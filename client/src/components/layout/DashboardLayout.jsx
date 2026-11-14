import { useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { getNavigationItems } from "./navigation";
import { clearAuthData } from "../../utils/auth";
import "./tenant-admin.css";

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const user = useMemo(() => readStoredUser(), []);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigationItems = useMemo(() => getNavigationItems(user), [user]);
  const isTenantAdmin = Boolean(user?.tenantId && user.role === "admin");
  const logout = () => {
    clearAuthData();
    navigate("/", { replace: true });
  };

  return (
    <div className={`flex h-dvh min-h-0 overflow-hidden bg-slate-100 text-slate-900 ${isTenantAdmin ? "tenant-admin-shell" : ""}`}>
      <Sidebar
        items={navigationItems}
        user={user}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((value) => !value)}
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
        onLogout={logout}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header items={navigationItems} user={user} onMenuClick={() => setMobileOpen(true)} />
        <main className={`min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 ${isTenantAdmin ? "scrollbar-hidden" : ""}`}>
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
