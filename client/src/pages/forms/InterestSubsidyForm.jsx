import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import API from "../../services/api";
import DocumentFormFooter from "../../components/DocumentFormFooter";
import { ArrowLeft, FileText, Building2, CalendarDays, Landmark, Sparkles, RefreshCw, Save, CheckCircle2, Plus, Trash2 } from "lucide-react";

export default function InterestSubsidyForm({
  editMode = false,
  documentId = null,
  existingDocument = null,
}) {
  const params = useParams();
  const navigate = useNavigate();
  const companyId = params.companyId || existingDocument?.company?._id;
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const clientId = queryParams.get("clientId");

  // ================= STATIC =================

  const [nameOfCompany, setNameOfCompany] = useState("");
  const [factoryAddress, setFactoryAddress] = useState("");
  const [companyBanks, setCompanyBanks] = useState([]);
  const [selectedAccountNo, setSelectedAccountNo] = useState("");
  const [loanTypeStatic, setLoanTypeStatic] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [bankName, setBankName] = useState("");
  const [place, setPlace] = useState("");

  // ================= BASIC =================

  const [certificateNo, setCertificateNo] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [interestAmountPaid, setInterestAmountPaid] = useState("");
  const [interestFromDate, setInterestFromDate] = useState("");
  const [interestToDate, setInterestToDate] = useState("");
  const [udin, setUdin] = useState("");
  const [dateOfUdin, setDateOfUdin] = useState("");
  const [authorizedSignatory, setAuthorizedSignatory] = useState("");
  const [authorizedSignatoryRole, setAuthorizedSignatoryRole] = useState("");
  const [authorizedSignatories, setAuthorizedSignatories] = useState([]);
  const [membershipNo, setMembershipNo] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= LOAD MASTER =================
  useEffect(() => {
    console.log("LOADED METADATA:", existingDocument?.metadata);
  }, [existingDocument]);

  useEffect(() => {
    if (editMode) return;

    const loadMasterData = async () => {
      if (!companyId) return;

      try {
        // ================= MASTER =================

        const res = await API.get(
          `/document-master/${companyId}/INTEREST_SUBSIDY`,
        );

        // ================= COMPANY =================

        const companyRes = await API.get(`/companies/${companyId}`);

        const company = companyRes.data;

        // ================= BANKS =================

        const bankRes = await API.get(`/banks/company/${companyId}`);

        const termBanks = bankRes.data.filter(
          (b) => b.bankType === "TERM_LOAN",
        );

        setCompanyBanks(termBanks);

        // ================= SIGNATORIES =================

        const signatories = company.authorizedSignatories || [];

        setAuthorizedSignatories(signatories);

        // ================= DEFAULT SIGNATORY =================

        const defaultSignatory =
          signatories.find((s) => s.isDefault) || signatories[0];

        // ================= STATIC DATA =================

        if (res.data?.staticData) {
          const s = res.data.staticData;

          setNameOfCompany(s.nameOfCompany || "");

          setFactoryAddress(s.factoryAddress || "");

          const savedAccountNo = s.accountNumber || "";

          setSelectedAccountNo(savedAccountNo);

          // Find matching bank from fetched banks
          const matchedBank = termBanks.find(
            (b) => b.accountNumber === savedAccountNo,
          );

          setBankName(matchedBank?.bankName || s.bankName || "");
          setPlace(s.place || "");

          // ================= AUTHORIZED SIGNATORY =================

          setAuthorizedSignatory(
            s.authorizedSignatory || defaultSignatory?.name || "",
          );

          setAuthorizedSignatoryRole(
            s.authorizedSignatoryRole || defaultSignatory?.role || "",
          );
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

    setNameOfCompany(m.nameOfCompany || "");

    setFactoryAddress(m.factoryAddress || "");

    setBankName(m.bankName || "");

    setLoanTypeStatic(m.loanTypeStatic || "");

    setAccountNo(m.accountNo || "");

    setPlace(m.place || "");

    setCertificateNo(m.certificateNo || "");

    setFromDate(m.fromDate || "");

    setToDate(m.toDate || "");

    setInterestAmountPaid(m.interestAmountPaid || "");

    setInterestFromDate(m.interestFromDate || "");

    setInterestToDate(m.interestToDate || "");

    setUdin(m.udin || "");

    setDateOfUdin(m.dateOfUdin || "");

    setAuthorizedSignatory(m.authorizedSignatory || "");

    setAuthorizedSignatoryRole(m.authorizedSignatoryRole || "");

    setMembershipNo(m.membershipNo || "");

    setLoanData(
      m.loanData?.length
        ? m.loanData
        : [
            {
              loanType: "",
              periodFrom: "",
              periodTo: "",
              rate: "",
              dueDate: "",
              dueAmount: "",
              paidDate: "",
              paidAmount: "",
            },
          ],
    );
  }, [editMode, existingDocument]);
  // ================= TABLE =================

  const [loanData, setLoanData] = useState([
    {
      loanType: "",
      periodFrom: "",
      periodTo: "",
      rate: "",
      dueDate: "",
      dueAmount: "",
      paidDate: "",
      paidAmount: "",
    },
  ]);

  const handleLoanChange = (index, field, value) => {
    const updated = [...loanData];
    updated[index][field] = value;
    setLoanData(updated);
  };

  const addRow = () => {
    setLoanData([
      ...loanData,
      {
        loanType: "",
        periodFrom: "",
        periodTo: "",
        rate: "",
        dueDate: "",
        dueAmount: "",
        paidDate: "",
        paidAmount: "",
      },
    ]);
  };

  const removeRow = (index) => {
    setLoanData(loanData.filter((_, i) => i !== index));
  };

  // ================= GENERATE =================

  const handleGenerateInterestDoc = async () => {
    try {
      setLoading(true);

      const filteredLoans = loanData.filter((row) =>
        Object.values(row).some((v) => v !== ""),
      );

      const formData = {
        nameOfCompany,
        factoryAddress,
        bankName,
        accountNumber: selectedAccountNo,
        place,
        certificateNo,
        fromDate,
        toDate,
        interestAmountPaid,
        interestFromDate,
        interestToDate,
        udin,
        dateOfUdin,
        authorizedSignatory,
        authorizedSignatoryRole,
        membershipNo,
        loanData: filteredLoans,
      };

      let apiUrl = `/documents/generate-interest-subsidy/${companyId}`;

      if (clientId) {
        apiUrl += `?clientId=${clientId}`;
      }

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
        response = await API.post(apiUrl, formData, {
          responseType: "blob",
        });
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      const nextVersion = (existingDocument?.version || 1) + 1;

      link.setAttribute(
        "download",
        editMode
          ? `InterestSubsidy_V${nextVersion}.docx`
          : "InterestSubsidy.docx",
      );

      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.log(error);
      alert("Failed to generate document");
    } finally {
      setLoading(false);
    }
  };

  const dateFields = ["periodFrom", "periodTo", "dueDate", "paidDate"];

  // ================= UI =================

  return (
    <div className="document-form-theme min-h-full bg-slate-50/80 p-3 sm:p-4 lg:p-5">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 text-white shadow-sm shadow-slate-900/10">
              <FileText size={19} />
            </div>
            <div className="min-w-0">
              <div className="mb-0.5 flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Interest Subsidy</h1>
                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                  {editMode ? "EDIT MODE" : "DOCUMENT FORM"}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {editMode ? "Review and update the interest subsidy details." : "Enter company, certificate and loan details to generate the document."}
              </p>
            </div>
          </div>
          <button type="button" onClick={() => navigate("/generate")} className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 sm:self-auto">
            <ArrowLeft size={15} /> Back to Documents
          </button>
        </header>

        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-white px-3 py-2.5">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-700" />
          <p className="text-xs text-slate-600"><span className="font-semibold text-slate-800">Before generating:</span> Review company details, certificate dates and loan entries.</p>
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-800"><Building2 size={17} /></div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Company &amp; Bank Details</h2>
              <p className="mt-0.5 text-[11px] text-slate-500">Company information and term-loan account details.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <InputField label="Company Name" value={nameOfCompany} setValue={setNameOfCompany} />
            <InputField label="Factory Address" value={factoryAddress} setValue={setFactoryAddress} />
            <div className="min-w-0">
              <label className="mb-1 block text-xs font-semibold text-slate-600">Term Loan Account</label>
              <select value={selectedAccountNo} onChange={(e) => {
                const selectedAccount = e.target.value;
                setSelectedAccountNo(selectedAccount);
                const selectedBank = companyBanks.find((b) => b.accountNumber === selectedAccount);
                setBankName(selectedBank?.bankName || "");
              }} className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10">
                <option value="">Select account</option>
                {companyBanks.map((bank) => <option key={bank._id} value={bank.accountNumber}>{bank.accountNumber} - {bank.bankName}</option>)}
              </select>
            </div>
            <InputField label="Bank Name" value={bankName} setValue={setBankName} />
            <InputField label="Place" value={place} setValue={setPlace} />
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50/60 to-white px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><CalendarDays size={17} /></div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Certificate &amp; Interest Details</h2>
              <p className="mt-0.5 text-[11px] text-slate-500">Certificate period, interest amount and authorization details.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <InputField label="Certificate No." value={certificateNo} setValue={setCertificateNo} />
            <InputField label="Interest Amount Paid" value={interestAmountPaid} setValue={setInterestAmountPaid} />
            <DateField label="From Date" value={fromDate} setValue={setFromDate} />
            <DateField label="To Date" value={toDate} setValue={setToDate} />
            <DateField label="Interest From Date" value={interestFromDate} setValue={setInterestFromDate} />
            <DateField label="Interest To Date" value={interestToDate} setValue={setInterestToDate} />
            <InputField label="UDIN" value={udin} setValue={setUdin} />
            <DateField label="Date of UDIN" value={dateOfUdin} setValue={setDateOfUdin} />
            <div className="min-w-0">
              <label className="mb-1 block text-xs font-semibold text-slate-600">Authorized Signatory</label>
              <select value={authorizedSignatory} onChange={(e) => {
                const selectedName = e.target.value;
                setAuthorizedSignatory(selectedName);
                const selected = authorizedSignatories.find((s) => s.name === selectedName);
                setAuthorizedSignatoryRole(selected?.role || "");
              }} className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10">
                <option value="">Select signatory</option>
                {authorizedSignatories.map((s, index) => <option key={index} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <InputField label="Authorized Signatory Role" value={authorizedSignatoryRole} setValue={setAuthorizedSignatoryRole} />
            <InputField label="Membership No." value={membershipNo} setValue={setMembershipNo} />
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-800"><Landmark size={17} /></div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Loan Interest Schedule</h2>
                <p className="mt-0.5 text-[11px] text-slate-500">Enter the details for each loan period. All fields fit within the page.</p>
              </div>
            </div>
            <span className="w-fit rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600">{loanData.length} {loanData.length === 1 ? "ENTRY" : "ENTRIES"}</span>
          </div>

          <div className="space-y-3 p-3 sm:p-4">
            {loanData.map((row, index) => {
              const interest = row.dueAmount
                ? (Number(String(row.dueAmount).replace(/,/g, "")) * 0.5).toFixed(2)
                : "";
              return (
                <div key={index} className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Loan Entry {String(index + 1).padStart(2, "0")}</h3>
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      aria-label={`Remove loan row ${index + 1}`}
                      disabled={loanData.length === 1}
                      title={loanData.length === 1 ? "At least one row is required" : "Remove row"}
                      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-rose-100 px-2.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                  <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <InputField label="Loan Type" value={row.loanType} setValue={(value) => handleLoanChange(index, "loanType", value)} />
                    <DateField label="Period From" value={row.periodFrom} setValue={(value) => handleLoanChange(index, "periodFrom", value)} />
                    <DateField label="Period To" value={row.periodTo} setValue={(value) => handleLoanChange(index, "periodTo", value)} />
                    <InputField label="Rate (%)" value={row.rate} setValue={(value) => handleLoanChange(index, "rate", value)} />
                    <DateField label="Due Date" value={row.dueDate || ""} setValue={(value) => handleLoanChange(index, "dueDate", value)} />
                    <InputField label="Due Amount" value={row.dueAmount || ""} setValue={(value) => handleLoanChange(index, "dueAmount", value)} />
                    <DateField label="Paid Date" value={row.paidDate || ""} setValue={(value) => handleLoanChange(index, "paidDate", value)} />
                    <InputField label="Paid Amount" value={row.paidAmount || ""} setValue={(value) => handleLoanChange(index, "paidAmount", value)} />
                    <div className="min-w-0">
                      <label className="mb-1 block text-xs font-semibold text-slate-600">Interest @ 5%</label>
                      <div className="flex h-9 items-center rounded-lg border border-emerald-100 bg-emerald-50 px-3 text-sm font-semibold text-emerald-800">{interest || "—"}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-slate-500">Interest is calculated automatically from the due amount, matching the existing calculation.</p>
            <button type="button" onClick={addRow} className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"><Plus size={15} className="text-emerald-700" /> Add Loan Row</button>
          </div>
        </section>

        <DocumentFormFooter
          documentName="Interest Subsidy"
          onCancel={() => navigate("/generate")}
          onGenerate={handleGenerateInterestDoc}
          loading={loading}
          editMode={editMode}
          cancelDisabled={loading}
        />
      </div>
    </div>
  );
}

function InputField({ label, value, setValue }) {
  return (
    <div className="min-w-0">
      <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
      <input type="text" value={value ?? ""} onChange={(e) => setValue(e.target.value)} className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
    </div>
  );
}

function DateField({ label, value, setValue }) {
  return (
    <div className="min-w-0">
      <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
      <input type="date" value={value ?? ""} onChange={(e) => setValue(e.target.value)} className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10" />
    </div>
  );
}
