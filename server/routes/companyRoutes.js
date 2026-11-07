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
import multer from "multer";

const router = express.Router();

// 📁 File upload config
const upload = multer({ dest: "uploads/" });

// ➕ Create Company
router.post("/", createCompany);

router.get("/:companyId", getCompanyById);

// 📄 Get all companies of a client
router.get("/", getCompanies);

// 📤 Bulk Upload Companies (Excel)
router.post("/bulk-upload", protect, upload.single("file"), uploadCompanies);

router.put("/update/:companyId", updateCompany);
router.delete("/delete/:companyId", deleteCompany);

export default router;
