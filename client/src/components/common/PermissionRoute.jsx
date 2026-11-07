import { Navigate } from "react-router-dom";

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export default function PermissionRoute({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  match = "any",
  redirectTo = "/dashboard",
}) {
  const user = readUser();
  if (!user) return <Navigate to="/" replace />;

  const role = String(user.role || "").toLowerCase();
  const permissions = Array.isArray(user.permissions) ? user.permissions : [];
  const checks = [];

  if (allowedRoles.length) {
    checks.push(allowedRoles.map((item) => item.toLowerCase()).includes(role));
  }
  if (requiredPermissions.length) {
    checks.push(requiredPermissions.some((permission) => permissions.includes(permission)));
  }

  const allowed = checks.length === 0 || (match === "all" ? checks.every(Boolean) : checks.some(Boolean));
  return allowed ? children : <Navigate to={redirectTo} replace />;
}
