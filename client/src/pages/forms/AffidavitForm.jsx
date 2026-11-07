import { useState, useEffect } from "react";
import API from "../../services/api";
import DocumentFormFooter from "../../components/DocumentFormFooter";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Building2,
  Zap,
  CalendarDays,
  Sparkles,
  LoaderCircle,
  Save,
  CheckCircle2,
} from "lucide-react";

export default function AffidavitForm({
  editMode = false,
  documentId = null,
  existingDocument = null,
}) {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const clientId =
    searchParams.get("clientId") || localStorage.getItem("clientId") || "";

  console.log("AFFIDAVIT CLIENT ID:", clientId);

  // ================= COMPANY =================

  const [selectedCompanyData, setSelectedCompanyData] = useState(null);

  // ================= STATIC =================

  const [directorName, setDirectorName] = useState("");
  const [directorRole, setDirectorRole] = useState("");

  const [nameOfCompany, setNameOfCompany] = useState("");

  const [factoryAddress, setFactoryAddress] = useState("");

  const [ecNumber, setEcNumber] = useState("");
  const [ecDate, setEcDate] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");

  const [bankName, setBankName] = useState("");
  const [loanSanctionDate, setLoanSanctionDate] = useState("");
  const [loanSanctionAmount, setLoanSanctionAmount] = useState("");
  const [loanDisbursedAmount, setLoanDisbursedAmount] = useState("");

  const [msedclSanctionNumber, setMsedclSanctionNumber] = useState("");

  const [sanctionedLoad, setSanctionedLoad] = useState("");

  const [place, setPlace] = useState("");

  // ================= DYNAMIC =================

  const [interestAmountPaid, setInterestAmountPaid] = useState("");

  const [interestPeriodFrom, setInterestPeriodFrom] = useState("");

  const [interestPeriodTo, setInterestPeriodTo] = useState("");

  const [roi, setRoi] = useState("");

  const [claimPeriodFrom, setClaimPeriodFrom] = useState("");

  const [claimPeriodTo, setClaimPeriodTo] = useState("");

  const [unitsConsumed, setUnitsConsumed] = useState("");

  const [electricityPeriodFrom, setElectricityPeriodFrom] = useState("");

  const [electricityPeriodTo, setElectricityPeriodTo] = useState("");

  const [totalElectricityChargesPaid, setTotalElectricityChargesPaid] =
    useState("");

  const [date, setDate] = useState("");

  const [loading, setLoading] = useState(false);

  // ================= LOAD MASTER =================

  useEffect(() => {
    const loadMasterData = async () => {
      if (!companyId) return;

      try {
        // ================= DOCUMENT MASTER =================

        const res = await API.get(`/document-master/${companyId}/AFFIDAVIT`);

        // ================= COMPANY =================

        const companyRes = await API.get(`/companies/${companyId}`);

        const companyData = companyRes.data;

        setSelectedCompanyData(companyData);

        // ================= DEFAULT SIGNATORY =================

        const defaultSignatory =
          companyData?.authorizedSignatories?.find((s) => s.isDefault) ||
          companyData?.authorizedSignatories?.[0];

        // ================= MASTER DATA =================

        const s = res.data?.staticData || {};

        console.log("MASTER DATA:", s);

        // =====================================================
        // IMPORTANT FIX
        // DOCUMENT MASTER SAVES:
        // authorizedSignatory
        // authorizedSignatoryRole
        //
        // AFFIDAVIT FORM NEEDS:
        // directorName
        // directorRole
        // =====================================================

        setDirectorName(
          s.authorizedSignatory ||
            s.directorName ||
            defaultSignatory?.name ||
            "",
        );

        setDirectorRole(
          s.authorizedSignatoryRole ||
            s.directorRole ||
            defaultSignatory?.role ||
            "",
        );

        // ================= OTHER FIELDS =================

        setNameOfCompany(s.nameOfCompany || "");

        setFactoryAddress(s.factoryAddress || "");

        setEcNumber(s.ecNumber || "");

        setEcDate(s.ecDate || "");

        setEffectiveDate(s.effectiveDate || "");

        setBankName(s.bankName || "");

        setLoanSanctionDate(s.loanSanctionDate || "");

        setLoanSanctionAmount(s.loanSanctionAmount || "");

        setLoanDisbursedAmount(s.loanDisbursedAmount || "");

        setMsedclSanctionNumber(s.msedclSanctionNumber || "");

        setSanctionedLoad(s.sanctionedLoad || "");

        setPlace(s.place || "");
      } catch (error) {
        console.log("Master Load Error:", error);
      }
    };

    loadMasterData();
  }, [companyId]);

  useEffect(() => {
  if (!editMode || !existingDocument) return;

  const m = existingDocument.metadata || {};

  setDirectorName(m.directorName || "");
  setDirectorRole(m.directorRole || "");

  setNameOfCompany(m.nameOfCompany || "");

  setFactoryAddress(m.factoryAddress || "");

  setEcNumber(m.ecNumber || "");
  setEcDate(m.ecDate || "");
  setEffectiveDate(m.effectiveDate || "");

  setBankName(m.bankName || "");

  setLoanSanctionDate(m.loanSanctionDate || "");
  setLoanSanctionAmount(m.loanSanctionAmount || "");
  setLoanDisbursedAmount(m.loanDisbursedAmount || "");

  setMsedclSanctionNumber(
    m.msedclSanctionNumber || ""
  );

  setSanctionedLoad(
    m.sanctionedLoad || ""
  );

  setPlace(m.place || "");

  setInterestAmountPaid(
    m.interestAmountPaid || ""
  );

  setInterestPeriodFrom(
    m.interestPeriodFrom || ""
  );

  setInterestPeriodTo(
    m.interestPeriodTo || ""
  );

  setRoi(m.roi || "");

  setClaimPeriodFrom(
    m.claimPeriodFrom || ""
  );

  setClaimPeriodTo(
    m.claimPeriodTo || ""
  );

  setUnitsConsumed(
    m.unitsConsumed || ""
  );

  setElectricityPeriodFrom(
    m.electricityPeriodFrom || ""
  );

  setElectricityPeriodTo(
    m.electricityPeriodTo || ""
  );

  setTotalElectricityChargesPaid(
    m.totalElectricityChargesPaid || ""
  );

  setDate(m.date || "");
}, [editMode, existingDocument]);

  // ================= GENERATE =================

  const handleGenerateAffidavit = async () => {
    try {
      setLoading(true);

      const formData = {
        directorName,
        directorRole,
        nameOfCompany,
        factoryAddress,
        ecNumber,
        ecDate,
        effectiveDate,
        bankName,
        loanSanctionDate,
        loanSanctionAmount,
        loanDisbursedAmount,
        msedclSanctionNumber,
        sanctionedLoad,
        place,

        interestAmountPaid,
        interestPeriodFrom,
        interestPeriodTo,
        roi,
        claimPeriodFrom,
        claimPeriodTo,
        unitsConsumed,
        electricityPeriodFrom,
        electricityPeriodTo,
        totalElectricityChargesPaid,
        date,
      };

      let apiUrl = `/documents/generate-affidavit/${companyId}`;

      if (clientId && clientId !== "null" && clientId !== "undefined") {
        apiUrl += `?clientId=${clientId}`;
      }

     let response;

if (editMode) {
  response = await API.put(
    `/documents/edit-generated-document/${documentId}`,
    formData,
    {
      responseType: "blob",
    }
  );
} else {
  response = await API.post(
    apiUrl,
    formData,
    {
      responseType: "blob",
    }
  );
}

      const url = window.URL.createObjectURL(response.data);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Affidavit.docx");

      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.log("AFFIDAVIT ERROR:", error);
      alert("Failed to generate affidavit");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================

  return (
    <div className="document-form-theme min-h-screen bg-slate-50 px-3 py-4 sm:px-5 lg:px-7">
      <div className="mx-auto max-w-7xl space-y-4">
        {/* Page heading */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200">
              <FileText size={22} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
                  Affidavit Form
                </h1>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  editMode
                    ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                    : "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                }`}>
                  {editMode ? "Edit document" : "New document"}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Complete the company details and claim information to generate your affidavit.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/generate")}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 sm:self-auto"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        {/* Static details */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeading
            icon={<Building2 size={18} />}
            title="Static Details"
            subtitle="Company, authorization and sanction information"
            tone="blue"
            count="13 fields"
          />
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-4 sm:grid-cols-2 lg:grid-cols-3 lg:p-5">
            <div className="flex min-w-0 flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Authorized Signatory
              </label>
              <select
                value={directorName}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const signatory =
                    selectedCompanyData?.authorizedSignatories?.find(
                      (s) => s.name === selectedName,
                    );
                  setDirectorName(selectedName);
                  setDirectorRole(signatory?.role || "");
                }}
                className={fieldClass}
              >
                <option value="">Select signatory</option>
                {selectedCompanyData?.authorizedSignatories?.map((s, index) => (
                  <option key={index} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <InputField label="Authorized Signatory Role" value={directorRole} setValue={setDirectorRole} readOnly />
            <InputField label="Company Name" value={nameOfCompany} setValue={setNameOfCompany} />
            <InputField label="Factory Address" value={factoryAddress} setValue={setFactoryAddress} />
            <InputField label="EC Number" value={ecNumber} setValue={setEcNumber} />
            <DateField label="EC Date" value={ecDate} setValue={setEcDate} />
            <DateField label="Effective Date" value={effectiveDate} setValue={setEffectiveDate} />
            <InputField label="Bank Name" value={bankName} setValue={setBankName} />
            <DateField label="Loan Sanction Date" value={loanSanctionDate} setValue={setLoanSanctionDate} />
            <InputField label="Loan Sanction Amount" value={loanSanctionAmount} setValue={setLoanSanctionAmount} />
            <InputField label="Loan Disbursed Amount" value={loanDisbursedAmount} setValue={setLoanDisbursedAmount} />
            <InputField label="MSEDCL Sanction Number" value={msedclSanctionNumber} setValue={setMsedclSanctionNumber} />
            <InputField label="Sanctioned Load (KW)" value={sanctionedLoad} setValue={setSanctionedLoad} />
            <InputField label="Place" value={place} setValue={setPlace} />
          </div>
        </section>

        {/* Dynamic details */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeading
            icon={<Zap size={18} />}
            title="Dynamic Details"
            subtitle="Interest, claim period and electricity consumption"
            tone="violet"
            count="11 fields"
          />
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-4 sm:grid-cols-2 lg:grid-cols-3 lg:p-5">
            <InputField label="Interest Amount Paid" value={interestAmountPaid} setValue={setInterestAmountPaid} />
            <DateField label="Interest Period From" value={interestPeriodFrom} setValue={setInterestPeriodFrom} />
            <DateField label="Interest Period To" value={interestPeriodTo} setValue={setInterestPeriodTo} />
            <InputField label="ROI (%)" value={roi} setValue={setRoi} />
            <DateField label="Claim Period From" value={claimPeriodFrom} setValue={setClaimPeriodFrom} />
            <DateField label="Claim Period To" value={claimPeriodTo} setValue={setClaimPeriodTo} />
            <InputField label="Units Consumed" value={unitsConsumed} setValue={setUnitsConsumed} />
            <DateField label="Electricity Period From" value={electricityPeriodFrom} setValue={setElectricityPeriodFrom} />
            <DateField label="Electricity Period To" value={electricityPeriodTo} setValue={setElectricityPeriodTo} />
            <InputField label="Total Electricity Charges Paid" value={totalElectricityChargesPaid} setValue={setTotalElectricityChargesPaid} />
            <DateField label="Final Date" value={date} setValue={setDate} />
          </div>
        </section>

        <DocumentFormFooter
          documentName="Affidavit"
          onCancel={() => navigate("/generate")}
          onGenerate={handleGenerateAffidavit}
          loading={loading}
          editMode={editMode}
        />
      </div>
    </div>
  );
}

const fieldClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function SectionHeading({ icon, title, subtitle, tone, count }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
  };
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-800 sm:text-base">{title}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <span className="hidden shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 sm:inline-flex">
        {count}
      </span>
    </div>
  );
}

function InputField({ label, value, setValue, readOnly = false }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      <input
        type="text"
        value={value}
        readOnly={readOnly}
        onChange={(e) => setValue(e.target.value)}
        className={`${fieldClass} ${readOnly ? "cursor-not-allowed bg-slate-50 text-slate-500" : ""}`}
      />
    </div>
  );
}

function DateField({ label, value, setValue }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`${fieldClass} pr-3`}
        />
      </div>
    </div>
  );
}
