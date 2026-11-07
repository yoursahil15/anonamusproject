import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import DocumentFormFooter from "../../components/DocumentFormFooter";
import { ArrowLeft, Building2, ClipboardCheck, FileText, Landmark, ListChecks, LoaderCircle, Plus, Save, Trash2, Wallet } from "lucide-react";

export default function DisbursementAgreementForm({
  editMode = false,
  documentId = null,
  existingDocument = null,
}) {
  const { companyId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // ✅ SINGLE SOURCE OF TRUTH FOR clientId
  const clientId =
    searchParams.get("clientId") || localStorage.getItem("clientId") || "";

  console.log("FINAL CLIENT ID:", clientId); // 🔍 DEBUG

  // ================= STATIC =================

  const [nameOfCompany, setNameOfCompany] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [registeredOfficeAddress, setRegisteredOfficeAddress] = useState("");
  const [factoryAddress, setFactoryAddress] = useState("");
  const [selectedCompanyData, setSelectedCompanyData] = useState(null);
  const [directorName, setDirectorName] = useState("");
  const [directorRole, setDirectorRole] = useState("");

  const [ecNumber, setEcNumber] = useState("");
  const [ecDate, setEcDate] = useState("");

  const [schemeResolutionNo, setSchemeResolutionNo] = useState("");
  const [schemeResolutionDate, setSchemeResolutionDate] = useState("");

  const [grantAmountRs, setGrantAmountRs] = useState("");
  const [grantAmountWords, setGrantAmountWords] = useState("");

  const [representativeName, setRepresentativeName] = useState("");

  const [implementingAgencyName, setImplementingAgencyName] = useState("");
  const [implementingAgencyAddress, setImplementingAgencyAddress] =
    useState("");

  const [receiptAmountRs, setReceiptAmountRs] = useState("");
  const [receiptAmountWords, setReceiptAmountWords] = useState("");
  const [authorizedSignatory, setAuthorizedSignatory] = useState("");
  const [authorizedSignatoryRole, setAuthorizedSignatoryRole] = useState("");

  // ================= DYNAMIC =================

  const [yy, setYy] = useState("");
  const [directorAge, setDirectorAge] = useState("");
  const [amountDisbursedTillDate, setAmountDisbursedTillDate] = useState("");

  // ================= TABLE =================

  const [loading, setLoading] = useState(false);

  const [tableRows, setTableRows] = useState([
    {
      srNo: "",
      periodFrom: "",
      periodTo: "",
      dateOfSanction: "",
      amountSanctioned: "",
      amountDisbursed: "",
      dateOfDisbursement: "",
    },
  ]);

  // ================= LOAD MASTER =================

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        // ================= MASTER =================

        const res = await API.get(
          `/document-master/${companyId}/DISBURSEMENT_AGREEMENT`,
        );

        // ================= COMPANY =================

        const companyRes = await API.get(`/companies/${companyId}`);

        const company = companyRes.data;

        setSelectedCompanyData(company);

        // ================= DEFAULT SIGNATORY =================

        const defaultSignatory =
          company?.authorizedSignatories?.find((s) => s.isDefault) ||
          company?.authorizedSignatories?.[0];

        const s = res.data.staticData || {};

        setNameOfCompany(s.nameOfCompany || "");
        setOrganizationType(s.organizationType || "");
        setRegisteredOfficeAddress(s.registeredOfficeAddress || "");
        setFactoryAddress(s.factoryAddress || "");

        setDirectorName(s.directorName || "");
        setDirectorRole(s.directorRole || "");

        setEcNumber(s.ecNumber || "");
        setEcDate(s.ecDate || "");

        setSchemeResolutionNo(s.schemeResolutionNo || "");

        setSchemeResolutionDate(s.schemeResolutionDate || "");

        setGrantAmountRs(s.grantAmountRs || "");

        setGrantAmountWords(s.grantAmountWords || "");

        setRepresentativeName(s.representativeName || "");

        setImplementingAgencyName(s.implementingAgencyName || "");

        setImplementingAgencyAddress(s.implementingAgencyAddress || "");

        setReceiptAmountRs(s.receiptAmountRs || "");

        setReceiptAmountWords(s.receiptAmountWords || "");

        // ✅ AUTHORIZED SIGNATORY
        // ✅ AUTHORIZED SIGNATORY

        if (s.authorizedSignatory) {
          // MASTER DATA

          setAuthorizedSignatory(s.authorizedSignatory);

          setAuthorizedSignatoryRole(s.authorizedSignatoryRole || "");
        } else {
          // DEFAULT COMPANY SIGNATORY

          setAuthorizedSignatory(defaultSignatory?.name || "");

          setAuthorizedSignatoryRole(defaultSignatory?.role || "");
        }
      } catch (err) {
        console.log("Master Load Error:", err);
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

  setOrganizationType(
    m.organizationType || ""
  );

  setRegisteredOfficeAddress(
    m.registeredOfficeAddress || ""
  );

  setFactoryAddress(
    m.factoryAddress || ""
  );

  setDirectorName(
    m.directorName || ""
  );

  setDirectorRole(
    m.directorRole || ""
  );

  setEcNumber(
    m.ecNumber || ""
  );

  setEcDate(
    m.ecDate || ""
  );

  setSchemeResolutionNo(
    m.schemeResolutionNo || ""
  );

  setSchemeResolutionDate(
    m.schemeResolutionDate || ""
  );

  setGrantAmountRs(
    m.grantAmountRs || ""
  );

  setGrantAmountWords(
    m.grantAmountWords || ""
  );

  setRepresentativeName(
    m.representativeName || ""
  );

  setImplementingAgencyName(
    m.implementingAgencyName || ""
  );

  setImplementingAgencyAddress(
    m.implementingAgencyAddress || ""
  );

  setReceiptAmountRs(
    m.receiptAmountRs || ""
  );

  setReceiptAmountWords(
    m.receiptAmountWords || ""
  );

  setAuthorizedSignatory(
    m.authorizedSignatory || ""
  );

  setAuthorizedSignatoryRole(
    m.authorizedSignatoryRole || ""
  );

  setYy(
    m.yy || ""
  );

  setDirectorAge(
    m.directorAge || ""
  );

  setAmountDisbursedTillDate(
    m.amountDisbursedTillDate || ""
  );

  setTableRows(
    m.tableRows?.length
      ? m.tableRows
      : [
          {
            srNo: "",
            periodFrom: "",
            periodTo: "",
            dateOfSanction: "",
            amountSanctioned: "",
            amountDisbursed: "",
            dateOfDisbursement: "",
          },
        ]
  );
}, [editMode, existingDocument]);

  // ================= TABLE FUNCTIONS =================

  const handleRowChange = (index, field, value) => {
    const updated = [...tableRows];

    updated[index][field] = value;

    setTableRows(updated);
  };

  const addRow = () => {
    setTableRows([
      ...tableRows,
      {
        srNo: "",
        periodFrom: "",
        periodTo: "",
        dateOfSanction: "",
        amountSanctioned: "",
        amountDisbursed: "",
        dateOfDisbursement: "",
      },
    ]);
  };

  const removeRow = (index) => {
    const updated = [...tableRows];

    updated.splice(index, 1);

    setTableRows(updated);
  };

  // ================= GENERATE =================

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const formattedRows = tableRows.map((row) => ({
        ...row,

        periodOfIps: `${row.periodFrom}-${String(row.periodTo).slice(-2)}`,
      }));
      const payload = {
        nameOfCompany,
        organizationType,
        registeredOfficeAddress,
        factoryAddress,
        directorName,
        directorRole,
        ecNumber,
        ecDate,
        schemeResolutionNo,
        schemeResolutionDate,
        grantAmountRs,
        grantAmountWords,
        representativeName,
        implementingAgencyName,
        implementingAgencyAddress,
        receiptAmountRs,
        receiptAmountWords,

        yy,
        directorAge,
        tableRows: formattedRows,
        amountDisbursedTillDate,
      };

      let apiUrl = `/documents/generate-from-master/${companyId}/DISBURSEMENT_AGREEMENT`;

      if (clientId && clientId !== "null" && clientId !== "undefined") {
        apiUrl += `?clientId=${clientId}`;
      }

      console.log("CLIENT ID SENT:", clientId); // 🔍 debug

      let response;

if (editMode) {
  response = await API.put(
    `/documents/edit-generated-document/${documentId}`,
    payload,
    {
      responseType: "blob",
    }
  );
} else {
  response = await API.post(
    apiUrl,
    payload,
    {
      responseType: "blob",
    }
  );
}

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
const nextVersion = (existingDocument?.version || 1) + 1;

link.setAttribute(
  "download",
  editMode
    ? `DisbursementAgreement_V${nextVersion}.docx`
    : "DisbursementAgreement.docx"
);

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log(error);
      alert("Failed to generate Disbursement Agreement");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className="document-form-theme min-h-screen bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <FileText size={22} />
            </div>
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">Disbursement Agreement</h1>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${editMode ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                  {editMode ? "Edit document" : "New document"}
                </span>
              </div>
              <p className="text-sm text-slate-500">Enter company information, sanction details, and incentive disbursement history.</p>
            </div>
          </div>
          <button type="button" onClick={() => navigate("/generate")} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            <ArrowLeft size={16} /> Back to Documents
          </button>
        </header>

        <div className="space-y-5">
          <Section title="Company & Organization" description="Basic company details and registered addresses" icon={<Building2 size={18} />}>
            <Grid>
              <InputField label="Company Name" value={nameOfCompany} setValue={setNameOfCompany} />
              <InputField label="Organization Type" value={organizationType} setValue={setOrganizationType} />
              <InputField label="Registered Office Address" value={registeredOfficeAddress} setValue={setRegisteredOfficeAddress} />
              <InputField label="Factory Address" value={factoryAddress} setValue={setFactoryAddress} />
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Authorized Signatory</label>
                <select value={authorizedSignatory} onChange={(e) => {
                  const selectedName = e.target.value;
                  const signatory = selectedCompanyData?.authorizedSignatories?.find((s) => s.name === selectedName);
                  setAuthorizedSignatory(selectedName);
                  setDirectorRole(signatory?.role || "");
                }} className={fieldClass}>
                  <option value="">Select signatory</option>
                  {selectedCompanyData?.authorizedSignatories?.map((s, index) => <option key={index} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <InputField label="Authorized Signatory Role" value={directorRole} setValue={setDirectorRole} />
              <InputField label="Director Name" value={directorName} setValue={setDirectorName} />
              <InputField label="Director Role" value={directorRole} setValue={setDirectorRole} />
              <InputField label="Representative Name" value={representativeName} setValue={setRepresentativeName} />
            </Grid>
          </Section>

          <Section title="Eligibility & Scheme Approval" description="Enter eligibility certificate and scheme resolution references" icon={<ClipboardCheck size={18} />}>
            <Grid>
              <InputField label="EC Number" value={ecNumber} setValue={setEcNumber} />
              <DateField label="EC Date" value={ecDate} setValue={setEcDate} />
              <InputField label="Scheme Resolution Number" value={schemeResolutionNo} setValue={setSchemeResolutionNo} />
              <DateField label="Scheme Resolution Date" value={schemeResolutionDate} setValue={setSchemeResolutionDate} />
            </Grid>
          </Section>

          <Section title="Grant & Implementing Agency" description="Grant approval and agency details" icon={<Landmark size={18} />}>
            <Grid>
              <InputField label="Grant Amount (₹)" value={grantAmountRs} setValue={setGrantAmountRs} />
              <InputField label="Grant Amount (in words)" value={grantAmountWords} setValue={setGrantAmountWords} />
              <InputField label="Implementing Agency Name" value={implementingAgencyName} setValue={setImplementingAgencyName} />
              <InputField label="Implementing Agency Address" value={implementingAgencyAddress} setValue={setImplementingAgencyAddress} />
              <InputField label="Receipt Amount (₹)" value={receiptAmountRs} setValue={setReceiptAmountRs} />
              <InputField label="Receipt Amount (in words)" value={receiptAmountWords} setValue={setReceiptAmountWords} />
            </Grid>
          </Section>

          <Section title="Disbursement Summary" description="Current period and cumulative disbursement details" icon={<Wallet size={18} />}>
            <Grid>
              <InputField label="Year (YY)" value={yy} setValue={setYy} />
              <InputField label="Director Age" value={directorAge} setValue={setDirectorAge} />
              <InputField label="Amount Disbursed Till Date (₹)" value={amountDisbursedTillDate} setValue={setAmountDisbursedTillDate} />
            </Grid>
          </Section>

          <Section title="Incentive Disbursement History" description="Add one entry for each sanction or disbursement period" icon={<ListChecks size={18} />}>
            <div className="space-y-4">
              {tableRows.map((row, index) => (
                <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs font-semibold text-slate-700 ring-1 ring-slate-200">{index + 1}</span>
                      <h3 className="text-sm font-semibold text-slate-800">Disbursement entry</h3>
                    </div>
                    <button type="button" onClick={() => removeRow(index)} disabled={tableRows.length === 1} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40">
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <InputField label="Serial Number" value={row.srNo} setValue={(v) => handleRowChange(index, "srNo", v)} />
                    <InputField label="From Year" value={row.periodFrom} setValue={(v) => handleRowChange(index, "periodFrom", v)} />
                    <InputField label="To Year" value={row.periodTo} setValue={(v) => handleRowChange(index, "periodTo", v)} />
                    <DateField label="Sanction Date" value={row.dateOfSanction} setValue={(v) => handleRowChange(index, "dateOfSanction", v)} />
                    <InputField label="Amount Sanctioned (₹)" value={row.amountSanctioned} setValue={(v) => handleRowChange(index, "amountSanctioned", v)} />
                    <InputField label="Amount Disbursed (₹)" value={row.amountDisbursed} setValue={(v) => handleRowChange(index, "amountDisbursed", v)} />
                    <DateField label="Disbursement Date" value={row.dateOfDisbursement} setValue={(v) => handleRowChange(index, "dateOfDisbursement", v)} />
                  </div>
                </div>
              ))}
              <button type="button" onClick={addRow} className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100">
                <Plus size={16} /> Add disbursement entry
              </button>
            </div>
          </Section>

          <DocumentFormFooter
            documentName="Disbursement Agreement"
            onCancel={() => navigate("/generate")}
            onGenerate={handleGenerate}
            loading={loading}
            editMode={editMode}
          />
        </div>
      </div>
    </div>
  );
}

const fieldClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

function Section({ title, description, icon, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">{icon}</div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900 sm:text-base">{title}</h2>
          <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function Grid({ children }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

function InputField({ label, value, setValue, type = "text" }) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-xs font-medium text-slate-600">{label}</label>
      <input type={type} value={value ?? ""} onChange={(e) => setValue(e.target.value)} className={fieldClass} />
    </div>
  );
}

function DateField({ label, value, setValue }) {
  const formatted = value?.includes("T") ? value.split("T")[0] : value || "";
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-xs font-medium text-slate-600">{label}</label>
      <input type="date" value={formatted} onChange={(e) => setValue(e.target.value)} className={fieldClass} />
    </div>
  );
}
