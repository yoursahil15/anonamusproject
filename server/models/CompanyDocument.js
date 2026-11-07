import mongoose from "mongoose";

const companyDocumentSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    storageType: { type: String, enum: ["filesystem", "s3"], default: "filesystem" },
    filePath: { type: String },
    mimeType: { type: String, default: "application/octet-stream" },
    fileSize: { type: Number },
    // Kept for legacy records; new records use protected filePath storage.
    fileUrl: { type: String },

    uploadedAt: {
      type: Date,
      default: Date.now,
    }
  },
  { timestamps: true }
);

export default mongoose.model(
  "CompanyDocument",
  companyDocumentSchema
);
