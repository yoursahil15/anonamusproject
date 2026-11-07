import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import StatusBadge from "../components/common/StatusBadge";

import {
  Building2,
  FileText,
  UserCheck,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertCircle,
  RefreshCw,
  Workflow,
  History,
  Inbox,
} from "lucide-react";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

/* =========================================================
   HELPERS
========================================================= */

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

// Same classification rules as before: approved / reject* / everything else pending.
const classifyStatus = (rawStatus) => {
  const status = (rawStatus || "").toLowerCase();

  if (status.includes("approved")) return "approved";
  if (status.includes("reject")) return "rejected";
  return "pending";
};

const getDocDate = (doc) => doc.createdAt || doc.uploadedAt;

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const timeValue = (doc) => {
  const time = new Date(getDocDate(doc)).getTime();
  return Number.isNaN(time) ? 0 : time;
};

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function StatTile({ label, value, icon: Icon, tone, loading }) {
  return (
    <div className="group flex min-w-0 items-center justify-between gap-2.5 rounded-xl border border-blue-100 bg-gradient-to-br from-white via-white to-blue-50/70 px-3 py-2.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone}`}
      >
        <Icon size={16} />
      </span>

      <div className="min-w-0 flex items-end flex-col gap-0.5">
        
        {loading ? (
          <div className="mt-1 h-5 w-10 animate-pulse rounded bg-slate-200" />
        ) : (
          <p className="text-lg font-semibold leading-tight text-slate-900">
            {value}
          </p>
          
        )}
        <p className="truncate text-[11px] font-medium text-slate-500">
          {label}
        </p>
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, action, children }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center justify-between gap-2 border-b border-blue-100/70 bg-gradient-to-r from-blue-50/70 via-white to-violet-50/40 px-3 py-2.5">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold text-slate-800">
          {Icon && <Icon size={15} className="text-blue-600" />}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const user = useMemo(readStoredUser, []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    companies: 0,
    documents: 0,
    users: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  const [recentDocuments, setRecentDocuments] = useState([]);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [usersRes, companiesRes, docsRes] = await Promise.all([
        API.get("/users"),
        API.get("/companies"),
        API.get("/documents/generated"),
      ]);

      const users = usersRes.data || [];
      const companies = companiesRes.data || [];
      const documents = docsRes.data || [];

      const counts = { approved: 0, pending: 0, rejected: 0 };

      documents.forEach((doc) => {
        counts[classifyStatus(doc.status)] += 1;
      });

      const recentDocs = [...documents]
        .sort((a, b) => timeValue(b) - timeValue(a))
        .slice(0, 7);

      setRecentDocuments(recentDocs);

      setStats({
        companies: companies.length,
        documents: documents.length,
        users: users.length,
        ...counts,
      });
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError("Unable to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const workflowData = useMemo(
    () => [
      { name: "Approved", value: stats.approved, color: "#059669" },
      { name: "Pending", value: stats.pending, color: "#d97706" },
      { name: "Rejected", value: stats.rejected, color: "#dc2626" },
    ],
    [stats.approved, stats.pending, stats.rejected],
  );

  const hasWorkflowData = stats.approved + stats.pending + stats.rejected > 0;

  const tiles = [
    {
      label: "Companies",
      value: stats.companies,
      icon: Building2,
      tone: "bg-blue-100 text-blue-700 ring-1 ring-blue-200",
    },
    {
      label: "Documents",
      value: stats.documents,
      icon: FileText,
      tone: "bg-violet-100 text-violet-700 ring-1 ring-violet-200",
    },
    {
      label: "Users",
      value: stats.users,
      icon: UserCheck,
      tone: "bg-cyan-100 text-cyan-700 ring-1 ring-cyan-200",
    },
    {
      label: "Approved",
      value: stats.approved,
      icon: CheckCircle2,
      tone: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock3,
      tone: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      tone: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
    },
  ];

  return (
    <div className="min-h-full w-full min-w-0 max-w-full">
      <div className="mx-auto w-full min-w-0 max-w-[1600px] space-y-3">
        {/* HEADER */}
        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold leading-tight text-slate-900">
              Welcome back, {user?.fname || "User"}
            </h1>
            <p className="truncate text-xs text-slate-500">
              Overview of companies, documents, users and approval workflow.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </header>

        {/* ERROR */}
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
          >
            <AlertCircle size={14} className="shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={loadDashboard}
              className="font-semibold underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              Retry
            </button>
          </div>
        )}

        {/* KPI TILES */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          {tiles.map((tile) => (
            <StatTile key={tile.label} {...tile} loading={loading} />
          ))}
        </div>

        <div className="grid gap-3 xl:grid-cols-3">
          {/* WORKFLOW STATUS */}
          <Panel title="Workflow Status" icon={Workflow}>
            <div className="p-3">
              {loading ? (
                <div className="mx-auto h-40 w-40 animate-pulse rounded-full bg-slate-100" />
              ) : !hasWorkflowData ? (
                <div className="flex flex-col items-center py-10 text-center">
                  <Inbox size={24} className="mb-2 text-slate-300" />
                  <p className="text-xs text-slate-500">
                    No documents to chart yet.
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={workflowData}
                        dataKey="value"
                        innerRadius={52}
                        outerRadius={78}
                        paddingAngle={3}
                        stroke="none"
                      >
                        {workflowData.map((item) => (
                          <Cell key={item.name} fill={item.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-semibold text-slate-900">
                      {stats.documents}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Documents
                    </span>
                  </div>
                </div>
              )}

              <ul className="mt-2 divide-y divide-slate-100 text-xs">
                {workflowData.map((item) => (
                  <li
                    key={item.name}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="flex items-center gap-2 text-slate-600">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </span>
                    <span className="font-semibold tabular-nums text-slate-900">
                      {item.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>

          {/* RECENT DOCUMENTS */}
          <div className="min-w-0 xl:col-span-2">
            <Panel
              title="Recent Activity"
              icon={History}
              action={
                <Link
                  to="/document-approval"
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  View all
                </Link>
              }
            >
              {loading ? (
                <div className="space-y-2 p-3">
                  {[0, 1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-10 animate-pulse rounded-lg bg-slate-100"
                    />
                  ))}
                </div>
              ) : recentDocuments.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center">
                  <Inbox size={26} className="mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700">
                    No activity yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Generated documents will appear here.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recentDocuments.map((doc, index) => {
                    return (
                      <li
                        key={doc._id || index}
                        className="flex items-start gap-2.5 px-3 py-2.5 transition-colors hover:bg-slate-50/80"
                      >
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-100 to-violet-100 text-blue-700 ring-1 ring-blue-200/70">
                          <FileText size={15} />
                        </span>

                        <div className="min-w-0 flex-1">
                          <p
                            className="truncate text-[13px] font-semibold text-slate-800"
                            title={doc.documentType || "Document"}
                          >
                            {doc.documentType || "Document"}
                          </p>
                          <p
                            className="truncate text-xs text-slate-500"
                            title={doc.company?.nameOfCompany || "Company"}
                          >
                            {doc.company?.nameOfCompany || "Company"}
                          </p>

                          {(doc.maker || doc.checker || doc.approver) && (
                            <p className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                              {doc.maker && (
                                <span>
                                  Maker:{" "}
                                  <span className="font-medium text-slate-700">
                                    {doc.maker.fname}
                                  </span>
                                </span>
                              )}
                              {doc.checker && (
                                <span>
                                  Checker:{" "}
                                  <span className="font-medium text-slate-700">
                                    {doc.checker.fname}
                                  </span>
                                </span>
                              )}
                              {doc.approver && (
                                <span>
                                  Approver:{" "}
                                  <span className="font-medium text-slate-700">
                                    {doc.approver.fname}
                                  </span>
                                </span>
                              )}
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <StatusBadge status={doc.status} />
                          <span className="text-[11px] text-slate-400">
                            {formatDate(getDocDate(doc))}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
