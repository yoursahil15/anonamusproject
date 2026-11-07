import { storeDocument } from "../services/serverStorageService.js";

export const uploadFile = async (file) => {
  if (!file?.buffer) throw new Error("No file provided");
  return storeDocument(file.buffer, file.originalname, "uploads", file.mimetype);
};
