import mongoose from "mongoose";
import GeneratedDocument from "../models/GeneratedDocument.js";

export const saveGeneratedDocument = async ({
  companyId,
  documentType,
  fileName,
  fileInfo,
  userId,
  status = "PENDING_CHECK",
}) => {
 

  return await GeneratedDocument.create({
    company: new mongoose.Types.ObjectId(companyId),


    documentType,
    fileName,

    fileSize: fileInfo.fileSize,
    mimeType: fileInfo.mimeType || fileInfo.ContentType,

    storageType: fileInfo.storageType,
    filePath: fileInfo.filePath,

    maker: new mongoose.Types.ObjectId(userId),

    status,
  });
};

