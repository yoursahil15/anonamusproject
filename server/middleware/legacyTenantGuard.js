import jwt from "jsonwebtoken";

// Legacy business collections are not tenant-scoped yet. Deny tenant sessions
// until those routes have been migrated to tenant-filtered queries.
export const legacyTenantGuard = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next();
  try {
    const identity = jwt.verify(token, process.env.JWT_SECRET);
    if (identity.tenantId) return res.status(403).json({ msg: "This business area is not enabled for tenant accounts yet." });
  } catch { /* Route-level authentication returns the invalid-token response. */ }
  return next();
};
