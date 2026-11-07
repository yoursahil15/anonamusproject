import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, ChevronRight, LogOut, Menu, Search, ShieldCheck, UserRound, X } from "lucide-react";
import { clearAuthData } from "../../utils/auth";

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const prettify = (value) => decodeURIComponent(value).replace(/[-_]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
const isId = (value) => /^[0-9a-f]{24}$/i.test(value) || /^\d+$/.test(value);

export default function Header({ items = [], user: providedUser, onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(providedUser || readStoredUser);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => setUser(providedUser || readStoredUser()), [providedUser, location.pathname]);
  useEffect(() => {
    setProfileOpen(false);
    setNotificationsOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) setNotificationsOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const crumbs = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean).filter((part) => !isId(part));
    const result = [{ label: "Home", to: items.find((item) => item.dashboard)?.path || "/dashboard" }];
    parts.forEach((part, index) => {
      const accumulated = `/${parts.slice(0, index + 1).join("/")}`;
      const navItem = items.find((item) => item.path === accumulated);
      result.push({ label: navItem?.label || prettify(part), to: accumulated });
    });
    return result;
  }, [items, location.pathname]);

  const title = crumbs.length > 1 ? crumbs[crumbs.length - 1].label : "Dashboard";
  const matches = items.filter((item) => item.label.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 5);
  const fullName = `${user?.fname || ""} ${user?.lname || ""}`.trim() || "Portal User";
  const initial = fullName.charAt(0).toUpperCase();

  const logout = () => {
    clearAuthData();
    navigate("/", { replace: true });
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter" && matches[0]) {
      navigate(matches[0].path);
      setSearch("");
      setSearchOpen(false);
    }
    if (event.key === "Escape") setSearchOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[68px] shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" onClick={onMenuClick} aria-label="Open navigation" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden">
            <Menu size={18} />
          </button>
          <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm sm:flex">
            <ShieldCheck size={19} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight text-slate-900">CA Portal</p>
            <p className="hidden truncate text-[11px] text-slate-500 sm:block">Document workspace</p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 justify-center px-1 sm:px-4">
          <div className="relative w-full max-w-md" ref={searchRef}>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              aria-label="Search pages"
              placeholder="Search pages..."
              value={search}
              onFocus={() => setSearchOpen(true)}
              onChange={(event) => { setSearch(event.target.value); setSearchOpen(true); }}
              onKeyDown={handleSearchKeyDown}
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-200"><X size={13} /></button>}
            {searchOpen && search.trim() && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                {matches.length ? matches.map((item) => (
                  <button key={item.path} type="button" onClick={() => { navigate(item.path); setSearch(""); setSearchOpen(false); }} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700">
                    {item.label}<ChevronRight size={14} />
                  </button>
                )) : <p className="px-3 py-3 text-xs text-slate-500">No matching pages</p>}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="relative" ref={notificationsRef}>
            <button type="button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)} className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50">
              <Bell size={17} />
            </button>
            {notificationsOpen && <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-xl"><p className="text-sm font-semibold text-slate-800">Notifications</p><p className="mt-2 text-xs text-slate-500">You’re all caught up.</p></div>}
          </div>

          <div className="relative" ref={profileRef}>
            <button type="button" aria-haspopup="menu" aria-expanded={profileOpen} onClick={() => setProfileOpen((open) => !open)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1 pl-1 pr-2 transition hover:bg-slate-50">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white">{initial}</span>
              <span className="hidden min-w-0 text-left sm:block"><span className="block max-w-[130px] truncate text-xs font-semibold text-slate-800">{fullName}</span><span className="block text-[10px] capitalize text-slate-500">{user?.role || "User"}</span></span>
              <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
            </button>
            {profileOpen && (
              <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                <div className="border-b border-slate-100 px-3 py-2"><p className="truncate text-xs font-semibold text-slate-800">{fullName}</p><p className="truncate text-[11px] text-slate-500">{user?.email}</p><p className="mt-1 text-[10px] capitalize text-blue-700">{user?.role || "User"}</p></div>
                <Link role="menuitem" to="/profile" onClick={() => setProfileOpen(false)} className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"><UserRound size={15} />Profile</Link>
                <button role="menuitem" type="button" onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"><LogOut size={15} />Log out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="shrink-0 border-b border-slate-200 bg-white px-5 py-3 sm:px-7">
        <h1 className="text-base font-semibold text-slate-900">{title}</h1>
        <nav aria-label="Breadcrumb" className="mt-1">
          <ol className="flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
            {crumbs.map((crumb, index) => (
              <li key={`${crumb.to}-${index}`} className="flex items-center gap-1">
                {index > 0 && <ChevronRight size={11} className="text-slate-300" />}
                {index === crumbs.length - 1 ? <span aria-current="page" className="font-medium text-slate-700">{crumb.label}</span> : <Link to={crumb.to} className="hover:text-blue-700">{crumb.label}</Link>}
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </>
  );
}
