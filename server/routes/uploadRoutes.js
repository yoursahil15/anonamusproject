import express from "express";
import multer from "multer";
import { uploadFile } from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/upload", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });
    const result = await uploadFile(req.file);
    res.status(201).json({ success: true, fileName: result.fileName, filePath: result.filePath, storageType: result.storageType, mimeType: result.mimeType, fileSize: result.fileSize });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
