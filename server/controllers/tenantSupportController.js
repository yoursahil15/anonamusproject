import mongoose from "mongoose";
import ActivityLog from "../models/ActivityLog.js";
import Notification from "../models/Notification.js";
import Tenant from "../models/Tenant.js";
import Company from "../models/Company.js";
import GeneratedDocument from "../models/GeneratedDocument.js";
import User from "../models/User.js";
import { getCompanyScope } from "../utils/officeScope.js";

const pageParams = (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
};
const validId = (id) => mongoose.Types.ObjectId.isValid(id);
const scopes = async (user) => Company.distinct("_id", await getCompanyScope(user));

export const recordTenantActivity = async ({ tenantId, actor, action, resourceType, resourceId, metadata = {} }) => {
  if (!tenantId || !actor) return;
  try { await ActivityLog.create({ tenantId, actor, action, resourceType, resourceId, metadata }); }
  catch (error) { console.error("Activity log write failed:", error.message); }
};

export const tenantProfile = async (req, res) => {
  const tenant = await Tenant.findOne({ _id: req.user.tenantId, status: "ACTIVE" })
    .select("name slug firmType contactEmail contactNumber address professionalDetails businessDetails settings status onboardingStatus")
    .lean();
  if (!tenant) return res.status(404).json({ success: false, msg: "Office profile not found." });
  return res.json({ success: true, data: tenant });
};

export const updateTenantProfile = async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ success: false, msg: "Tenant administrator access is required." });
  const allowedRoot = ["name", "firmType", "contactEmail", "contactNumber", "address", "professionalDetails", "businessDetails", "settings"];
  const rootUpdates = {};
  if (req.body.firmType && !["Proprietorship", "Partnership", "LLP", "Private Limited", "Other"].includes(req.body.firmType)) {
    return res.status(400).json({ success: false, msg: "Invalid firm type." });
  }
  for (const key of allowedRoot) {
    if (!Object.hasOwn(req.body, key)) continue;
    if (["address", "professionalDetails", "businessDetails", "settings"].includes(key)) {
      if (!req.body[key] || typeof req.body[key] !== "object" || Array.isArray(req.body[key])) return res.status(400).json({ success: false, msg: `Invalid ${key}.` });
      const allowedNested = {
        address: ["country", "state", "city", "office", "pinCode"],
        professionalDetails: ["frn", "membershipNumber", "primaryContact", "designation", "gstin"],
        businessDetails: ["employees", "clients", "documentTypes", "activities", "workflow"],
        settings: ["timezone", "dateFormat", "currency"],
      }[key];
      for (const nested of allowedNested) if (Object.hasOwn(req.body[key], nested)) rootUpdates[`${key}.${nested}`] = req.body[key][nested];
    } else rootUpdates[key] = typeof req.body[key] === "string" ? req.body[key].trim() : req.body[key];
  }
  if (rootUpdates.contactEmail && !/^\S+@\S+\.\S+$/.test(rootUpdates.contactEmail)) return res.status(400).json({ success: false, msg: "Enter a valid office email." });
  try {
    const tenant = await Tenant.findOneAndUpdate({ _id: req.user.tenantId, status: "ACTIVE" }, { $set: rootUpdates }, { new: true, runValidators: true })
      .select("name slug firmType contactEmail contactNumber address professionalDetails businessDetails settings status onboardingStatus");
    if (!tenant) return res.status(404).json({ success: false, msg: "Office profile not found." });
    await recordTenantActivity({ tenantId: req.user.tenantId, actor: req.user.id, action: "TENANT_PROFILE_UPDATED", resourceType: "Tenant", resourceId: tenant._id, metadata: { fields: Object.keys(req.body).filter((key) => allowedRoot.includes(key)) } });
    return res.json({ success: true, msg: "Office profile updated.", data: tenant });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") return res.status(400).json({ success: false, msg: "Office profile contains invalid values." });
    throw error;
  }
};

export const listTenantActivity = async (req, res) => {
  const { page, limit, skip } = pageParams(req.query);
  const filter = { tenantId: req.user.tenantId };
  if (req.query.employeeId) {
    if (!validId(req.query.employeeId)) return res.status(400).json({ success: false, msg: "Invalid employee ID." });
    filter.actor = req.query.employeeId;
  }
  if (req.query.action) filter.action = String(req.query.action).slice(0, 100);
  if (req.query.resource) filter.resourceType = String(req.query.resource).slice(0, 80);
  const from = req.query.from ? new Date(req.query.from) : undefined;
  const to = req.query.to ? new Date(req.query.to) : undefined;
  if ((from && Number.isNaN(from.getTime())) || (to && Number.isNaN(to.getTime())) || (from && to && from > to)) return res.status(400).json({ success: false, msg: "Invalid date range." });
  if (from || to) filter.createdAt = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) };
  const [data, total] = await Promise.all([
    ActivityLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("actor", "fname lname email").lean(),
    ActivityLog.countDocuments(filter),
  ]);
  return res.json({ success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
};

export const listTenantNotifications = async (req, res) => {
  const { page, limit, skip } = pageParams(req.query);
  const filter = { tenantId: req.user.tenantId, user: req.user.id };
  const [data, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
  ]);
  return res.json({ success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
};

export const markTenantNotificationRead = async (req, res) => {
  if (!validId(req.params.notificationId)) return res.status(400).json({ success: false, msg: "Invalid notification ID." });
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.notificationId, tenantId: req.user.tenantId, user: req.user.id },
    { $set: { readAt: new Date() } }, { new: true },
  ).lean();
  if (!notification) return res.status(404).json({ success: false, msg: "Notification not found." });
  return res.json({ success: true, data: notification });
};

export const markAllTenantNotificationsRead = async (req, res) => {
  const result = await Notification.updateMany({ tenantId: req.user.tenantId, user: req.user.id, readAt: null }, { $set: { readAt: new Date() } });
  return res.json({ success: true, data: { modifiedCount: result.modifiedCount } });
};

export const createTenantNotificationsForPermissions = async ({ tenantId, permission, kind, title, message, resourceType, resourceId }) => {
  if (!tenantId) return;
  const recipients = await User.find({ tenantId, permissions: permission, isActive: true }).select("_id").lean();
  if (!recipients.length) return;
  try {
    await Notification.insertMany(recipients.map(({ _id: user }) => ({ tenantId, user, kind, title, message, resourceType, resourceId })));
  } catch (error) { console.error("Notification write failed:", error.message); }
};

export const createTenantNotification = async ({ tenantId, user, kind, title, message, resourceType, resourceId }) => {
  if (!tenantId || !user) return;
  try { await Notification.create({ tenantId, user, kind, title, message, resourceType, resourceId }); }
  catch (error) { console.error("Notification write failed:", error.message); }
};

const buildMonthly = (match) => [
  { $match: match },
  { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt", timezone: "UTC" } }, count: { $sum: 1 } } },
  { $sort: { _id: 1 } },
];

export const monthlyDocumentsReport = async (req, res) => {
  const match = { company: { $in: await scopes(req.user) } };
  const from = req.query.from ? new Date(req.query.from) : undefined;
  const to = req.query.to ? new Date(req.query.to) : undefined;
  if ((from && Number.isNaN(from.getTime())) || (to && Number.isNaN(to.getTime())) || (from && to && from > to)) return res.status(400).json({ success: false, msg: "Invalid date range." });
  if (from || to) match.createdAt = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) };
  return res.json({ success: true, data: await GeneratedDocument.aggregate(buildMonthly(match)) });
};

export const companyStatisticsReport = async (req, res) => {
  const companyIds = await scopes(req.user);
  const data = await GeneratedDocument.aggregate([
    { $match: { company: { $in: companyIds } } },
    { $group: { _id: "$company", documents: { $sum: 1 } } },
    { $lookup: { from: Company.collection.name, localField: "_id", foreignField: "_id", as: "company" } },
    { $unwind: "$company" },
    { $project: { _id: 0, companyId: "$company._id", name: "$company.nameOfCompany", documents: 1 } },
    { $sort: { documents: -1 } },
  ]);
  return res.json({ success: true, data });
};

export const employeeWorkloadReport = async (req, res) => {
  const companyIds = await scopes(req.user);
  const data = await GeneratedDocument.aggregate([
    { $match: { company: { $in: companyIds } } },
    { $group: { _id: "$maker", documents: { $sum: 1 } } },
    { $lookup: { from: User.collection.name, localField: "_id", foreignField: "_id", as: "employee" } },
    { $unwind: "$employee" },
    { $match: { "employee.tenantId": req.user.tenantId } },
    { $project: { _id: 0, employeeId: "$employee._id", name: { $concat: ["$employee.fname", " ", "$employee.lname"] }, documents: 1 } },
    { $sort: { documents: -1 } },
  ]);
  return res.json({ success: true, data });
};

export const workflowStatisticsReport = async (req, res) => {
  const data = await GeneratedDocument.aggregate([
    { $match: { company: { $in: await scopes(req.user) } } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  return res.json({ success: true, data });
};

export const approvalStatisticsReport = async (req, res) => {
  const data = await GeneratedDocument.aggregate([
    { $match: { company: { $in: await scopes(req.user) }, "workflowHistory.0": { $exists: true } } },
    { $unwind: "$workflowHistory" },
    { $match: { "workflowHistory.action": { $in: ["APPROVED", "REJECTED_BY_APPROVER"] } } },
    { $group: { _id: { month: { $dateToString: { format: "%Y-%m", date: "$workflowHistory.at", timezone: "UTC" } }, action: "$workflowHistory.action" }, count: { $sum: 1 } } },
    { $sort: { "_id.month": 1 } },
  ]);
  return res.json({ success: true, data });
};
