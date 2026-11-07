import { useCallback, useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Building2,
  Landmark,
  Plus,
  Save,
  ArrowLeft,
  Eye,
  Pencil,
  RefreshCw,
  Search,
  CheckCircle2,
  CalendarDays,
  ShieldCheck,
  Users,
  X,
  Trash2,
  ClipboardList,
  ChevronRight,
  FileCheck,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

/* =========================================================
   DESIGN SYSTEM
========================================================= */

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50";

const labelClass =
  "mb-1.5 block text-xs font-semibold text-slate-600";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300";

const iconButton =
  "inline-flex h-8 w-8 items-center justify-center rounded-md transition focus:outline-none focus:ring-2 focus:ring-blue-300";

const emptyLoan = () => ({
  bankName: "",
  loanAccountNumber: "",
  loanSanctionDate: "",
  sanctionedAmount: "",
  loanBalance: "",
});

const formatLabel = (key) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase());

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)
  ) {
    return formatDate(value);
  }

  return String(value);
};

function PageHeader({
  title,
  description,
  icon: Icon = FileText,
  children,
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
          <Icon size={20} />
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>

          {description && (
            <p className="mt-0.5 text-sm text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>

      {children && (
        <div className="flex flex-wrap items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  className = "",
}) {
  return (
    <section
      className={`overflow-hidden rounded-lg border border-slate-200 bg-white ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-3">
        {Icon && (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
            <Icon size={15} />
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            {title}
          </h3>

          {description && (
            <p className="mt-0.5 text-xs text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="p-4">{children}</div>
    </section>
  );
}

function Field({
  field,
  value,
  onChange,
  label,
  type = "text",
  options,
  readOnly = false,
  disabled = false,
  placeholder,
  className = "",
  ...props
}) {
  const id = props.id || field;

  const shared = {
    id,
    name: field,
    value: value ?? "",
    onChange,
    disabled,
    readOnly,
    "aria-label": label,
    className: `${inputClass} ${
      readOnly ? "bg-slate-50 text-slate-500" : ""
    } ${className}`,
    ...props,
  };

  return (
    <div className="min-w-0">
      <label htmlFor={id} className={labelClass}>
        {label}
        {props.required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      {options ? (
        <select {...shared}>
          <option value="">Select {label}</option>

          {options.map((option) => {
            const item =
              typeof option === "string"
                ? { value: option, label: option }
                : option;

            return (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            );
          })}
        </select>
      ) : type === "textarea" ? (
        <textarea
          {...shared}
          rows={3}
          placeholder={placeholder}
        />
      ) : (
        <input
          {...shared}
          type={type}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

function ActionIcon({
  label,
  icon: Icon,
  onClick,
  color = "slate",
  disabled = false,
}) {
  const colors = {
    slate: "text-slate-600 hover:bg-slate-100",
    blue: "text-blue-600 hover:bg-blue-50",
    green: "text-emerald-600 hover:bg-emerald-50",
    red: "text-red-600 hover:bg-red-50",
  };

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`${iconButton} ${colors[color]} disabled:opacity-50`}
    >
      <Icon size={16} />
    </button>
  );
}

function StatusBadge({ children, color = "blue" }) {
  const styles = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    slate: "bg-slate-100 text-slate-600 ring-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles[color]}`}
    >
      {children}
    </span>
  );
}

function EmptyState({ title, description, icon: Icon = FileText }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon size={23} />
      </div>

      <h3 className="text-sm font-semibold text-slate-800">
        {title}
      </h3>

      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function DocumentMaster() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [selectedCompanyData, setSelectedCompanyData] = useState(null);
  const [companyBanks, setCompanyBanks] = useState([]);
  const [staticData, setStaticData] = useState({});
  const [mode, setMode] = useState("");
  const [hasData, setHasData] = useState(false);

  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingMaster, setLoadingMaster] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [companySearch, setCompanySearch] = useState("");

  const navigate = useNavigate();

  const roleOptions = ["Director", "Proprietor", "Partner"];
  const yesNoOptions = ["Yes", "No"];

  const authorityOptions = [
    "District Industries Centre",
    "Joint Director of Industries",
  ];

  /* =======================================================
     DOCUMENT TYPES
  ======================================================= */

  const documentTypes = [
    "COVERING_LETTER",
    "APPENDIX_A",
    "APPENDIX_B",
    "APPENDIX_C",
    "AFFIDAVIT",
    "BANK_INTEREST_CERTIFICATE",
    "POWER_SUBSIDY",
    "INTEREST_SUBSIDY",
    "ELP_FORM",
    "PRODUCTION_EXTRACT",
    "DISBURSEMENT_AGREEMENT",
  ];

  /* =======================================================
     DOCUMENT FIELD MAPPING
  ======================================================= */

  const documentFields = {
    BANK_INTEREST_CERTIFICATE: [
      "nameOfCompany",
      "factoryUnitAddress",
      "accountNumber",
      "loanSanctionAmount",
      "fromDate",
      "toDate",
    ],

    ELP_FORM: [
      "nameOfCompany",
      "registeredOfficeAddress",
      "factoryAddress",
      "productsManufactured",
      "yearOfIncorporation",
      "year",
      "place",
      "hrKnowsMarathi",
      "registeredUnderFactoriesAct",
      "authorizedSignatory",
      "authorizedSignatoryRole",
      "date",
      "currentTotalSupervisory",
      "currentTotalOther",
      "currentLocalSupervisory",
      "currentLocalOther",
      "previousTotalSupervisory",
      "previousTotalOther",
      "previousLocalSupervisory",
      "previousLocalOther",
      "declarationSupervisory",
      "declarationOther",
      "declarationTotal",
    ],

    PRODUCTION_EXTRACT: [
      "nameOfIndustry",
      "factoryAddress",
      "phone",
      "eligibleProductsAsPerEC",
      "startMonthYear",
      "constitution",
      "directorAddress",
      "productWithCapacity",
      "ssiRegistration",
      "fixedCapitalInvestment",
      "financeAgency",
      "bankName",
      "workingCapital",
      "registrations",
      "workers",
      "electricity",
      "waterRequirement",
      "place",
      "authorizedSignatory",
      "authorizedSignatoryRole",
    ],

    APPENDIX_A: [
      "nameOfCompany",
      "factoryAddress",
      "ecNumber",
      "ecDate",
      "techUpgradation",
      "qualityCertification",
      "cleanerProduction",
      "patentRegistration",
      "waterAudit",
      "energyAudit",
      "waterConservation",
      "energyEfficiency",
      "creditRating",
      "fciLand",
      "fciBuilding",
      "fciMachinery",
      "fciPreoperative",
      "fciCreditors",
      "place",
      "authorizedSignatory",
      "authorizedSignatoryRole",
    ],

    AFFIDAVIT: [
      "authorizedSignatory",
      "authorizedSignatoryRole",
      "nameOfCompany",
      "factoryAddress",
      "ecNumber",
      "ecDate",
      "effectiveDate",
      "selectedLoanBank",
      "bankName",
      "loanSanctionDate",
      "loanSanctionAmount",
      "loanDisbursedAmount",
      "msedclSanctionNumber",
      "sanctionedLoad",
      "place",
    ],

    APPENDIX_C: [
      "unitName",
      "factoryAddress",
      "factoryPhone",
      "factoryEmail",
      "officeAddress",
      "officePhone",
      "officeEmail",
      "bankDetails",
      "ecNumber",
      "ecDate",
      "periodOfClaim",
      "authorizedSignatory",
      "authorizedSignatoryRole",
      "place",
      "date",
      "interestDetails",
    ],

    DISBURSEMENT_AGREEMENT: [
      "nameOfCompany",
      "registeredOfficeAddress",
      "factoryAddress",
      "authorizedSignatory",
      "authorizedSignatoryRole",
      "ecNumber",
      "ecDate",
      "unitName",
      "officeAddress",
      "factoryUnitAddress",
      "representativeName",
    ],

    COVERING_LETTER: [
      "nameOfCompany",
      "registeredOfficeAddress",
      "authorityType",
      "psiYear",
      "financialYear",
      "ecNumber",
      "ecDate",
      "authorizedSignatory",
      "authorizedSignatoryRole",
    ],

    APPENDIX_B: [
      "nameOfCompany",
      "factoryAddress",
      "factoryPhone",
      "factoryEmail",
      "officeAddress",
      "officePhone",
      "officeEmail",
      "place",
      "date",
      "authorizedSignatory",
      "authorizedSignatoryRole",
      "ecNumber",
      "ecDate",
      "eligiblePeriod",
      "subsidyClaimed",
      "subsidyRate",
      "powerCompany",
      "consumerNumber",
      "connectionDate",
      "tariffRate",
    ],

    POWER_SUBSIDY: [
      "nameOfCompany",
      "factoryAddress",
      "place",
      "membershipNumber",
    ],

    INTEREST_SUBSIDY: [
      "nameOfCompany",
      "factoryAddress",
      "accountNumber",
      "place",
    ],
  };

  /* =======================================================
     FIELD HELPERS
  ======================================================= */

  const getLabel = (field) => {
    const labels = {
      hrKnowsMarathi:
        "The Head of HR / Recruitment Knows Marathi",

      registeredUnderFactoriesAct:
        "Whether Registered Under Factories Act?",

      productsManufactured: "Products Manufactured",

      factoryUnitAddress: "Factory Unit Address",

      ecNumber: "EC Number",

      ecDate: "EC Date",

      fciPreoperative: "FCI Pre-operative Expenses",

      fciCreditors: "FCI Creditors",

      psiYear: "PSI Year",

      selectedLoanBank: "Select Loan Bank",

      loanSanctionAmount: "Loan Sanction Amount",

      loanDisbursedAmount: "Loan Disbursed Amount",
    };

    return labels[field] || formatLabel(field);
  };

  const getFieldType = (field) => {
    if (field.toLowerCase().includes("email")) {
      return "email";
    }

    if (field.toLowerCase().includes("date")) {
      return "date";
    }

    if (field.toLowerCase().includes("phone")) {
      return "tel";
    }

    return "text";
  };

  const getDocumentLabel = (type) =>
    type
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");

  /* =======================================================
     FETCH COMPANIES
  ======================================================= */

  const fetchCompanies = useCallback(async () => {
    setLoadingCompanies(true);

    try {
      const res = await API.get("/companies");

      setCompanies(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Company Fetch Error:", error);

      setCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  /* =======================================================
     FETCH TERM LOAN BANKS
  ======================================================= */

  useEffect(() => {
    if (!selectedCompany) {
      setCompanyBanks([]);
      return;
    }

    let active = true;

    const fetchBanks = async () => {
      setLoadingBanks(true);

      try {
        const res = await API.get(
          `/banks/company/${selectedCompany}`,
        );

        if (active) {
          const banks = Array.isArray(res.data)
            ? res.data
            : [];

          setCompanyBanks(
            banks.filter(
              (bank) => bank.bankType === "TERM_LOAN",
            ),
          );
        }
      } catch (error) {
        console.error("Bank Fetch Error:", error);

        if (active) {
          setCompanyBanks([]);
        }
      } finally {
        if (active) {
          setLoadingBanks(false);
        }
      }
    };

    fetchBanks();

    return () => {
      active = false;
    };
  }, [selectedCompany]);

  /* =======================================================
     RESET FORM ON DOCUMENT TYPE CHANGE
  ======================================================= */

  useEffect(() => {
    if (!documentType) {
      setStaticData({});
      setHasData(false);
      setMode("");
      setSelectedCompanyData(null);
      setLoadError("");
      return;
    }

    const fields = documentFields[documentType] || [];
    const initial = {};

    fields.forEach((field) => {
      if (
        field === "bankDetails" ||
        field === "interestDetails"
      ) {
        initial[field] = [];
      } else if (field === "productsManufactured") {
        initial[field] = [""];
      } else {
        initial[field] = "";
      }
    });

    setStaticData(initial);
    setMode("");
    setHasData(false);
    setLoadError("");
  }, [documentType]);

  /* =======================================================
     LOAD DOCUMENT MASTER AND PREFILL COMPANY DATA
  ======================================================= */

  useEffect(() => {
    if (!selectedCompany || !documentType) {
      setLoadingMaster(false);
      return;
    }

    let active = true;

    const load = async () => {
      setLoadingMaster(true);
      setLoadError("");

      try {
        const [masterRes, companyRes, bankRes] =
          await Promise.all([
            API.get(
              `/document-master/${selectedCompany}/${documentType}`,
            ),
            API.get(`/companies/${selectedCompany}`),
            API.get(`/banks/company/${selectedCompany}`),
          ]);

        if (!active) return;

        const savedData = masterRes.data?.staticData || {};

        const data = { ...savedData };
        const company = companyRes.data;

        setSelectedCompanyData(company);

        const banks = Array.isArray(bankRes.data)
          ? bankRes.data
          : [];

        const loanBanks = banks.filter(
          (bank) => bank.bankType === "TERM_LOAN",
        );

        setCompanyBanks(loanBanks);

        /* COMPANY PREFILL */

        if (!data.nameOfCompany) {
          data.nameOfCompany = company.nameOfCompany || "";
        }

        if (!data.factoryUnitAddress) {
          data.factoryUnitAddress =
            company.factoryAddress || "";
        }

        /* APPENDIX C BANK PREFILL */

        if (
          documentType === "APPENDIX_C" &&
          (!data.bankDetails ||
            data.bankDetails.length === 0)
        ) {
          data.bankDetails = loanBanks.map((bank) => ({
            bankName: bank.bankName || "",
            loanAccountNumber: bank.accountNumber || "",
            loanSanctionDate:
              bank.sanctionDateFrom?.split("T")[0] || "",
            sanctionedAmount: bank.sanctionAmount || "",
            loanBalance: "",
          }));
        }

        /* AUTHORIZED SIGNATORY PREFILL */

        const defaultSignatory =
          company.authorizedSignatories?.find(
            (signatory) => signatory.isDefault,
          ) || company.authorizedSignatories?.[0];

        if (!data.authorizedSignatory) {
          data.authorizedSignatory =
            defaultSignatory?.name || "";
        }

        if (!data.authorizedSignatoryRole) {
          data.authorizedSignatoryRole =
            defaultSignatory?.role || "";
        }

        setStaticData(data);

        setHasData(
          Object.keys(masterRes.data?.staticData || {}).length > 0,
        );

        setMode("");
      } catch (error) {
        console.error("Document Master Load Error:", error);

        if (active) {
          setLoadError(
            error.response?.data?.msg ||
              "Unable to load document details. Please try again.",
          );

          setHasData(false);
        }
      } finally {
        if (active) {
          setLoadingMaster(false);
        }
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [selectedCompany, documentType]);

  /* =======================================================
     INPUT HANDLERS
  ======================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setStaticData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneChange = (e) => {
    const { name, value } = e.target;

    setStaticData((prev) => ({
      ...prev,
      [name]: value.replace(/\D/g, "").slice(0, 10),
    }));
  };

  const updateLoan = (index, field, value) => {
    setStaticData((prev) => {
      const rows = [...(prev.bankDetails || [])];

      rows[index] = {
        ...emptyLoan(),
        ...rows[index],
        [field]: value,
      };

      return {
        ...prev,
        bankDetails: rows,
      };
    });
  };

  const addLoan = () => {
    setStaticData((prev) => ({
      ...prev,
      bankDetails: [
        ...(prev.bankDetails || []),
        emptyLoan(),
      ],
    }));
  };

  const removeLoan = (index) => {
    setStaticData((prev) => ({
      ...prev,
      bankDetails: (prev.bankDetails || []).filter(
        (_, i) => i !== index,
      ),
    }));
  };

  const updateProducts = (index, value) => {
    setStaticData((prev) => {
      const products = [
        ...(prev.productsManufactured || [""]),
      ];

      products[index] = value;

      return {
        ...prev,
        productsManufactured: products,
      };
    });
  };

  const addProduct = () => {
    setStaticData((prev) => ({
      ...prev,
      productsManufactured: [
        ...(prev.productsManufactured || [""]),
        "",
      ],
    }));
  };

  const removeProduct = (index) => {
    setStaticData((prev) => {
      const products = [
        ...(prev.productsManufactured || []),
      ];

      products.splice(index, 1);

      return {
        ...prev,
        productsManufactured:
          products.length > 0 ? products : [""],
      };
    });
  };

  const handleSignatoryChange = (e) => {
    const selectedName = e.target.value;

    const signatory =
      selectedCompanyData?.authorizedSignatories?.find(
        (person) => person.name === selectedName,
      );

    setStaticData((prev) => ({
      ...prev,
      authorizedSignatory: selectedName,
      authorizedSignatoryRole: signatory?.role || "",
    }));
  };

  const handleLoanBankChange = (e) => {
    const bankId = e.target.value;

    const bank = companyBanks.find(
      (item) => item._id === bankId,
    );

    setStaticData((prev) => ({
      ...prev,
      selectedLoanBank: bankId,
      bankName: bank?.bankName || "",
      loanSanctionDate:
        bank?.sanctionDateFrom?.split("T")[0] || "",
      loanSanctionAmount: bank?.sanctionAmount || "",
      loanDisbursedAmount: bank?.sanctionAmount || "",
    }));
  };

  const handleAccountNumberChange = (e) => {
    const accountNumber = e.target.value;

    const bank = companyBanks.find(
      (item) => item.accountNumber === accountNumber,
    );

    setStaticData((prev) => ({
      ...prev,
      accountNumber,
      bankName: bank?.bankName || "",

      ...(documentType === "BANK_INTEREST_CERTIFICATE"
        ? {
            loanSanctionAmount: bank?.sanctionAmount || "",
            fromDate:
              bank?.sanctionDateFrom?.split("T")[0] || "",
            toDate:
              bank?.sanctionDateTo?.split("T")[0] || "",
          }
        : {}),
    }));
  };

  /* =======================================================
     SAVE DOCUMENT MASTER
  ======================================================= */

  const handleSave = async () => {
    if (!selectedCompany || !documentType) {
      alert("Select company and document type.");
      return;
    }

    if (saving) return;

    setSaving(true);

    try {
      await API.post("/document-master/save-master", {
        companyId: selectedCompany,
        documentType,
        staticData,
      });

      alert("Document Master saved successfully.");

      setHasData(true);
      setMode("view");
    } catch (error) {
      console.error("Document Master Save Error:", error);

      alert(
        error.response?.data?.msg ||
          "Error saving Document Master.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     DOCUMENT FIELD RENDERER
  ======================================================= */

  const renderField = (field) => {
    const value = staticData[field] ?? "";

    /* APPENDIX C BANK TABLE */

    if (field === "bankDetails") {
      const loans = staticData.bankDetails || [];

      return (
        <div
          key={field}
          className="col-span-full"
        >
          <SectionCard
            title="Loan Details"
            description="Manage the company's term loan accounts and sanction information."
            icon={Landmark}
          >
            {loans.length === 0 ? (
              <EmptyState
                icon={Landmark}
                title="No loan entries"
                description="Add a loan entry or load the company's existing term loan details."
              />
            ) : (
              <div className="overflow-x-auto rounded-md border border-slate-200">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2.5 font-semibold">
                        Bank / PFI
                      </th>

                      <th className="px-3 py-2.5 font-semibold">
                        Loan Account No.
                      </th>

                      <th className="px-3 py-2.5 font-semibold">
                        Sanction Date
                      </th>

                      <th className="px-3 py-2.5 font-semibold">
                        Sanction Amount
                      </th>

                      <th className="px-3 py-2.5 text-center font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {loans.map((loan, index) => (
                      <tr
                        key={index}
                        className="hover:bg-slate-50/70"
                      >
                        <td className="p-2">
                          <input
                            aria-label={`Bank name ${index + 1}`}
                            value={loan.bankName || ""}
                            onChange={(e) =>
                              updateLoan(
                                index,
                                "bankName",
                                e.target.value,
                              )
                            }
                            className={inputClass}
                          />
                        </td>

                        <td className="p-2">
                          <input
                            aria-label={`Loan account number ${index + 1}`}
                            value={loan.loanAccountNumber || ""}
                            onChange={(e) =>
                              updateLoan(
                                index,
                                "loanAccountNumber",
                                e.target.value,
                              )
                            }
                            className={inputClass}
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="date"
                            aria-label={`Sanction date ${index + 1}`}
                            value={
                              loan.loanSanctionDate
                                ? loan.loanSanctionDate.split("T")[0]
                                : ""
                            }
                            onChange={(e) =>
                              updateLoan(
                                index,
                                "loanSanctionDate",
                                e.target.value,
                              )
                            }
                            className={inputClass}
                          />
                        </td>

                        <td className="p-2">
                          <input
                            type="number"
                            aria-label={`Sanction amount ${index + 1}`}
                            value={loan.sanctionedAmount ?? ""}
                            onChange={(e) =>
                              updateLoan(
                                index,
                                "sanctionedAmount",
                                e.target.value,
                              )
                            }
                            className={inputClass}
                          />
                        </td>

                        <td className="p-2 text-center">
                          <ActionIcon
                            label="Remove loan"
                            icon={Trash2}
                            color="red"
                            onClick={() => removeLoan(index)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <button
              type="button"
              onClick={addLoan}
              className={`${secondaryButton} mt-3`}
            >
              <Plus size={15} />
              Add Loan
            </button>
          </SectionCard>
        </div>
      );
    }

    /* AUTHORITY DROPDOWN */

    if (field === "authorityType") {
      return (
        <Field
          key={field}
          field={field}
          label={getLabel(field)}
          value={value}
          onChange={handleChange}
          options={authorityOptions}
        />
      );
    }

    /* PSI YEAR */

    if (field === "psiYear") {
      return (
        <Field
          key={field}
          field={field}
          label={getLabel(field)}
          value={value}
          onChange={handleChange}
          options={["2013", "2019"]}
        />
      );
    }

    /* SUBSIDY RATE */

    if (field === "subsidyRate") {
      return (
        <Field
          key={field}
          field={field}
          label={getLabel(field)}
          value={value}
          onChange={handleChange}
          options={["1", "2"]}
        />
      );
    }

    /* SELECTED LOAN BANK */

    if (field === "selectedLoanBank") {
      return (
        <div key={field}>
          <Field
            field={field}
            label={getLabel(field)}
            value={value}
            onChange={handleLoanBankChange}
            options={companyBanks.map((bank) => ({
              value: bank._id,
              label: `${bank.bankName} - ${bank.accountNumber}`,
            }))}
          />

          {loadingBanks && (
            <p className="mt-1 text-xs text-slate-500">
              Loading term loan accounts...
            </p>
          )}
        </div>
      );
    }

    /* BANK ACCOUNT NUMBER */

    if (field === "accountNumber") {
      return (
        <div key={field}>
          <Field
            field={field}
            label={getLabel(field)}
            value={value}
            onChange={handleAccountNumberChange}
            options={companyBanks.map((bank) => ({
              value: bank.accountNumber,
              label: `${bank.accountNumber} - ${bank.bankName}`,
            }))}
          />

          {loadingBanks && (
            <p className="mt-1 text-xs text-slate-500">
              Loading term loan accounts...
            </p>
          )}
        </div>
      );
    }

    /* AUTHORIZED SIGNATORY */

    if (field === "authorizedSignatory") {
      return (
        <div key={field}>
          <Field
            field={field}
            label={getLabel(field)}
            value={value}
            onChange={handleSignatoryChange}
            options={(
              selectedCompanyData?.authorizedSignatories || []
            ).map((person) => ({
              value: person.name,
              label: person.name,
            }))}
          />
        </div>
      );
    }

    /* SIGNATORY ROLE */

    if (field === "authorizedSignatoryRole") {
      return (
        <Field
          key={field}
          field={field}
          label={getLabel(field)}
          value={value}
          readOnly
          hint="Automatically populated from the selected signatory."
        />
      );
    }

    /* YES / NO */

    if (
      field === "hrKnowsMarathi" ||
      field === "registeredUnderFactoriesAct"
    ) {
      return (
        <Field
          key={field}
          field={field}
          label={getLabel(field)}
          value={value}
          onChange={handleChange}
          options={yesNoOptions}
        />
      );
    }

    /* PRODUCTS MANUFACTURED */

    if (field === "productsManufactured") {
      const products =
        staticData.productsManufactured || [""];

      return (
        <div
          key={field}
          className="col-span-full"
        >
          <label className={labelClass}>
            {getLabel(field)}
          </label>

          <div className="space-y-2">
            {products.map((product, index) => (
              <div
                key={index}
                className="flex items-center gap-2"
              >
                <input
                  value={product}
                  onChange={(e) =>
                    updateProducts(index, e.target.value)
                  }
                  aria-label={`Product ${index + 1}`}
                  className={inputClass}
                  placeholder={`Product ${index + 1}`}
                />

                <ActionIcon
                  label="Remove product"
                  icon={X}
                  color="red"
                  onClick={() => removeProduct(index)}
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addProduct}
            className={`${secondaryButton} mt-2`}
          >
            <Plus size={14} />
            Add Product
          </button>
        </div>
      );
    }

    /* DEFAULT FIELD */

    return (
      <Field
        key={field}
        field={field}
        label={getLabel(field)}
        type={getFieldType(field)}
        value={value}
        onChange={
          getFieldType(field) === "tel"
            ? handlePhoneChange
            : handleChange
        }
      />
    );
  };

  /* =======================================================
     FILTERED COMPANIES
  ======================================================= */

  const filteredCompanies = companies.filter((company) =>
    String(company.nameOfCompany || "")
      .toLowerCase()
      .includes(companySearch.trim().toLowerCase()),
  );

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="min-h-full ">
      <div className="mx-auto max-w-[1500px]">
        <PageHeader
          title="Document Master"
          description="Manage company-specific information used for document generation."
          icon={FileText}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={secondaryButton}
          >
            <ArrowLeft size={15} />
            Back
          </button>
        </PageHeader>

        {/* =================================================
            SELECTION PANEL
        ================================================= */}

        <SectionCard
          title="Document Configuration"
          description="Select a company and document type to continue."
          icon={ClipboardList}
          className="mb-4"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* COMPANY SELECTOR */}

            <div>
              <label
                htmlFor="company-select"
                className={labelClass}
              >
                Company
              </label>

              <div className="relative">
                <Building2
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  id="company-select"
                  value={selectedCompany}
                  onChange={(e) => {
                    setSelectedCompany(e.target.value);
                    setMode("");
                  }}
                  className={`${inputClass} pl-9`}
                >
                  <option value="">Select Company</option>

                  {filteredCompanies.map((company) => (
                    <option
                      key={company._id}
                      value={company._id}
                    >
                      {company.nameOfCompany}
                    </option>
                  ))}
                </select>
              </div>

              {loadingCompanies && (
                <p className="mt-1.5 text-xs text-slate-500">
                  Loading companies...
                </p>
              )}
            </div>

            {/* DOCUMENT TYPE SELECTOR */}

            <div>
              <label
                htmlFor="document-type-select"
                className={labelClass}
              >
                Document Type
              </label>

              <div className="relative">
                <FileText
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  id="document-type-select"
                  value={documentType}
                  onChange={(e) => {
                    setDocumentType(e.target.value);
                    setMode("");
                  }}
                  className={`${inputClass} pl-9`}
                >
                  <option value="">Select Document</option>

                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {getDocumentLabel(type)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SELECTED CONTEXT */}

          {selectedCompany && documentType && (
            <div className="mt-4 flex flex-col gap-3 rounded-md border border-blue-100 bg-blue-50/50 p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-blue-600 ring-1 ring-blue-100">
                  <FileCheck size={18} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {companies.find(
                      (company) =>
                        company._id === selectedCompany,
                    )?.nameOfCompany || "Selected company"}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    {getDocumentLabel(documentType)}
                  </p>
                </div>
              </div>

              {loadingMaster ? (
                <StatusBadge color="blue">
                  <span className="inline-flex items-center gap-1.5">
                    <RefreshCw
                      size={12}
                      className="animate-spin"
                    />
                    Loading data
                  </span>
                </StatusBadge>
              ) : hasData ? (
                <StatusBadge color="green">
                  <CheckCircle2
                    size={12}
                    className="mr-1 inline"
                  />
                  Saved data available
                </StatusBadge>
              ) : (
                <StatusBadge color="amber">
                  New document data
                </StatusBadge>
              )}
            </div>
          )}
        </SectionCard>

        {/* =================================================
            LOADING / ERROR / EMPTY STATES
        ================================================= */}

        {loadError && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div className="flex-1">
              <p className="font-semibold">
                Unable to load document data
              </p>

              <p className="mt-1">{loadError}</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setDocumentType((current) => {
                  if (!current) return current;

                  return current;
                });

                window.location.reload();
              }}
              className="text-xs font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {(!selectedCompany || !documentType) && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white">
            <EmptyState
              icon={ClipboardList}
              title="Configure your document"
              description="Choose a company and document type above to view, add or update document master information."
            />
          </div>
        )}

        {/* =================================================
            DOCUMENT ACTIONS
        ================================================= */}

        {selectedCompany &&
          documentType &&
          !loadingMaster && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {!hasData ? (
                <button
                  type="button"
                  onClick={() => setMode("add")}
                  className={primaryButton}
                >
                  <Plus size={16} />
                  Add Details
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setMode("view")}
                    className={
                      mode === "view"
                        ? primaryButton
                        : secondaryButton
                    }
                  >
                    <Eye size={16} />
                    View Details
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("edit")}
                    className={
                      mode === "edit"
                        ? primaryButton
                        : secondaryButton
                    }
                  >
                    <Pencil size={15} />
                    Update Details
                  </button>
                </>
              )}

              {mode && (
                <button
                  type="button"
                  onClick={() => setMode("")}
                  className={secondaryButton}
                >
                  <X size={15} />
                  Close
                </button>
              )}
            </div>
          )}

        {/* =================================================
            ADD / EDIT FORM
        ================================================= */}

        {(mode === "add" || mode === "edit") &&
          documentType &&
          selectedCompany && (
            <div className="space-y-4">
              <SectionCard
                title={
                  mode === "edit"
                    ? "Update Document Information"
                    : "Document Information"
                }
                description="Complete the fields below. Company and bank-related fields may be prefilled automatically."
                icon={mode === "edit" ? Pencil : FileText}
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {(documentFields[documentType] || []).map(
                    (field) => renderField(field),
                  )}
                </div>

                {(
                  documentFields[documentType] || []
                ).length === 0 && (
                  <p className="text-sm text-slate-500">
                    No fields are configured for this document type.
                  </p>
                )}
              </SectionCard>

              <div className="sticky bottom-0 z-10 -mx-3 flex flex-col-reverse gap-2 border-t border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:-mx-5 sm:flex-row sm:justify-end sm:px-5 lg:-mx-6 lg:px-6">
                <button
                  type="button"
                  onClick={() => setMode("")}
                  className={secondaryButton}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className={primaryButton}
                >
                  {saving ? (
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={16} />
                  )}

                  {saving
                    ? "Saving..."
                    : "Save Document Master"}
                </button>
              </div>
            </div>
          )}

        {/* =================================================
            VIEW DETAILS
        ================================================= */}

        {mode === "view" &&
          selectedCompany &&
          documentType && (
            <div className="space-y-4">
              <SectionCard
                title="Saved Document Details"
                description={`${getDocumentLabel(documentType)} — saved company-specific information.`}
                icon={Eye}
              >
                {Object.keys(staticData).length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No document fields found"
                    description="There is no saved information to display."
                  />
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {Object.entries(staticData).map(
                      ([key, value]) => {
                        /* ARRAY VALUES */

                        if (Array.isArray(value)) {
                          return (
                            <div
                              key={key}
                              className="min-w-0 rounded-md border border-slate-200 bg-white p-3"
                            >
                              <p className="mb-2 text-xs font-semibold text-slate-500">
                                {getLabel(key)}
                              </p>

                              {value.length === 0 ? (
                                <p className="text-sm text-slate-400">
                                  -
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {value.map((item, index) => (
                                    <div
                                      key={index}
                                      className="rounded-md border border-slate-100 bg-slate-50 p-2.5"
                                    >
                                      {typeof item === "object" &&
                                      item !== null ? (
                                        <div className="space-y-2">
                                          {Object.entries(item).map(
                                            ([itemKey, itemValue]) => (
                                              <div
                                                key={itemKey}
                                                className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-2"
                                              >
                                                <p className="text-xs text-slate-500">
                                                  {formatLabel(itemKey)}
                                                </p>

                                                <p className="break-words text-right text-xs font-medium text-slate-800">
                                                  {formatValue(itemValue)}
                                                </p>
                                              </div>
                                            ),
                                          )}
                                        </div>
                                      ) : (
                                        <p className="break-words text-sm text-slate-700">
                                          {formatValue(item)}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        }

                        /* OBJECT VALUES */

                        if (
                          typeof value === "object" &&
                          value !== null
                        ) {
                          return (
                            <div
                              key={key}
                              className="min-w-0 rounded-md border border-slate-200 p-3"
                            >
                              <p className="mb-2 text-xs font-semibold text-slate-500">
                                {getLabel(key)}
                              </p>

                              <div className="space-y-2">
                                {Object.entries(value).map(
                                  ([itemKey, itemValue]) => (
                                    <div
                                      key={itemKey}
                                      className="grid grid-cols-2 gap-2"
                                    >
                                      <span className="text-xs text-slate-500">
                                        {formatLabel(itemKey)}
                                      </span>

                                      <span className="break-words text-right text-sm font-medium text-slate-800">
                                        {formatValue(itemValue)}
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          );
                        }

                        /* NORMAL VALUES */

                        return (
                          <div
                            key={key}
                            className="min-w-0 rounded-md border border-slate-200 p-3 transition hover:border-slate-300"
                          >
                            <p className="text-xs font-medium text-slate-500">
                              {getLabel(key)}
                            </p>

                            <p className="mt-1.5 break-words text-sm font-semibold text-slate-800">
                              {formatValue(value)}
                            </p>
                          </div>
                        );
                      },
                    )}
                  </div>
                )}
              </SectionCard>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setMode("edit")}
                  className={primaryButton}
                >
                  <Pencil size={15} />
                  Update Details
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

