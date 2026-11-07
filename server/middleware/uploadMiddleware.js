import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const destination = path.resolve(process.env.DOCUMENT_STORAGE_PATH || path.join(process.cwd(), "uploads"));
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => fs.mkdir(destination, { recursive: true }, (error) => cb(error, destination)),
    filename: (_req, file, cb) => cb(null, `${randomUUID()}${path.extname(file.originalname).replace(/[^.a-zA-Z0-9]/g, "")}`),
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
});

export default upload;
