import mongoose from "mongoose";

const documentMasterSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    bank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bank",
    },

    documentType: {
      type: String,
      enum: [
        "COVERING_LETTER", 
        "BANK_INTEREST_CERTIFICATE",
        "APPENDIX_A",
        "APPENDIX_B",
        "APPENDIX_C",
        "AFFIDAVIT",
        "POWER_SUBSIDY",
        "INTEREST_SUBSIDY",
        "DISBURSEMENT_AGREEMENT",
        "ELP_FORM",
        "PRODUCTION_EXTRACT",

      ],
      required: true,
    },

    // 🔥 ALL STATIC FIELDS GO HERE (FLEXIBLE)
    staticData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // 🔥 OPTIONAL: PREFILLED BUT EDITABLE DATA
    prefillData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

export default mongoose.model("DocumentMaster", documentMasterSchema);
