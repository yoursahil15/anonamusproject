import {
  Activity,
  LayoutDashboard,
  UserCheck,
  FileText,
  FilePlus,
  FileCheck,
  Users,
  BarChart3,
  Bell,
  Building,
  Building2,
  ClipboardList,
  LogOut,
  Settings,
  Shield,
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
  { label: "Companies", path: "/tenant-dashboard#companies", icon: Building, section: "Workspace" },
  { label: "Employees / Staff", path: "/tenant-dashboard#employees", icon: Users, section: "Administration" },
  { label: "Roles & Permissions", path: "/tenant-dashboard#roles-permissions", icon: Shield, section: "Administration" },
  { label: "Client Management", path: "/clients", icon: UserCheck, section: "Workspace" },
  { label: "Create Document", path: "/generate", icon: FilePlus, section: "Documents", permissions: ["maker"] },
  { label: "All Documents", path: "/tenant-dashboard#all-documents", icon: FileText, section: "Documents" },
  { label: "Draft Documents", path: "/tenant-dashboard?status=DRAFT#all-documents", icon: FileText, section: "Documents" },
  { label: "Pending Check", path: "/tenant-dashboard?status=PENDING_CHECK#all-documents", icon: FileCheck, section: "Documents" },
  { label: "Pending Approval", path: "/tenant-dashboard?status=PENDING_APPROVAL#all-documents", icon: FileCheck, section: "Documents" },
  { label: "Approved Documents", path: "/tenant-dashboard?status=APPROVED#all-documents", icon: FileCheck, section: "Documents" },
  { label: "Rejected Documents", path: "/tenant-dashboard?status=REJECTED#all-documents", icon: FileCheck, section: "Documents" },
  { label: "Document Templates", path: "/templates", icon: ClipboardList, section: "Documents" },
  { label: "Reports & Analytics", path: "/tenant-dashboard#reports", icon: BarChart3, section: "Workspace" },
  { label: "Activity Logs", path: "/tenant-dashboard#activity-logs", icon: Activity, section: "Administration" },
  { label: "Notifications", path: "/tenant-dashboard#notifications", icon: Bell, section: "Administration" },
  { label: "Office Profile", path: "/tenant-dashboard#firm-profile", icon: Building2, section: "Administration" },
  { label: "Settings", path: "/tenant-dashboard#settings", icon: Settings, section: "Administration" },
  { label: "Logout", path: "#logout", icon: LogOut, section: "Administration", action: "logout" },
];

export const getNavigationItems = (user) => {
  if (!user || typeof user !== "object") return [];

  const role = String(user.role || "").toLowerCase();
  const permissions = Array.isArray(user.permissions) ? user.permissions : [];
  if (user.tenantId && role === "admin") {
    return TENANT_ADMIN_NAVIGATION.filter((item) =>
      !item.permissions || item.permissions.some((permission) => permissions.includes(permission)),
    );
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
