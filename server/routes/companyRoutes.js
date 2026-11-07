import express from "express";
import {
  createCompany,
  getCompanies,
  uploadCompanies,
  updateCompany,
  deleteCompany,
  getCompanyById,
} from "../controllers/companyController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { requireActiveTenant } from "../middleware/officeWorkflowAccess.js";
import multer from "multer";

const router = express.Router();

// 📁 File upload config
const upload = multer({ dest: "uploads/" });

// ➕ Create Company
router.post("/", protect, requireActiveTenant, authorize("superadmin", "admin", "manager", "intern", "client"), createCompany);

router.get("/:companyId", protect, requireActiveTenant, getCompanyById);

// 📄 Get all companies of a client
router.get("/", protect, requireActiveTenant, getCompanies);

// 📤 Bulk Upload Companies (Excel)
router.post("/bulk-upload", protect, requireActiveTenant, authorize("superadmin", "admin"), upload.single("file"), uploadCompanies);

router.put("/update/:companyId", protect, requireActiveTenant, authorize("superadmin", "admin"), updateCompany);
router.delete("/delete/:companyId", protect, requireActiveTenant, authorize("superadmin", "admin"), deleteCompany);

export default router;
