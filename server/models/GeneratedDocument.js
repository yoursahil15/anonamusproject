import mongoose from "mongoose";

const generatedDocumentSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    documentType: {
      type: String,
      required: true,
      enum: [
        "COVERING_LETTER",
        "BANK_INTEREST_CERTIFICATE",
        "APPENDIX_A",
        "APPENDIX_B",
        "APPENDIX_C",
        "POWER_SUBSIDY",
        "INTEREST_SUBSIDY",
        "DISBURSEMENT_AGREEMENT",
        "AFFIDAVIT",
        "ELP_FORM",
        "PRODUCTION_EXTRACT",
      ],
    },

    fileName: {
      type: String,
      required: true,
    },

    fileSize: {
      type: Number,
    },

    mimeType: {
      type: String,
      default: "application/octet-stream",
    },

    storageType: { type: String, enum: ["filesystem", "s3"], default: "s3" },
    filePath: { type: String },
    s3Key: {
      type: String,
    },

    s3Url: {
      type: String,
    },

    s3Bucket: {
      type: String,
      default: undefined,
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "PENDING_CHECK",
        "CHECKED",
        "REJECTED_BY_CHECKER",
        "PENDING_APPROVAL",
        "APPROVED",
        "REJECTED_BY_APPROVER",
      ],
      default: "PENDING_CHECK",
    },

    maker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    checker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    checkedAt: Date,

    approvedAt: Date,

    rejectedReason: String,
    version: {
  type: Number,
  default: 1,
},

editLogs: [
  {
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    editedRole: {
      type: String,
      enum: ["maker", "checker"],
    },

    previousFileName: String,

    newFileName: String,

    previousS3Key: String,

    newS3Key: String,
    previousFilePath: String,
    newFilePath: String,

    comment: String,

    editedAt: {
      type: Date,
      default: Date.now,
    },
  },
],
  },
  
  
  { timestamps: true },
  
);



export default mongoose.model("GeneratedDocument", generatedDocumentSchema);
