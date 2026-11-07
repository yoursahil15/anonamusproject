import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  History,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import API from "../services/api";
import StatusBadge from "../components/common/StatusBadge";

const WORKFLOW_PERMISSIONS = ["maker", "checker", "approver"];
const ROLE_OPTIONS = ["admin", "manager", "intern"];
const ROLE_FILTERS = ["all", "superadmin", "admin", "manager", "intern", "client"];

const readCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const readTokenRole = () => {
  try {
    const token = localStorage.getItem("token");
    const payload = token?.split(".")[1];
    if (!payload) return null;
    const encoded = payload.replace(/-/g, "+").replace(/_/g, "/");
    const base64 = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=");
    return JSON.parse(window.atob(base64)).role || null;
  } catch {
    return null;
  }
};

const fullName = (user) =>
  `${user?.fname || ""} ${user?.lname || ""}`.trim() || user?.email || "Unknown user";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const countBy = (records, key, fallback = "Unknown") =>
  records.reduce((result, record) => {
    const value = record?.[key] || fallback;
    result[value] = (result[value] || 0) + 1;
    return result;
  }, {});

const actorLabel = (actor) => {
  if (actor && typeof actor === "object") return fullName(actor);
  return actor ? `User ${String(actor).slice(-6)}` : "System user";
};

const makeActivityEvents = (documents) => {
  const events = [];

  documents.forEach((document) => {
    const documentLabel = document.documentType?.replaceAll("_", " ") || "Document";
    const companyLabel = document.company?.nameOfCompany || "Company record";

    if (document.createdAt) {
      events.push({
        id: `${document._id}-created`,
        action: "Document generated",
        actor: actorLabel(document.maker),
        subject: `${documentLabel} · ${companyLabel}`,
        at: document.createdAt,
        icon: FileText,
      });
    }
    if (document.checkedAt) {
      const rejected = document.status === "REJECTED_BY_CHECKER";
      events.push({
        id: `${document._id}-checked`,
        action: rejected ? "Document rejected by checker" : "Document checked",
        actor: actorLabel(document.checker),
        subject: `${documentLabel} · ${companyLabel}`,
        at: document.checkedAt,
        icon: rejected ? XCircle : CheckCircle2,
      });
    }
    if (document.approvedAt) {
      const rejected = document.status === "REJECTED_BY_APPROVER";
      events.push({
        id: `${document._id}-approved`,
        action: rejected ? "Document rejected by approver" : "Document approved",
        actor: actorLabel(document.approver),
        subject: `${documentLabel} · ${companyLabel}`,
        at: document.approvedAt,
        icon: rejected ? XCircle : FileCheck2,
      });
    }
    (document.editLogs || []).forEach((edit, index) => {
      if (!edit.editedAt) return;
      events.push({
        id: `${document._id}-edit-${index}`,
        action: "Document edited",
        actor: actorLabel(edit.editedBy),
        subject: `${documentLabel} · ${companyLabel}`,
        at: edit.editedAt,
        icon: Activity,
      });
    });
  });

  return events
    .sort((left, right) => new Date(right.at).getTime() - new Date(left.at).getTime())
    .slice(0, 10);
};

function MetricCard({ icon: Icon, label, value, detail, tone = "blue", loading }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    violet: "bg-violet-50 text-violet-700 ring-violet-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${tones[tone]}`}>
          <Icon size={19} />
        </div>
        {value === null && !loading && <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">API unavailable</span>}
      </div>
      <p className="mt-4 text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
        {loading ? <span className="inline-block h-7 w-14 animate-pulse rounded bg-slate-100" /> : value ?? "—"}
      </p>
      <p className="mt-1 text-[11px] leading-4 text-slate-500">{detail}</p>
    </article>
  );
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">{eyebrow}</p>
        <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

function DataNotice({ children }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs leading-5 text-amber-900">
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

function DistributionList({ title, values, total, emptyLabel = "No records available" }) {
  const entries = Object.entries(values).sort((a, b) => b[1] - a[1]);
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      {entries.length ? (
        <div className="mt-4 space-y-3">
          {entries.map(([label, value]) => (
            <div key={label}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                <span className="truncate capitalize text-slate-600">{String(label).replaceAll("_", " ")}</span>
                <span className="font-semibold tabular-nums text-slate-800">{value}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-blue-600" style={{ width: `${total ? Math.max(4, (value / total) * 100) : 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : <p className="mt-4 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">{emptyLabel}</p>}
    </div>
  );
}

export default function SuperadminDashboard() {
  const currentUser = useMemo(readCurrentUser, []);
  const tokenRole = useMemo(readTokenRole, []);
  const hasSuperadminToken = tokenRole === "superadmin";
  const [users, setUsers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [usersAvailable, setUsersAvailable] = useState(false);
  const [documentsAvailable, setDocumentsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState({ users: "", documents: "" });
  const [actionError, setActionError] = useState("");
  const [updatingUsers, setUpdatingUsers] = useState({});
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchDashboardData = useCallback(async (quiet = false) => {
    if (!hasSuperadminToken) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setErrors({ users: "", documents: "" });

    const [usersResult, documentsResult] = await Promise.allSettled([
      API.get("/users"),
      API.get("/documents/generated"),
    ]);

    if (usersResult.status === "fulfilled" && Array.isArray(usersResult.value.data)) {
      setUsers(usersResult.value.data);
      setUsersAvailable(true);
    } else {
      setUsersAvailable(false);
      setErrors((previous) => ({ ...previous, users: "User records could not be loaded." }));
    }

    if (documentsResult.status === "fulfilled" && Array.isArray(documentsResult.value.data)) {
      setDocuments(documentsResult.value.data.map((document) => ({
        _id: document._id,
        documentType: document.documentType,
        status: document.status,
        createdAt: document.createdAt,
        checkedAt: document.checkedAt,
        approvedAt: document.approvedAt,
        company: document.company ? { nameOfCompany: document.company.nameOfCompany } : null,
        maker: document.maker ? { fname: document.maker.fname, lname: document.maker.lname } : null,
        checker: document.checker ? { fname: document.checker.fname, lname: document.checker.lname } : null,
        approver: document.approver ? { fname: document.approver.fname, lname: document.approver.lname } : null,
        editLogs: (document.editLogs || []).map((edit) => ({ editedAt: edit.editedAt, editedBy: edit.editedBy })),
      })));
      setDocumentsAvailable(true);
    } else {
      setDocumentsAvailable(false);
      setErrors((previous) => ({ ...previous, documents: "Document records could not be loaded." }));
    }

    setLoading(false);
    setRefreshing(false);
  }, [hasSuperadminToken]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesQuery = !query ||
        fullName(user).toLowerCase().includes(query) ||
        String(user.email || "").toLowerCase().includes(query);
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? user.isActive : !user.isActive);
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const roleCounts = useMemo(() => countBy(users, "role"), [users]);
  const documentStatuses = useMemo(() => countBy(documents, "status"), [documents]);
  const documentTypes = useMemo(() => countBy(documents, "documentType"), [documents]);
  const auditEvents = useMemo(() => makeActivityEvents(documents), [documents]);
  const accountRecentCount = useMemo(() => {
    const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return users.filter((user) => user.createdAt && new Date(user.createdAt).getTime() >= since).length;
  }, [users]);
  const recentUsers = useMemo(() => [...users]
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())
    .slice(0, 5), [users]);

  const setUserUpdating = (userId, value) =>
    setUpdatingUsers((previous) => ({ ...previous, [userId]: value }));

  const updateUserField = async (user, patch) => {
    const userId = user._id;
    const previous = user;
    setActionError("");
    setUserUpdating(userId, true);
    setUsers((items) => items.map((item) => item._id === userId ? { ...item, ...patch } : item));

    try {
      await API.put(`/users/${userId}`, patch);
    } catch (error) {
      setUsers((items) => items.map((item) => item._id === userId ? previous : item));
      setActionError(error.response?.data?.msg || "Unable to update this account.");
    } finally {
      setUserUpdating(userId, false);
    }
  };

  const updatePermissions = async (user, permission, checked) => {
    const current = user.permissions || [];
    const permissions = checked
      ? [...new Set([...current, permission])]
      : current.filter((item) => item !== permission);
    const previous = user;
    setActionError("");
    setUserUpdating(user._id, true);
    setUsers((items) => items.map((item) => item._id === user._id ? { ...item, permissions } : item));

    try {
      await API.put(`/users/permissions/${user._id}`, { permissions });
    } catch (error) {
      setUsers((items) => items.map((item) => item._id === user._id ? previous : item));
      setActionError(error.response?.data?.msg || "Unable to update workflow permissions.");
    } finally {
      setUserUpdating(user._id, false);
    }
  };

  const activeUsers = users.filter((user) => user.isActive).length;
  const pendingDocuments = documents.filter((document) => ["PENDING_CHECK", "PENDING_APPROVAL"].includes(document.status)).length;

  if (!hasSuperadminToken) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-amber-200 bg-white p-7 text-center shadow-sm">
        <ShieldCheck size={28} className="mx-auto text-amber-600" />
        <h1 className="mt-3 text-lg font-bold text-slate-900">Superadmin access required</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">This dashboard only loads platform-wide data for a session whose signed token identifies a superadmin. Sign in with an authorized superadmin account to continue.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-900 p-5 text-white shadow-sm sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-2 -top-10 h-44 w-44 rounded-full border border-white/10" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-300/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-100">
              <ShieldCheck size={13} /> Platform administration
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Superadmin Dashboard</h1>
            <p className="mt-2 text-sm leading-6 text-blue-100/75">
              Welcome{currentUser?.fname ? `, ${currentUser.fname}` : ""}. Monitor platform records and manage staff access from one place.
            </p>
          </div>
          <button type="button" onClick={() => fetchDashboardData(true)} disabled={refreshing} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-xs font-semibold text-white transition hover:bg-white/15 disabled:opacity-60">
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> Refresh data
          </button>
        </div>
      </section>

      <section aria-label="Platform overview" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={Building2} label="Total CA Offices" value={null} detail="Office directory API is not available yet." tone="blue" loading={loading} />
        <MetricCard icon={Users} label="Total Users" value={usersAvailable ? users.length : null} detail={usersAvailable ? `${activeUsers} active accounts` : errors.users || "Waiting for user records"} tone="violet" loading={loading} />
        <MetricCard icon={FileText} label="Total Documents" value={documentsAvailable ? documents.length : null} detail={documentsAvailable ? `${pendingDocuments} awaiting review` : errors.documents || "Waiting for document records"} tone="emerald" loading={loading} />
        <MetricCard icon={Clock3} label="Pending Office Requests" value={null} detail="Tenant review status is not exposed to this dashboard." tone="amber" loading={loading} />
      </section>

      <section id="offices" className="space-y-4 scroll-mt-24">
        <SectionHeading eyebrow="Platform directory" title="CA Office Management" description="Office records and approval states are stored in the Tenant model, but there is no superadmin office-list or office-management API in the current backend." />
        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Building2 size={19} /></div>
              <div><h3 className="text-sm font-bold text-slate-900">Office directory unavailable</h3><p className="mt-0.5 text-xs text-slate-500">No office records are loaded or inferred from employee data.</p></div>
            </div>
            <DataNotice>
              The existing onboarding API only returns the signed-in owner’s tenant. A protected superadmin endpoint is needed to list offices, employee totals, status, and office details. No cross-office company records are queried for this section.
            </DataNotice>
          </article>
          <article className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
            <div className="flex items-center gap-2 text-slate-700"><Clock3 size={17} /><h3 className="text-sm font-bold">Office requests</h3></div>
            <p className="mt-2 text-xs leading-5 text-slate-500">Tenant records support `PENDING`, `ACTIVE`, and `SUSPENDED` status, but there is no API to review or change those statuses as superadmin.</p>
            <p className="mt-3 text-[11px] font-semibold text-slate-400">Request count: unavailable</p>
          </article>
        </div>
      </section>

      <section id="users" className="space-y-4 scroll-mt-24">
        <SectionHeading
          eyebrow="Access administration"
          title="User Management"
          description="Search the user records returned by the existing superadmin API. Role, status, and workflow permission changes use the existing protected user endpoints."
          action={<Link to="/users" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-blue-200 hover:text-blue-700">User administration <ArrowRight size={14} /></Link>}
        />

        {errors.users && <DataNotice>{errors.users} Refresh to retry. The table is not populated with sample users.</DataNotice>}
        {actionError && <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"><span>{actionError}</span><button type="button" onClick={() => setActionError("")} className="font-semibold underline">Dismiss</button></div>}

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h3 className="text-sm font-bold text-slate-900">Platform users</h3><p className="mt-1 text-[11px] text-slate-500">{usersAvailable ? `${filteredUsers.length} of ${users.length} accounts` : "User data not loaded"}</p></div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(220px,1fr)_150px_140px]">
              <label className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100" /></label>
              <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} aria-label="Filter by role" className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-blue-400">
                {ROLE_FILTERS.map((role) => <option key={role} value={role}>{role === "all" ? "All roles" : role}</option>)}
              </select>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status" className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-blue-400"><option value="all">All status</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1020px] border-collapse text-left">
              <thead><tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold uppercase tracking-wider text-slate-500"><th className="px-4 py-3">User</th><th className="px-3 py-3">Role</th><th className="px-3 py-3 text-center">Account</th>{WORKFLOW_PERMISSIONS.map((permission) => <th key={permission} className="px-3 py-3 text-center capitalize">{permission}</th>)}<th className="px-4 py-3">Joined</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? <tr><td colSpan={7} className="px-4 py-12 text-center text-xs text-slate-500"><span className="inline-flex items-center gap-2"><RefreshCw size={15} className="animate-spin" /> Loading live user records…</span></td></tr> : !usersAvailable ? <tr><td colSpan={7} className="px-4 py-12 text-center text-xs text-slate-500">User data could not be loaded.</td></tr> : !filteredUsers.length ? <tr><td colSpan={7} className="px-4 py-12 text-center"><Users size={23} className="mx-auto mb-2 text-slate-300" /><p className="text-xs font-semibold text-slate-700">No users match these filters</p><p className="mt-1 text-[11px] text-slate-500">Try another name, role, or account status.</p></td></tr> : filteredUsers.map((user) => {
                  const isUpdating = Boolean(updatingUsers[user._id]);
                  const isProtectedAccount = user.role === "superadmin";
                  const canEditWorkflow = !["superadmin", "client"].includes(user.role) && !user.tenantId;
                  const roleCanChange = !["superadmin", "client"].includes(user.role) && !user.tenantId;
                  return (
                    <tr key={user._id} className="hover:bg-blue-50/30">
                      <td className="px-4 py-3"><div className="flex min-w-0 items-center gap-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-bold text-blue-700">{`${user.fname?.[0] || user.email?.[0] || "U"}${user.lname?.[0] || ""}`.toUpperCase()}</span><span className="min-w-0"><span className="block max-w-[240px] truncate text-xs font-semibold text-slate-800">{fullName(user)}</span><span className="block max-w-[240px] truncate text-[11px] text-slate-500">{user.email || "No email"}</span></span></div></td>
                      <td className="px-3 py-3"><select aria-label={`Change role for ${fullName(user)}`} value={user.role || "client"} disabled={!roleCanChange || isUpdating} onChange={(event) => updateUserField(user, { role: event.target.value })} className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] capitalize text-slate-700 disabled:bg-slate-50 disabled:text-slate-400">{![...ROLE_OPTIONS, "superadmin", "client"].includes(user.role) && <option value={user.role}>{user.role}</option>}{[...ROLE_OPTIONS, "superadmin", "client"].map((role) => <option key={role} value={role}>{role}</option>)}</select></td>
                      <td className="px-3 py-3 text-center"><button type="button" role="switch" aria-checked={Boolean(user.isActive)} aria-label={`Toggle active status for ${fullName(user)}`} disabled={isProtectedAccount || user._id === currentUser?._id || isUpdating} onClick={() => updateUserField(user, { isActive: !user.isActive })} className={`relative inline-flex h-[18px] w-8 items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${user.isActive ? "bg-emerald-500" : "bg-slate-300"}`}><span className={`h-3 w-3 rounded-full bg-white shadow-sm transition-transform ${user.isActive ? "translate-x-[17px]" : "translate-x-[3px]"}`} /></button><p className={`mt-1 text-[10px] font-medium ${user.isActive ? "text-emerald-700" : "text-slate-400"}`}>{user.isActive ? "Active" : "Inactive"}</p></td>
                      {WORKFLOW_PERMISSIONS.map((permission) => <td key={permission} className="px-3 py-3 text-center"><input type="checkbox" aria-label={`${permission} for ${fullName(user)}`} checked={(user.permissions || []).includes(permission)} disabled={!canEditWorkflow || isUpdating} onChange={(event) => updatePermissions(user, permission, event.target.checked)} className="h-3.5 w-3.5 cursor-pointer rounded accent-blue-600 disabled:cursor-not-allowed disabled:opacity-40" /></td>)}
                      <td className="px-4 py-3 text-[11px] text-slate-500">{formatDate(user.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 text-[10px] text-slate-500"><span>Role changes are limited to roles supported by the existing update API.</span><span className="inline-flex items-center gap-1"><ShieldCheck size={12} /> UI permissions do not replace server checks</span></div>
        </article>
      </section>

      <section id="templates" className="space-y-4 scroll-mt-24">
        <SectionHeading eyebrow="Document configuration" title="Document Template Management" description="The current template page contains the template catalog and a browser-only add form; template records are not backed by a database API." />
        <article className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700"><FileText size={19} /></div><div><h3 className="text-sm font-bold text-slate-900">Template catalog</h3><p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">View and add to the existing catalog from Templates. Persistent add/edit operations and template categories require a backend model and protected CRUD API.</p></div></div>
          <Link to="/templates" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-700 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-800">Open templates <ArrowRight size={14} /></Link>
        </article>
      </section>

      <section id="reports" className="space-y-4 scroll-mt-24">
        <SectionHeading eyebrow="Platform reporting" title="System Reports" description="User and document reports below are calculated from records returned by the existing APIs. Office activity is unavailable without tenant-level reporting access." />
        <div className="grid gap-4 xl:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2 text-blue-700"><Users size={17} /><h3 className="text-sm font-bold text-slate-900">User activity</h3></div>
            <p className="text-3xl font-bold text-slate-900">{usersAvailable ? accountRecentCount : "—"}</p>
            <p className="mt-1 text-xs text-slate-500">Accounts created in the last 30 days</p>
            <div className="mt-5 border-t border-slate-100 pt-4"><DistributionList title="Accounts by role" values={usersAvailable ? roleCounts : {}} total={users.length} emptyLabel={errors.users || "No user report data"} /></div>
            {usersAvailable && <div className="mt-5 border-t border-slate-100 pt-4"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Recently created accounts</p><ul className="mt-2 divide-y divide-slate-100">{recentUsers.map((user) => <li key={user._id} className="flex items-center justify-between gap-2 py-2"><span className="min-w-0"><span className="block truncate text-xs font-medium text-slate-700">{fullName(user)}</span><span className="block text-[10px] capitalize text-slate-400">{user.role}</span></span><span className="shrink-0 text-[10px] text-slate-400">{formatDate(user.createdAt)}</span></li>)}</ul></div>}
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-2 text-emerald-700"><FileCheck2 size={17} /><h3 className="text-sm font-bold text-slate-900">Document statistics</h3></div>
            <p className="text-3xl font-bold text-slate-900">{documentsAvailable ? documents.length : "—"}</p>
            <p className="mt-1 text-xs text-slate-500">Generated document records</p>
            <div className="mt-5 border-t border-slate-100 pt-4"><DistributionList title="Workflow status" values={documentsAvailable ? documentStatuses : {}} total={documents.length} emptyLabel={errors.documents || "No document report data"} /></div>
            <div className="mt-5 border-t border-slate-100 pt-4"><DistributionList title="Document type" values={documentsAvailable ? documentTypes : {}} total={documents.length} emptyLabel={errors.documents || "No document type data"} /></div>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-amber-700"><Building2 size={17} /><h3 className="text-sm font-bold text-slate-900">Office activity</h3></div>
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-700">No office activity report available</p><p className="mt-1 text-[11px] leading-5 text-slate-500">Tenant records are not listable by superadmin through the current API. The dashboard does not infer offices from user records.</p></div>
          </article>
        </div>
      </section>

      <section id="audit" className="space-y-4 scroll-mt-24">
        <SectionHeading eyebrow="Recent records" title="Audit & Document Activity" description="There is no system-wide audit log model or endpoint. These entries are derived only from document timestamps and edit logs returned by the existing generated-documents API." />
        {errors.documents && <DataNotice>{errors.documents} Activity is not replaced with fabricated events.</DataNotice>}
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5"><div className="flex items-center gap-2"><History size={16} className="text-blue-700" /><h3 className="text-sm font-bold text-slate-900">Document workflow events</h3></div><span className="text-[10px] text-slate-500">Most recent first</span></div>
          {!documentsAvailable ? <div className="p-10 text-center text-xs text-slate-500">Document activity is unavailable.</div> : auditEvents.length === 0 ? <div className="p-10 text-center"><History size={24} className="mx-auto mb-2 text-slate-300" /><p className="text-xs font-semibold text-slate-700">No workflow activity recorded</p><p className="mt-1 text-[11px] text-slate-500">Document creation, review, approval, or edits will appear here when timestamps are available.</p></div> : (
            <ol className="divide-y divide-slate-100">
              {auditEvents.map((event) => {
                const Icon = event.icon;
                return <li key={event.id} className="flex items-start gap-3 px-4 py-3.5"><span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600 ring-1 ring-slate-200"><Icon size={15} /></span><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-slate-800">{event.action}</p><p className="mt-1 truncate text-[11px] text-slate-500">{event.subject}</p><p className="mt-1 text-[10px] text-slate-500">By <span className="font-medium text-slate-700">{event.actor}</span></p></div><time className="shrink-0 text-right text-[10px] text-slate-400">{formatDateTime(event.at)}</time></li>;
              })}
            </ol>
          )}
          <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-2.5 text-[10px] leading-4 text-slate-500">Account, office, permission, and template actions are not included because they are not captured by an existing audit-log API.</div>
        </article>
      </section>
    </div>
  );
}
