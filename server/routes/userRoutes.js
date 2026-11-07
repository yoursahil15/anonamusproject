import express from "express";
import {
  createUser,
  getUsers,
  deleteUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { requireActiveTenant } from "../middleware/officeWorkflowAccess.js";
import {
  updateUser,
  updateUserPermissions,
} from "../controllers/userController.js";

const router = express.Router();

// Only Superadmin
// Superadmin + Admin + Manager can create users
router.post(
  "/",
  protect,
  requireActiveTenant,
  authorize("superadmin", "admin", "manager"),
  createUser,
);

// Only Superadmin & Admin can see all users
router.get(
  "/",
  protect,
  requireActiveTenant,
  authorize("superadmin", "admin", "manager", "intern"),
  getUsers,
);

// Delete → only Superadmin
router.delete("/:id", protect, authorize("superadmin"), deleteUser);

//Update --> only Superadmin
router.put("/:id", protect, authorize("superadmin"), updateUser);
router.put(
  "/permissions/:userId",
  protect,
  authorize("superadmin"),
  updateUserPermissions,
);

export default router;
