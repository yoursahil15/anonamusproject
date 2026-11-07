import {
  createElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileCheck2,
  FilePlus2,
  FileText,
  Inbox,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import API from "../services/api";
import StatusBadge from "../components/common/StatusBadge";

const STATUS_LABELS = {
  DRAFT: "Draft",
  PENDING_CHECK: "Pending Check",
  CHECKED: "Checked",
  PENDING_APPROVAL: "Pending Approval",
  APPROVED: "Approved",
  REJECTED_BY_CHECKER: "Rejected by Checker",
  REJECTED_BY_APPROVER: "Rejected by Approver",
};

const STATUS_COLORS = {
  DRAFT: "#64748b",
  PENDING_CHECK: "#f59e0b",
  CHECKED: "#3b82f6",
  PENDING_APPROVAL: "#8b5cf6",
  APPROVED: "#10b981",
  REJECTED_BY_CHECKER: "#ef4444",
  REJECTED_BY_APPROVER: "#dc2626",
};

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const statusOf = (document) =>
  String(document?.status || "UNKNOWN").toUpperCase();
const displayDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
};
const timestamp = (value) => {
  const result = new Date(value || 0).getTime();
  return Number.isNaN(result) ? 0 : result;
};
const fullName = (user) =>
  `${user?.fname || ""} ${user?.lname || ""}`.trim() ||
  user?.email ||
  "Employee";

function StatCard({ label, value, icon: Icon, color, loading }) {
  return (
    <article className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}
      >
        {createElement(Icon, { size: 20 })}
      </span>
    </article>
  );
}

function Panel({
  id,
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  className = "",
}) {
  return (
    <section
      id={id}
      className={`min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            {createElement(Icon, { size: 18 })}
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Empty({ title, detail }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <Inbox size={25} className="text-slate-300" />
      <p className="mt-2 text-sm font-semibold text-slate-600">{title}</p>
      {detail && (
        <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
          {detail}
        </p>
      )}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-slate-800">{label || payload[0].name}</p>
      <p className="mt-1 text-slate-600">{payload[0].value} documents</p>
    </div>
  );
}

export default function TenantDashboard() {
  const user = useMemo(() => readUser(), []);
  const navigate = useNavigate();
  const location = useLocation();
  const [firm, setFirm] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errors, setErrors] = useState({});
  const [companySearch, setCompanySearch] = useState("");
  const [documentSearch, setDocumentSearch] = useState("");
  const [filters, setFilters] = useState({
    company: "all",
    type: "all",
    employee: "all",
  });
  const [downloadingId, setDownloadingId] = useState("");
  const [downloadError, setDownloadError] = useState("");

  const loadDashboard = useCallback(
    async (quiet = false) => {
      if (quiet) setRefreshing(true);
      else setLoading(true);
      setErrors({});
      const [firmResult, companiesResult, employeesResult, documentsResult] =
        await Promise.allSettled([
          API.get("/auth/tenant-dashboard"),
          API.get("/companies"),
          API.get("/users"),
          API.get("/documents/generated"),
        ]);

      if (firmResult.status === "fulfilled" && firmResult.value.data?.firm) {
        setFirm(firmResult.value.data.firm);
      } else if (firmResult.reason?.response?.status === 403) {
        navigate("/onboarding", { replace: true });
        return;
      } else {
        setErrors((old) => ({
          ...old,
          firm: "Firm profile could not be loaded.",
        }));
      }
      if (
        companiesResult.status === "fulfilled" &&
        Array.isArray(companiesResult.value.data)
      )
        setCompanies(companiesResult.value.data);
      else
        setErrors((old) => ({
          ...old,
          companies: "Company data could not be loaded.",
        }));
      if (
        employeesResult.status === "fulfilled" &&
        Array.isArray(employeesResult.value.data)
      )
        setEmployees(employeesResult.value.data);
      else
        setErrors((old) => ({
          ...old,
          employees: "Employee data could not be loaded.",
        }));
      if (
        documentsResult.status === "fulfilled" &&
        Array.isArray(documentsResult.value.data)
      )
        setDocuments(documentsResult.value.data);
      else
        setErrors((old) => ({
          ...old,
          documents: "Document data could not be loaded.",
        }));
      setLoading(false);
      setRefreshing(false);
    },
    [navigate],
  );

  // Initial authenticated data load for the tenant dashboard.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const selectedStatus =
    new URLSearchParams(location.search).get("status") || "all";
  const changeStatus = (status) => {
    const searchParams = new URLSearchParams(location.search);
    if (status === "all") searchParams.delete("status");
    else searchParams.set("status", status);
    navigate({
      pathname: location.pathname,
      search: searchParams.toString() ? `?${searchParams.toString()}` : "",
      hash: "#all-documents",
    });
  };

  const downloadApprovedDocument = async (document) => {
    if (downloadingId) return;
    setDownloadingId(document._id);
    setDownloadError("");
    try {
      const response = await API.get(
        `/documents/generated/${document._id}/file`,
        { responseType: "blob" },
      );
      const url = URL.createObjectURL(response.data);
      const link = window.document.createElement("a");
      link.href = url;
      link.download =
        document.fileName || document.documentType || "approved-document";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setDownloadError(
        error.response?.status === 410
          ? "This document is in legacy cloud storage and is not downloadable through the current server storage API."
          : error.response?.data?.msg ||
              "Unable to download this approved document.",
      );
    } finally {
      setDownloadingId("");
    }
  };

  const documentStats = useMemo(() => {
    const statuses = Object.keys(STATUS_LABELS).reduce(
      (result, status) => ({ ...result, [status]: 0 }),
      {},
    );
    documents.forEach((doc) => {
      if (Object.hasOwn(statuses, statusOf(doc))) statuses[statusOf(doc)] += 1;
    });
    return statuses;
  }, [documents]);

  const staff = useMemo(
    () =>
      employees.filter(
        (person) =>
          person._id !== user?._id &&
          ["manager", "intern"].includes(person.role),
      ),
    [employees, user?._id],
  );
  const activeStaff = staff.filter(
    (person) => person.isActive !== false,
  ).length;
  const companySearchResults = useMemo(() => {
    const term = companySearch.trim().toLowerCase();
    return companies.filter(
      (company) =>
        !term ||
        `${company.nameOfCompany || ""} ${company.pan || ""} ${company.email || ""}`
          .toLowerCase()
          .includes(term),
    );
  }, [companies, companySearch]);

  const employeeOptions = useMemo(() => {
    const byId = new Map();
    const workflowUsers = documents
      .flatMap((doc) => [doc.maker, doc.checker, doc.approver])
      .filter(Boolean);
    [...employees, ...workflowUsers].forEach((person) => {
      const id = String(person?._id || person || "");
      if (id && typeof person === "object") byId.set(id, person);
    });
    return [...byId.entries()].map(([id, person]) => ({
      id,
      label: fullName(person),
    }));
  }, [documents, employees]);

  const filteredDocuments = useMemo(() => {
    const term = documentSearch.trim().toLowerCase();
    return [...documents]
      .filter(
        (doc) =>
          filters.company === "all" ||
          String(doc.company?._id || doc.company || "") === filters.company,
      )
      .filter(
        (doc) => filters.type === "all" || doc.documentType === filters.type,
      )
      .filter(
        (doc) =>
          filters.employee === "all" ||
          [doc.maker, doc.checker, doc.approver].some(
            (person) =>
              String(person?._id || person || "") === filters.employee,
          ),
      )
      .filter(
        (doc) =>
          selectedStatus === "all" ||
          (selectedStatus === "REJECTED"
            ? statusOf(doc).startsWith("REJECTED")
            : statusOf(doc) === selectedStatus),
      )
      .filter(
        (doc) =>
          !term ||
          `${doc.company?.nameOfCompany || ""} ${doc.documentType || ""} ${doc.fileName || ""} ${doc.rejectedReason || ""}`
            .toLowerCase()
            .includes(term),
      )
      .sort(
        (a, b) =>
          timestamp(b.createdAt || b.uploadedAt) -
          timestamp(a.createdAt || a.uploadedAt),
      );
  }, [documents, documentSearch, filters, selectedStatus]);

  const recentDocuments = useMemo(
    () =>
      [...documents]
        .sort(
          (a, b) =>
            timestamp(b.createdAt || b.uploadedAt) -
            timestamp(a.createdAt || a.uploadedAt),
        )
        .slice(0, 6),
    [documents],
  );

  const statusChart = useMemo(
    () =>
      Object.entries(STATUS_LABELS).map(([status, name]) => ({
        name,
        status,
        value: documentStats[status],
      })),
    [documentStats],
  );

  const monthlyStats = useMemo(() => {
    const today = new Date();
    const keys = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(
        today.getFullYear(),
        today.getMonth() - (5 - index),
        1,
      );
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        month: date.toLocaleDateString("en-IN", { month: "short" }),
        value: 0,
      };
    });
    const lookup = new Map(keys.map((item) => [item.key, item]));
    documents.forEach((doc) => {
      const date = new Date(doc.createdAt || doc.uploadedAt);
      if (Number.isNaN(date.getTime())) return;
      const month = lookup.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (month) month.value += 1;
    });
    return keys;
  }, [documents]);

  const companyStats = useMemo(() => {
    const counts = new Map(
      companies.map((company) => [
        String(company._id),
        { name: company.nameOfCompany || "Company", documents: 0 },
      ]),
    );
    documents.forEach((doc) => {
      const id = String(doc.company?._id || doc.company || "");
      const record = counts.get(id);
      if (record) record.documents += 1;
    });
    return [...counts.values()]
      .sort((a, b) => b.documents - a.documents)
      .slice(0, 6);
  }, [companies, documents]);

  const employeeStats = useMemo(() => {
    const counts = new Map();
    documents.forEach((doc) => {
      const maker = doc.maker;
      if (!maker) return;
      const id = String(maker._id || maker);
      const name =
        typeof maker === "object"
          ? fullName(maker)
          : `Employee ${id.slice(-5)}`;
      const current = counts.get(id) || { name, documents: 0 };
      current.documents += 1;
      counts.set(id, current);
    });
    return [...counts.values()]
      .sort((a, b) => b.documents - a.documents)
      .slice(0, 6);
  }, [documents]);

  const recentActivity = useMemo(() => {
    const events = [];
    documents.forEach((doc) => {
      const label =
        doc.company?.nameOfCompany || doc.documentType || "Document";
      if (doc.createdAt || doc.uploadedAt)
        events.push({
          key: `${doc._id}-created`,
          time: doc.createdAt || doc.uploadedAt,
          title: `Document created · ${label}`,
          detail: fullName(doc.maker),
        });
      if (doc.checkedAt)
        events.push({
          key: `${doc._id}-checked`,
          time: doc.checkedAt,
          title: `Checker review · ${label}`,
          detail: fullName(doc.checker),
        });
      if (doc.approvedAt)
        events.push({
          key: `${doc._id}-approved`,
          time: doc.approvedAt,
          title: `Document approved · ${label}`,
          detail: fullName(doc.approver),
        });
      (doc.editLogs || []).forEach((edit, index) =>
        events.push({
          key: `${doc._id}-edit-${index}`,
          time: edit.editedAt,
          title: `Document updated · ${label}`,
          detail: edit.comment || "Revision recorded",
        }),
      );
    });
    return events
      .sort((a, b) => timestamp(b.time) - timestamp(a.time))
      .slice(0, 8);
  }, [documents]);

  const rejectedDocuments = useMemo(
    () => documents.filter((doc) => statusOf(doc).startsWith("REJECTED")),
    [documents],
  );
  const permissionList = Array.isArray(user?.permissions)
    ? user.permissions
    : [];
  const canMakeDocuments = permissionList.includes("maker");

  const cards = [
    [
      "Total Companies",
      companies.length,
      Building2,
      "bg-blue-50 text-blue-700",
    ],
    ["Total Employees", staff.length, Users, "bg-cyan-50 text-cyan-700"],
    [
      "Total Documents",
      documents.length,
      FileText,
      "bg-indigo-50 text-indigo-700",
    ],
    [
      "Draft Documents",
      documentStats.DRAFT,
      FileText,
      "bg-slate-100 text-slate-700",
    ],
    [
      "Pending Check",
      documentStats.PENDING_CHECK,
      Clock3,
      "bg-amber-50 text-amber-700",
    ],
    [
      "Pending Approval",
      documentStats.PENDING_APPROVAL,
      FileCheck2,
      "bg-violet-50 text-violet-700",
    ],
    [
      "Approved Documents",
      documentStats.APPROVED,
      CheckCircle2,
      "bg-emerald-50 text-emerald-700",
    ],
    [
      "Rejected Documents",
      rejectedDocuments.length,
      XCircle,
      "bg-rose-50 text-rose-700",
    ],
  ];

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-700">
            Tenant workspace
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Welcome back, {user?.fname || "Admin"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {firm?.name || "Your firm"} · Office operations and document
            workflow.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadDashboard(true)}
          disabled={loading || refreshing}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />{" "}
          Refresh
        </button>
      </header>

      {Object.keys(errors).length > 0 && (
        <div
          role="alert"
          className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">
              Some tenant data could not be loaded
            </p>
            <p className="mt-1 text-xs">
              {Object.values(errors).join(" ")} Use refresh to try again.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 2xl:grid-cols-8">
        {cards.map(([label, value, icon, color]) => (
          <StatCard
            key={label}
            label={label}
            value={value}
            icon={icon}
            color={color}
            loading={loading}
          />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel
          title="Document workflow"
          subtitle="Live document distribution by current status"
          icon={Activity}
        >
          {loading ? (
            <div className="h-64 animate-pulse bg-slate-50" />
          ) : documents.length ? (
            <div className="h-72 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChart.filter((item) => item.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={96}
                    paddingAngle={3}
                  >
                    {statusChart
                      .filter((item) => item.value > 0)
                      .map((item) => (
                        <Cell
                          key={item.status}
                          fill={STATUS_COLORS[item.status]}
                        />
                      ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty
              title="No document activity yet"
              detail="The chart will populate as documents are created for this tenant."
            />
          )}
        </Panel>
        <Panel
          title="Monthly document creation"
          subtitle="Documents created in the last six months"
          icon={CalendarDays}
        >
          {loading ? (
            <div className="h-64 animate-pulse bg-slate-50" />
          ) : (
            <div className="h-72 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyStats}
                  margin={{ top: 12, right: 6, left: -18, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="value"
                    name="Documents"
                    fill="#2563eb"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      </div>

      <Panel
        title="Recent documents"
        subtitle="Latest documents created in this tenant"
        icon={FileText}
        action={
          <Link
            to="/tenant-dashboard#all-documents"
            className="text-xs font-semibold text-blue-700"
          >
            Open document list <ArrowRight size={13} className="ml-1 inline" />
          </Link>
        }
      >
        {loading ? (
          <Empty title="Loading recent documents…" />
        ) : recentDocuments.length ? (
          <div className="divide-y divide-slate-100">
            {recentDocuments.map((doc) => (
              <div
                key={doc._id}
                className="flex flex-wrap items-center gap-3 px-5 py-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  {createElement(FileText, { size: 17 })}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {doc.company?.nameOfCompany || "Company"}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {String(doc.documentType || "Document").replaceAll(
                      "_",
                      " ",
                    )}{" "}
                    · {fullName(doc.maker)} ·{" "}
                    {displayDate(doc.createdAt || doc.uploadedAt)}
                  </p>
                </div>
                <StatusBadge status={doc.status} />
              </div>
            ))}
          </div>
        ) : (
          <Empty
            title={errors.documents || "No documents yet"}
            detail="Newly created documents will appear here."
          />
        )}
      </Panel>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          id="companies"
          title="Companies"
          subtitle={`${companies.length} companies in this tenant`}
          icon={Building2}
          action={
            <Link to="/clients" className="text-xs font-semibold text-blue-700">
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
                placeholder="Search company, PAN, or email"
                className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>
          {loading ? (
            <Empty title="Loading companies…" />
          ) : companySearchResults.length ? (
            <div className="max-h-[360px] divide-y divide-slate-100 overflow-auto">
              {companySearchResults.slice(0, 8).map((company) => (
                <div
                  key={company._id}
                  className="flex items-center justify-between gap-3 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {company.nameOfCompany}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      PAN {company.pan || "—"} · {company.email || "No email"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFilters((value) => ({
                        ...value,
                        company: String(company._id),
                      }));
                      document
                        .getElementById("all-documents")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Documents
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title={errors.companies || "No companies found"}
              detail="Add and edit company records from Company Management."
            />
          )}
          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
            Company activation controls are unavailable because the Company
            model has no active status field.
          </div>
        </Panel>

        <Panel
          id="employees"
          title="Employees and staff"
          subtitle={`${staff.length} employees · ${activeStaff} active`}
          icon={Users}
          action={
            <Link to="/users" className="text-xs font-semibold text-blue-700">
              Add or manage staff{" "}
              <ArrowRight size={13} className="ml-1 inline" />
            </Link>
          }
        >
          {loading ? (
            <Empty title="Loading employees…" />
          ) : staff.length ? (
            <div className="max-h-[360px] divide-y divide-slate-100 overflow-auto">
              {staff.slice(0, 8).map((person) => (
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
                      {fullName(person)}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {person.email} ·{" "}
                      <span className="capitalize">{person.role}</span>
                    </p>
                  </div>
                  <div className="flex max-w-[180px] flex-wrap justify-end gap-1">
                    {(person.permissions || []).map((permission) => (
                      <span
                        key={permission}
                        className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold capitalize text-blue-700"
                      >
                        {permission}
                      </span>
                    ))}
                    {!person.permissions?.length && (
                      <span className="text-[10px] text-slate-400">
                        No workflow permissions
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title={errors.employees || "No staff accounts found"}
              detail="Create manager or intern accounts using the existing staff management page."
            />
          )}
          <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-xs leading-5 text-slate-600">
            Tenant admins can create staff through the existing user API.
            Editing accounts and assigning maker, checker, or approver
            permissions are restricted to superadmin by the current API.
          </div>
        </Panel>
      </div>

      <Panel
        id="all-documents"
        title="Documents and workflow"
        subtitle="Filter tenant documents by company, type, employee, and status"
        icon={FileText}
        action={
          <>
            {canMakeDocuments ? (
              <Link
                to="/generate"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                <FilePlus2 size={14} /> Create document
              </Link>
            ) : (
              <span className="text-xs text-slate-500">
                Maker permission required to create documents
              </span>
            )}
          </>
        }
      >
        {downloadError && (
          <p
            role="alert"
            className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-900"
          >
            {downloadError}
          </p>
        )}
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 xl:grid-cols-5">
          <label className="relative block sm:col-span-2 xl:col-span-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={documentSearch}
              onChange={(event) => setDocumentSearch(event.target.value)}
              placeholder="Search documents"
              className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <select
            value={filters.company}
            onChange={(event) =>
              setFilters((value) => ({ ...value, company: event.target.value }))
            }
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
          >
            <option value="all">All companies</option>
            {companies.map((company) => (
              <option key={company._id} value={company._id}>
                {company.nameOfCompany}
              </option>
            ))}
          </select>
          <select
            value={filters.type}
            onChange={(event) =>
              setFilters((value) => ({ ...value, type: event.target.value }))
            }
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
          >
            <option value="all">All document types</option>
            {[
              ...new Set(
                documents.map((doc) => doc.documentType).filter(Boolean),
              ),
            ]
              .sort()
              .map((type) => (
                <option key={type} value={type}>
                  {String(type).replaceAll("_", " ")}
                </option>
              ))}
          </select>
          <select
            value={filters.employee}
            onChange={(event) =>
              setFilters((value) => ({
                ...value,
                employee: event.target.value,
              }))
            }
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
          >
            <option value="all">All employees</option>
            {employeeOptions.map((person) => (
              <option key={person.id} value={person.id}>
                {person.label}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(event) => changeStatus(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
          >
            <option value="all">All statuses</option>
            <option value="REJECTED">Rejected</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        {loading ? (
          <Empty title="Loading documents…" />
        ) : filteredDocuments.length ? (
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full min-w-[1020px] text-left">
              <thead className="sticky top-0 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Company / document</th>
                  <th className="px-4 py-3">Maker</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Workflow details</th>
                  <th className="px-4 py-3">File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocuments.slice(0, 100).map((doc) => (
                  <tr
                    key={doc._id}
                    id={`${statusOf(doc).toLowerCase().replaceAll("_", "-")}-document-${doc._id}`}
                    className="align-top hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-slate-800">
                        {doc.company?.nameOfCompany || "Company"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {String(doc.documentType || "Document").replaceAll(
                          "_",
                          " ",
                        )}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {fullName(doc.maker)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {displayDate(doc.createdAt || doc.uploadedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="max-w-xs px-4 py-3 text-xs text-slate-600">
                      <p>
                        {doc.checkedAt
                          ? `Checked ${displayDate(doc.checkedAt)}`
                          : "Waiting for checker"}
                      </p>
                      <p className="mt-1">
                        {doc.approvedAt
                          ? `Approved ${displayDate(doc.approvedAt)}`
                          : statusOf(doc) === "PENDING_APPROVAL"
                            ? "Waiting for approver"
                            : ""}
                      </p>
                      {doc.rejectedReason && (
                        <p className="mt-1 font-medium text-rose-700">
                          Reason: {doc.rejectedReason}
                        </p>
                      )}
                      {doc.editLogs?.length > 0 && (
                        <details className="mt-1">
                          <summary className="cursor-pointer font-medium text-blue-700">
                            {doc.editLogs.length} revision event(s)
                          </summary>
                          <ul className="mt-1 space-y-1">
                            {doc.editLogs.map((log, index) => (
                              <li key={`${doc._id}-log-${index}`}>
                                {displayDate(log.editedAt)} ·{" "}
                                {log.comment || "Updated"}
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {statusOf(doc) === "APPROVED" &&
                      doc.storageType === "filesystem" ? (
                        <button
                          type="button"
                          onClick={() => downloadApprovedDocument(doc)}
                          disabled={Boolean(downloadingId)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          <Download size={13} />
                          {downloadingId === doc._id ? "Preparing" : "Download"}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          {statusOf(doc) === "APPROVED"
                            ? "Cloud file unavailable"
                            : "—"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredDocuments.length > 100 && (
              <p className="px-5 py-3 text-xs text-slate-500">
                Showing first 100 of {filteredDocuments.length} matching
                documents.
              </p>
            )}
          </div>
        ) : (
          <Empty
            title={errors.documents || "No documents match these filters"}
            detail="Documents are listed from the tenant-scoped document API."
          />
        )}
      </Panel>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          id="reports"
          title="Reports and analytics"
          subtitle="Derived from tenant-scoped live document and company records"
          icon={Activity}
        >
          <div className="grid gap-4 p-5 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 text-xs font-semibold text-slate-700">
                Company document volume
              </h3>
              {companyStats.length ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={companyStats}
                      layout="vertical"
                      margin={{ left: 10, right: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis
                        type="number"
                        allowDecimals={false}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={90}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar
                        dataKey="documents"
                        name="Documents"
                        fill="#0ea5e9"
                        radius={[0, 5, 5, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="py-12 text-center text-xs text-slate-400">
                  No company document records.
                </p>
              )}
            </div>
            <div>
              <h3 className="mb-3 text-xs font-semibold text-slate-700">
                Employee workload (makers)
              </h3>
              {employeeStats.length ? (
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={employeeStats}
                      layout="vertical"
                      margin={{ left: 10, right: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis
                        type="number"
                        allowDecimals={false}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={90}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar
                        dataKey="documents"
                        name="Documents"
                        fill="#8b5cf6"
                        radius={[0, 5, 5, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="py-12 text-center text-xs text-slate-400">
                  No maker workload recorded.
                </p>
              )}
            </div>
          </div>
        </Panel>
        <Panel
          title="Recent activity"
          subtitle="Document events available from current timestamps and revision records"
          icon={Activity}
        >
          {recentActivity.length ? (
            <div className="divide-y divide-slate-100">
              {recentActivity.map((event) => (
                <div key={event.key} className="flex gap-3 px-5 py-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800">
                      {event.title}
                    </p>
                    <p className="mt-1 truncate text-[11px] text-slate-500">
                      {event.detail}
                    </p>
                  </div>
                  <time className="shrink-0 text-[10px] text-slate-400">
                    {displayDate(event.time)}
                  </time>
                </div>
              ))}
            </div>
          ) : (
            <Empty title="No recent activity" />
          )}
          <div
            id="activity-logs"
            className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500"
          >
            System-wide audit logs and employee activity endpoints are not
            present in the current backend.
          </div>
        </Panel>
      </div>

      <Panel
        id="firm-profile"
        title="Office profile"
        subtitle="Tenant details from the authenticated firm profile"
        icon={Building2}
      >
        {firm ? (
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[11px] font-medium text-slate-500">Firm</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {firm.name || "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">
                Tenant status
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {firm.status || "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">
                Onboarding
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {firm.onboardingStatus || "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Timezone</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {firm.settings?.timezone || "Asia/Kolkata"}
              </p>
            </div>
          </div>
        ) : (
          <Empty title={errors.firm || "Firm profile unavailable"} />
        )}
      </Panel>

      <div className="grid gap-5 md:grid-cols-3">
        <Panel
          id="roles-permissions"
          title="Roles and permissions"
          subtitle="Your current workflow permissions"
          icon={ShieldCheck}
        >
          <div className="p-5">
            <div className="flex flex-wrap gap-2">
              {permissionList.length ? (
                permissionList.map((permission) => (
                  <span
                    key={permission}
                    className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold capitalize text-blue-700"
                  >
                    {permission}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">
                  No maker, checker, or approver permission is assigned to this
                  account.
                </span>
              )}
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              The existing permission API only allows superadmins to assign
              workflow permissions. Tenant users cannot grant these permissions
              from this dashboard.
            </p>
          </div>
        </Panel>
        <Panel
          id="notifications"
          title="Notifications"
          subtitle="Tenant notification feed"
          icon={Bell}
        >
          <div className="p-5 text-xs leading-5 text-slate-500">
            A tenant notification endpoint/model is not available yet. No sample
            notifications are shown.
          </div>
        </Panel>
        <Panel
          id="settings"
          title="Settings"
          subtitle="Tenant preferences"
          icon={Settings}
        >
          <div className="p-5 text-xs leading-5 text-slate-500">
            Timezone and currency are displayed in Office Profile. A tenant
            settings management screen/API is not available yet.
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          ["Drafts", "draft-documents", FileText],
          ["Pending check", "pending-check", Clock3],
          ["Pending approval", "pending-approval", FileCheck2],
          ["Approved", "approved-documents", CheckCircle2],
          ["Rejected", "rejected-documents", XCircle],
        ].map(([label, id, icon]) => (
          <div
            key={id}
            id={id}
            className="scroll-mt-28 rounded-xl border border-slate-200 bg-white p-3"
          >
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              {createElement(icon, { size: 14 })}
              {label}
            </div>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {loading
                ? "—"
                : id === "draft-documents"
                  ? documentStats.DRAFT
                  : id === "pending-check"
                    ? documentStats.PENDING_CHECK
                    : id === "pending-approval"
                      ? documentStats.PENDING_APPROVAL
                      : id === "approved-documents"
                        ? documentStats.APPROVED
                        : rejectedDocuments.length}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
