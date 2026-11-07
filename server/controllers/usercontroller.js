import User from "../models/User.js";
import bcrypt from "bcryptjs";

// ================= CREATE USER =================
export const createUser = async (req, res) => {
  try {
    const {
      fname,
      lname,
      email,
      password,
      mobile,
      role,
      adminId,
      managerId,
    } = req.body;

    const loggedInUser = req.user;

    // ================= ROLE CONTROL =================

    // Admin → manager, intern
    if (
      loggedInUser.role === "admin" &&
      !["manager", "intern"].includes(role)
    ) {
      return res.status(403).json({
        msg: "Admin can create manager or intern",
      });
    }

    // Manager → intern only
    if (
      loggedInUser.role === "manager" &&
      role !== "intern"
    ) {
      return res.status(403).json({
        msg: "Manager can only create intern",
      });
    }

    // Intern → cannot create
    if (loggedInUser.role === "intern") {
      return res.status(403).json({
        msg: "Intern cannot create users",
      });
    }

    // Superadmin → all valid roles
    if (
      loggedInUser.role === "superadmin" &&
      !["admin", "manager", "intern"].includes(role)
    ) {
      return res.status(400).json({
        msg: "Invalid role",
      });
    }

    // ================= CHECK EXISTING =================

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        msg: "User already exists",
      });
    }

    // ================= HASH PASSWORD =================

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUserData = {
      fname,
      lname,
      email,
      password: hashedPassword,
      mobile,
      role,
      isVerified: false,
      isActive: true,
      isApproved: true,
      tenantId: loggedInUser.tenantId || undefined,
    };

    // ================= HIERARCHY =================

    // Superadmin → Manager
    if (
      loggedInUser.role === "superadmin" &&
      role === "manager"
    ) {
      if (!adminId) {
        return res.status(400).json({
          msg: "Admin ID required",
        });
      }

      newUserData.admin = adminId;
    }

    // Superadmin → Intern
    if (
      loggedInUser.role === "superadmin" &&
      role === "intern"
    ) {
      if (!managerId) {
        return res.status(400).json({
          msg: "Manager ID required",
        });
      }

      newUserData.manager = managerId;
    }

    // Admin → Manager
    if (
      loggedInUser.role === "admin" &&
      role === "manager"
    ) {
      newUserData.admin = loggedInUser.id;
    }

    // Admin → Intern
    if (
      loggedInUser.role === "admin" &&
      role === "intern"
    ) {
      if (!managerId) {
        return res.status(400).json({
          msg: "Manager ID required",
        });
      }

      if (loggedInUser.tenantId) {
        const manager = await User.findOne({
          _id: managerId,
          role: "manager",
          admin: loggedInUser.id,
          tenantId: loggedInUser.tenantId,
        }).select("_id");
        if (!manager) {
          return res.status(400).json({ msg: "Select a manager from your tenant." });
        }
      }

      newUserData.manager = managerId;
      newUserData.admin = loggedInUser.id;
    }

    // Manager → Intern
    if (
      loggedInUser.role === "manager" &&
      role === "intern"
    ) {
      newUserData.manager = loggedInUser.id;
      newUserData.admin = loggedInUser.admin;
    }

    // ================= CREATE USER =================

    const user = await User.create(newUserData);

    res.json({
      msg: "User created successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      msg: error.message,
    });
  }
};

// ================= GET USERS =================
export const getUsers = async (req, res) => {
  try {
    const loggedInUser = req.user;

    let users = [];

    // ================= SUPERADMIN =================

    if (loggedInUser.role === "superadmin") {
      users = await User.find().select("-password");
    }

    // ================= ADMIN =================

    else if (loggedInUser.role === "admin") {
      const tenantScope = loggedInUser.tenantId
        ? { tenantId: loggedInUser.tenantId }
        : {};
      const managers = await User.find({
        role: "manager",
        admin: loggedInUser.id,
        ...tenantScope,
      }).select("_id");

      const managerIds = managers.map((m) => m._id);

      users = await User.find({
        $and: [
          {
            $or: [
              { _id: loggedInUser.id },
              { role: "manager", admin: loggedInUser.id },
              { role: "intern", manager: { $in: managerIds } },
            ],
          },
          tenantScope,
        ],
      }).select("-password");
    }

    // ================= MANAGER =================

    else if (loggedInUser.role === "manager") {
      const tenantScope = loggedInUser.tenantId
        ? { tenantId: loggedInUser.tenantId }
        : {};
      users = await User.find({
        $and: [
          {
            $or: [
              { _id: loggedInUser.id },
              { role: "intern", manager: loggedInUser.id },
            ],
          },
          tenantScope,
        ],
      }).select("-password");
    }

    // ================= INTERN =================

    else {
      users = await User.find({
        _id: loggedInUser.id,
        ...(loggedInUser.tenantId ? { tenantId: loggedInUser.tenantId } : {}),
      }).select("-password");
    }

    res.json(users);
  } catch (error) {
    res.status(500).json({
      msg: error.message,
    });
  }
};

// ================= DELETE USER =================
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({
      msg: "User deleted",
    });
  } catch (error) {
    res.status(500).json({
      msg: error.message,
    });
  }
};

// ================= UPDATE USER =================
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      fname,
      lname,
      email,
      password,
      role,
      adminId,
      managerId,
      mobile,
      isActive,
      isVerified,
    } = req.body;

    const loggedInUser = req.user;

    if (loggedInUser.role !== "superadmin") {
      return res.status(403).json({
        msg: "Only superadmin can edit users",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        msg: "User not found",
      });
    }

    // ================= BASIC FIELDS =================

    if (fname) user.fname = fname;

    if (lname) user.lname = lname;

    if (email) user.email = email;

    if (mobile) user.mobile = mobile;

    // ================= PASSWORD =================

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    // ================= ROLE =================

    if (role) {
      if (!["admin", "manager", "intern"].includes(role)) {
        return res.status(400).json({
          msg: "Invalid role",
        });
      }

      user.role = role;
    }

    // ================= HIERARCHY =================

    if (role === "manager" && adminId) {
      user.admin = adminId;
    }

    if (role === "intern" && managerId) {
      user.manager = managerId;
    }

    // ================= STATUS =================

    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    if (isVerified !== undefined) {
      user.isVerified = isVerified;
    }

    await user.save();

    res.json({
      msg: "User updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      msg: error.message,
    });
  }
};

// ================= ASSIGN PERMISSIONS =================
export const updateUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;

    const { permissions } = req.body;

    const loggedInUser = req.user;

    // Only superadmin
    if (loggedInUser.role !== "superadmin") {
      return res.status(403).json({
        msg: "Only superadmin can assign permissions",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        msg: "User not found",
      });
    }

    // Prevent editing superadmin
    if (user.role === "superadmin") {
      return res.status(400).json({
        msg: "Cannot modify superadmin permissions",
      });
    }

    // Valid permissions
    const validPermissions = [
      "maker",
      "checker",
      "approver",
    ];

    const isValid = permissions.every((p) =>
      validPermissions.includes(p)
    );

    if (!isValid) {
      return res.status(400).json({
        msg: "Invalid permissions",
      });
    }

    user.permissions = permissions;

    await user.save();

    res.json({
      msg: "Permissions updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      msg: error.message,
    });
  }
};
