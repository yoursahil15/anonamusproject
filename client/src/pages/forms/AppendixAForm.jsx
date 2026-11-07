import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import DocumentFormFooter from "../../components/DocumentFormFooter";
import { ArrowLeft, FileText, Building2, Landmark, CalendarDays, Sparkles, RefreshCw, Save, CheckCircle2 } from "lucide-react";

/* ================= DYNAMIC FIELDS ONLY ================= */
const INITIAL_FORM = {
  totalUnitsConsumed: "",
  totalEligibleSubsidy: "",
  totalInterestAmount: "",
  interestRate: "5",
  date: "",
};

export default function AppendixAForm({
  editMode = false,
  documentId = null,
  existingDocument = null,
}) {
  const { companyId } = useParams();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const navigate = useNavigate();
  const [authorizedSignatories, setAuthorizedSignatories] = useState([]);

  const [master, setMaster] = useState({
    nameOfCompany: "",
    factoryAddress: "",
    ecNumber: "",
    ecDate: "",
    place: "",
    authorizedSignatory: "",
    authorizedSignatoryRole: "",

    applicationNumber: "",
    dateOfReceipt: "",

    techUpgradation: "",
    qualityCertification: "",
    cleanerProduction: "",
    patentRegistration: "",
    waterAudit: "",
    energyAudit: "",
    waterConservation: "",
    energyEfficiency: "",
    creditRating: "",

    fciLand: "",
    fciBuilding: "",
    fciMachinery: "",
    fciPreoperative: "",
    fciCreditors: "",
  });

  /* ================= LOAD MASTER ================= */
  useEffect(() => {
    const loadMaster = async () => {
      try {
        const res = await API.get(`/document-master/${companyId}/APPENDIX_A`);

        const companyRes = await API.get(`/companies/${companyId}`);

        setAuthorizedSignatories(companyRes.data?.authorizedSignatories || []);

        setMaster((prev) => ({
          ...prev,
          ...(res.data?.staticData || {}),
        }));
      } catch (err) {
        console.log(err);
      }
    };
    if (companyId) loadMaster();
  }, [companyId]);

  useEffect(() => {
  if (!editMode || !existingDocument) return;

  const m = existingDocument.metadata || {};

  setMaster((prev) => ({
    ...prev,

    nameOfCompany: m.nameOfCompany || "",
    factoryAddress: m.factoryAddress || "",
    ecNumber: m.ecNumber || "",
    ecDate: m.ecDate || "",
    place: m.place || "",

    authorizedSignatory:
      m.authorizedSignatory || "",

    authorizedSignatoryRole:
      m.authorizedSignatoryRole || "",

    applicationNumber:
      m.applicationNumber || "",

    dateOfReceipt:
      m.dateOfReceipt || "",

    techUpgradation:
      m.techUpgradation || "",

    qualityCertification:
      m.qualityCertification || "",

    cleanerProduction:
      m.cleanerProduction || "",

    patentRegistration:
      m.patentRegistration || "",

    waterAudit:
      m.waterAudit || "",

    energyAudit:
      m.energyAudit || "",

    waterConservation:
      m.waterConservation || "",

    energyEfficiency:
      m.energyEfficiency || "",

    creditRating:
      m.creditRating || "",

    fciLand:
      m.fciLand || "",

    fciBuilding:
      m.fciBuilding || "",

    fciMachinery:
      m.fciMachinery || "",

    fciPreoperative:
      m.fciPreoperative || "",

    fciCreditors:
      m.fciCreditors || "",
  }));

  setForm({
    totalUnitsConsumed:
      m.totalUnitsConsumed || "",

    totalEligibleSubsidy:
      m.totalEligibleSubsidy || "",

    totalInterestAmount:
      m.totalInterestAmount || "",

    interestRate:
      m.interestRate || "5",

    date:
      m.date || "",
  });
}, [editMode, existingDocument]);
  /* ================= HANDLE INPUT ================= */
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignatoryChange = (e) => {
    const selectedName = e.target.value;

    const selectedSignatory = authorizedSignatories.find(
      (s) => s.name === selectedName,
    );

    setMaster((prev) => ({
      ...prev,
      authorizedSignatory: selectedName,
      authorizedSignatoryRole: selectedSignatory?.role || "",
    }));
  };

  const handleMasterChange = (e) => {
    const { name, value } = e.target;

    setMaster((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= GENERATE ================= */
  const handleGenerate = async () => {
    try {
      setLoading(true);

      const payload = {
        ...master,
        ...form,
      };

      const location = window.location.search;
      const clientId = new URLSearchParams(location).get("clientId");

      let apiUrl = `/documents/generate-from-master/${companyId}/APPENDIX_A`;

      if (clientId && clientId !== "null" && clientId !== "undefined") {
        apiUrl += `?clientId=${clientId}`;
      }

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

      const url = window.URL.createObjectURL(res.data);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "AppendixA.xlsx");

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log("❌ ERROR:", err);
      alert("Failed to generate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="document-form-theme min-h-screen bg-slate-50 px-3 py-4 sm:px-5 lg:px-7">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <FileText size={19} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Appendix A Form</h1>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                  {editMode ? "Edit document" : "Document form"}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Scheme, company, fixed capital investment and financial details</p>
            </div>
          </div>
          <button type="button" onClick={() => navigate("/generate")} className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:self-auto">
            <ArrowLeft size={15} /> Back to Documents
          </button>
        </header>

        <div className="flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2.5">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-700" />
          <p className="text-xs leading-5 text-slate-600"><span className="font-semibold text-slate-800">Before generating:</span> Review company, scheme, FCI and financial details.</p>
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <SectionHeading icon={Building2} title="Company & Scheme Details" description="Company information, scheme indicators and authorized signatory." />
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="Company Name" name="nameOfCompany" value={master.nameOfCompany} onChange={handleMasterChange} />
            <Input label="Factory Address" name="factoryAddress" value={master.factoryAddress} onChange={handleMasterChange} />
            <Input label="EC Number" name="ecNumber" value={master.ecNumber} onChange={handleMasterChange} />
            <Input label="EC Date" name="ecDate" value={master.ecDate} onChange={handleMasterChange} />
            <Input label="Place" name="place" value={master.place} onChange={handleMasterChange} />
            <div className="min-w-0">
              <label className="mb-1 block text-xs font-semibold text-slate-600">Authorized Signatory</label>
              <select value={master.authorizedSignatory || ""} onChange={handleSignatoryChange} className={fieldClass}>
                <option value="">Select signatory</option>
                {authorizedSignatories.map((signatory, index) => <option key={signatory._id || index} value={signatory.name}>{signatory.name}</option>)}
              </select>
            </div>
            <Input label="Authorized Signatory Role" name="authorizedSignatoryRole" value={master.authorizedSignatoryRole} onChange={handleMasterChange} readOnly />
            <Input label="Tech Upgradation" name="techUpgradation" value={master.techUpgradation} onChange={handleMasterChange} />
            <Input label="Quality Certification" name="qualityCertification" value={master.qualityCertification} onChange={handleMasterChange} />
            <Input label="Cleaner Production" name="cleanerProduction" value={master.cleanerProduction} onChange={handleMasterChange} />
            <Input label="Patent Registration" name="patentRegistration" value={master.patentRegistration} onChange={handleMasterChange} />
            <Input label="Water Audit" name="waterAudit" value={master.waterAudit} onChange={handleMasterChange} />
            <Input label="Energy Audit" name="energyAudit" value={master.energyAudit} onChange={handleMasterChange} />
            <Input label="Water Conservation" name="waterConservation" value={master.waterConservation} onChange={handleMasterChange} />
            <Input label="Energy Efficiency" name="energyEfficiency" value={master.energyEfficiency} onChange={handleMasterChange} />
            <Input label="Credit Rating" name="creditRating" value={master.creditRating} onChange={handleMasterChange} />
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <SectionHeading icon={Landmark} title="Fixed Capital Investment (FCI)" description="Enter the fixed capital investment components." />
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="Land" name="fciLand" value={master.fciLand} onChange={handleMasterChange} />
            <Input label="Building" name="fciBuilding" value={master.fciBuilding} onChange={handleMasterChange} />
            <Input label="Machinery" name="fciMachinery" value={master.fciMachinery} onChange={handleMasterChange} />
            <Input label="Preoperative" name="fciPreoperative" value={master.fciPreoperative} onChange={handleMasterChange} />
            <Input label="Creditors" name="fciCreditors" value={master.fciCreditors} onChange={handleMasterChange} />
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <SectionHeading icon={CalendarDays} title="Financial Details" description="Enter consumption, subsidy, interest and date information." />
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="Total Units Consumed" name="totalUnitsConsumed" value={form.totalUnitsConsumed} onChange={handleFormChange} />
            <Input label="Total Eligible Subsidy" name="totalEligibleSubsidy" value={form.totalEligibleSubsidy} onChange={handleFormChange} />
            <Input label="Total Interest Amount" name="totalInterestAmount" value={form.totalInterestAmount} onChange={handleFormChange} />
            <Input label="Interest Rate (%)" name="interestRate" value={form.interestRate} onChange={handleFormChange} />
            <Input label="Date" name="date" type="date" value={form.date} onChange={handleFormChange} />
          </div>
        </section>

        <DocumentFormFooter
          documentName="Appendix A"
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

const fieldClass = "h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10";

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><Icon size={17} /></div>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, name, type = "text", readOnly = false }) {
  return (
    <div className="min-w-0">
      <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
      <input name={name} type={type} value={value ?? ""} onChange={onChange} readOnly={readOnly} className={`${fieldClass} ${readOnly ? "bg-slate-50 text-slate-500" : ""}`} />
    </div>
  );
}
