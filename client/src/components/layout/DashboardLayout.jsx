import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { getNavigationItems } from "./navigation";

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export default function DashboardLayout({ children }) {
  const location = useLocation();
  const [user, setUser] = useState(readStoredUser);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setUser(readStoredUser()), [location.pathname]);
  useEffect(() => setMobileOpen(false), [location.pathname]);

  const navigationItems = useMemo(() => getNavigationItems(user), [user]);

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-slate-100 text-slate-900">
      <Sidebar
        items={navigationItems}
        user={user}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((value) => !value)}
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header items={navigationItems} user={user} onMenuClick={() => setMobileOpen(true)} />
        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
