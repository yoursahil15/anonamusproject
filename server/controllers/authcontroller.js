import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import EmailVerificationToken from "../models/EmailVerificationToken.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  sendOtpEmail,
  sendVerificationEmail,
} from "../services/emailService.js";
import {
  INTERNAL_SERVER_ERROR,
  CREATED,
  BAD_REQUEST,
  NOT_FOUND,
  FORBIDDEN,
  TOO_MANY_REQUESTS,
  OK,
} from "../utils/statusCode.js";

const createVerification = async (user) => {
  const raw = crypto.randomBytes(32).toString("hex");
  await EmailVerificationToken.deleteMany({ userId: user._id, usedAt: null });
  await EmailVerificationToken.create({
    userId: user._id,
    tokenHash: crypto.createHash("sha256").update(raw).digest("hex"),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  });
  await sendVerificationEmail(user.email, raw);
};


export const registerTenantOwner = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      mobile,
      termsAccepted,
    } = req.body;

    // Normalize email
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    // Validate registration details
    if (
      !name?.trim() ||
      !/^\S+@\S+\.\S+$/.test(normalizedEmail) ||
      !password ||
      password.length < 8 ||
      password !== confirmPassword ||
      termsAccepted !== true
    ) {
      return res.status(400).json({
        msg: "Enter a valid name, email and matching password (at least 8 characters), and accept the terms.",
      });
    }

    // Check whether the email already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      // Already verified account
      if (existingUser.isVerified) {
        return res.status(409).json({
          msg: "This email is already registered. Please sign in or reset your password.",
        });
      }

      // Inactive account
      if (existingUser.accountStatus === "INACTIVE") {
        return res.status(409).json({
          msg: "This account is inactive. Please contact support.",
        });
      }

      // Existing unverified account: resend verification
      try {
        await createVerification(existingUser);

        return res.status(200).json({
          msg: "Your account already exists and is waiting for email verification. A new verification link has been sent.",
          verificationEmailSent: true,
        });
      } catch (emailError) {
        console.error(
          "Registration retry verification email failed:",
          emailError
        );

        return res.status(200).json({
          msg: "Your account is waiting for email verification, but the verification email could not be sent. Please try again later.",
          verificationEmailSent: false,
        });
      }
    }

    // Split full name
    const [fname, ...rest] = name.trim().split(/\s+/);

    // Create user
    const user = await User.create({
      fname,
      lname: rest.join(" ") || "—",
      email: normalizedEmail,
      password: await bcrypt.hash(password, 12),
      mobile,
      role: "admin",
      isVerified: false,
      isActive: true,
      isApproved: true,
      accountStatus: "PENDING_VERIFICATION",
      termsAcceptedAt: new Date(),
    });

    // Create tenant for the owner
    try {
      await Tenant.create({
        ownerId: user._id,
      });
    } catch (error) {
      // Roll back user if tenant creation fails
      await User.deleteOne({
        _id: user._id,
      });

      throw error;
    }

    // Send verification email
    try {
      await createVerification(user);

      return res.status(201).json({
        msg: "Account created successfully. Please check your email for the verification link.",
        verificationEmailSent: true,
      });
    } catch (emailError) {
      console.error(
        "Registration verification email failed:",
        emailError
      );

      return res.status(201).json({
        msg: "Account created successfully, but the verification email could not be sent. Please try resending it later.",
        verificationEmailSent: false,
      });
    }
  } catch (error) {
    console.error("TENANT REGISTRATION ERROR:", {
      message: error.message,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue,
    });

    // MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        msg: "Duplicate value detected. Email or another unique field already exists.",
        field: Object.keys(error.keyPattern || {}),
      });
    }

    return res.status(500).json({
      msg: "Registration could not be completed. Please try again.",
    });
  }
};


export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (typeof token !== "string" || token.length < 32)
      return res
        .status(400)
        .json({ msg: "Verification link is invalid or expired." });
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const record = await EmailVerificationToken.findOneAndUpdate(
      { tokenHash, usedAt: null, expiresAt: { $gt: new Date() } },
      { $set: { usedAt: new Date() } },
      { new: true },
    );
    if (!record)
      return res
        .status(400)
        .json({ msg: "Verification link is invalid or expired." });
    const user = await User.findByIdAndUpdate(
      record.userId,
      { isVerified: true, accountStatus: "ONBOARDING" },
      { new: true },
    );
    if (!user)
      return res
        .status(400)
        .json({ msg: "Verification link is invalid or expired." });
    const tenant = await Tenant.findOne({ ownerId: user._id });
    if (tenant) {
      user.tenantId = tenant._id;
      await user.save();
    }
    const tokenJwt = jwt.sign(
      {
        id: user._id,
        role: user.role,
        permissions: user.permissions,
        tenantId: user.tenantId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    res.json({
      msg: "Email verified",
      token: tokenJwt,
      user: {
        _id: user._id,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        onboardingStatus: "IN_PROGRESS",
      },
    });
  } catch {
    res.status(500).json({ msg: "Verification could not be completed." });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const user = await User.findOne({ email, isVerified: false });
    if (user) await createVerification(user);
    res.json({
      msg: "If the account needs verification, an email has been sent.",
    });
  } catch {
    res.status(500).json({ msg: "Verification email could not be sent." });
  }
};

export const saveOnboarding = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (
      !user?.isVerified ||
      (!user.tenantId && !(await Tenant.exists({ ownerId: user?._id })))
    )
      return res.status(403).json({ msg: "Verified account required." });
    const tenant = await Tenant.findOne({
      ownerId: user._id,
      status: { $ne: "ACTIVE" },
    });
    if (!tenant) return res.status(404).json({ msg: "Onboarding not found." });
    const { step, data } = req.body;
    if (
      ![1, 2, 3, 4].includes(step) ||
      !data ||
      typeof data !== "object" ||
      Array.isArray(data)
    )
      return res.status(400).json({ msg: "Invalid onboarding step." });
    const paths = {
      1: ["name", "firmType", "contactEmail", "contactNumber", "address"],
      2: ["professionalDetails"],
      3: ["businessDetails"],
      4: ["settings"],
    };
    const allowed = paths[step];
    const update = {};
    for (const key of allowed)
      if (Object.hasOwn(data, key)) update[key] = data[key];
    if (
      step === 1 &&
      (!String(data.name || "").trim() || !data.firmType || !data.contactEmail)
    )
      return res
        .status(400)
        .json({ msg: "Firm name, type and business email are required." });
    if (step === 4) {
      if (!tenant.name && !data.name)
        return res
          .status(400)
          .json({ msg: "Complete basic firm information first." });
      update.onboardingStatus = "COMPLETED";
      update.status = "ACTIVE";
      update.onboardingStep = 4;
      user.accountStatus = "ACTIVE";
      user.tenantId = tenant._id;
      await user.save();
    } else update.onboardingStep = Math.max(tenant.onboardingStep, step + 1);
    const saved = await Tenant.findByIdAndUpdate(
      tenant._id,
      { $set: update },
      { new: true, runValidators: true },
    );
    res.json({
      tenant: saved,
      completed: saved.onboardingStatus === "COMPLETED",
    });
  } catch (error) {
    res.status(400).json({ msg: "Onboarding details could not be saved." });
  }
};

export const tenantDashboard = async (req, res) => {
  const user = await User.findById(req.user.id).select(
    "fname lname email tenantId accountStatus",
  );
  if (!user?.tenantId)
    return res
      .status(403)
      .json({ msg: "Complete firm onboarding to continue." });
  const tenant = await Tenant.findOne({ _id: user.tenantId, status: "ACTIVE" });
  if (!tenant) return res.status(403).json({ msg: "Tenant is not active." });
  res.json({
    firm: {
      name: tenant.name,
      status: tenant.status,
      onboardingStatus: tenant.onboardingStatus,
      settings: tenant.settings,
    },
    user,
  });
};
// import { sendResetEmail } from "../services/emailService.js";

// ================= REGISTER =================
export const registerUser = async (req, res) => {
  try {
    const { fname, lname, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(BAD_REQUEST).json({ msg: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fname,
      lname,
      email,
      password: hashedPassword,
      role,
      isVerified: false,
      isActive: true,
      isApproved: true,
    });
    res.status(CREATED).json({ msg: "User registered successfully", user });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
};

// ================= LOGIN =================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      email: String(email || "")
        .trim()
        .toLowerCase(),
    });
    if (!user) {
      return res.status(NOT_FOUND).json({ msg: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(BAD_REQUEST).json({ msg: "Invalid password" });
    }
    if (user.accountStatus === "INACTIVE" || !user.isActive)
      return res.status(FORBIDDEN).json({ msg: "Account is inactive." });
    // 🔒 1. ACTIVE CHECK
    if (!user.isActive) {
      return res.status(FORBIDDEN).json({ msg: "User is inactive" });
    }
    // 🔒 2. APPROVED CHECK
    if (!user.isApproved) {
      return res.status(FORBIDDEN).json({ msg: "User not approved" });
    }
    // 🔐 3. VERIFICATION CHECK (ONLY FOR NEW USERS)
    if (!user.isVerified) {
      if (user.accountStatus === "PENDING_VERIFICATION")
        return res
          .status(FORBIDDEN)
          .json({
            msg: "Verify your email before signing in.",
            requiresEmailVerification: true,
          });
      // 🚨 OTP LIMIT
      if (user.otpRequestCount >= 5) {
        return res.status(TOO_MANY_REQUESTS).json({
          msg: "Too many OTP requests. Try later.",
        });
      }
      // 🔥 GENERATE OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpiry = Date.now() + 10 * 60 * 1000;
      user.otpRequestCount += 1;
      await user.save();
      await sendOtpEmail(user.email, otp);
      return res.status(FORBIDDEN).json({
        msg: "User not verified. OTP sent",
        email: user.email,
        requiresOtp: true,
      });
    }
    // ✅ LOGIN SUCCESS (VERIFIED USERS ONLY)
    const tenant = user.tenantId
      ? await Tenant.findById(user.tenantId)
      : await Tenant.findOne({ ownerId: user._id });
    if (tenant && !user.tenantId) {
      user.tenantId = tenant._id;
      await user.save();
    }
    if (tenant?.status === "SUSPENDED")
      return res
        .status(FORBIDDEN)
        .json({ msg: "This firm account is suspended." });
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        permissions: user.permissions,
        tenantId: tenant?._id || user.tenantId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );
    // 🔐 CLEAN RESPONSE
    const safeUser = {
      _id: user._id,
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
      permissions: user.permissions || [],
      tenantId: tenant?._id || user.tenantId || null,
      onboardingStatus:
        tenant?.onboardingStatus ||
        (user.accountStatus === "ONBOARDING" ? "IN_PROGRESS" : "COMPLETED"),
    };
    res.status(OK).json({ token, user: safeUser });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
};

// ================= VERIFY OTP =================
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp) {
      return res.status(BAD_REQUEST).json({ msg: "Invalid OTP" });
    }
    if (user.otpExpiry < Date.now()) {
      return res.status(BAD_REQUEST).json({ msg: "OTP expired" });
    }
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.otpRequestCount = 0; // 🔥 reset counter
    await user.save();
    res.status(OK).json({ msg: "User verified successfully" });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
};

// ================= UPDATE PROFILE =================
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { fname, lname, email, mobile, oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(NOT_FOUND).json({
        msg: "User not found",
      });
    }

    // Update profile fields
    if (fname) user.fname = fname;
    if (lname) user.lname = lname;
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;

    // ================= PASSWORD CHANGE =================

    if (newPassword) {
      // Old password required
      if (!oldPassword) {
        return res.status(400).json({
          msg: "Old password is required",
        });
      }

      // Verify old password
      const isMatch = await bcrypt.compare(oldPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({
          msg: "Old password is incorrect",
        });
      }

      // Prevent same password reuse
      const samePassword = await bcrypt.compare(newPassword, user.password);

      if (samePassword) {
        return res.status(400).json({
          msg: "New password must be different from old password",
        });
      }

      // Password strength validation
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          msg: "Password must contain uppercase, lowercase, number, special character and minimum 8 characters",
        });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    res.status(200).json({
      msg: "Profile updated successfully",
    });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({
      msg: error.message,
    });
  }
};
// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(NOT_FOUND).json({ msg: "User not found" });
    }
    // ✅ GENERATE 6 DIGIT OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();
    // ✅ SEND ONLY OTP
    await sendOtpEmail(user.email, otp);
    res.json({ msg: "OTP sent to email" });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp) {
      return res.status(BAD_REQUEST).json({ msg: "Invalid OTP" });
    }
    if (user.otpExpiry < Date.now()) {
      return res.status(BAD_REQUEST).json({ msg: "OTP expired" });
    }
    // 🔒 Update password
    user.password = await bcrypt.hash(password, 10);
    // 🔥 Clear OTP
    user.otp = null;
    user.otpExpiry = null;
    user.otpRequestCount = 0;
    await user.save();
    res.status(OK).json({ msg: "Password reset successful" });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ msg: error.message });
  }
};
