import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // =====================================
    // BASIC INFORMATION
    // =====================================

    fname: {
      type: String,
      required: true,
      trim: true,
    },

    lname: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    mobile: {
      type: String,
      trim: true,
    },

    // =====================================
    // TENANT INFORMATION
    // =====================================

    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      index: true,
    },

    accountStatus: {
      type: String,
      enum: [
        "PENDING_VERIFICATION",
        "ONBOARDING",
        "ACTIVE",
        "INACTIVE",
      ],
      default: "ACTIVE",
    },

    termsAcceptedAt: {
      type: Date,
    },

    // =====================================
    // USER ROLE
    // =====================================

    role: {
      type: String,
      enum: [
        "superadmin",
        "admin",
        "manager",
        "intern",
        "client",
      ],
      default: "client",
    },

    // =====================================
    // USER HIERARCHY
    // =====================================

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // =====================================
    // PERMISSIONS
    // =====================================

    permissions: {
      type: [String],
      enum: ["maker", "checker", "approver"],
      default: [],
    },

    // =====================================
    // EMAIL / LOGIN OTP
    // =====================================

    otp: {
      type: String,
      default: null,
    },

    otpExpiry: {
      type: Date,
      default: null,
    },

    otpRequestCount: {
      type: Number,
      default: 0,
    },

    // =====================================
    // ACCOUNT STATUS
    // =====================================

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isApproved: {
      type: Boolean,
      default: true,
    },

    // =====================================
    // PASSWORD RESET
    // =====================================

    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ tenantId: 1, role: 1, isActive: 1 });

const User = mongoose.model("User", userSchema);

export default User;
