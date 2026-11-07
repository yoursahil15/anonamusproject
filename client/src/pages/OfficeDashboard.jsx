import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import StatusBadge from "../components/common/StatusBadge";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCheck,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FilePlus2,
  FileText,
  Inbox,
  RefreshCw,
  Search,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const dateValue = (value) => {
  const date = new Date(value || 0).getTime();
  return Number.isNaN(date) ? 0 : date;
};

const dateLabel = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Date unavailable";

const employeeName = (user) =>
  `${user?.fname || ""} ${user?.lname || ""}`.trim() ||
  user?.email ||
  "Employee";

function StatCard({ label, value, icon: Icon, tone, loading }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        {loading ? (
          <div className="mt-2 h-7 w-12 animate-pulse rounded bg-slate-100" />
        ) : (
          <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
        )}
      </div>
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
      >
        <Icon size={20} />
      </span>
    </div>
  );
}

function Section({ id, title, caption, icon: Icon, action, children }) {
  return (
    <section
      id={id}
      className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Icon size={18} />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{caption}</p>
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ children }) {
  return (
    <div className="flex flex-col items-center px-5 py-10 text-center">
      <Inbox size={24} className="text-slate-300" />
      <p className="mt-2 text-sm font-medium text-slate-600">{children}</p>
    </div>
  );
}

export default function OfficeDashboard() {
  const user = useMemo(readUser, []);
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  const canCreateDocuments =
    user?.role === "superadmin" || permissions.includes("maker");
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState({});
  const [companySearch, setCompanySearch] = useState("");
  const [documentSearch, setDocumentSearch] = useState("");
  const [documentStatus, setDocumentStatus] = useState("all");
  const [documentView, setDocumentView] = useState("all");

  const load = useCallback(async (quiet = false) => {
    quiet ? setRefreshing(true) : setLoading(true);
    setErrors({});
    const [companiesResult, usersResult, documentsResult] =
      await Promise.allSettled([
        API.get("/companies"),
        API.get("/users"),
        API.get("/documents/generated"),
      ]);
    const nextErrors = {};
    if (
      companiesResult.status === "fulfilled" &&
      Array.isArray(companiesResult.value.data)
    )
      setCompanies(companiesResult.value.data);
    else {
      setCompanies([]);
      nextErrors.companies = "Company records are unavailable for this office.";
    }
    if (
      usersResult.status === "fulfilled" &&
      Array.isArray(usersResult.value.data)
    )
      setEmployees(usersResult.value.data);
    else {
      setEmployees([]);
      nextErrors.users = "Employee records could not be loaded.";
    }
    if (
      documentsResult.status === "fulfilled" &&
      Array.isArray(documentsResult.value.data)
    )
      setDocuments(documentsResult.value.data);
    else {
      setDocuments([]);
      nextErrors.documents =
        "Document records are unavailable for this office.";
    }
    setErrors(nextErrors);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const byStatus = useMemo(() => {
    const status = (doc) => String(doc.status || "").toUpperCase();
    return {
      pendingCheck: documents.filter((doc) => status(doc) === "PENDING_CHECK"),
      pendingApproval: documents.filter(
        (doc) => status(doc) === "PENDING_APPROVAL",
      ),
      approved: documents.filter((doc) => status(doc) === "APPROVED"),
      rejected: documents.filter((doc) =>
        ["REJECTED_BY_CHECKER", "REJECTED_BY_APPROVER"].includes(status(doc)),
      ),
      drafts: documents.filter((doc) => status(doc) === "DRAFT"),
    };
  }, [documents]);

  const employeeList = useMemo(
    () =>
      employees.filter(
        (person) =>
          person._id !== user?._id &&
          ["manager", "intern"].includes(person.role),
      ),
    [employees, user?._id],
  );
  const visibleCompanies = useMemo(() => {
    const term = companySearch.trim().toLowerCase();
    return companies
      .filter(
        (company) =>
          !term ||
          String(company.nameOfCompany || "")
            .toLowerCase()
            .includes(term) ||
          String(company.pan || "")
            .toLowerCase()
            .includes(term),
      )
      .slice(0, 6);
  }, [companies, companySearch]);
  const recentDocuments = useMemo(
    () =>
      [...documents]
        .sort(
          (a, b) =>
            dateValue(b.createdAt || b.uploadedAt) -
            dateValue(a.createdAt || a.uploadedAt),
        )
        .slice(0, 5),
    [documents],
  );
  const recentEmployees = useMemo(
    () =>
      [...employeeList]
        .sort((a, b) => dateValue(b.createdAt) - dateValue(a.createdAt))
        .slice(0, 4),
    [employeeList],
  );
  const visibleDocuments = useMemo(() => {
    const term = documentSearch.trim().toLowerCase();
    return [...documents]
      .filter(
        (doc) =>
          documentStatus === "all" ||
          String(doc.status || "").toUpperCase() === documentStatus,
      )
      .filter(
        (doc) =>
          documentView !== "mine" ||
          String(doc.maker?._id || doc.maker || "") === String(user?._id || ""),
      )
      .filter(
        (doc) =>
          !term ||
          String(doc.company?.nameOfCompany || "")
            .toLowerCase()
            .includes(term) ||
          String(doc.documentType || "")
            .toLowerCase()
            .includes(term),
      )
      .sort(
        (a, b) =>
          dateValue(b.createdAt || b.uploadedAt) -
          dateValue(a.createdAt || a.uploadedAt),
      );
  }, [documents, documentSearch, documentStatus, documentView, user?._id]);

  const quickActions = [
    {
      label: "Add client company",
      detail: "Register a company in your office",
      to: "/clients",
      icon: Building2,
    },
    {
      label: "Manage companies",
      detail: "Search and review company records",
      to: "/clients",
      icon: Search,
    },
    {
      label: "Add employee",
      detail: "Create a manager or intern account",
      to: "/users",
      icon: UserPlus,
    },
    {
      label: "Assign employee permissions",
      detail: "Permission assignment is limited to system superadmins",
      to: null,
      icon: Users,
      disabled: true,
    },
    {
      label: "Create document",
      detail: canCreateDocuments
        ? "Start a document for a company"
        : "Maker permission is required",
      to: canCreateDocuments ? "/generate" : null,
      icon: FilePlus2,
      disabled: !canCreateDocuments,
    },
    {
      label: "View all documents",
      detail: "Review this office’s document list",
      to: "#all-documents",
      icon: FileText,
    },
    {
      label: "Track approvals",
      detail: "See work waiting for review",
      to: "#approval-monitoring",
      icon: FileCheck2,
    },
    {
      label: "View reports",
      detail: "Open office activity and status summary",
      to: "#reports",
      icon: Activity,
    },
  ];

  const stats = [
    {
      label: "Client companies",
      value: companies.length,
      icon: Building2,
      tone: "bg-blue-50 text-blue-700",
    },
    {
      label: "Employees",
      value: employeeList.length,
      icon: Users,
      tone: "bg-cyan-50 text-cyan-700",
    },
    {
      label: "Total documents",
      value: documents.length,
      icon: FileText,
      tone: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "Pending check",
      value: byStatus.pendingCheck.length,
      icon: Clock3,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "Pending approval",
      value: byStatus.pendingApproval.length,
      icon: FileCheck2,
      tone: "bg-violet-50 text-violet-700",
    },
    {
      label: "Approved documents",
      value: byStatus.approved.length,
      icon: CheckCircle2,
      tone: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-700">
            Office workspace
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Welcome back, {user?.fname || "Admin"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Your CA office operations at a glance.
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={loading || refreshing}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />{" "}
          Refresh
        </button>
      </header>

      {!!Object.keys(errors).length && (
        <div
          role="alert"
          className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">
              Some office data could not be loaded
            </p>
            <p className="mt-1 text-xs">
              {Object.values(errors).join(" ")} Ask your system administrator to
              check the office-scoped API access.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} loading={loading} />
        ))}
      </div>

      <section>
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Quick actions
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Common tasks for your CA office.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map(({ label, detail, to, icon: Icon, disabled }) => {
            const card = (
              <>
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${disabled ? "bg-slate-100 text-slate-400" : "bg-blue-50 text-blue-700"}`}
                >
                  <Icon size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {detail}
                  </p>
                </div>
                <ArrowRight size={16} className="shrink-0 text-slate-400" />
              </>
            );
            return to ? (
              <Link
                key={label}
                to={to}
                className="flex min-h-[96px] items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                {card}
              </Link>
            ) : (
              <div
                key={label}
                aria-disabled="true"
                className="flex min-h-[96px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 opacity-80"
              >
                {card}
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Employee workflow permissions are managed under the current system
          rules. An office admin does not receive checker or approver access
          automatically.
        </p>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <Section
          title="Company management"
          caption="Companies associated with this office"
          icon={Building2}
          action={
            <Link
              to="/clients"
              className="text-xs font-semibold text-blue-700 hover:text-blue-800"
            >
              Manage companies <ArrowRight size={13} className="ml-1 inline" />
            </Link>
          }
        >
          <div className="border-b border-slate-100 p-4">
            <label className="relative block">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={companySearch}
                onChange={(event) => setCompanySearch(event.target.value)}
                placeholder="Search company or PAN"
                className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>
          {loading ? (
            <EmptyState>Loading companies…</EmptyState>
          ) : visibleCompanies.length ? (
            <div className="divide-y divide-slate-100">
              {visibleCompanies.map((company) => (
                <div
                  key={company._id}
                  className="flex items-center justify-between gap-3 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {company.nameOfCompany}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      PAN {company.pan || "—"} · {company.email || "No email"}
                    </p>
                  </div>
                  <Link
                    to="/clients"
                    className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>
              {errors.companies ||
                "No matching companies yet. Add a company to get started."}
            </EmptyState>
          )}
        </Section>

        <Section
          title="Employee management"
          caption="Your office managers and interns"
          icon={Users}
          action={
            <Link
              to="/users"
              className="text-xs font-semibold text-blue-700 hover:text-blue-800"
            >
              Manage employees <ArrowRight size={13} className="ml-1 inline" />
            </Link>
          }
        >
          {loading ? (
            <EmptyState>Loading employees…</EmptyState>
          ) : recentEmployees.length ? (
            <div className="divide-y divide-slate-100">
              {recentEmployees.map((person) => (
                <div
                  key={person._id}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600">
                    {`${person.fname?.[0] || ""}${person.lname?.[0] || ""}`.toUpperCase() ||
                      "U"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {employeeName(person)}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {person.email} ·{" "}
                      <span className="capitalize">{person.role}</span>
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${person.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                  >
                    {person.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>
              {errors.users || "No employees have been added yet."}
            </EmptyState>
          )}
          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
            Employee activity feed is not available from the current API.
          </div>
        </Section>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Section
          id="approval-monitoring"
          title="Approval monitoring"
          caption="Documents waiting for review or correction"
          icon={CheckCheck}
          action={
            <Link
              to="/generated-documents"
              className="text-xs font-semibold text-blue-700"
            >
              Open documents <ArrowRight size={13} className="ml-1 inline" />
            </Link>
          }
        >
          {loading ? (
            <EmptyState>Loading approval status…</EmptyState>
          ) : (
            <div className="grid gap-4 p-5 sm:grid-cols-3">
              {[
                [
                  "Waiting for checker",
                  byStatus.pendingCheck,
                  "text-amber-700 bg-amber-50",
                ],
                [
                  "Waiting for approver",
                  byStatus.pendingApproval,
                  "text-violet-700 bg-violet-50",
                ],
                [
                  "Needs correction",
                  byStatus.rejected,
                  "text-rose-700 bg-rose-50",
                ],
              ].map(([label, list, tone]) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-100 p-4"
                >
                  <p className="text-xs font-medium text-slate-500">{label}</p>
                  <p
                    className={`mt-2 inline-flex rounded-lg px-2.5 py-1 text-lg font-semibold ${tone}`}
                  >
                    {list.length}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {list
                      .slice(0, 2)
                      .map(
                        (doc) => doc.company?.nameOfCompany || doc.documentType,
                      )
                      .join(" · ") || "No documents"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section
          title="Recent document activity"
          caption="Newest documents and their current status"
          icon={Activity}
          action={
            <Link
              to="/generated-documents"
              className="text-xs font-semibold text-blue-700"
            >
              View all <ArrowRight size={13} className="ml-1 inline" />
            </Link>
          }
        >
          {loading ? (
            <EmptyState>Loading activity…</EmptyState>
          ) : recentDocuments.length ? (
            <div className="divide-y divide-slate-100">
              {recentDocuments.map((doc) => (
                <div
                  key={doc._id}
                  className="flex items-center gap-3 px-5 py-3.5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <FileText size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {doc.company?.nameOfCompany ||
                        doc.documentType ||
                        "Document"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {dateLabel(doc.createdAt || doc.uploadedAt)}
                    </p>
                  </div>
                  <StatusBadge status={doc.status} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>
              {errors.documents || "No documents in this office yet."}
            </EmptyState>
          )}
        </Section>
      </div>

      <Section
        id="all-documents"
        title="Document management"
        caption="All documents created for companies in this office"
        icon={FileText}
        action={
          <Link
            to="/generated-documents"
            className="text-xs font-semibold text-blue-700"
          >
            Approved downloads <ArrowRight size={13} className="ml-1 inline" />
          </Link>
        }
      >
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-[1fr_180px_210px]">
          <label className="relative block">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={documentSearch}
              onChange={(event) => setDocumentSearch(event.target.value)}
              placeholder="Search company or document type"
              className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <select
            value={documentView}
            onChange={(event) => setDocumentView(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400"
          >
            <option value="all">All documents</option>
            <option value="mine">My documents</option>
          </select>
          <select
            value={documentStatus}
            onChange={(event) => setDocumentStatus(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400"
          >
            <option value="all">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_CHECK">Pending check</option>
            <option value="PENDING_APPROVAL">Pending approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED_BY_CHECKER">Rejected by checker</option>
            <option value="REJECTED_BY_APPROVER">Rejected by approver</option>
          </select>
        </div>
        {loading ? (
          <EmptyState>Loading office documents…</EmptyState>
        ) : visibleDocuments.length ? (
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead className="sticky top-0 bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Company</th>
                  <th className="px-5 py-3">Document</th>
                  <th className="px-5 py-3">Maker</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleDocuments.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3 text-sm font-medium text-slate-800">
                      {doc.company?.nameOfCompany || "Company"}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-600">
                      {String(doc.documentType || "Document").replaceAll(
                        "_",
                        " ",
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-600">
                      {employeeName(doc.maker)}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {dateLabel(doc.createdAt || doc.uploadedAt)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={doc.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState>
            {errors.documents || "No documents match these filters."}
          </EmptyState>
        )}
      </Section>

      <Section
        id="reports"
        title="Office reports"
        caption="Current document status summary"
        icon={FileCheck2}
      >
        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
          {[
            ["Drafts", byStatus.drafts.length, FileText],
            ["Pending check", byStatus.pendingCheck.length, Clock3],
            ["Approved", byStatus.approved.length, CheckCircle2],
            ["Rejected", byStatus.rejected.length, XCircle],
          ].map(([label, value, Icon]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <Icon size={15} /> {label}
              </div>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {loading ? "—" : value}
              </p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
