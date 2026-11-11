import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  // Tenant router middleware already verified and refreshed this request's
  // identity. Do not replace its database-backed values with older JWT claims.
  if (req.tenantAuthVerified) return next();
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({
      msg: "No token",
    });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role,
      permissions: decoded.permissions || [],
      tenantId: decoded.tenantId || null,
    };

    next();
  } catch (err) {
    res.status(401).json({
      msg: "Invalid token",
    });
  }
};
