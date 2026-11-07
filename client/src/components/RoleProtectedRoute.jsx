import PermissionRoute from "./common/PermissionRoute";

export default function RoleProtectedRoute({
  children,
  allowedRoles = [],
  allowedPermissions = [],
}) {
  return (
    <PermissionRoute
      allowedRoles={allowedRoles}
      requiredPermissions={allowedPermissions}
      match="any"
    >
      {children}
    </PermissionRoute>
  );
}
