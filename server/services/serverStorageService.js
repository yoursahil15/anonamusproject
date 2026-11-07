import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const storageRoot = path.resolve(
  process.env.DOCUMENT_STORAGE_PATH || path.join(process.cwd(), "uploads"),
);

const resolveStoredPath = (relativePath) => {
  if (typeof relativePath !== "string" || !relativePath || path.isAbsolute(relativePath)) {
    throw new Error("Invalid stored file path");
  }
  const normalized = relativePath.replace(/[\\]/g, "/");
  if (normalized.split("/").some((part) => part === ".." || part === ".")) {
    throw new Error("Invalid stored file path");
  }
  const fullPath = path.resolve(storageRoot, normalized);
  if (fullPath === storageRoot || !fullPath.startsWith(`${storageRoot}${path.sep}`)) {
    throw new Error("Invalid stored file path");
  }
  return fullPath;
};

export const storeDocument = async (buffer, originalName, folder = "documents", mimeType = "application/octet-stream") => {
  if (!Buffer.isBuffer(buffer)) throw new Error("File content must be a buffer");
  const safeFolder = String(folder).split(/[\\/]/).filter(Boolean);
  if (safeFolder.some((part) => part === "." || part === "..")) throw new Error("Invalid storage folder");
  const extension = path.extname(path.basename(originalName || "" )).replace(/[^.a-zA-Z0-9]/g, "").slice(0, 16);
  const relativePath = path.posix.join(...safeFolder, `${randomUUID()}${extension}`);
  const fullPath = resolveStoredPath(relativePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true, mode: 0o700 });
  try {
    await fs.writeFile(fullPath, buffer, { flag: "wx", mode: 0o600 });
  } catch (error) {
    await fs.rm(fullPath, { force: true }).catch(() => {});
    throw error;
  }
  return { storageType: "filesystem", fileName: path.basename(originalName || "document"), filePath: relativePath, mimeType, fileSize: buffer.length };
};

export const getStoredFilePath = resolveStoredPath;

export const deleteStoredFile = async (relativePath) => {
  const fullPath = resolveStoredPath(relativePath);
  await fs.rm(fullPath, { force: true });
};

