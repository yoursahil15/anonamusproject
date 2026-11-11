import Company from "../models/Company.js";
import GeneratedDocument from "../models/GeneratedDocument.js";
import Tenant from "../models/Tenant.js";
import User from "../models/User.js";
import { getCompanyScope } from "../utils/officeScope.js";

export const requireActiveTenant = async (req, res, next) => {
  try {
    if (!req.user?.id) return res.status(401).json({ msg: "Authentication required." });
    // JWT claims can be stale. The database is authoritative for role, tenant,
    // account status, and workflow permissions on every tenant operation.
    const user = await User.findById(req.user.id).select(
      "tenantId role permissions isActive accountStatus isApproved isVerified",
    );
    if (!user || !user.isActive || user.accountStatus === "INACTIVE" || !user.isApproved || !user.isVerified) {
      return res.status(403).json({ msg: "Active account access is required." });
    }
    if (user.role === "superadmin" && !user.tenantId) {
      req.user = { ...req.user, role: user.role, permissions: user.permissions || [], tenantId: null };
      return next();
    }
    if (!user.tenantId) return next();
    const tenant = await Tenant.findOne({ _id: user.tenantId, status: "ACTIVE" }).select("_id");
    if (!tenant) {
      return res.status(403).json({ msg: "Active tenant membership is required." });
    }
    req.user = {
      ...req.user,
      role: user.role,
      permissions: user.permissions || [],
      tenantId: String(user.tenantId),
    };
    return next();
  } catch {
    return res.status(500).json({ msg: "Unable to verify tenant membership." });
  }
};

export const requireTenantAdmin = (req, res, next) => {
  if (req.user?.role === "admin" && req.user?.tenantId) return next();
  return res.status(403).json({ msg: "Tenant administrator access is required." });
};

export const authorizeRole = (...roles) => (req, res, next) => {
  if (roles.includes(req.user?.role)) return next();
  return res.status(403).json({ msg: "Your role cannot perform this operation." });
};

export const authorizePermission = (permission) => (req, res, next) => {
  if (req.user?.permissions?.includes(permission)) return next();
  return res.status(403).json({ msg: `The ${permission} workflow permission is required.` });
};

export const requireMakerPermission = (req, res, next) => {
  if (req.user?.role === "superadmin" || req.user?.permissions?.includes("maker")) return next();
  return res.status(403).json({ msg: "Maker permission is required to create documents." });
};

export const requireOfficeCompany = async (req, res, next) => {
  try {
    const company = await Company.findOne({
      _id: req.params.companyId,
      ...(await getCompanyScope(req.user)),
    }).select("_id");
    if (!company) return res.status(404).json({ msg: "Company not found in your office." });
    req.officeCompany = company;
    return next();
  } catch {
    return res.status(400).json({ msg: "Invalid company reference." });
  }
};

export const requireOfficeDocument = async (req, res, next) => {
  try {
    const document = await GeneratedDocument.findById(req.params.documentId).select("company status");
    if (!document) return res.status(404).json({ msg: "Document not found." });
    const company = await Company.findOne({
      _id: document.company,
      ...(await getCompanyScope(req.user)),
    }).select("_id");
    if (!company) return res.status(404).json({ msg: "Document not found in this tenant." });
    req.officeDocument = document;
    return next();
  } catch {
    return res.status(400).json({ msg: "Invalid document reference." });
  }
};
