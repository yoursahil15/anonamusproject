import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Company from "../models/Company.js";
import GeneratedDocument from "../models/GeneratedDocument.js";
import User from "../models/User.js";
import { getCompanyScope, getOfficeAdminId } from "../utils/officeScope.js";
import { createTenantNotification, recordTenantActivity } from "./tenantSupportController.js";

const pageParams = (query) => {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
};
const sendPage = (res, data, total, page, limit) => res.json({
  success: true,
  data,
  pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
});
const validId = (id) => mongoose.Types.ObjectId.isValid(id);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isAdmin = (req) => req.user?.role === "admin" && Boolean(req.user?.tenantId);
const companyFields = [
  "nameOfCompany", "pan", "gst", "factoryAddress", "registeredOfficeAddress",
  "ecNumber", "ecDate", "udyamNumber", "mpcbDetails", "contactPerson", "phone",
  "email", "authorizedSignatories", "dateOfIncorporation", "operatingPeriodFrom",
  "operatingPeriodTo", "operatingPeriod",
];
const safeUser = (user) => {
  const object = user.toObject ? user.toObject() : user;
  delete object.password;
  delete object.otp;
  delete object.otpExpiry;
  delete object.resetPasswordToken;
  delete object.resetPasswordExpiry;
  return object;
};

export const listTenantCompanies = async (req, res) => {
  const { page, limit, skip } = pageParams(req.query);
  const scope = await getCompanyScope(req.user);
  const filter = { ...scope };
  if (req.query.search) {
    const search = escapeRegex(String(req.query.search).trim().slice(0, 100));
    filter.$and = [
      ...(filter.$and || []),
      { $or: [
        { nameOfCompany: { $regex: search, $options: "i" } },
        { pan: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ] },
    ];
  }
  if (req.query.status && !Company.schema.path("isActive")) {
    return res.status(400).json({ success: false, msg: "Company status filtering is not supported by the current schema." });
  }
  if (req.query.status && Company.schema.path("isActive")) {
    if (!["active", "inactive"].includes(String(req.query.status).toLowerCase())) return res.status(400).json({ success: false, msg: "Invalid status filter." });
    filter.isActive = String(req.query.status).toLowerCase() === "active";
  }
  const sortFields = { name: "nameOfCompany", createdAt: "createdAt", pan: "pan" };
  const sortField = sortFields[req.query.sort] || "createdAt";
  const direction = req.query.order === "asc" ? 1 : -1;
  const [data, total] = await Promise.all([
    Company.find(filter).sort({ [sortField]: direction }).skip(skip).limit(limit).lean(),
    Company.countDocuments(filter),
  ]);
  return sendPage(res, data, total, page, limit);
};

export const getTenantCompany = async (req, res) => {
  if (!validId(req.params.companyId)) return res.status(400).json({ success: false, msg: "Invalid company ID." });
  const company = await Company.findOne({ _id: req.params.companyId, ...(await getCompanyScope(req.user)) }).lean();
  if (!company) return res.status(404).json({ success: false, msg: "Company not found." });
  return res.json({ success: true, data: company });
};

export const createTenantCompany = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ success: false, msg: "Tenant administrator access is required." });
  const values = Object.fromEntries(companyFields.filter((key) => Object.hasOwn(req.body, key)).map((key) => [key, req.body[key]]));
  try {
    const duplicate = await Company.findOne({ ...(await getCompanyScope(req.user)), pan: String(values.pan || "").toUpperCase() }).select("_id");
    if (duplicate) return res.status(409).json({ success: false, msg: "A company with this PAN already exists in this tenant." });
    const company = await Company.create({ ...values, officeAdmin: await getOfficeAdminId(req.user), tenantId: req.user.tenantId });
    await recordTenantActivity({ tenantId: req.user.tenantId, actor: req.user.id, action: "COMPANY_CREATED", resourceType: "Company", resourceId: company._id, metadata: { nameOfCompany: company.nameOfCompany } });
    return res.status(201).json({ success: true, msg: "Company created successfully.", data: company });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") return res.status(400).json({ success: false, msg: "Company details are invalid or incomplete." });
    throw error;
  }
};

export const updateTenantCompany = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ success: false, msg: "Tenant administrator access is required." });
  if (!validId(req.params.companyId)) return res.status(400).json({ success: false, msg: "Invalid company ID." });
  const updates = Object.fromEntries(companyFields.filter((key) => Object.hasOwn(req.body, key)).map((key) => [key, req.body[key]]));
  if (updates.pan) updates.pan = String(updates.pan).toUpperCase();
  const scope = await getCompanyScope(req.user);
  if (updates.pan) {
    const duplicate = await Company.findOne({ ...scope, pan: updates.pan, _id: { $ne: req.params.companyId } }).select("_id");
    if (duplicate) return res.status(409).json({ success: false, msg: "A company with this PAN already exists in this tenant." });
  }
  const company = await Company.findOneAndUpdate({ _id: req.params.companyId, ...scope }, updates, { new: true, runValidators: true });
  if (!company) return res.status(404).json({ success: false, msg: "Company not found." });
  await recordTenantActivity({ tenantId: req.user.tenantId, actor: req.user.id, action: "COMPANY_UPDATED", resourceType: "Company", resourceId: company._id, metadata: { fields: Object.keys(updates) } });
  return res.json({ success: true, msg: "Company updated successfully.", data: company });
};

export const listTenantCompanyDocuments = async (req, res) => {
  if (!validId(req.params.companyId)) return res.status(400).json({ success: false, msg: "Invalid company ID." });
  const company = await Company.findOne({ _id: req.params.companyId, ...(await getCompanyScope(req.user)) }).select("_id");
  if (!company) return res.status(404).json({ success: false, msg: "Company not found." });
  const { page, limit, skip } = pageParams(req.query);
  const filter = { company: company._id };
  if (req.query.status) {
    const status = String(req.query.status).toUpperCase();
    if (!GeneratedDocument.schema.path("status").enumValues.includes(status)) return res.status(400).json({ success: false, msg: "Invalid document status." });
    filter.status = status;
  }
  const [data, total] = await Promise.all([
    GeneratedDocument.find(filter).select("-filePath -s3Key -s3Url -s3Bucket").sort({ createdAt: -1 }).skip(skip).limit(limit).populate("maker", "fname lname").lean(),
    GeneratedDocument.countDocuments(filter),
  ]);
  return sendPage(res, data, total, page, limit);
};

const employeeScope = (req) => ({
  tenantId: req.user.tenantId,
  role: { $in: ["manager", "intern"] },
  ...(req.user.role === "manager" ? { $or: [{ _id: req.user.id }, { manager: req.user.id }] } : {}),
  ...(req.user.role === "intern" ? { _id: req.user.id } : {}),
  ...(!["admin", "manager", "intern"].includes(req.user.role) ? { _id: null } : {}),
});

export const listTenantEmployees = async (req, res) => {
  const { page, limit, skip } = pageParams(req.query);
  const filter = employeeScope(req);
  if (req.query.role) {
    if (!["manager", "intern"].includes(req.query.role)) return res.status(400).json({ success: false, msg: "Invalid employee role filter." });
    filter.role = req.query.role;
  }
  if (req.query.status) {
    const status = String(req.query.status).toLowerCase();
    if (!["active", "inactive"].includes(status)) return res.status(400).json({ success: false, msg: "Invalid employee status filter." });
    filter.isActive = status === "active";
  }
  if (req.query.search) {
    const search = escapeRegex(String(req.query.search).trim().slice(0, 100));
    filter.$and = [
      ...(filter.$and || []),
      { $or: ["fname", "lname", "email"].map((field) => ({ [field]: { $regex: search, $options: "i" } })) },
    ];
  }
  const sortFields = { name: "fname", email: "email", createdAt: "createdAt", role: "role" };
  const sortField = sortFields[req.query.sort] || "createdAt";
  const direction = req.query.order === "asc" ? 1 : -1;
  const [users, total] = await Promise.all([
    User.find(filter).select("fname lname email mobile role tenantId admin manager permissions isActive accountStatus isVerified isApproved createdAt updatedAt").sort({ [sortField]: direction }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  return sendPage(res, users, total, page, limit);
};

export const getTenantEmployee = async (req, res) => {
  if (!validId(req.params.employeeId)) return res.status(400).json({ success: false, msg: "Invalid employee ID." });
  const employee = await User.findOne({ _id: req.params.employeeId, ...employeeScope(req) }).select("fname lname email mobile role tenantId admin manager permissions isActive accountStatus isVerified isApproved createdAt updatedAt").lean();
  if (!employee) return res.status(404).json({ success: false, msg: "Employee not found." });
  return res.json({ success: true, data: employee });
};

export const createTenantEmployee = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ success: false, msg: "Tenant administrator access is required." });
  const { fname, lname, email, password, mobile, role, managerId } = req.body;
  if (!fname?.trim() || !lname?.trim() || !/^\S+@\S+\.\S+$/.test(String(email || "")) || String(password || "").length < 8 || !["manager", "intern"].includes(role)) {
    return res.status(400).json({ success: false, msg: "Provide valid name, email, password (8+ characters), and employee role." });
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ success: false, msg: "This email is already registered." });
  let manager;
  if (managerId || role === "intern") {
    if (!validId(managerId)) return res.status(400).json({ success: false, msg: "A valid manager is required for an intern." });
    manager = await User.findOne({ _id: managerId, tenantId: req.user.tenantId, role: "manager", isActive: true }).select("_id");
    if (!manager) return res.status(400).json({ success: false, msg: "Select an active manager from this tenant." });
  }
  const created = await User.create({
    fname: fname.trim(), lname: lname.trim(), email: normalizedEmail,
    password: await bcrypt.hash(password, 12), mobile, role,
    tenantId: req.user.tenantId, admin: req.user.id,
    ...(manager ? { manager: manager._id } : {}),
    isVerified: false, isActive: true, isApproved: true,
  });
  await recordTenantActivity({ tenantId: req.user.tenantId, actor: req.user.id, action: "EMPLOYEE_CREATED", resourceType: "User", resourceId: created._id, metadata: { role: created.role } });
  const tenantAdmins = await User.find({ tenantId: req.user.tenantId, role: "admin", isActive: true }).select("_id").lean();
  await Promise.all(tenantAdmins.map(({ _id }) => createTenantNotification({ tenantId: req.user.tenantId, user: _id, kind: "EMPLOYEE_CREATED", title: "New employee added", message: `${created.fname} ${created.lname} joined the office.`, resourceType: "User", resourceId: created._id })));
  return res.status(201).json({ success: true, msg: "Employee created successfully.", data: safeUser(created) });
};

export const updateTenantEmployee = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ success: false, msg: "Tenant administrator access is required." });
  if (!validId(req.params.employeeId)) return res.status(400).json({ success: false, msg: "Invalid employee ID." });
  const employee = await User.findOne({ _id: req.params.employeeId, ...employeeScope(req) });
  if (!employee) return res.status(404).json({ success: false, msg: "Employee not found." });
  for (const field of ["fname", "lname", "mobile"]) {
    if (Object.hasOwn(req.body, field)) employee[field] = String(req.body[field]).trim();
  }
  if (Object.hasOwn(req.body, "email")) employee.email = String(req.body.email).trim().toLowerCase();
  if (Object.hasOwn(req.body, "role")) {
    if (!["manager", "intern"].includes(req.body.role)) return res.status(400).json({ success: false, msg: "Invalid employee role." });
    employee.role = req.body.role;
  }
  if (employee.role === "intern" && Object.hasOwn(req.body, "managerId")) {
    if (!validId(req.body.managerId)) return res.status(400).json({ success: false, msg: "Invalid manager ID." });
    const manager = await User.findOne({ _id: req.body.managerId, tenantId: req.user.tenantId, role: "manager", isActive: true }).select("_id");
    if (!manager) return res.status(400).json({ success: false, msg: "Select an active manager from this tenant." });
    employee.manager = manager._id;
  }
  await employee.save();
  await recordTenantActivity({ tenantId: req.user.tenantId, actor: req.user.id, action: "EMPLOYEE_UPDATED", resourceType: "User", resourceId: employee._id, metadata: { fields: Object.keys(req.body).filter((field) => ["fname", "lname", "mobile", "email", "role", "managerId"].includes(field)) } });
  return res.json({ success: true, msg: "Employee updated successfully.", data: safeUser(employee) });
};

export const setTenantEmployeeStatus = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ success: false, msg: "Tenant administrator access is required." });
  if (!validId(req.params.employeeId) || typeof req.body.isActive !== "boolean") return res.status(400).json({ success: false, msg: "Provide a valid employee ID and boolean isActive value." });
  const employee = await User.findOneAndUpdate(
    { _id: req.params.employeeId, ...employeeScope(req) },
    { $set: { isActive: req.body.isActive, accountStatus: req.body.isActive ? "ACTIVE" : "INACTIVE" } },
    { new: true },
  ).select("-password -otp -otpExpiry -resetPasswordToken -resetPasswordExpiry");
  if (!employee) return res.status(404).json({ success: false, msg: "Employee not found." });
  await recordTenantActivity({ tenantId: req.user.tenantId, actor: req.user.id, action: req.body.isActive ? "EMPLOYEE_ACTIVATED" : "EMPLOYEE_DEACTIVATED", resourceType: "User", resourceId: employee._id });
  return res.json({ success: true, msg: "Employee status updated.", data: employee });
};

export const getTenantRoles = (req, res) => res.json({
  success: true,
  data: {
    roles: ["admin", "manager", "intern", "client"],
    workflowPermissions: ["maker", "checker", "approver"],
  },
});

export const getTenantEmployeePermissions = async (req, res) => {
  if (!validId(req.params.employeeId)) return res.status(400).json({ success: false, msg: "Invalid employee ID." });
  const employee = await User.findOne({ _id: req.params.employeeId, ...employeeScope(req) }).select("permissions").lean();
  if (!employee) return res.status(404).json({ success: false, msg: "Employee not found." });
  return res.json({ success: true, data: { permissions: employee.permissions || [] } });
};

export const updateTenantEmployeePermissions = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ success: false, msg: "Tenant administrator access is required." });
  if (!validId(req.params.employeeId)) return res.status(400).json({ success: false, msg: "Invalid employee ID." });
  const { permissions } = req.body;
  const allowed = ["maker", "checker", "approver"];
  if (!Array.isArray(permissions) || permissions.some((permission) => !allowed.includes(permission))) {
    return res.status(400).json({ success: false, msg: "Permissions must be selected from maker, checker, and approver." });
  }
  const employee = await User.findOneAndUpdate(
    { _id: req.params.employeeId, ...employeeScope(req) },
    { $set: { permissions: [...new Set(permissions)] } },
    { new: true, runValidators: true },
  ).select("_id fname lname role permissions tenantId");
  if (!employee) return res.status(404).json({ success: false, msg: "Employee not found." });
  await recordTenantActivity({ tenantId: req.user.tenantId, actor: req.user.id, action: "EMPLOYEE_PERMISSIONS_CHANGED", resourceType: "User", resourceId: employee._id, metadata: { permissions: employee.permissions } });
  await createTenantNotification({ tenantId: req.user.tenantId, user: employee._id, kind: "PERMISSIONS_CHANGED", title: "Workflow permissions updated", message: "Your office workflow permissions have changed.", resourceType: "User", resourceId: employee._id });
  return res.json({ success: true, msg: "Workflow permissions updated.", data: employee });
};
