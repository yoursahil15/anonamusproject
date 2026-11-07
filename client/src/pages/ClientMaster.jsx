import { useCallback, useEffect, useState } from "react";
import API from "../services/api";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Eye,
  Search,
  Landmark,
  FileText,
  Upload,
  X,
  Save,
  UserRound,
  MapPin,
  ShieldCheck,
  CalendarDays,
  Phone,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Users,
  Building,
  BriefcaseBusiness,
} from "lucide-react";

/* =========================================================
   SHARED STYLES
========================================================= */

const inputClass =
  "mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-[13px] text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50";

const labelClass = "block text-[11px] font-medium text-slate-600";

const primaryButton =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 text-xs font-medium text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButton =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-60";

const iconButton =
  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300";

const thClass = "px-3 py-2 text-[11px] font-semibold text-slate-500";

const emptyCompanyForm = () => ({
  nameOfCompany: "",
  pan: "",
  gst: "",
  factoryAddress: "",
  registeredOfficeAddress: "",
  ecNumber: "",
  ecDate: "",
  udyamNumber: "",
  mpcbDetails: "",
  contactPerson: "",
  phone: "",
  email: "",
  authorizedSignatories: [
    { name: "", role: "", mobileNumber: "", isDefault: true },
  ],
  operatingPeriodFrom: "",
  operatingPeriodTo: "",
  operatingPeriod: "",
  dateOfIncorporation: "",
});

const emptyBankForm = () => ({
  bankType: "",
  ifsc: "",
  accountNumber: "",
  bankName: "",
  branchName: "",
  branchAddress: "",
  startDate: "",
  endDate: "",
  sanctionDateFrom: "",
  sanctionDateTo: "",
  sanctionAmount: "",
});

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

const displayValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return value;
};

const bankTypeLabel = (type) =>
  type === "CC"
    ? "CC Account"
    : type === "TERM_LOAN"
      ? "Term Loan"
      : displayValue(type);

const formatAmount = (bank) =>
  bank.bankType === "TERM_LOAN" &&
  bank.sanctionAmount !== undefined &&
  bank.sanctionAmount !== null &&
  bank.sanctionAmount !== ""
    ? Number(bank.sanctionAmount).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
      })
    : "-";

/* =========================================================
   SHARED UI
========================================================= */

function PageHeader({ title, description, icon: Icon = Building2, children }) {
  return (
    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold leading-tight text-slate-900">
            {title}
          </h1>
          {description && (
            <p className="truncate text-xs text-slate-500">{description}</p>
          )}
        </div>
      </div>

      {children && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}

function SectionCard({ title, description, icon: Icon, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-3 py-2">
        {Icon && <Icon size={15} className="shrink-0 text-blue-600" />}

        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold text-slate-800">{title}</h3>
          {description && (
            <p className="text-[11px] text-slate-500">{description}</p>
          )}
        </div>
      </div>

      <div className="p-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  readOnly = false,
  disabled = false,
  className = "",
  rows = 3,
  options,
  hint,
  ...props
}) {
  const id = props.id || name;

  const commonProps = {
    id,
    name,
    value: value ?? "",
    onChange,
    required,
    disabled,
    "aria-label": label,
    className: `${inputClass} ${
      readOnly ? "bg-slate-50 text-slate-500" : ""
    } ${type === "textarea" ? "h-auto py-2" : ""} ${className}`,
    ...props,
  };

  return (
    <div className="min-w-0">
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

      {options ? (
        <select {...commonProps}>
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          {...commonProps}
          rows={rows}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      ) : (
        <input
          {...commonProps}
          type={type}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      )}

      {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
    </div>
  );
}

function ActionIcon({
  label,
  icon: Icon,
  onClick,
  color = "slate",
  disabled = false,
  spin = false,
}) {
  const colors = {
    slate: "text-slate-600 hover:bg-slate-100",
    blue: "text-blue-600 hover:bg-blue-50",
    green: "text-emerald-600 hover:bg-emerald-50",
    red: "text-red-600 hover:bg-red-50",
    purple: "text-purple-600 hover:bg-purple-50",
  };

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`${iconButton} ${colors[color]} disabled:cursor-not-allowed disabled:opacity-40`}
    >
      <Icon size={15} className={spin ? "animate-spin" : ""} />
    </button>
  );
}

function BackButton({ onClick, label = "Back to companies" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 transition hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
    >
      <ArrowLeft size={14} />
      {label}
    </button>
  );
}

function EmptyState({ icon: Icon = FileText, title, description, children }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon size={20} />
      </div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>
      )}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

function LoadingState({ text }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-xs text-slate-500">
      <RefreshCw size={15} className="animate-spin text-blue-600" />
      {text}
    </div>
  );
}

function DetailItem({ label, value, wide = false }) {
  return (
    <div className={`min-w-0 ${wide ? "sm:col-span-2" : ""}`}>
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className="mt-0.5 break-words text-[13px] font-medium text-slate-800">
        {displayValue(value)}
      </p>
    </div>
  );
}

function StatusBadge({ children, color = "blue" }) {
  const styles = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    purple: "bg-purple-50 text-purple-700 ring-purple-100",
    amber: "bg-amber-50 text-amber-800 ring-amber-200",
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
        styles[color] || styles.blue
      }`}
    >
      {children}
    </span>
  );
}

function SelectedCompany({ label, name }) {
  return (
    <div className="mb-3 flex items-center gap-2.5 rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-2">
      <Building2 size={16} className="shrink-0 text-blue-600" />
      <div className="min-w-0">
        <p className="text-[11px] text-blue-700">{label}</p>
        <p className="truncate text-[13px] font-semibold text-slate-800">
          {name || "-"}
        </p>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-3 py-2.5">
        <p className="truncate text-[13px] font-semibold text-slate-800">
          {title}
        </p>
        <p className="text-[11px] text-slate-500">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function ClientMaster() {
  const [companies, setCompanies] = useState([]);
  const [banks, setBanks] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [viewCompany, setViewCompany] = useState(null);
  const [companyDetails, setCompanyDetails] = useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [view, setView] = useState("companyList");

  const [companyForm, setCompanyForm] = useState(emptyCompanyForm);
  const [bankForm, setBankForm] = useState(emptyBankForm);

  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [previewingDocument, setPreviewingDocument] = useState(null);
  const [deletingDocument, setDeletingDocument] = useState(null);
  const [deletingCompany, setDeletingCompany] = useState(null);
  const [deletingBank, setDeletingBank] = useState(null);
  const [ifscLoading, setIfscLoading] = useState(false);
  const [ifscError, setIfscError] = useState("");

  /* =======================================================
     FETCH DATA
  ======================================================= */

  const fetchBanks = useCallback(async (companyId) => {
    if (!companyId) return;

    setLoadingBanks(true);

    try {
      const res = await API.get(`/banks/company/${companyId}`);
      setBanks(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch banks:", error);
      setBanks([]);
    } finally {
      setLoadingBanks(false);
    }
  }, []);

  const fetchDocuments = useCallback(async (companyId) => {
    if (!companyId) return;

    setLoadingDocuments(true);

    try {
      const res = await API.get(`/company-documents/company/${companyId}`);
      setDocuments(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  }, []);

  const fetchCompanies = useCallback(async () => {
    setLoadingCompanies(true);

    try {
      const res = await API.get("/companies");
      const list = Array.isArray(res.data) ? res.data : [];

      const companiesWithCount = await Promise.all(
        list.map(async (company) => {
          try {
            const bankRes = await API.get(`/banks/company/${company._id}`);

            return {
              ...company,
              bankCount: Array.isArray(bankRes.data)
                ? bankRes.data.length
                : 0,
            };
          } catch {
            return { ...company, bankCount: 0 };
          }
        }),
      );

      setCompanies(companiesWithCount);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
      alert(error.response?.data?.msg || "Unable to load companies.");
    } finally {
      setLoadingCompanies(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    if (!selectedCompany?._id) {
      setCompanyDetails(null);
      return;
    }

    let active = true;

    const fetchCompanyDetails = async () => {
      try {
        const res = await API.get(`/companies/${selectedCompany._id}`);

        if (active) {
          setCompanyDetails(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch selected company details:", error);
      }
    };

    fetchCompanyDetails();

    return () => {
      active = false;
    };
  }, [selectedCompany]);

  /* =======================================================
     NAVIGATION HELPERS
  ======================================================= */

  const openCompanyForm = (company = null) => {
    setSelectedCompany(company);

    if (company) {
      setCompanyForm({
        ...emptyCompanyForm(),
        ...company,

        ecDate: company.ecDate ? company.ecDate.substring(0, 10) : "",

        dateOfIncorporation: company.dateOfIncorporation
          ? company.dateOfIncorporation.substring(0, 10)
          : "",

        operatingPeriodFrom: company.operatingPeriodFrom
          ? company.operatingPeriodFrom.substring(0, 10)
          : "",

        operatingPeriodTo: company.operatingPeriodTo
          ? company.operatingPeriodTo.substring(0, 10)
          : "",

        authorizedSignatories:
          company.authorizedSignatories?.length > 0
            ? company.authorizedSignatories.map((person) => ({
                name: person.name || "",
                role: person.role || "",
                mobileNumber: person.mobileNumber || "",
                isDefault: Boolean(person.isDefault),
              }))
            : emptyCompanyForm().authorizedSignatories,
      });
    } else {
      setCompanyForm(emptyCompanyForm());
    }

    setView("companyForm");
  };

  const openBankForm = (company) => {
    setSelectedCompany(company);
    setBankForm(emptyBankForm());
    setIfscError("");
    setView("bankForm");
  };

  const openBankList = async (company) => {
    setSelectedCompany(company);
    setBanks([]);
    setView("bankList");

    await fetchBanks(company._id);
  };

  const openDocumentList = async (company) => {
    setSelectedCompany(company);
    setDocuments([]);
    setView("documentList");

    await fetchDocuments(company._id);
  };

  const openDocumentUpload = (company = selectedCompany) => {
    if (company) {
      setSelectedCompany(company);
    }

    setSelectedFile(null);
    setView("documentUpload");
  };

  const goToCompanyList = () => {
    setView("companyList");
    setSelectedFile(null);
  };

  /* =======================================================
     COMPANY CREATE / UPDATE
  ======================================================= */

  const handleCreateCompany = async (e) => {
    e.preventDefault();

    if (savingCompany) return;

    setSavingCompany(true);

    try {
      const payload = {
        ...companyForm,
        operatingPeriodFrom: companyForm.operatingPeriodFrom || undefined,
        operatingPeriodTo: companyForm.operatingPeriodTo || undefined,
        operatingPeriod:
          companyForm.operatingPeriod === "" ? undefined : companyForm.operatingPeriod,
      };

      if (selectedCompany?._id) {
        await API.put(`/companies/update/${selectedCompany._id}`, payload);

        alert("Company updated successfully.");
      } else {
        await API.post("/companies", payload);

        alert("Company created successfully.");
      }

      await fetchCompanies();

      setSelectedCompany(null);
      setCompanyForm(emptyCompanyForm());
      setView("companyList");
    } catch (error) {
      console.error("Company save failed:", error);

      alert(
        error.response?.data?.msg ||
          error.response?.data?.message ||
          error.message ||
          "Unable to save company.",
      );
    } finally {
      setSavingCompany(false);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm("Are you sure you want to delete this company?")) {
      return;
    }

    setDeletingCompany(companyId);

    try {
      await API.delete(`/companies/delete/${companyId}`);

      alert("Company deleted successfully.");

      await fetchCompanies();
    } catch (error) {
      console.error("Company deletion failed:", error);
      alert(error.response?.data?.msg || "Unable to delete company.");
    } finally {
      setDeletingCompany(null);
    }
  };

  /* =======================================================
     COMPANY FORM HANDLERS
  ======================================================= */

  const handleCompanyFieldChange = (e) => {
    const { name, value } = e.target;

    let nextValue = value;

    if (name === "pan") {
      nextValue = value.toUpperCase().slice(0, 10);
    }

    if (name === "gst") {
      nextValue = value.toUpperCase().slice(0, 16);
    }

    if (name === "phone") {
      nextValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setCompanyForm((prev) => {
      const next = {
        ...prev,
        [name]: nextValue,
      };

      if (name === "operatingPeriodFrom" || name === "operatingPeriodTo") {
        next.operatingPeriod = calculateOperatingPeriod(
          next.operatingPeriodFrom,
          next.operatingPeriodTo,
        );
      }

      return next;
    });
  };

  const calculateOperatingPeriod = (from, to) => {
    if (!from || !to) return "";

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (
      Number.isNaN(fromDate.getTime()) ||
      Number.isNaN(toDate.getTime()) ||
      toDate < fromDate
    ) {
      return "";
    }

    let years = toDate.getFullYear() - fromDate.getFullYear();

    const beforeAnniversary =
      toDate.getMonth() < fromDate.getMonth() ||
      (toDate.getMonth() === fromDate.getMonth() &&
        toDate.getDate() < fromDate.getDate());

    if (beforeAnniversary) {
      years -= 1;
    }

    return Math.max(0, years);
  };

  const updateSignatory = (index, field, value) => {
    setCompanyForm((prev) => ({
      ...prev,

      authorizedSignatories: prev.authorizedSignatories.map((person, i) => ({
        ...person,
        ...(i === index ? { [field]: value } : {}),
        ...(field === "isDefault" && value ? { isDefault: i === index } : {}),
      })),
    }));
  };

  const addSignatory = () => {
    setCompanyForm((prev) => ({
      ...prev,

      authorizedSignatories: [
        ...prev.authorizedSignatories,
        {
          name: "",
          role: "",
          mobileNumber: "",
          isDefault: prev.authorizedSignatories.length === 0,
        },
      ],
    }));
  };

  const removeSignatory = (index) => {
    setCompanyForm((prev) => {
      const updated = prev.authorizedSignatories.filter((_, i) => i !== index);

      if (updated.length > 0 && !updated.some((person) => person.isDefault)) {
        updated[0] = { ...updated[0], isDefault: true };
      }

      return {
        ...prev,
        authorizedSignatories:
          updated.length > 0
            ? updated
            : [{ name: "", role: "", mobileNumber: "", isDefault: true }],
      };
    });
  };

  /* =======================================================
     BANK MANAGEMENT
  ======================================================= */

  const handleBankChange = async (e) => {
    const { name, value } = e.target;

    if (name !== "ifsc") {
      setBankForm((prev) => ({
        ...prev,
        [name]: value,
      }));

      return;
    }

    const normalized = value.toUpperCase().replace(/\s/g, "");

    setBankForm((prev) => ({
      ...prev,
      ifsc: normalized,
      bankName: "",
      branchName: "",
      branchAddress: "",
    }));

    setIfscError("");

    if (normalized.length < 11) {
      setIfscLoading(false);
      return;
    }

    if (normalized.length !== 11) {
      setIfscError("Enter a valid 11-character IFSC code.");
      return;
    }

    setIfscLoading(true);

    try {
      const response = await fetch(`https://ifsc.razorpay.com/${normalized}`);

      if (!response.ok) {
        throw new Error("Invalid IFSC code.");
      }

      const data = await response.json();

      setBankForm((prev) => ({
        ...prev,
        ifsc: normalized,
        bankName: data.BANK || "",
        branchName: data.BRANCH || "",
        branchAddress: data.ADDRESS || "",
      }));
    } catch (error) {
      console.error("IFSC lookup failed:", error);
      setIfscError("IFSC not found. Please verify the code.");
    } finally {
      setIfscLoading(false);
    }
  };

  const handleCreateBank = async (e) => {
    e.preventDefault();

    if (savingBank || !selectedCompany?._id) return;

    setSavingBank(true);

    try {
      await API.post("/banks/add", {
        ...bankForm,
        companyId: selectedCompany._id,
      });

      alert("Bank added successfully.");

      setBankForm(emptyBankForm());

      await fetchBanks(selectedCompany._id);
      await fetchCompanies();

      setView("bankList");
    } catch (error) {
      console.error("Bank creation failed:", error);

      alert(error.response?.data?.msg || "Bank creation failed.");
    } finally {
      setSavingBank(false);
    }
  };

  const handleDeleteBank = async (bankId) => {
    if (!window.confirm("Are you sure you want to delete this bank account?")) {
      return;
    }

    setDeletingBank(bankId);

    try {
      await API.delete(`/banks/${bankId}`);

      alert("Bank deleted successfully.");

      await fetchBanks(selectedCompany._id);
      await fetchCompanies();
    } catch (error) {
      console.error("Bank deletion failed:", error);

      alert(error.response?.data?.msg || "Failed to delete bank.");
    } finally {
      setDeletingBank(null);
    }
  };

  /* =======================================================
     DOCUMENT MANAGEMENT
  ======================================================= */

  const handleUploadDocument = async () => {
    if (!selectedFile) {
      alert("Please select a file.");
      return;
    }

    if (!selectedCompany?._id || uploadingDocument) return;

    setUploadingDocument(true);

    try {
      const formData = new FormData();

      formData.append("file", selectedFile);
      formData.append("companyId", selectedCompany._id);

      await API.post("/company-documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Document uploaded successfully.");

      setSelectedFile(null);

      await fetchDocuments(selectedCompany._id);

      setView("documentList");
    } catch (error) {
      console.error("Document upload failed:", error);

      alert(error.response?.data?.msg || "Document upload failed.");
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    setDeletingDocument(id);

    try {
      await API.delete(`/company-documents/${id}`);

      await fetchDocuments(selectedCompany._id);
    } catch (error) {
      console.error("Document deletion failed:", error);

      alert(error.response?.data?.msg || "Failed to delete document.");
    } finally {
      setDeletingDocument(null);
    }
  };

  const handlePreviewDocument = async (doc) => {
    setPreviewingDocument(doc._id);

    let objectUrl;

    try {
      const response = await API.get(`/company-documents/${doc._id}/file`, {
        responseType: "blob",
      });

      objectUrl = URL.createObjectURL(response.data);

      const openedWindow = window.open(objectUrl, "_blank", "noopener,noreferrer");

      if (!openedWindow) {
        alert(
          "The preview window may have been blocked. Please allow pop-ups and try again.",
        );
      }

      window.setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
      }, 60_000);
    } catch (error) {
      console.error("Document preview failed:", error);

      alert(
        error.response?.status === 410
          ? "This legacy document needs to be migrated to server storage."
          : "Document preview failed.",
      );
    } finally {
      setPreviewingDocument(null);
    }
  };

  /* =======================================================
     FILTERS
  ======================================================= */

  const filteredCompanies = companies.filter((company) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return [
      company.nameOfCompany,
      company.email,
      company.pan,
      company.gst,
      company.contactPerson,
    ].some((value) => String(value || "").toLowerCase().includes(query));
  });

  /* =======================================================
     SHARED ACTION GROUPS (used by table rows and mobile cards)
  ======================================================= */

  const renderCompanyActions = (company) => (
    <div className="flex items-center gap-0.5">
      <ActionIcon
        label="Add bank"
        icon={Plus}
        color="blue"
        onClick={() => openBankForm(company)}
      />
      <ActionIcon
        label="View banks"
        icon={Landmark}
        color="green"
        onClick={() => openBankList(company)}
      />
      <span className="mx-1 h-4 w-px bg-slate-200" />
      <ActionIcon
        label="Upload document"
        icon={Upload}
        color="blue"
        onClick={() => openDocumentUpload(company)}
      />
      <ActionIcon
        label="View documents"
        icon={FileText}
        color="purple"
        onClick={() => openDocumentList(company)}
      />
      <span className="mx-1 h-4 w-px bg-slate-200" />
      <ActionIcon
        label="View company details"
        icon={Eye}
        color="blue"
        onClick={() => {
          setViewCompany(company);
          setView("companyDetails");
        }}
      />
      <ActionIcon
        label="Edit company"
        icon={Pencil}
        color="green"
        onClick={() => openCompanyForm(company)}
      />
      <ActionIcon
        label="Delete company"
        icon={Trash2}
        color="red"
        disabled={deletingCompany === company._id}
        onClick={() => handleDeleteCompany(company._id)}
      />
    </div>
  );

  const canDeleteBank = (bank) =>
    bank.bankType === "TERM_LOAN" || bank.bankType === "LOAN";

  const maskAccount = (value) => {
    const accountNumber = String(value || "");

    return accountNumber.length > 4
      ? `••••${accountNumber.slice(-4)}`
      : accountNumber || "-";
  };

  const sanctionPeriod = (bank) =>
    bank.bankType === "TERM_LOAN"
      ? `${formatDate(bank.sanctionDateFrom)} – ${formatDate(
          bank.sanctionDateTo,
        )}`
      : "-";

  const openAddBank = () => {
    setBankForm(emptyBankForm());
    setIfscError("");
    setView("bankForm");
  };

  /* =======================================================
     PAGE WRAPPER
     min-w-0 + w-full keep wide content from pushing the
     sidebar / flex parent; tables scroll inside their panels.
  ======================================================= */

  return (
    <div className="min-h-full w-full min-w-0 max-w-full">
      <div className="mx-auto w-full min-w-0 max-w-[1600px]">
        {/* =================================================
            COMPANY LIST
        ================================================= */}

        {view === "companyList" && (
          <>
            <PageHeader
              title="Company Master"
              description="Manage company profiles, bank accounts and documents."
            >
              <button
                type="button"
                onClick={() => openCompanyForm()}
                className={primaryButton}
              >
                <Plus size={14} />
                Add Company
              </button>
            </PageHeader>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-2 border-b border-slate-200 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500" aria-live="polite">
                  {loadingCompanies ? (
                    "Loading…"
                  ) : (
                    <>
                      <span className="font-semibold text-slate-800">
                        {filteredCompanies.length}
                      </span>{" "}
                      of {companies.length}{" "}
                      {companies.length === 1 ? "company" : "companies"}
                    </>
                  )}
                </p>

                <div className="relative w-full sm:w-72">
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, PAN, GST or email"
                    aria-label="Search companies"
                    className="h-8 w-full rounded-md border border-slate-300 pl-8 pr-8 text-xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {loadingCompanies ? (
                <LoadingState text="Loading companies…" />
              ) : filteredCompanies.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title={search ? "No matching companies" : "No companies yet"}
                  description={
                    search
                      ? "Try a different company name, PAN, GST or email."
                      : "Add your first company to start managing its accounts and documents."
                  }
                >
                  {!search && (
                    <button
                      type="button"
                      onClick={() => openCompanyForm()}
                      className={primaryButton}
                    >
                      <Plus size={14} />
                      Add Company
                    </button>
                  )}
                </EmptyState>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block">
                    <table className="w-full table-fixed text-left">
                      <colgroup>
                        <col className="w-[30%]" />
                        <col className="w-[24%]" />
                        <col className="w-[12%]" />
                        <col className="w-[34%]" />
                      </colgroup>
                      <thead className="border-b border-slate-200 bg-slate-50">
                        <tr>
                          <th className={thClass}>Company</th>
                          <th className={thClass}>Contact</th>
                          <th className={thClass}>Banks</th>
                          <th className={`${thClass} text-right`}>Actions</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {filteredCompanies.map((company) => (
                          <tr
                            key={company._id}
                            className="transition-colors hover:bg-slate-50/80"
                          >
                            <td className="px-3 py-2">
                              <div className="flex min-w-0 items-center gap-2.5">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                  <Building2 size={15} />
                                </div>

                                <div className="min-w-0">
                                  <p
                                    className="truncate text-[13px] font-semibold text-slate-800"
                                    title={company.nameOfCompany}
                                  >
                                    {company.nameOfCompany || "-"}
                                  </p>
                                  <p className="truncate text-[11px] text-slate-500">
                                    PAN: {displayValue(company.pan)}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-3 py-2">
                              <p
                                className="truncate text-xs text-slate-700"
                                title={company.email}
                              >
                                {displayValue(company.email)}
                              </p>
                              <p className="truncate text-[11px] text-slate-500">
                                {displayValue(company.phone)}
                              </p>
                            </td>

                            <td className="px-3 py-2">
                              <StatusBadge color="blue">
                                {company.bankCount || 0} accounts
                              </StatusBadge>
                            </td>

                            <td className="px-3 py-2">
                              <div className="flex justify-end">
                                {renderCompanyActions(company)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="space-y-2 p-2.5 md:hidden">
                    {filteredCompanies.map((company) => (
                      <article
                        key={company._id}
                        className="rounded-lg border border-slate-200 p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-slate-800">
                              {company.nameOfCompany || "-"}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              PAN: {displayValue(company.pan)}
                            </p>
                          </div>
                          <StatusBadge color="blue">
                            {company.bankCount || 0} banks
                          </StatusBadge>
                        </div>

                        <p className="mt-1.5 truncate text-xs text-slate-600">
                          {displayValue(company.email)} ·{" "}
                          {displayValue(company.phone)}
                        </p>

                        <div className="mt-2 flex justify-between overflow-x-auto border-t border-slate-100 pt-2">
                          {renderCompanyActions(company)}
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* =================================================
            COMPANY CREATE / EDIT
        ================================================= */}

        {view === "companyForm" && (
          <>
            <PageHeader
              title={selectedCompany ? "Edit Company" : "Create Company"}
              description={
                selectedCompany
                  ? "Update the company's profile and compliance information."
                  : "Enter the company details to create a new profile."
              }
            >
              <StatusBadge color={selectedCompany ? "amber" : "blue"}>
                {selectedCompany ? "Edit mode" : "New company"}
              </StatusBadge>
            </PageHeader>

            <form onSubmit={handleCreateCompany} className="space-y-3">
              <SectionCard
                title="Basic Company Information"
                description="Identity and statutory identification."
                icon={Building2}
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="md:col-span-2">
                    <Field
                      label="Company Name"
                      name="nameOfCompany"
                      value={companyForm.nameOfCompany}
                      onChange={handleCompanyFieldChange}
                      placeholder="Enter registered company name"
                      required
                    />
                  </div>

                  <Field
                    label="PAN"
                    name="pan"
                    value={companyForm.pan}
                    onChange={handleCompanyFieldChange}
                    placeholder="ABCDE1234F"
                    required
                  />

                  <Field
                    label="GST"
                    name="gst"
                    value={companyForm.gst}
                    onChange={handleCompanyFieldChange}
                    placeholder="Enter GST number"
                    required
                  />

                  <Field
                    label="Date of Incorporation"
                    name="dateOfIncorporation"
                    type="date"
                    value={companyForm.dateOfIncorporation}
                    onChange={handleCompanyFieldChange}
                    required
                  />
                </div>
              </SectionCard>

              <SectionCard
                title="Address Details"
                description="Factory and registered office addresses."
                icon={MapPin}
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Field
                    label="Factory Unit Address"
                    name="factoryAddress"
                    type="textarea"
                    rows={2}
                    value={companyForm.factoryAddress}
                    onChange={handleCompanyFieldChange}
                    placeholder="Enter factory address"
                    required
                  />

                  <Field
                    label="Registered Office Address"
                    name="registeredOfficeAddress"
                    type="textarea"
                    rows={2}
                    value={companyForm.registeredOfficeAddress}
                    onChange={handleCompanyFieldChange}
                    placeholder="Enter registered office address"
                    required
                  />
                </div>
              </SectionCard>

              <SectionCard
                title="Registrations & Compliance"
                description="Environmental clearances and business registrations."
                icon={ShieldCheck}
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <Field
                    label="EC Number"
                    name="ecNumber"
                    value={companyForm.ecNumber}
                    onChange={handleCompanyFieldChange}
                    required
                  />

                  <Field
                    label="EC Date"
                    name="ecDate"
                    type="date"
                    value={companyForm.ecDate}
                    onChange={handleCompanyFieldChange}
                    required
                  />

                  <Field
                    label="Udyam Number"
                    name="udyamNumber"
                    value={companyForm.udyamNumber}
                    onChange={handleCompanyFieldChange}
                    required
                  />

                  <Field
                    label="MPCB Details"
                    name="mpcbDetails"
                    value={companyForm.mpcbDetails}
                    onChange={handleCompanyFieldChange}
                    placeholder="Enter MPCB details"
                    required
                  />
                </div>
              </SectionCard>

              <SectionCard
                title="Contact Information"
                description="Primary company contact details."
                icon={Phone}
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Field
                    label="Contact Person"
                    name="contactPerson"
                    value={companyForm.contactPerson}
                    onChange={handleCompanyFieldChange}
                    placeholder="Full name"
                    required
                  />

                  <Field
                    label="Phone Number"
                    name="phone"
                    type="tel"
                    value={companyForm.phone}
                    onChange={handleCompanyFieldChange}
                    placeholder="10-digit mobile number"
                    required
                  />

                  <Field
                    label="Email Address"
                    name="email"
                    type="email"
                    value={companyForm.email}
                    onChange={handleCompanyFieldChange}
                    placeholder="company@example.com"
                    required
                  />
                </div>
              </SectionCard>

              <SectionCard
                title="Operating Period"
                description="Define the company's operating period."
                icon={CalendarDays}
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Field
                    label="Operating Period From"
                    name="operatingPeriodFrom"
                    type="date"
                    value={companyForm.operatingPeriodFrom}
                    onChange={handleCompanyFieldChange}
                  />

                  <Field
                    label="Operating Period To"
                    name="operatingPeriodTo"
                    type="date"
                    value={companyForm.operatingPeriodTo}
                    onChange={handleCompanyFieldChange}
                  />

                  <Field
                    label="Calculated Operating Period"
                    name="operatingPeriod"
                    value={
                      companyForm.operatingPeriod === ""
                        ? ""
                        : `${companyForm.operatingPeriod} Year(s)`
                    }
                    readOnly
                    hint="Calculated from the selected dates."
                  />
                </div>
              </SectionCard>

              <SectionCard
                title="Authorized Persons"
                description="Directors, partners and authorized signatories."
                icon={Users}
              >
                <div className="space-y-2">
                  {companyForm.authorizedSignatories.map((person, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-slate-200 bg-slate-50/50 p-2.5"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <UserRound
                            size={14}
                            className="shrink-0 text-slate-400"
                          />
                          <span className="text-xs font-semibold text-slate-700">
                            Authorized Person {index + 1}
                          </span>
                          {person.isDefault && (
                            <StatusBadge color="green">
                              Default signatory
                            </StatusBadge>
                          )}
                        </div>

                        {companyForm.authorizedSignatories.length > 1 && (
                          <ActionIcon
                            label="Remove authorized person"
                            icon={X}
                            color="red"
                            onClick={() => removeSignatory(index)}
                          />
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <Field
                          label="Person Name"
                          name={`signatory-name-${index}`}
                          value={person.name}
                          onChange={(e) =>
                            updateSignatory(index, "name", e.target.value)
                          }
                          placeholder="Full name"
                          required
                        />

                        <Field
                          label="Role"
                          name={`signatory-role-${index}`}
                          value={person.role}
                          onChange={(e) =>
                            updateSignatory(index, "role", e.target.value)
                          }
                          options={[
                            { value: "Director", label: "Director" },
                            { value: "Partner", label: "Partner" },
                            { value: "Proprietor", label: "Proprietor" },
                          ]}
                          required
                        />

                        <Field
                          label="Mobile Number"
                          name={`signatory-mobile-${index}`}
                          type="tel"
                          value={person.mobileNumber}
                          onChange={(e) =>
                            updateSignatory(
                              index,
                              "mobileNumber",
                              e.target.value.replace(/\D/g, "").slice(0, 10),
                            )
                          }
                          placeholder="Mobile number"
                          required
                        />
                      </div>

                      <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-[11px] font-medium text-slate-600">
                        <input
                          type="radio"
                          name="defaultSignatory"
                          checked={Boolean(person.isDefault)}
                          onChange={() =>
                            updateSignatory(index, "isDefault", true)
                          }
                          className="h-3.5 w-3.5 accent-blue-600"
                        />
                        Default for printing
                      </label>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addSignatory}
                    className={secondaryButton}
                  >
                    <Plus size={14} />
                    Add Authorized Person
                  </button>
                </div>
              </SectionCard>

              <div className="sticky bottom-0 z-10 -mx-3 flex flex-col-reverse gap-2 border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur sm:-mx-4 sm:flex-row sm:justify-end sm:px-4">
                <button
                  type="button"
                  onClick={goToCompanyList}
                  className={secondaryButton}
                  disabled={savingCompany}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingCompany}
                  className={primaryButton}
                >
                  {savingCompany ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}

                  {savingCompany
                    ? "Saving..."
                    : selectedCompany
                      ? "Update Company"
                      : "Create Company"}
                </button>
              </div>
            </form>
          </>
        )}

        {/* =================================================
            COMPANY DETAILS
        ================================================= */}

        {view === "companyDetails" && viewCompany && (
          <>
            <PageHeader
              title={viewCompany.nameOfCompany || "Company Details"}
              description="Company profile, compliance and authorized persons."
            >
              <button
                type="button"
                onClick={() => openCompanyForm(viewCompany)}
                className={primaryButton}
              >
                <Pencil size={14} />
                Edit Company
              </button>
            </PageHeader>

            <BackButton onClick={goToCompanyList} />

            <div className="space-y-3">
              <SectionCard title="Company Information" icon={Building}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <DetailItem
                    label="Company Name"
                    value={viewCompany.nameOfCompany}
                  />
                  <DetailItem label="PAN" value={viewCompany.pan} />
                  <DetailItem label="GST" value={viewCompany.gst} />
                  <DetailItem
                    label="Date of Incorporation"
                    value={formatDate(viewCompany.dateOfIncorporation)}
                  />
                </div>
              </SectionCard>

              <SectionCard title="Address Details" icon={MapPin}>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <DetailItem
                    label="Factory Unit Address"
                    value={viewCompany.factoryAddress}
                    wide
                  />
                  <DetailItem
                    label="Registered Office Address"
                    value={viewCompany.registeredOfficeAddress}
                    wide
                  />
                </div>
              </SectionCard>

              <SectionCard title="Registration & Compliance" icon={ShieldCheck}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <DetailItem label="EC Number" value={viewCompany.ecNumber} />
                  <DetailItem
                    label="EC Date"
                    value={formatDate(viewCompany.ecDate)}
                  />
                  <DetailItem
                    label="Udyam Number"
                    value={viewCompany.udyamNumber}
                  />
                  <DetailItem
                    label="MPCB Details"
                    value={viewCompany.mpcbDetails}
                  />
                </div>
              </SectionCard>

              <SectionCard title="Contact Information" icon={Phone}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <DetailItem
                    label="Contact Person"
                    value={viewCompany.contactPerson}
                  />
                  <DetailItem label="Phone Number" value={viewCompany.phone} />
                  <DetailItem label="Email Address" value={viewCompany.email} />
                </div>
              </SectionCard>

              <SectionCard title="Operating Period" icon={CalendarDays}>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <DetailItem
                    label="From"
                    value={formatDate(viewCompany.operatingPeriodFrom)}
                  />
                  <DetailItem
                    label="To"
                    value={formatDate(viewCompany.operatingPeriodTo)}
                  />
                  <DetailItem
                    label="Duration"
                    value={
                      viewCompany.operatingPeriod !== "" &&
                      viewCompany.operatingPeriod !== null &&
                      viewCompany.operatingPeriod !== undefined
                        ? `${viewCompany.operatingPeriod} Year(s)`
                        : "-"
                    }
                  />
                </div>
              </SectionCard>

              <SectionCard title="Authorized Persons" icon={Users}>
                {viewCompany.authorizedSignatories?.length ? (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {viewCompany.authorizedSignatories.map((person, index) => (
                      <div
                        key={person._id || index}
                        className="rounded-lg border border-slate-200 p-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                              <UserRound size={15} />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-[13px] font-semibold text-slate-800">
                                {displayValue(person.name)}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {displayValue(person.role)}
                              </p>
                            </div>
                          </div>

                          {person.isDefault && (
                            <StatusBadge color="green">Default</StatusBadge>
                          )}
                        </div>

                        <p className="mt-2 border-t border-slate-100 pt-2 text-xs text-slate-600">
                          <span className="text-slate-500">Mobile: </span>
                          <span className="font-medium">
                            {displayValue(person.mobileNumber)}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    No authorized persons added.
                  </p>
                )}
              </SectionCard>
            </div>

            {companyDetails && (
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
                <CheckCircle2 size={12} />
                Latest company details retrieved.
              </div>
            )}
          </>
        )}

        {/* =================================================
            ADD BANK
        ================================================= */}

        {view === "bankForm" && (
          <>
            <PageHeader
              title="Add Bank Account"
              description="Register a bank account for the selected company."
              icon={Landmark}
            />

            <BackButton
              onClick={() => setView("bankList")}
              label="Back to bank accounts"
            />

            <SelectedCompany
              label="Selected company"
              name={selectedCompany?.nameOfCompany}
            />

            <form onSubmit={handleCreateBank} className="space-y-3">
              <SectionCard
                title="Account Information"
                description="Bank details are filled in from the IFSC code."
                icon={Landmark}
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <Field
                    label="Account Type"
                    name="bankType"
                    value={bankForm.bankType}
                    onChange={handleBankChange}
                    options={[
                      { value: "CC", label: "CC Account" },
                      { value: "TERM_LOAN", label: "Term Loan" },
                    ]}
                    required
                  />

                  <Field
                    label="Account Number"
                    name="accountNumber"
                    value={bankForm.accountNumber}
                    onChange={handleBankChange}
                    placeholder="Enter account number"
                    required
                  />

                  <Field
                    label="IFSC Code"
                    name="ifsc"
                    value={bankForm.ifsc}
                    onChange={handleBankChange}
                    placeholder="11-character IFSC"
                    required
                    maxLength={11}
                    className="uppercase"
                  />

                  <div className="flex items-end pb-2">
                    {ifscLoading ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-blue-600">
                        <RefreshCw size={13} className="animate-spin" />
                        Looking up IFSC
                      </span>
                    ) : bankForm.bankName ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600">
                        <CheckCircle2 size={13} />
                        IFSC details found
                      </span>
                    ) : ifscError ? (
                      <span
                        role="alert"
                        className="inline-flex items-center gap-1.5 text-xs text-red-600"
                      >
                        <AlertCircle size={13} />
                        {ifscError}
                      </span>
                    ) : null}
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Bank & Branch Details"
                description="Populated by the IFSC lookup."
                icon={Building}
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Field
                    label="Bank Name"
                    name="bankName"
                    value={bankForm.bankName}
                    readOnly
                  />

                  <Field
                    label="Branch Name"
                    name="branchName"
                    value={bankForm.branchName}
                    readOnly
                  />

                  <div className="md:col-span-2">
                    <Field
                      label="Branch Address"
                      name="branchAddress"
                      type="textarea"
                      rows={2}
                      value={bankForm.branchAddress}
                      readOnly
                    />
                  </div>
                </div>
              </SectionCard>

              {bankForm.bankType === "TERM_LOAN" && (
                <SectionCard
                  title="Sanction Details"
                  description="Required for term loan accounts."
                  icon={BriefcaseBusiness}
                >
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Field
                      label="Sanction Date From"
                      name="sanctionDateFrom"
                      type="date"
                      value={bankForm.sanctionDateFrom}
                      onChange={handleBankChange}
                      required
                    />

                    <Field
                      label="Sanction Date To"
                      name="sanctionDateTo"
                      type="date"
                      value={bankForm.sanctionDateTo}
                      onChange={handleBankChange}
                      required
                    />

                    <Field
                      label="Sanction Amount"
                      name="sanctionAmount"
                      type="number"
                      min="0"
                      value={bankForm.sanctionAmount}
                      onChange={handleBankChange}
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                </SectionCard>
              )}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setView("bankList")}
                  className={secondaryButton}
                  disabled={savingBank}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingBank || ifscLoading}
                  className={primaryButton}
                >
                  {savingBank ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}

                  {savingBank ? "Saving..." : "Save Bank"}
                </button>
              </div>
            </form>
          </>
        )}

        {/* =================================================
            BANK LIST
            Fixed-layout table (no min-width) so the page never
            grows wider than its container; cards below lg.
        ================================================= */}

        {view === "bankList" && (
          <>
            <PageHeader
              title="Bank Accounts"
              description={`Bank accounts for ${
                selectedCompany?.nameOfCompany || "the selected company"
              }.`}
              icon={Landmark}
            >
              <button
                type="button"
                onClick={openAddBank}
                className={primaryButton}
              >
                <Plus size={14} />
                Add Bank
              </button>
            </PageHeader>

            <BackButton onClick={goToCompanyList} />

            <Panel
              title={selectedCompany?.nameOfCompany || "Bank Accounts"}
              subtitle={`${banks.length} account(s)`}
            >
              {loadingBanks ? (
                <LoadingState text="Loading bank accounts…" />
              ) : banks.length === 0 ? (
                <EmptyState
                  icon={Landmark}
                  title="No bank accounts found"
                  description="Add a bank account to associate it with this company."
                >
                  <button
                    type="button"
                    onClick={openAddBank}
                    className={primaryButton}
                  >
                    <Plus size={14} />
                    Add Bank
                  </button>
                </EmptyState>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden lg:block">
                    <table className="w-full table-fixed text-left">
                      <colgroup>
                        <col className="w-[12%]" />
                        <col className="w-[24%]" />
                        <col className="w-[13%]" />
                        <col className="w-[11%]" />
                        <col className="w-[20%]" />
                        <col className="w-[14%]" />
                        <col className="w-[6%]" />
                      </colgroup>
                      <thead className="border-b border-slate-200 bg-slate-50">
                        <tr>
                          <th className={thClass}>Type</th>
                          <th className={thClass}>Bank / Branch</th>
                          <th className={thClass}>IFSC</th>
                          <th className={thClass}>Account</th>
                          <th className={thClass}>Sanction Period</th>
                          <th className={`${thClass} text-right`}>Amount</th>
                          <th className={`${thClass} text-center`} />
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {banks.map((bank) => (
                          <tr
                            key={bank._id}
                            className="transition-colors hover:bg-slate-50/80"
                          >
                            <td className="px-3 py-2">
                              <StatusBadge
                                color={bank.bankType === "CC" ? "green" : "blue"}
                              >
                                {bankTypeLabel(bank.bankType)}
                              </StatusBadge>
                            </td>

                            <td className="px-3 py-2">
                              <p
                                className="truncate text-[13px] font-medium text-slate-800"
                                title={bank.bankName}
                              >
                                {displayValue(bank.bankName)}
                              </p>
                              <p
                                className="truncate text-[11px] text-slate-500"
                                title={bank.branchName}
                              >
                                {displayValue(bank.branchName)}
                              </p>
                            </td>

                            <td className="truncate px-3 py-2 font-mono text-[11px] text-slate-600">
                              {displayValue(bank.ifsc)}
                            </td>

                            <td
                              className="truncate px-3 py-2 font-mono text-[11px] text-slate-600"
                              title="Account number masked for privacy"
                            >
                              {maskAccount(bank.accountNumber)}
                            </td>

                            <td className="px-3 py-2 text-[11px] text-slate-600">
                              {sanctionPeriod(bank)}
                            </td>

                            <td className="px-3 py-2 text-right text-xs font-medium tabular-nums text-slate-700">
                              {formatAmount(bank)}
                            </td>

                            <td className="px-3 py-2">
                              <div className="flex justify-center">
                                {canDeleteBank(bank) && (
                                  <ActionIcon
                                    label="Delete bank account"
                                    icon={Trash2}
                                    color="red"
                                    disabled={deletingBank === bank._id}
                                    onClick={() => handleDeleteBank(bank._id)}
                                  />
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Tablet / mobile cards */}
                  <div className="space-y-2 p-2.5 lg:hidden">
                    {banks.map((bank) => (
                      <article
                        key={bank._id}
                        className="rounded-lg border border-slate-200 p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-slate-800">
                              {displayValue(bank.bankName)}
                            </p>
                            <p className="truncate text-[11px] text-slate-500">
                              {displayValue(bank.branchName)}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-1">
                            <StatusBadge
                              color={bank.bankType === "CC" ? "green" : "blue"}
                            >
                              {bankTypeLabel(bank.bankType)}
                            </StatusBadge>

                            {canDeleteBank(bank) && (
                              <ActionIcon
                                label="Delete bank account"
                                icon={Trash2}
                                color="red"
                                disabled={deletingBank === bank._id}
                                onClick={() => handleDeleteBank(bank._id)}
                              />
                            )}
                          </div>
                        </div>

                        <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-slate-100 pt-2 text-xs">
                          <div className="min-w-0">
                            <dt className="text-[11px] text-slate-500">IFSC</dt>
                            <dd className="truncate font-mono text-slate-700">
                              {displayValue(bank.ifsc)}
                            </dd>
                          </div>
                          <div className="min-w-0">
                            <dt className="text-[11px] text-slate-500">
                              Account
                            </dt>
                            <dd className="truncate font-mono text-slate-700">
                              {maskAccount(bank.accountNumber)}
                            </dd>
                          </div>
                          {bank.bankType === "TERM_LOAN" && (
                            <>
                              <div className="min-w-0">
                                <dt className="text-[11px] text-slate-500">
                                  Sanction period
                                </dt>
                                <dd className="text-slate-700">
                                  {sanctionPeriod(bank)}
                                </dd>
                              </div>
                              <div className="min-w-0">
                                <dt className="text-[11px] text-slate-500">
                                  Amount
                                </dt>
                                <dd className="font-medium tabular-nums text-slate-700">
                                  {formatAmount(bank)}
                                </dd>
                              </div>
                            </>
                          )}
                        </dl>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </Panel>
          </>
        )}

        {/* =================================================
            DOCUMENT LIST
        ================================================= */}

        {view === "documentList" && (
          <>
            <PageHeader
              title="Company Documents"
              description={`Documents for ${
                selectedCompany?.nameOfCompany || "the selected company"
              }.`}
              icon={FileText}
            >
              <button
                type="button"
                onClick={() => openDocumentUpload()}
                className={primaryButton}
              >
                <Upload size={14} />
                Upload Document
              </button>
            </PageHeader>

            <BackButton onClick={goToCompanyList} />

            <Panel
              title={selectedCompany?.nameOfCompany || "Documents"}
              subtitle={`${documents.length} document(s)`}
            >
              {loadingDocuments ? (
                <LoadingState text="Loading documents…" />
              ) : documents.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No documents found"
                  description="Upload company documents to keep records organized."
                >
                  <button
                    type="button"
                    onClick={() => openDocumentUpload()}
                    className={primaryButton}
                  >
                    <Upload size={14} />
                    Upload Document
                  </button>
                </EmptyState>
              ) : (
                <table className="w-full table-fixed text-left">
                  <colgroup>
                    <col />
                    <col className="hidden w-32 sm:table-column" />
                    <col className="w-20" />
                  </colgroup>
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className={thClass}>File name</th>
                      <th className={`${thClass} hidden sm:table-cell`}>
                        Uploaded
                      </th>
                      <th className={`${thClass} text-center`}>Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {documents.map((doc) => (
                      <tr
                        key={doc._id}
                        className="transition-colors hover:bg-slate-50/80"
                      >
                        <td className="px-3 py-2">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                              <FileText size={15} />
                            </div>

                            <div className="min-w-0">
                              <p
                                className="truncate text-[13px] font-medium text-slate-800"
                                title={doc.fileName}
                              >
                                {displayValue(doc.fileName)}
                              </p>
                              <p className="text-[11px] text-slate-500 sm:hidden">
                                {formatDate(doc.createdAt)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="hidden px-3 py-2 text-xs text-slate-600 sm:table-cell">
                          {formatDate(doc.createdAt)}
                        </td>

                        <td className="px-3 py-2">
                          <div className="flex items-center justify-center gap-0.5">
                            <ActionIcon
                              label="Preview document"
                              icon={
                                previewingDocument === doc._id
                                  ? RefreshCw
                                  : ExternalLink
                              }
                              spin={previewingDocument === doc._id}
                              color="blue"
                              disabled={previewingDocument === doc._id}
                              onClick={() => handlePreviewDocument(doc)}
                            />

                            <ActionIcon
                              label="Delete document"
                              icon={Trash2}
                              color="red"
                              disabled={deletingDocument === doc._id}
                              onClick={() => handleDeleteDocument(doc._id)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Panel>
          </>
        )}

        {/* =================================================
            DOCUMENT UPLOAD
        ================================================= */}

        {view === "documentUpload" && (
          <>
            <PageHeader
              title="Upload Document"
              description="Add a file to the selected company's repository."
              icon={Upload}
            />

            <BackButton
              onClick={() => setView("documentList")}
              label="Back to documents"
            />

            <div className="mx-auto max-w-2xl">
              <SelectedCompany
                label="Uploading for"
                name={selectedCompany?.nameOfCompany}
              />

              <SectionCard
                title="Select Document"
                description="Choose the file you want to upload."
                icon={FileText}
              >
                <div className="space-y-3">
                  <label
                    htmlFor="company-document-file"
                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50/60 px-4 py-7 text-center transition hover:border-blue-400 hover:bg-blue-50/30 focus-within:border-blue-500"
                  >
                    <Upload size={20} className="mb-2 text-blue-600" />

                    <span className="text-[13px] font-semibold text-slate-800">
                      Click to select a document
                    </span>

                    <span className="mt-0.5 text-[11px] text-slate-500">
                      Choose a file from your device.
                    </span>

                    <input
                      id="company-document-file"
                      type="file"
                      className="sr-only"
                      disabled={uploadingDocument}
                      onChange={(e) =>
                        setSelectedFile(e.target.files?.[0] || null)
                      }
                    />
                  </label>

                  {selectedFile && (
                    <div className="flex items-center gap-2.5 rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2">
                      <FileText size={16} className="shrink-0 text-blue-600" />

                      <div className="min-w-0 flex-1">
                        <p
                          className="truncate text-[13px] font-medium text-slate-800"
                          title={selectedFile.name}
                        >
                          {selectedFile.name}
                        </p>

                        <p className="text-[11px] text-slate-500">
                          {(selectedFile.size / 1024).toLocaleString("en-IN", {
                            maximumFractionDigits: 1,
                          })}{" "}
                          KB
                        </p>
                      </div>

                      <ActionIcon
                        label="Remove selected file"
                        icon={X}
                        color="red"
                        disabled={uploadingDocument}
                        onClick={() => setSelectedFile(null)}
                      />
                    </div>
                  )}

                  <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setView("documentList")}
                      className={secondaryButton}
                      disabled={uploadingDocument}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={handleUploadDocument}
                      disabled={!selectedFile || uploadingDocument}
                      className={primaryButton}
                    >
                      {uploadingDocument ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <Upload size={14} />
                      )}

                      {uploadingDocument ? "Uploading..." : "Upload Document"}
                    </button>
                  </div>
                </div>
              </SectionCard>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
