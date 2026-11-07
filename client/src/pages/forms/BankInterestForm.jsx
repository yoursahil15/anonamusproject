import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import DocumentFormFooter from "../../components/DocumentFormFooter";
import { ArrowLeft, Building2, CalendarDays, CheckCircle2, FileText, Plus, RefreshCw, Save, Trash2 } from "lucide-react";

export default function BankInterestForm({
  editMode = false,
  documentId = null,
  existingDocument = null,
}) {
  const params = useParams();
  const navigate = useNavigate();
  const companyId = params.companyId || existingDocument?.company?._id;

  // ================= STATIC FIELDS =================

  const [nameOfCompany, setNameOfCompany] = useState("");
  const [factoryAddress, setFactoryAddress] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [companyBanks, setCompanyBanks] = useState([]);

  // ================= DYNAMIC FIELDS =================

  const [loanSanctionAmount, setLoanSanctionAmount] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [loading, setLoading] = useState(false);

  // ================= TABLE =================

  const [rows, setRows] = useState([
    {
      typeOfLoan: "",
      periodFrom: "",
      periodTo: "",
      rate: "",
      date: "",
      amount: "",
      subsidyAmount: "",
    },
  ]);

  // ================= LOAD MASTER =================

  useEffect(() => {
    const loadMaster = async () => {
      try {
        // ================= DOCUMENT MASTER =================

        const res = await API.get(
          `/document-master/${companyId}/BANK_INTEREST_CERTIFICATE`,
        );

        // ================= COMPANY BANKS =================

        const bankRes = await API.get(`/banks/company/${companyId}`);

        const loanBanks = bankRes.data.filter(
          (b) => b.bankType === "TERM_LOAN",
        );

        setCompanyBanks(loanBanks);

        if (res.data?.staticData) {
          const s = res.data.staticData;

          // ✅ PREFILLED BUT EDITABLE

          setNameOfCompany(s.nameOfCompany || "");

          // ⚠️ YOUR MASTER SAVES factoryUnitAddress
          setFactoryAddress(s.factoryUnitAddress || "");

          setAccountNumber(s.accountNumber || "");

          setLoanSanctionAmount(s.loanSanctionAmount || "");

          setDateFrom(s.fromDate || "");

          setDateTo(s.toDate || "");
        }
      } catch (err) {
        console.error("❌ ERROR:", err);
      }
    };

    loadMaster();
  }, [companyId]);

  useEffect(() => {
    if (!editMode || !existingDocument) return;

    const m = existingDocument.metadata || {};

    setNameOfCompany(m.nameOfCompany || "");

    setFactoryAddress(m.factoryAddress || "");

    setAccountNumber(m.accountNumber || "");

    setLoanSanctionAmount(m.loanSanctionAmount || "");

    setDateFrom(m.dateFrom || "");

    setDateTo(m.dateTo || "");

    setRows(
      m.rows?.length
        ? m.rows
        : [
            {
              typeOfLoan: "",
              periodFrom: "",
              periodTo: "",
              rate: "",
              date: "",
              amount: "",
              subsidyAmount: "",
            },
          ],
    );
  }, [editMode, existingDocument]);
  // ================= TABLE FUNCTIONS =================

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];

    updated[index][field] = value;

    setRows(updated);
  };

  const addRow = () => {
    setRows([
      ...rows,
      {
        typeOfLoan: "",
        periodFrom: "",
        periodTo: "",
        rate: "",
        date: "",
        amount: "",
        subsidyAmount: "",
      },
    ]);
  };

  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  // ================= GENERATE =================

  // ================= GENERATE =================

  const handleGenerate = async () => {
    try {
      setLoading(true);

      if (!companyId) {
        alert("❌ Company ID is missing.");
        return;
      }

      const updatedRows = rows.map((row) => ({
        ...row,

        // ✅ INTEREST AMOUNT = (amount × 5) / rate
        subsidyAmount:
          row.amount && row.rate
            ? ((Number(row.amount) * 5) / Number(row.rate)).toFixed(2)
            : 0,
      }));

      const formData = {
        loanSanctionAmount,
        accountNumber,
        dateFrom,
        dateTo,
        rows: updatedRows,
      };

      console.log("📤 Sending Data:", formData);

      const documentType = encodeURIComponent("BANK_INTEREST_CERTIFICATE");

      let response;

      if (editMode) {
        response = await API.put(
          `/documents/edit-generated-document/${documentId}`,
          formData,
          {
            responseType: "blob",
          },
        );
      } else {
        response = await API.post(
          `/documents/generate-from-master/${companyId}/${documentType}`,
          formData,
          {
            responseType: "blob",
          },
        );
      }

      // ✅ DOWNLOAD FILE

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");

      link.href = url;

      link.setAttribute("download", "BankInterestCertificate.xlsx");

      document.body.appendChild(link);

      link.click();

      link.remove();

      alert("✅ Document generated successfully!");
    } catch (error) {
      console.error("Generate Error:", error.response?.data || error);

      alert(
        `❌ Failed to generate document: ${
          error.response?.data?.msg || error.message
        }`,
      );
    } finally {
      setLoading(false);
    }
  };
  // ================= UI =================

  return (
    <div className="document-form-theme min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <FileText size={22} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  Bank Interest Form
                </h1>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${editMode ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                  {editMode ? "Edit mode" : "New document"}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Enter loan details and prepare the bank interest certificate.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/generate")}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} /> Back to Documents
          </button>
        </header>

        <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-900">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-700" />
          <p>Company and bank information can be prefilled from your saved records. Review the details before generating the document.</p>
        </div>

        <Section title="Company & Loan Details" description="Review the company information and select the term-loan account." icon={<Building2 size={18} />}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <InputField label="Company Name" value={nameOfCompany} setValue={setNameOfCompany} />
            <InputField label="Factory Address" value={factoryAddress} setValue={setFactoryAddress} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">Account Number</label>
              <select
                value={accountNumber}
                onChange={(e) => {
                  const selectedAccount = e.target.value;
                  const selectedBank = companyBanks.find((b) => b.accountNumber === selectedAccount);
                  setAccountNumber(selectedAccount);
                  setLoanSanctionAmount(selectedBank?.sanctionAmount || "");
                  setDateFrom(selectedBank?.sanctionDateFrom?.split("T")[0] || "");
                  setDateTo(selectedBank?.sanctionDateTo?.split("T")[0] || "");
                }}
                className={inputClass}
              >
                <option value="">Select account</option>
                {companyBanks.map((bank) => (
                  <option key={bank._id} value={bank.accountNumber}>
                    {bank.accountNumber} — {bank.bankName}
                  </option>
                ))}
              </select>
            </div>
            <InputField label="Loan Sanction Amount" value={loanSanctionAmount} setValue={setLoanSanctionAmount} />
            <DateField label="Loan Period — From" value={dateFrom} setValue={setDateFrom} />
            <DateField label="Loan Period — To" value={dateTo} setValue={setDateTo} />
          </div>
        </Section>

        <Section title="Loan Interest Schedule" description="Add one entry for each loan-interest record. The interest amount is calculated using the existing formula." icon={<CalendarDays size={18} />}>
          <div className="space-y-4">
            {rows.map((row, index) => (
              <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Loan entry {index + 1}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">Loan type, period, rate and amount</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    disabled={rows.length === 1}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Remove loan entry ${index + 1}`}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <RowInput label="Type of Loan" value={row.typeOfLoan} onChange={(value) => handleRowChange(index, "typeOfLoan", value)} />
                  <RowInput label="Interest Rate (%)" value={row.rate} onChange={(value) => handleRowChange(index, "rate", value)} />
                  <DateRowInput label="Period From" value={row.periodFrom} onChange={(value) => handleRowChange(index, "periodFrom", value)} />
                  <DateRowInput label="Period To" value={row.periodTo} onChange={(value) => handleRowChange(index, "periodTo", value)} />
                  <DateRowInput label="Entry Date" value={row.date} onChange={(value) => handleRowChange(index, "date", value)} />
                  <RowInput label="Amount" type="number" value={row.amount} onChange={(value) => handleRowChange(index, "amount", value)} />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600">Interest Amount @ 5%</label>
                    <input
                      type="number"
                      value={row.amount && row.rate && Number(row.rate) !== 0 ? ((Number(row.amount) * 5) / Number(row.rate)).toFixed(2) : ""}
                      readOnly
                      className={`${inputClass} cursor-not-allowed bg-slate-100 font-semibold text-slate-700`}
                    />
                    <span className="text-[11px] text-slate-500">Automatically calculated</span>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
            >
              <Plus size={16} /> Add Loan Entry
            </button>
          </div>
        </Section>

        <DocumentFormFooter
          documentName="Bank Interest Certificate"
          onCancel={() => navigate("/generate")}
          onGenerate={handleGenerate}
          loading={loading}
          editMode={editMode}
        />
      </div>
    </div>
  );
}

// ================= SHARED FORM STYLES =================
const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

function Section({ title, description, icon, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
        <div className="mt-0.5 rounded-lg bg-emerald-50 p-2 text-emerald-700">{icon}</div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          {description && <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function InputField({ label, value, setValue, readOnly }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      <input type="text" value={value} readOnly={readOnly} onChange={(e) => setValue && setValue(e.target.value)} className={`${inputClass} ${readOnly ? "cursor-not-allowed bg-slate-100" : ""}`} />
    </div>
  );
}

function DateField({ label, value, setValue }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      <input type="date" value={value} onChange={(e) => setValue(e.target.value)} className={inputClass} />
    </div>
  );
}

function RowInput({ label, value, onChange, type = "text" }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </div>
  );
}

function DateRowInput({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      <input type="date" value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </div>
  );
}
