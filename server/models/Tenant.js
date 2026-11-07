import mongoose from "mongoose";

const tenantSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  slug: { type: String, unique: true, sparse: true, lowercase: true },
  firmType: { type: String, enum: ["Proprietorship", "Partnership", "LLP", "Private Limited", "Other"] },
  contactEmail: { type: String, lowercase: true, trim: true },
  contactNumber: String,
  address: { country: String, state: String, city: String, office: String, pinCode: String },
  professionalDetails: { frn: String, membershipNumber: String, primaryContact: String, designation: String, gstin: String },
  businessDetails: { employees: String, clients: String, documentTypes: [String], activities: String, workflow: String },
  settings: { timezone: { type: String, default: "Asia/Kolkata" }, dateFormat: { type: String, default: "DD/MM/YYYY" }, currency: { type: String, default: "INR" } },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["PENDING", "ACTIVE", "SUSPENDED"], default: "PENDING" },
  onboardingStatus: { type: String, enum: ["IN_PROGRESS", "COMPLETED"], default: "IN_PROGRESS" },
  onboardingStep: { type: Number, default: 1 },
}, { timestamps: true });

export default mongoose.model("Tenant", tenantSchema);
