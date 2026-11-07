import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Building2, CalendarDays, Sparkles, RefreshCw, Save, CheckCircle2 } from "lucide-react";

import API from "../../services/api";
import DocumentFormFooter from "../../components/DocumentFormFooter";

export default function CoveringLetterForm({
  editMode = false,
  documentId = null,
  existingDocument = null,
}) {
  const { companyId } = useParams();
  const navigate = useNavigate();

  // ================= STATIC =================

  const [nameOfCompany, setNameOfCompany] = useState("");
  const [registeredOfficeAddress, setRegisteredOfficeAddress] = useState("");
  const [authorityType, setAuthorityType] = useState("");

  // ✅ AUTHORIZED SIGNATORY
  const [authorizedSignatories, setAuthorizedSignatories] = useState([]);

  const [authorizedSignatory, setAuthorizedSignatory] = useState("");

  const [authorizedSignatoryRole, setAuthorizedSignatoryRole] = useState("");

  const [financialYear, setFinancialYear] = useState("");

  // ✅ PSI YEAR
  const [psiYear, setPsiYear] = useState("");

  const psiOptions = ["2013", "2019"];

  // ================= DYNAMIC =================

  const [dateOfLetter, setDateOfLetter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(false);

  // ================= LOAD MASTER =================
  useEffect(() => {
    const loadMasterData = async () => {
      if (!companyId) return;

      try {
        // ================= DOCUMENT MASTER =================

        const res = await API.get(
          `/document-master/${companyId}/COVERING_LETTER`,
        );

        // ================= COMPANY =================

        const companyRes = await API.get("/companies");

        const company = companyRes.data.find((c) => c._id === companyId);

        if (company?.authorizedSignatories) {
          setAuthorizedSignatories(company.authorizedSignatories);
        }

        // ================= STATIC DATA =================

        if (res.data?.staticData) {
          const s = res.data.staticData;

          setNameOfCompany(s.nameOfCompany || "");

          setRegisteredOfficeAddress(s.registeredOfficeAddress || "");

          setAuthorityType(s.authorityType || "");

          // ✅ IMPORTANT FIX
          // First take document master saved value
          // then fallback to company default

          // ✅ LOAD ONLY FROM DOCUMENT MASTER

          // ✅ LOAD ONLY FROM DOCUMENT MASTER

          const savedSignatory = s.authorizedSignatory || s.directorName || "";

          setAuthorizedSignatory(savedSignatory.trim());

          setAuthorizedSignatoryRole(
            s.authorizedSignatoryRole || s.directorRole || "",
          );

          setPsiYear(s.psiYear || "");

          setFinancialYear(s.financialYear || "");
        }
      } catch (error) {
        console.log("Master Load Error:", error);
      }
    };

    loadMasterData();
  }, [companyId]);

  useEffect(() => {
  if (!editMode || !existingDocument) return;

  const m = existingDocument.metadata || {};

  setNameOfCompany(
    m.nameOfCompany || ""
  );

  setRegisteredOfficeAddress(
    m.registeredOfficeAddress || ""
  );

  setAuthorityType(
    m.authorityType || ""
  );

  setAuthorizedSignatory(
    m.authorizedSignatory || ""
  );

  setAuthorizedSignatoryRole(
    m.authorizedSignatoryRole || ""
  );

  setPsiYear(
    m.psiYear || ""
  );

  setFinancialYear(
    m.financialYear || ""
  );

  setDateOfLetter(
    m.dateOfLetter || ""
  );

  setFromDate(
    m.fromDate || ""
  );

  setToDate(
    m.toDate || ""
  );
}, [editMode, existingDocument]);

  // ================= HANDLE SIGNATORY CHANGE =================

  const handleSignatoryChange = (value) => {
    setAuthorizedSignatory(value);

    const selected = authorizedSignatories.find((s) => s.name === value);

    if (selected) {
      setAuthorizedSignatoryRole(selected.role || "");
    }
  };

  // ================= GENERATE WORD =================

  const handleGenerate = async () => {
    try {
      setLoading(true);

      const payload = {
        nameOfCompany,
        registeredOfficeAddress,
        authorityType,

        authorizedSignatory,
        authorizedSignatoryRole,

        psiYear,
        financialYear,

        dateOfLetter,
        fromDate,
        toDate,
      };

      const apiUrl = `/documents/generate-from-master/${companyId}/COVERING_LETTER`;

      let res;

if (editMode) {
  res = await API.put(
    `/documents/edit-generated-document/${documentId}`,
    payload,
    {
      responseType: "blob",
    }
  );
} else {
  res = await API.post(
    apiUrl,
    payload,
    {
      responseType: "blob",
    }
  );
}

      const url = window.URL.createObjectURL(new Blob([res.data]));

      const link = document.createElement("a");

      link.href = url;

      link.setAttribute("download", "CoveringLetter.docx");

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log(err);

      alert("Error generating document");
    } finally {
      setLoading(false);
    }
  };
  // ================= UI =================

  return (
    <div className="document-form-theme min-h-full bg-slate-50/80 p-3 sm:p-4 lg:p-5">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-600/20">
              <FileText size={19} />
            </div>
            <div className="min-w-0">
              <div className="mb-0.5 flex items-center gap-2">
                <h1 className="truncate text-xl font-bold tracking-tight text-slate-900">Covering Letter</h1>
                <span className="hidden rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 sm:inline-flex">
                  {editMode ? "EDIT MODE" : "DOCUMENT FORM"}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {editMode ? "Review and update the covering letter details." : "Enter company information and letter dates to generate the document."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/generate")}
            className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:self-auto"
          >
            <ArrowLeft size={15} /> Back to Documents
          </button>
        </header>

        <div className="flex items-center gap-2 rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2.5">
          <CheckCircle2 size={16} className="shrink-0 text-blue-600" />
          <p className="text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Before generating:</span>{" "}
            Review company details and confirm the letter dates.
          </p>
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-blue-50/80 to-white px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700"><Building2 size={17} /></div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Company &amp; Static Details</h2>
              <p className="mt-0.5 text-[11px] text-slate-500">Information saved in Document Master.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <InputField label="Company Name" value={nameOfCompany} setValue={setNameOfCompany} />
            <InputField label="Registered Office Address" value={registeredOfficeAddress} setValue={setRegisteredOfficeAddress} />
            <InputField label="Authority Type" value={authorityType} setValue={setAuthorityType} />
            <SelectField label="PSI Year" value={psiYear} setValue={setPsiYear} options={psiOptions.map((year) => ({ value: year, label: year }))} placeholder="Select PSI year" />
            <InputField label="Financial Year" value={financialYear} setValue={setFinancialYear} />
            <SelectField label="Authorized Signatory" value={authorizedSignatory} setValue={handleSignatoryChange} options={authorizedSignatories.map((signatory) => ({ value: signatory.name?.trim() || "", label: signatory.name || "" }))} placeholder="Select signatory" />
            <InputField label="Authorized Signatory Role" value={authorizedSignatoryRole} setValue={setAuthorizedSignatoryRole} />
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-violet-50/80 to-white px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700"><CalendarDays size={17} /></div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Letter Details</h2>
              <p className="mt-0.5 text-[11px] text-slate-500">Dates used in the generated covering letter.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <DateField label="Date of Letter" value={dateOfLetter} setValue={setDateOfLetter} />
            <DateField label="From Date" value={fromDate} setValue={setFromDate} />
            <DateField label="To Date" value={toDate} setValue={setToDate} />
          </div>
        </section>

        <DocumentFormFooter
          documentName="Covering Letter"
          onCancel={() => navigate("/generate")}
          onGenerate={handleGenerate}
          loading={loading}
          editMode={editMode}
          cancelDisabled={loading}
        />
      </div>
    </div>
  );
}

// ================= COMPACT FIELD COMPONENTS =================

function InputField({ label, value, setValue }) {
  return (
    <div className="min-w-0">
      <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      />
    </div>
  );
}

function SelectField({ label, value, setValue, options, placeholder = "Select" }) {
  return (
    <div className="min-w-0">
      <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
}

function DateField({ label, value, setValue }) {
  return (
    <div className="min-w-0">
      <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
      <input
        type="date"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
      />
    </div>
  );
}
