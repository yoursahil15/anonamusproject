import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  action: { type: String, required: true, trim: true, maxlength: 100, index: true },
  resourceType: { type: String, required: true, trim: true, maxlength: 80 },
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: { createdAt: true, updatedAt: false } });

activityLogSchema.index({ tenantId:  1, createdAt: -1 });

export default mongoose.model("ActivityLog", activityLogSchema);
