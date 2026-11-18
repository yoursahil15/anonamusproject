import PermissionRoute from "./common/PermissionRoute";

export default function RoleProtectedRoute({
  children,
  allowedRoles = [],
  allowedPermissions = [],
  allowTenantAdmin = false,
}) {
  return (
    <PermissionRoute
      allowedRoles={allowedRoles}
      requiredPermissions={allowedPermissions}
      allowTenantAdmin={allowTenantAdmin}
      match="any"
    >
      {children}
    </PermissionRoute>
  );
}
