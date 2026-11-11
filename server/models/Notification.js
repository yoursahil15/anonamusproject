import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant", required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  kind: { type: String, required: true, trim: true, maxlength: 80 },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  message: { type: String, required: true, trim: true, maxlength: 1000 },
  resourceType: { type: String, trim: true, maxlength: 80 },
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  readAt: { type: Date, default: null, index: true },
}, { timestamps: true });

notificationSchema.index({ tenantId: 1, user: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
