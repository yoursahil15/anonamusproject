import express from "express";
import { registerUser, loginUser, registerTenantOwner, verifyEmail, resendVerification } from "../controllers/authcontroller.js";
import { updateProfile } from "../controllers/authcontroller.js";
import { protect } from "../middleware/authMiddleware.js";
import { verifyOtp } from "../controllers/authcontroller.js";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/authcontroller.js";
import { authRateLimit } from "../middleware/authRateLimit.js";
import { saveOnboarding, tenantDashboard } from "../controllers/authcontroller.js";
import { requireActiveTenant, requireTenantAdmin } from "../middleware/officeWorkflowAccess.js";

const router = express.Router();

router.put("/update", protect, updateProfile);
router.post("/register", authRateLimit, registerTenantOwner);
router.post("/legacy-register", registerUser);
router.post("/verify-email", authRateLimit, verifyEmail);
router.post("/resend-verification", authRateLimit, resendVerification);
router.post("/login", authRateLimit, loginUser);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/onboarding", protect, async (req, res) => {
  const Tenant = (await import("../models/Tenant.js")).default;
  const tenant = await Tenant.findOne({ ownerId: req.user.id });
  if (!tenant) return res.status(404).json({ msg: "Onboarding not found." });
  return res.json({ tenant });
});
router.put("/onboarding", protect, saveOnboarding);
router.get("/tenant-dashboard", protect, requireActiveTenant, requireTenantAdmin, tenantDashboard);

export default router;
