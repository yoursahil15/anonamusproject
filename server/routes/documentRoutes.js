import express from "express";

import {
  getClients,
  getCompaniesByClient,
  generatePowerSubsidyDocument,
  generateCoveringWordFile,
  generateDocumentFromMaster,
  generateInterestSubsidyDocument,
  generateAppendix,
  generateAffidavit,
  generateDisbursementAgreement,
  generateELPForm,
  generateProductionExtract,
  getGeneratedDocumentsByClient,
  deleteGeneratedDocument,
  checkerAction,
  approverAction,
  assignApprover,
  assignChecker,
  getMyDocuments,
  getCheckerList,
  getApproverList,
  getApprovalDocuments,
  editGeneratedDocument,
  getGeneratedDocumentById,
  getGeneratedDocumentFile,
} from "../controllers/documentController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  requireActiveTenant,
  requireMakerPermission,
  requireOfficeDocument,
  requireOfficeCompany,
} from "../middleware/officeWorkflowAccess.js";

const router = express.Router();

// ================= CLIENT ROUTES =================


router.delete("/generated/:id", protect, deleteGeneratedDocument);

router.post(
  "/generate-disbursement-agreement/:companyId",
  protect,
  requireActiveTenant,
  requireMakerPermission,
  requireOfficeCompany,
  generateDisbursementAgreement,
);
// ================= COVERING LETTER =================

router.post("/generate-word/:companyId", protect, requireActiveTenant, requireMakerPermission, requireOfficeCompany, generateCoveringWordFile);

// ================= POWER SUBSIDY =================

router.post(
  "/generate-power-subsidy/:companyId",
  protect,
  requireActiveTenant,
  requireMakerPermission,
  requireOfficeCompany,
  generatePowerSubsidyDocument,
);

// ================= APPENDIX A =================

router.post("/appendix/:companyId", protect, requireActiveTenant, requireMakerPermission, requireOfficeCompany, generateAppendix);

// ================= DOCUMENT MASTER =================

router.post(
  "/generate-from-master/:companyId/:documentType",
  protect, // âœ… REQUIRED
  requireActiveTenant,
  requireMakerPermission,
  requireOfficeCompany,
  generateDocumentFromMaster,
);
// ================= INTEREST SUBSIDY =================
router.post(
  "/generate-interest-subsidy/:companyId",
  protect,
  requireActiveTenant,
  requireMakerPermission,
  requireOfficeCompany,
  generateInterestSubsidyDocument,
);

router.post("/generate-affidavit/:companyId", protect, requireActiveTenant, requireMakerPermission, requireOfficeCompany, generateAffidavit);

router.post("/appendix/:companyId", protect, requireActiveTenant, requireMakerPermission, requireOfficeCompany, generateAppendix);

router.get(
  "/generated",
  protect,
  requireActiveTenant,
  getGeneratedDocumentsByClient,
);

router.get("/generated/:documentId/file", protect, requireActiveTenant, requireOfficeDocument, getGeneratedDocumentFile);

router.get(
  "/generated/:documentId",
  protect,
  getGeneratedDocumentById
); 

router.put(
  "/edit-generated-document/:documentId",
  protect,
  editGeneratedDocument
);

// ================= ELP =================
router.post("/generate/elp/:companyId", protect, requireActiveTenant, requireMakerPermission, requireOfficeCompany, generateELPForm);

// ================= PRODUCTION EXTRACT =================

router.post(
  "/generate-production-extract/:companyId",
  protect,
  requireActiveTenant,
  requireMakerPermission,
  requireOfficeCompany,
  generateProductionExtract,
);
// ================= CHECKER =================
// ================= WORKFLOW =================

// Assign Checker (ðŸ”¥ MISSING BEFORE â€” NOW ADDED)
router.put("/assign-checker/:documentId", protect, assignChecker);

// Checker Action
router.put("/checker-action/:documentId", protect, checkerAction);

// Assign Approver
router.put("/assign-approver/:documentId", protect, assignApprover);

// Approver Action
router.put("/approver-action/:documentId", protect, approverAction);

// Get Approval Documents
router.get("/approval-documents", protect, getApprovalDocuments);

// Lists
router.get("/checkers", protect, getCheckerList);
router.get("/approvers", protect, getApproverList);


export default router;

