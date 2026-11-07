import jwt from "jsonwebtoken";

// Keep legacy routes denied for tenant sessions unless their route handlers
// apply the documented tenant-scoped replacement checks below.
const guardLegacyTenantAccess = (
  req,
  res,
  next,
  allowPlatformSuperadmin = false,
  allowTenantUserList = false,
  allowTenantStaffCreate = false,
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next();
  try {
    const identity = jwt.verify(token, process.env.JWT_SECRET);
    const isAllowedPlatformSuperadmin = allowPlatformSuperadmin && identity.role === "superadmin";
    const rootUserRoute = req.path.replace(/\/+$/, "") === "";
    const isTenantUserList = allowTenantUserList && identity.tenantId && req.method === "GET" && rootUserRoute;
    const isTenantStaffCreate = allowTenantStaffCreate && identity.tenantId && ["admin", "manager"].includes(identity.role) && req.method === "POST" && rootUserRoute;
    if (identity.tenantId && !isAllowedPlatformSuperadmin && !isTenantUserList && !isTenantStaffCreate) {
      return res.status(403).json({ msg: "This business area is not enabled for tenant accounts yet." });
    }
  } catch { /* Route-level authentication returns the invalid-token response. */ }
  return next();
};

export const legacyTenantGuard = (req, res, next) =>
  guardLegacyTenantAccess(req, res, next);

// The platform user directory is intentionally cross-tenant for superadmins;
// getUsers still applies the role-specific query and the API validates the JWT.
export const legacyUserTenantGuard = (req, res, next) =>
  guardLegacyTenantAccess(req, res, next, true, true, true);

// These company routes now authenticate and apply getCompanyScope in every
// read/update/delete handler; company creation assigns ownership from req.user.
export const tenantScopedCompanyGuard = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next();
  try {
    const identity = jwt.verify(token, process.env.JWT_SECRET);
    if (!identity.tenantId) return next();
    const scopedRoute =
      (req.method === "GET" && (req.path.replace(/\/+$/, "") === "" || /^\/[a-f\d]{24}$/i.test(req.path))) ||
      (req.method === "POST" && ["", "/bulk-upload"].includes(req.path.replace(/\/+$/, ""))) ||
      (req.method === "PUT" && /^\/update\/[a-f\d]{24}$/i.test(req.path)) ||
      (req.method === "DELETE" && /^\/delete\/[a-f\d]{24}$/i.test(req.path));
    if (scopedRoute) return next();
  } catch { /* Route-level authentication returns the invalid-token response. */ }
  return legacyTenantGuard(req, res, next);
};

// The generated-document listing has its own office/company query. Other
// document operations remain behind the legacy tenant guard until scoped.
export const legacyGeneratedListGuard = (req, res, next) => {
  if (req.method === "GET" && req.path.replace(/\/+$/, "") === "/generated") return next();
  if (req.method === "GET" && /^\/generated\/[^/]+\/file$/.test(req.path)) return next();
  const scopedGenerationRoutes = [
    "/generate-word/",
    "/generate-power-subsidy/",
    "/generate-from-master/",
    "/generate-interest-subsidy/",
    "/generate-affidavit/",
    "/generate-disbursement-agreement/",
    "/generate/elp/",
    "/generate-production-extract/",
    "/appendix/",
  ];
  if (req.method === "POST" && scopedGenerationRoutes.some((prefix) => req.path.startsWith(prefix))) return next();
  return legacyTenantGuard(req, res, next);
};
