import { Link, useLocation } from "react-router-dom";
import { Building2, ChevronLeft, ChevronRight, X } from "lucide-react";

const SECTIONS = ["Workspace", "Documents", "Administration"];

export default function Sidebar({
  items = [],
  user,
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onNavigate,
  onLogout,
}) {
  const location = useLocation();

  const isActive = (path) => {
    const target = new URL(path, window.location.origin);
    const pathname = target.pathname;
    const hash = target.hash;
    if (location.pathname !== pathname) return location.pathname.startsWith(`${pathname}/`);
    if (hash && location.hash !== hash) return false;
    if (target.search && location.search !== target.search) return false;
    return hash ? true : !location.hash;
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onNavigate}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}
      <aside
        aria-label="Main navigation"
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[252px] shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-white transition-[transform,width] duration-200 lg:relative lg:z-auto lg:translate-x-0 ${collapsed ? "lg:w-[76px]" : "lg:w-[252px]"} ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className={`flex h-[72px] shrink-0 items-center border-b border-white/10 ${collapsed ? "justify-center px-2" : "gap-3 px-4"}`}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-950/40">
            <Building2 size={21} />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold tracking-wide">CA Portal</p>
              <p className="mt-0.5 truncate text-[11px] text-slate-400">Document workspace</p>
            </div>
          )}
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close navigation"
            className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={17} />
          </button>
        </div>

        <nav className={`min-h-0 flex-1 overflow-y-auto px-2 py-4 ${user?.tenantId && user.role === "admin" ? "scrollbar-hidden" : ""}`}>
          {SECTIONS.map((section) => {
            const sectionItems = items.filter((item) => item.section === section);
            if (!sectionItems.length) return null;

            return (
              <div key={section} className="mb-5">
                {!collapsed && (
                  <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    {section}
                  </p>
                )}
                <div className="space-y-1">
                  {sectionItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    if (item.action === "logout") {
                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => { onNavigate?.(); onLogout?.(); }}
                          title={collapsed ? item.label : undefined}
                          className={`group relative flex min-h-10 w-full items-center rounded-lg text-left text-[12px] font-medium text-slate-300 transition hover:bg-white/[0.07] hover:text-white ${collapsed ? "justify-center px-2" : "gap-3 px-3"}`}
                        >
                          <Icon size={17} className="shrink-0 text-slate-400 group-hover:text-blue-300" />
                          {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
                        </button>
                      );
                    }
                    return (
                      <Link
                        key={item.label}
                        to={item.path}
                        onClick={onNavigate}
                        title={collapsed ? item.label : undefined}
                        aria-current={active ? "page" : undefined}
                        className={`group relative flex min-h-10 items-center rounded-lg text-[12px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${collapsed ? "justify-center px-2" : "gap-3 px-3"} ${active ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950/30" : "text-slate-300 hover:bg-white/[0.07] hover:text-white"}`}
                      >
                        {active && <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-cyan-200" />}
                        <Icon size={17} className={`shrink-0 ${active ? "text-white" : "text-slate-400 group-hover:text-blue-300"}`} />
                        {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {!items.length && (
            <p className="px-3 py-5 text-center text-xs text-slate-500">No pages are available for this account.</p>
          )}
        </nav>

        <div className={`shrink-0 border-t border-white/10 p-2 ${collapsed ? "text-center" : ""}`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.05] p-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold ring-1 ring-white/10">
                {`${user?.fname?.[0] || ""}${user?.lname?.[0] || ""}`.toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{`${user?.fname || ""} ${user?.lname || ""}`.trim() || "Portal User"}</p>
                <p className="mt-0.5 truncate text-[10px] capitalize text-slate-400">{user?.role || "User"}</p>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="mt-2 hidden h-9 w-full items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/[0.07] hover:text-white lg:flex"
          >
            {collapsed ? <ChevronRight size={17} /> : <><ChevronLeft size={17} /><span className="ml-2 text-[11px]">Collapse sidebar</span></>}
          </button>
        </div>
      </aside>
    </>
  );
}
