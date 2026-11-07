import express from "express";
import {
  saveDocumentMaster,
  getDocumentMaster
} from "../controllers/documentMasterController.js";

const router = express.Router();

router.post("/save-master", saveDocumentMaster);
router.get("/:companyId/:documentType", getDocumentMaster);

export default router;