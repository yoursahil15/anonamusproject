import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GENERATED_DOCUMENTS_DIR = path.join(__dirname, "../uploads/generated-documents");

// Create directory if it doesn't exist
if (!fs.existsSync(GENERATED_DOCUMENTS_DIR)) {
  fs.mkdirSync(GENERATED_DOCUMENTS_DIR, { recursive: true });
}

export const saveFileToStorage = (buffer, fileName, subFolder = "documents") => {
  try {
    const folderPath = path.join(GENERATED_DOCUMENTS_DIR, subFolder);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, fileName);
    fs.writeFileSync(filePath, buffer);

    return {
      fileName,
      filePath,
      fileSize: buffer.length,
      relativePath: path.join("generated-documents", subFolder, fileName),
    };
  } catch (error) {
    console.error("Error saving file to storage:", error);
    throw new Error("Failed to save file: " + error.message);
  }
};

export const getFileFromStorage = (filePath) => {
  try {
    const fullPath = path.join(GENERATED_DOCUMENTS_DIR, filePath);
    return fs.readFileSync(fullPath);
  } catch (error) {
    console.error("Error reading file from storage:", error);
    throw new Error("Failed to read file: " + error.message);
  }
};

export const deleteFileFromStorage = (filePath) => {
  try {
    const fullPath = path.join(GENERATED_DOCUMENTS_DIR, filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error("Error deleting file from storage:", error);
    throw new Error("Failed to delete file: " + error.message);
  }
};

export const generateStorageFileName = (fileName, documentType) => {
  const timestamp = new Date().getTime();
  const extension = path.extname(fileName);
  const baseName = path.basename(fileName, extension);
  return baseName + "-" + timestamp + extension;
};
