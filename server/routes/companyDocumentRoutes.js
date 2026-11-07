import express from "express";
import multer from "multer";
import { uploadCompanyDocument, getCompanyDocuments, deleteCompanyDocument, downloadCompanyDocument } from "../controllers/companyDocumentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
router.post("/upload", protect, upload.single("file"), uploadCompanyDocument);
router.get("/company/:companyId", protect, getCompanyDocuments);
router.get("/:id/file", protect, downloadCompanyDocument);
router.delete("/:id", protect, deleteCompanyDocument);
export default router;
