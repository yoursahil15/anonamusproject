import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireActiveTenant, requireOfficeCompany, requireOfficeBodyCompany } from "../middleware/officeWorkflowAccess.js";
import {
  saveDocumentMaster,
  getDocumentMaster
} from "../controllers/documentMasterController.js";

const router = express.Router();

router.post("/save-master", protect, requireActiveTenant, requireOfficeBodyCompany, saveDocumentMaster);
router.get("/:companyId/:documentType", protect, requireActiveTenant, requireOfficeCompany, getDocumentMaster);

export default router;
