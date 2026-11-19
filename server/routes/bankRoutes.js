import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireActiveTenant, requireOfficeCompany, requireOfficeBodyCompany } from "../middleware/officeWorkflowAccess.js";
import {
  addBank,
  getBanksByCompany,
  deleteBank,
} from "../controllers/bankController.js";

const router = express.Router();

// ✅ Add Bank
router.post("/add", protect, requireActiveTenant, requireOfficeBodyCompany, addBank);

router.delete("/:bankId", protect, requireActiveTenant, deleteBank);

// ✅ Get All Banks By Company
router.get("/company/:companyId", protect, requireActiveTenant, requireOfficeCompany, getBanksByCompany);

export default router;
