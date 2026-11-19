import {
  LayoutDashboard,
  UserCheck,
  FileText,
  FilePlus,
  FileCheck,
  Users,
} from "lucide-react";
import { getDashboardPath } from "../../utils/auth";

const STAFF_ROLES = ["superadmin", "admin", "manager", "intern"];
const WORKFLOW_PERMISSIONS = ["maker", "checker", "approver"];

const NAVIGATION = [
  {
    label: "Dashboard",
    path: "/dashboard",
    dashboard: true,
    icon: LayoutDashboard,
    section: "Workspace",
    roles: [...STAFF_ROLES, "client"],
  },
  {
    label: "Client Master",
    path: "/clients",
    icon: UserCheck,
    section: "Workspace",
    roles: STAFF_ROLES,
  },
  {
    label: "Document Master",
    path: "/document-master",
    icon: FileText,
    section: "Workspace",
    roles: STAFF_ROLES,
  },
  {
    label: "Generate Document",
    path: "/generate",
    icon: FilePlus,
    section: "Documents",
    roles: ["superadmin"],
    permissions: ["maker"],
  },
  {
    label: "Saved Documents",
    path: "/generated-documents",
    icon: FileText,
    section: "Documents",
    roles: ["superadmin"],
    permissions: WORKFLOW_PERMISSIONS,
  },
  {
    label: "Document Approval",
    path: "/document-approval",
    icon: FileCheck,
    section: "Documents",
    roles: ["superadmin"],
    permissions: WORKFLOW_PERMISSIONS,
  },
  {
    label: "Add User",
    path: "/users",
    icon: Users,
    section: "Administration",
    roles: ["superadmin", "admin", "manager"],
  },
  {
    label: "User Management",
    path: "/user-management",
    icon: Users,
    section: "Administration",
    roles: ["superadmin"],
  },
];

const TENANT_ADMIN_NAVIGATION = [
  { label: "Dashboard", path: "/tenant-dashboard", dashboard: true, icon: LayoutDashboard, section: "Workspace" },
  { label: "Client Master", path: "/clients", icon: UserCheck, section: "Workspace" },
  { label: "Document Master", path: "/document-master", icon: FileText, section: "Workspace" },
  { label: "Generate Document", path: "/generate", icon: FilePlus, section: "Documents" },
  { label: "Saved Documents", path: "/generated-documents", icon: FileText, section: "Documents" },
  { label: "Document Approval", path: "/document-approval", icon: FileCheck, section: "Documents" },
  { label: "Add User", path: "/users", icon: Users, section: "Administration" },
];

export const getNavigationItems = (user) => {
  if (!user || typeof user !== "object") return [];

  const role = String(user.role || "").toLowerCase();
  const permissions = Array.isArray(user.permissions) ? user.permissions : [];
  if (user.tenantId && role === "admin") {
    return TENANT_ADMIN_NAVIGATION;
  }

  return NAVIGATION.filter((item) => {
    const allowedByRole = item.roles?.includes(role) || false;
    const allowedByPermission = item.permissions?.some((permission) => permissions.includes(permission)) || false;
    return allowedByRole || allowedByPermission;
  }).map((item) => ({
    ...item,
    path: item.dashboard
      ? user.tenantId && role === "admin"
        ? "/tenant-dashboard"
        : getDashboardPath(role) || item.path
      : item.path,
  }));
};
