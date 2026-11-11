import mongoose from "mongoose";
import Company from "../models/Company.js";
import GeneratedDocument from "../models/GeneratedDocument.js";
import { getCompanyScope } from "../utils/officeScope.js";
import { getGeneratedDocumentFile } from "./documentController.js";
import { recordTenantActivity, createTenantNotification, createTenantNotificationsForPermissions } from "./tenantSupportController.js";

const pageParams = (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
};
const validId = (id) => mongoose.Types.ObjectId.isValid(id);
const scopedCompanyIds = async (user) => Company.distinct("_id", await getCompanyScope(user));
const statusValues = GeneratedDocument.schema.path("status").enumValues;
const parseDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const listTenantDocuments = async (req, res) => {
  const { page, limit, skip } = pageParams(req.query);
  const filter = { company: { $in: await scopedCompanyIds(req.user) } };
  if (req.query.companyId) {
    if (!validId(req.query.companyId)) return res.status(400).json({ success: false, msg: "Invalid company ID." });
    filter.company = { $in: filter.company.$in, $eq: new mongoose.Types.ObjectId(req.query.companyId) };
  }
  if (req.query.status) {
    const status = String(req.query.status).toUpperCase();
    if (!statusValues.includes(status)) return res.status(400).json({ success: false, msg: "Invalid document status." });
    filter.status = status;
  }
  if (req.query.documentType) filter.documentType = String(req.query.documentType).toUpperCase();
  if (req.query.employeeId) {
    if (!validId(req.query.employeeId)) return res.status(400).json({ success: false, msg: "Invalid employee ID." });
    const employee = new mongoose.Types.ObjectId(req.query.employeeId);
    filter.$or = [{ maker: employee }, { checker: employee }, { approver: employee }];
  }
  const from = parseDate(req.query.from);
  const to = parseDate(req.query.to);
  if (from === null || to === null || (from && to && from > to)) return res.status(400).json({ success: false, msg: "Invalid date range." });
  if (from || to) filter.createdAt = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) };
  if (req.query.search) {
    const term = String(req.query.search).trim().slice(0, 100);
    filter.$and = [...(filter.$and || []), { $or: [
      { fileName: { $regex: term, $options: "i" } },
      { documentType: { $regex: term, $options: "i" } },
    ] }];
  }
  const [data, total] = await Promise.all([
    GeneratedDocument.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate("company", "nameOfCompany").populate("maker", "fname lname")
      .populate("checker", "fname lname").populate("approver", "fname lname").lean(),
    GeneratedDocument.countDocuments(filter),
  ]);
  return res.json({ success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
};

export const getTenantDocument = async (req, res) => {
  if (!validId(req.params.documentId)) return res.status(400).json({ success: false, msg: "Invalid document ID." });
  const companyIds = await scopedCompanyIds(req.user);
  const document = await GeneratedDocument.findOne({ _id: req.params.documentId, company: { $in: companyIds } })
    .populate("company", "nameOfCompany").populate("maker", "fname lname")
    .populate("checker", "fname lname").populate("approver", "fname lname").lean();
  if (!document) return res.status(404).json({ success: false, msg: "Document not found." });
  return res.json({ success: true, data: document });
};

export const getTenantDocumentHistory = async (req, res) => {
  if (!validId(req.params.documentId)) return res.status(400).json({ success: false, msg: "Invalid document ID." });
  const companyIds = await scopedCompanyIds(req.user);
  const document = await GeneratedDocument.findOne({ _id: req.params.documentId, company: { $in: companyIds } })
    .select("createdAt uploadedAt maker workflowHistory editLogs status")
    .populate("maker", "fname lname").populate("workflowHistory.actor", "fname lname")
    .populate("editLogs.editedBy", "fname lname").lean();
  if (!document) return res.status(404).json({ success: false, msg: "Document not found." });
  return res.json({ success: true, data: { createdAt: document.createdAt || document.uploadedAt, maker: document.maker, workflow: document.workflowHistory || [], edits: document.editLogs || [], currentStatus: document.status } });
};

export const downloadTenantDocument = async (req, res, next) => {
  if (!validId(req.params.documentId)) return res.status(400).json({ success: false, msg: "Invalid document ID." });
  const companyIds = await scopedCompanyIds(req.user);
  const document = await GeneratedDocument.findOne({ _id: req.params.documentId, company: { $in: companyIds } }).select("company status maker checker approver");
  if (!document) return res.status(404).json({ success: false, msg: "Document not found." });
  req.officeDocument = document;
  return getGeneratedDocumentFile(req, res, next);
};

export const listTenantWorkflow = async (req, res) => {
  const { lane } = req.params;
  if (!["pending-check", "pending-approval", "rejected", "approved"].includes(lane)) return res.status(404).json({ success: false, msg: "Workflow lane not found." });
  const statuses = {
    "pending-check": ["PENDING_CHECK"],
    "pending-approval": ["PENDING_APPROVAL"],
    rejected: ["REJECTED_BY_CHECKER", "REJECTED_BY_APPROVER"],
    approved: ["APPROVED"],
  }[lane];
  if (!statuses) return res.status(404).json({ success: false, msg: "Workflow lane not found." });
  if (["pending-check", "pending-approval"].includes(lane) && !req.user.permissions?.includes(lane === "pending-check" ? "checker" : "approver") && req.user.role !== "admin") {
    return res.status(403).json({ success: false, msg: "Workflow permission is required." });
  }
  if (["rejected", "approved"].includes(lane) && req.user.role !== "admin") return res.status(403).json({ success: false, msg: "Tenant administrator access is required." });
  const { page, limit, skip } = pageParams(req.query);
  const filter = { company: { $in: await scopedCompanyIds(req.user) }, status: { $in: statuses } };
  const [data, total] = await Promise.all([
    GeneratedDocument.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate("company", "nameOfCompany").populate("maker", "fname lname")
      .populate("checker", "fname lname").populate("approver", "fname lname").lean(),
    GeneratedDocument.countDocuments(filter),
  ]);
  return res.json({ success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
};

const updateTransition = async (req, res, allowedFrom, toStatus, action, fields = {}) => {
  if (!validId(req.params.documentId)) return res.status(400).json({ success: false, msg: "Invalid document ID." });
  const companyIds = await scopedCompanyIds(req.user);
  const current = await GeneratedDocument.findOne({ _id: req.params.documentId, company: { $in: companyIds } }).select("_id status maker checker");
  if (!current) return res.status(404).json({ success: false, msg: "Document not found." });
  if (!allowedFrom.includes(current.status)) return res.status(409).json({ success: false, msg: `Document cannot transition from ${current.status}.` });
  const userId = String(req.user.id);
  if (action === "SUBMITTED" && String(current.maker) !== userId) return res.status(403).json({ success: false, msg: "Only the document maker can submit it." });
  if (action === "CHECKED" || action === "REJECTED_BY_CHECKER") {
    if (!req.user.permissions?.includes("checker")) return res.status(403).json({ success: false, msg: "Checker permission is required." });
    if (String(current.maker) === userId) return res.status(403).json({ success: false, msg: "Makers cannot check their own documents." });
  }
  if (action === "APPROVED" || action === "REJECTED_BY_APPROVER") {
    if (!req.user.permissions?.includes("approver")) return res.status(403).json({ success: false, msg: "Approver permission is required." });
    if (String(current.maker) === userId) return res.status(403).json({ success: false, msg: "Makers cannot approve their own documents." });
  }
  const fromStatus = current.status;
  const event = { actor: req.user.id, action, fromStatus, toStatus, at: new Date(), ...(req.body.remarks ? { remarks: String(req.body.remarks).slice(0, 2000) } : {}) };
  const updated = await GeneratedDocument.findOneAndUpdate(
    { _id: current._id, company: { $in: companyIds }, status: fromStatus },
    { $set: { status: toStatus, ...fields }, $push: { workflowHistory: event } },
    { new: true },
  );
  if (!updated) return res.status(409).json({ success: false, msg: "Document status changed; refresh and retry." });
  const company = await Company.findById(updated.company).select("tenantId").lean();
  const tenantId = company?.tenantId || req.user.tenantId;
  if (tenantId) {
    await recordTenantActivity({ tenantId, actor: req.user.id, action, resourceType: "GeneratedDocument", resourceId: updated._id, metadata: { fromStatus, toStatus, remarks: event.remarks } });
    if (action === "SUBMITTED") await createTenantNotificationsForPermissions({ tenantId, permission: "checker", kind: action, title: "Document submitted for checking", message: "A document is waiting for checker review.", resourceType: "GeneratedDocument", resourceId: updated._id });
    if (action === "CHECKED") await createTenantNotificationsForPermissions({ tenantId, permission: "approver", kind: action, title: "Document forwarded for approval", message: "A document is waiting for final approval.", resourceType: "GeneratedDocument", resourceId: updated._id });
    if (["REJECTED_BY_CHECKER", "APPROVED", "REJECTED_BY_APPROVER"].includes(action)) await createTenantNotification({ tenantId, user: updated.maker, kind: action, title: action === "APPROVED" ? "Document approved" : "Document workflow updated", message: action === "APPROVED" ? "Your document was approved." : `Your document was updated to ${toStatus}.`, resourceType: "GeneratedDocument", resourceId: updated._id });
  }
  return res.json({ success: true, msg: "Workflow action recorded.", data: updated });
};

export const submitTenantDocument = (req, res) => {
  if (!req.user.permissions?.includes("maker")) return res.status(403).json({ success: false, msg: "Maker permission is required." });
  return updateTransition(req, res, ["DRAFT"], "PENDING_CHECK", "SUBMITTED");
};

export const checkTenantDocument = async (req, res) => {
  const { action, reason, remarks } = req.body;
  if (!["approve", "reject"].includes(action)) return res.status(400).json({ success: false, msg: "Action must be approve or reject." });
  if (action === "reject" && !String(reason || "").trim()) return res.status(400).json({ success: false, msg: "A rejection reason is required." });
  req.body.remarks = action === "reject" ? reason : remarks;
  return updateTransition(req, res, ["PENDING_CHECK"], action === "approve" ? "PENDING_APPROVAL" : "REJECTED_BY_CHECKER", action === "approve" ? "CHECKED" : "REJECTED_BY_CHECKER", { checker: req.user.id, checkedAt: new Date(), ...(action === "reject" ? { rejectedReason: String(reason).trim() } : {}) });
};

export const approveTenantDocument = async (req, res) => {
  const { action, reason, remarks } = req.body;
  if (!["approve", "reject"].includes(action)) return res.status(400).json({ success: false, msg: "Action must be approve or reject." });
  if (action === "reject" && !String(reason || "").trim()) return res.status(400).json({ success: false, msg: "A rejection reason is required." });
  req.body.remarks = action === "reject" ? reason : remarks;
  return updateTransition(req, res, ["PENDING_APPROVAL"], action === "approve" ? "APPROVED" : "REJECTED_BY_APPROVER", action === "approve" ? "APPROVED" : "REJECTED_BY_APPROVER", { approver: req.user.id, ...(action === "approve" ? { approvedAt: new Date() } : { rejectedReason: String(reason).trim() }) });
};
