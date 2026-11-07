import Company from "../models/Company.js";
import GeneratedDocument from "../models/GeneratedDocument.js";
import Tenant from "../models/Tenant.js";
import User from "../models/User.js";
import { getCompanyScope } from "../utils/officeScope.js";

export const requireActiveTenant = async (req, res, next) => {
  try {
    if (!req.user?.tenantId) return next();
    const [user, tenant] = await Promise.all([
      User.findById(req.user.id).select("tenantId role"),
      Tenant.findOne({ _id: req.user.tenantId, status: "ACTIVE" }).select("_id"),
    ]);
    if (!user || String(user.tenantId || "") !== String(req.user.tenantId) || !tenant) {
      return res.status(403).json({ msg: "Active tenant membership is required." });
    }
    return next();
  } catch {
    return res.status(403).json({ msg: "Unable to verify tenant membership." });
  }
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
