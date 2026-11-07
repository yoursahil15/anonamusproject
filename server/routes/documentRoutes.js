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

const router = express.Router();

// ================= CLIENT ROUTES =================


router.delete("/generated/:id", protect, deleteGeneratedDocument);

router.post(
  "/generate-disbursement-agreement/:companyId",
  protect,
  generateDisbursementAgreement,
);
// ================= COVERING LETTER =================

router.post("/generate-word/:companyId", protect, generateCoveringWordFile);

// ================= POWER SUBSIDY =================

router.post(
  "/generate-power-subsidy/:companyId",
  protect,
  generatePowerSubsidyDocument,
);

// ================= APPENDIX A =================

router.post("/appendix/:companyId", protect, generateAppendix);

// ================= DOCUMENT MASTER =================

router.post(
  "/generate-from-master/:companyId/:documentType",
  protect, // âœ… REQUIRED
  generateDocumentFromMaster,
);
// ================= INTEREST SUBSIDY =================
router.post(
  "/generate-interest-subsidy/:companyId",
  protect,
  generateInterestSubsidyDocument,
);

router.post("/generate-affidavit/:companyId", protect, generateAffidavit);

router.post("/appendix/:companyId", protect, generateAppendix);

router.get(
  "/generated",
  protect,
  getGeneratedDocumentsByClient,
);

router.get("/generated/:documentId/file", protect, getGeneratedDocumentFile);

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
router.post("/generate/elp/:companyId", protect, generateELPForm);

// ================= PRODUCTION EXTRACT =================

router.post(
  "/generate-production-extract/:companyId",
  protect,
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

