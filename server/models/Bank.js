import mongoose from "mongoose";

const bankSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    // ✅ EC or TERM_LOAN
    bankType: {
      type: String,
      enum: ["CC", "TERM_LOAN"],
      required: true,
    },

    // ✅ Common Fields
    bankName: {
      type: String,
      required: true,
    },

    accountNumber: {
      type: String,
      required: true,
    },

    ifsc: {
      type: String,
      required: true,
    },

    branchName: {
      type: String,
      required: true,
    },

    branchAddress: {
      type: String,
      required: true,
    },

    // ✅ Only For Term Loan
    sanctionDateFrom: {
      type: Date,
    },

    sanctionDateTo: {
      type: Date,
    },

    sanctionAmount: {
      type: Number,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Bank", bankSchema);
