import CompanyDocument from "../models/CompanyDocument.js";
import { storeDocument, deleteStoredFile, getStoredFilePath } from "../services/serverStorageService.js";

// ================= UPLOAD =================

export const uploadCompanyDocument = async (req, res) => {
  try {
    const { companyId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "File is required",
      });
    }

    const stored = await storeDocument(req.file.buffer, req.file.originalname, `company-documents/${companyId}`, req.file.mimetype);
    const newDoc = await CompanyDocument.create({
      company: companyId,
      ...stored,
    });

    res.json({
      message: "Document uploaded",
      document: newDoc,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= GET =================

export const getCompanyDocuments = async (req, res) => {
  try {
    const { companyId } = req.params;

    const docs = await CompanyDocument.find({ company: companyId }).sort({
      createdAt: -1,
    });

    res.json(docs);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ================= DELETE =================

export const deleteCompanyDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await CompanyDocument.findById(id);
    if (!doc) return res.status(404).json({ message: "Document not found" });
    if (doc.storageType === "filesystem" && doc.filePath) await deleteStoredFile(doc.filePath);
    await CompanyDocument.findByIdAndDelete(id);

    res.json({
      message: "Document deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const downloadCompanyDocument = async (req, res) => {
  try {
    const doc = await CompanyDocument.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });
    if (doc.storageType !== "filesystem" || !doc.filePath) return res.status(410).json({ message: "Legacy document must be migrated from an authorized backup." });
    const safeName = String(doc.fileName || "document").replace(/[\r\n\"]+/g, "_");
    return res.type(doc.mimeType).set("Content-Disposition", `inline; filename="${safeName}"`).sendFile(getStoredFilePath(doc.filePath));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
