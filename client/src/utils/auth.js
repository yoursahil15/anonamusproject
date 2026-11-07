const DASHBOARD_PATHS = {
  superadmin: "/admin-dashboard",
  admin: "/office-dashboard",
  manager: "/manager-dashboard",
  intern: "/maker-dashboard",
  client: "/client-dashboard",
};

export const getDashboardPath = (role) => {
  if (typeof role !== "string") return null;
  return DASHBOARD_PATHS[role.trim().toLowerCase()] || null;
};

export const getUserLandingPath = (user) => {
  if (!user || typeof user !== "object" || Array.isArray(user)) return null;

  if (user.tenantId) {
    return user.onboardingStatus === "COMPLETED"
      ? "/tenant-dashboard"
      : "/onboarding";
  }

  return getDashboardPath(user.role);
};

export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("tempPassword");
};

