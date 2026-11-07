import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import DocumentFormFooter from "../../components/DocumentFormFooter";
import { ArrowLeft, FileText, Building2, CalendarDays, Users, CheckCircle2, Plus, Trash2, Sparkles, RefreshCw, Save } from "lucide-react";

export default function ELPForm({
  editMode = false,
  documentId = null,
  existingDocument = null,
}) {
  const params = useParams();
  const navigate = useNavigate();
  const companyId = params.companyId || existingDocument?.company?._id;

  const [loading, setLoading] = useState(false);

  const [selectedCompanyData, setSelectedCompanyData] = useState(null);

  const roleOptions = ["Director", "Proprietor", "Partner"];
  const yesNoOptions = ["Yes", "No"];

  // ================= FORM DATA =================

  const [formData, setFormData] = useState({
    // ================= STATIC MASTER FIELDS =================
    nameOfCompany: "",
    registeredOfficeAddress: "",
    factoryAddress: "",
    productsManufactured: [""],
    yearOfIncorporation: "",
    year: "",
    place: "",
    hrKnowsMarathi: "",
    registeredUnderFactoriesAct: "",
    authorizedSignatory: "",
    authorizedSignatoryRole: "",

    // ================= DYNAMIC =================
    date: "",

    // ================= CURRENT STATUS =================
    currentTotalSupervisory: "",
    currentTotalOther: "",

    currentLocalSupervisory: "",
    currentLocalOther: "",

    // ================= PREVIOUS STATUS =================
    previousTotalSupervisory: "",
    previousTotalOther: "",

    previousLocalSupervisory: "",
    previousLocalOther: "",

    // ================= DECLARATION =================
    declarationSupervisory: "",
    declarationOther: "",
    declarationTotal: "",
  });

  // ================= LOAD MASTER =================
  useEffect(() => {
    if (editMode) return;

    const loadMasterData = async () => {
      try {
        // ================= MASTER =================

        const res = await API.get(`/document-master/${companyId}/ELP_FORM`);

        // ================= COMPANY =================

        const companyRes = await API.get(`/companies/${companyId}`);

        const company = companyRes.data;

        setSelectedCompanyData(company);

        // ================= DEFAULT SIGNATORY =================

        const defaultSignatory =
          company?.authorizedSignatories?.find((s) => s.isDefault) ||
          company?.authorizedSignatories?.[0];

        const staticData = res.data?.staticData || {};

        setFormData((prev) => ({
          ...prev,

          // ================= STATIC =================

          nameOfCompany: staticData.nameOfCompany || "",
          registeredOfficeAddress: staticData.registeredOfficeAddress || "",
          factoryAddress: staticData.factoryAddress || "",

          productsManufactured:
            staticData.productsManufactured?.length > 0
              ? staticData.productsManufactured
              : [""],

          yearOfIncorporation: staticData.yearOfIncorporation || "",

          year: staticData.year || "",

          place: staticData.place || "",

          hrKnowsMarathi: staticData.hrKnowsMarathi || "",

          registeredUnderFactoriesAct:
            staticData.registeredUnderFactoriesAct || "",

          // ✅ AUTHORIZED SIGNATORY

          authorizedSignatory:
            staticData.authorizedSignatory || defaultSignatory?.name || "",

          authorizedSignatoryRole:
            staticData.authorizedSignatoryRole || defaultSignatory?.role || "",
        }));
      } catch (err) {
        console.log("MASTER LOAD ERROR:", err);
      }
    };

    loadMasterData();
  }, [companyId]);
  useEffect(() => {
    if (!editMode || !existingDocument) return;

    const m = existingDocument.metadata || {};

    setFormData((prev) => ({
      ...prev,

      nameOfCompany: m.nameOfCompany || "",

      registeredOfficeAddress: m.registeredOfficeAddress || "",

      factoryAddress: m.factoryAddress || "",

      productsManufactured: m.productsManufactured?.length
        ? m.productsManufactured
        : [""],

      yearOfIncorporation: m.yearOfIncorporation || "",

      year: m.year || "",

      place: m.place || "",

      hrKnowsMarathi: m.hrKnowsMarathi || "",

      registeredUnderFactoriesAct: m.registeredUnderFactoriesAct || "",

      authorizedSignatory: m.authorizedSignatory || "",

      authorizedSignatoryRole: m.authorizedSignatoryRole || "",

      date: m.date || "",

      currentTotalSupervisory: m.currentTotalSupervisory || "",

      currentTotalOther: m.currentTotalOther || "",

      currentLocalSupervisory: m.currentLocalSupervisory || "",

      currentLocalOther: m.currentLocalOther || "",

      previousTotalSupervisory: m.previousTotalSupervisory || "",

      previousTotalOther: m.previousTotalOther || "",

      previousLocalSupervisory: m.previousLocalSupervisory || "",

      previousLocalOther: m.previousLocalOther || "",

      declarationSupervisory: m.declarationSupervisory || "",

      declarationOther: m.declarationOther || "",

      declarationTotal: m.declarationTotal || "",
    }));
  }, [editMode, existingDocument]);
  // ================= CHANGE =================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= PRODUCTS MANUFACTURED =================

  const handleProductChange = (index, value) => {
    const updated = [...formData.productsManufactured];

    updated[index] = value;

    setFormData((prev) => ({
      ...prev,
      productsManufactured: updated,
    }));
  };

  const addProductField = () => {
    setFormData((prev) => ({
      ...prev,
      productsManufactured: [...prev.productsManufactured, ""],
    }));
  };

  const removeProductField = (index) => {
    const updated = formData.productsManufactured.filter((_, i) => i !== index);

    setFormData((prev) => ({
      ...prev,
      productsManufactured: updated.length ? updated : [""],
    }));
  };
  // ================= GENERATE =================

  const handleGenerate = async () => {
    try {
      if (!companyId) {
        alert("Missing Company ID");
        return;
      }
      console.log("COMPANY ID:", companyId);
      setLoading(true);

      const url = `/documents/generate/elp/${companyId}`;

      let res;

      if (editMode) {
        res = await API.put(
          `/documents/edit-generated-document/${documentId}`,
          formData,
          {
            responseType: "blob",
          },
        );
      } else {
        const url = `/documents/generate/elp/${companyId}`;

        res = await API.post(url, formData, {
          responseType: "blob",
        });
      }

      const downloadUrl = window.URL.createObjectURL(res.data);

      const link = document.createElement("a");

      link.href = downloadUrl;
      const nextVersion = (existingDocument?.version || 1) + 1;

      link.download = editMode ? `ELP_V${nextVersion}.xlsx` : "ELP.xlsx";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(downloadUrl);

      alert("✅ ELP Form Generated Successfully");
    } catch (err) {
      console.error("ELP ERROR:", err);
      alert("Error generating ELP Form");
    } finally {
      setLoading(false);
    }
  };

return (
    <div className="document-form-theme min-h-screen bg-white px-3 py-4 sm:px-5 lg:px-7">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <FileText size={19} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-blue-950">ELP Form</h1>
                <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-800">
                  {editMode ? "Edit document" : "Document form"}
                </span>
              </div>
              <p className="mt-1 text-xs text-blue-700">Employment of Local Persons Details</p>
            </div>
          </div>
          <button type="button" onClick={() => navigate("/generate")} className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border border-blue-100 bg-white px-3 text-xs font-semibold text-blue-800 transition hover:bg-blue-50 sm:self-auto">
            <ArrowLeft size={15} /> Back to Documents
          </button>
        </header>

        <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-2.5">
          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-blue-700" />
          <p className="text-xs leading-5 text-blue-800"><span className="font-semibold text-blue-900">Before generating:</span> Review company details, report date, and employment figures.</p>
        </div>

        <section className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
          <SectionHeading icon={Building2} title="Company Details" description="Company information and authorized signatory." />
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="Company Name" name="nameOfCompany" value={formData.nameOfCompany} onChange={handleChange} />
            <Input label="Registered Office Address" name="registeredOfficeAddress" value={formData.registeredOfficeAddress} onChange={handleChange} />
            <Input label="Factory Address" name="factoryAddress" value={formData.factoryAddress} onChange={handleChange} />

            <div className="min-w-0 sm:col-span-2 lg:col-span-3">
              <label className="mb-1 block text-xs font-semibold text-blue-800">Products Manufactured</label>
              <div className="space-y-2">
                {formData.productsManufactured.map((product, index) => (
                  <div key={index} className="flex min-w-0 gap-2">
                    <input type="text" value={product} onChange={(e) => handleProductChange(index, e.target.value)} className={fieldClass} placeholder={`Product ${index + 1}`} />
                    <button type="button" onClick={() => removeProductField(index)} aria-label={`Remove product ${index + 1}`} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-200 text-blue-700 transition hover:bg-blue-100">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addProductField} className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-lg border border-blue-100 bg-white px-3 text-xs font-semibold text-blue-800 transition hover:border-blue-500 hover:bg-blue-50">
                <Plus size={14} className="text-blue-700" /> Add Product
              </button>
            </div>

            <Input label="Year of Incorporation" name="yearOfIncorporation" value={formData.yearOfIncorporation} onChange={handleChange} />
            <Input label="Financial Year" name="year" value={formData.year} onChange={handleChange} />
            <Input label="Place" name="place" value={formData.place} onChange={handleChange} />
            <Select label="HR Knows Marathi" name="hrKnowsMarathi" value={formData.hrKnowsMarathi} onChange={handleChange} options={yesNoOptions} />
            <Select label="Registered Under Factories Act" name="registeredUnderFactoriesAct" value={formData.registeredUnderFactoriesAct} onChange={handleChange} options={yesNoOptions} />
            <div className="min-w-0">
              <label className="mb-1 block text-xs font-semibold text-blue-800">Authorized Signatory</label>
              <select value={formData.authorizedSignatory} onChange={(e) => {
                const selectedName = e.target.value;
                const signatory = selectedCompanyData?.authorizedSignatories?.find((s) => s.name === selectedName);
                setFormData((prev) => ({ ...prev, authorizedSignatory: selectedName, authorizedSignatoryRole: signatory?.role || "" }));
              }} className={fieldClass}>
                <option value="">Select signatory</option>
                {selectedCompanyData?.authorizedSignatories?.map((s, index) => <option key={index} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <Input label="Authorized Signatory Role" name="authorizedSignatoryRole" value={formData.authorizedSignatoryRole} onChange={handleChange} />
            <DateInput label="Report Date" name="date" value={formData.date} onChange={handleChange} />
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
          <SectionHeading icon={Users} title="Employment Status" description="Enter current and previous employment counts. Totals and local-person percentages calculate automatically." />
          <div className="space-y-4 p-4">
            {[
              { title: "Current Status", totalSup: "currentTotalSupervisory", totalOther: "currentTotalOther", localSup: "currentLocalSupervisory", localOther: "currentLocalOther" },
              { title: "Previous Status", totalSup: "previousTotalSupervisory", totalOther: "previousTotalOther", localSup: "previousLocalSupervisory", localOther: "previousLocalOther" },
            ].map((group) => {
              const totalSup = Number(formData[group.totalSup] || 0);
              const totalOther = Number(formData[group.totalOther] || 0);
              const localSup = Number(formData[group.localSup] || 0);
              const localOther = Number(formData[group.localOther] || 0);
              const totalAll = totalSup + totalOther;
              const localAll = localSup + localOther;
              return (
                <div key={group.title} className="overflow-hidden rounded-lg border border-blue-100">
                  <div className="border-b border-blue-100 bg-blue-50 px-3 py-2">
                    <h3 className="text-xs font-bold text-blue-900">{group.title}</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-2">
                    <div className="rounded-lg border border-blue-100 p-3">
                      <h4 className="mb-3 text-xs font-semibold text-blue-800">Total Employment</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <NumberInput label="Supervisory" name={group.totalSup} value={formData[group.totalSup]} onChange={handleChange} />
                        <NumberInput label="Other" name={group.totalOther} value={formData[group.totalOther]} onChange={handleChange} />
                      </div>
                      <div className="mt-3 flex items-center justify-between rounded-md bg-blue-50 px-3 py-2 text-xs">
                        <span className="text-blue-700">Total employees</span><strong className="text-blue-900">{totalAll}</strong>
                      </div>
                    </div>
                    <div className="rounded-lg border border-blue-100 p-3">
                      <h4 className="mb-3 text-xs font-semibold text-blue-800">Local Persons</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <NumberInput label="Supervisory" name={group.localSup} value={formData[group.localSup]} onChange={handleChange} />
                        <NumberInput label="Other" name={group.localOther} value={formData[group.localOther]} onChange={handleChange} />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-md bg-blue-50 px-3 py-2 text-xs"><span className="block text-blue-700">Local total</span><strong className="text-blue-800">{localAll}</strong></div>
                        <div className="rounded-md bg-blue-50 px-3 py-2 text-xs"><span className="block text-blue-700">Local percentage</span><strong className="text-blue-800">{calculatePercent(localAll, totalAll)}</strong></div>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-blue-700">
                        <span>Supervisory: {calculatePercent(localSup, totalSup)}</span>
                        <span>Other: {calculatePercent(localOther, totalOther)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <DocumentFormFooter
          documentName="ELP Form"
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

/* ================= HELPERS ================= */

function calculatePercent(local, total) {
  const l = Number(local || 0);
  const t = Number(total || 0);

  if (!t) return "0.00%";

  return ((l / t) * 100).toFixed(2) + "%";
}


const fieldClass = "h-9 w-full min-w-0 rounded-lg border border-blue-100 bg-white px-3 text-sm text-blue-900 outline-none transition placeholder:text-blue-600 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15";

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center gap-3 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Icon size={17} /></div>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-blue-950">{title}</h2>
        <p className="mt-0.5 text-[11px] leading-4 text-blue-700">{description}</p>
      </div>
    </div>
  );
}

function Input({ label, name, value, onChange, readOnly = false }) {
  return (
    <div className="min-w-0">
      <label className="mb-1 block text-xs font-semibold text-blue-800">{label}</label>
      <input type="text" name={name} value={value ?? ""} onChange={onChange} readOnly={readOnly} className={`${fieldClass} ${readOnly ? "bg-blue-50" : ""}`} />
    </div>
  );
}

function Select({ label, name, value, onChange, options, disabled = false }) {
  return (
    <div className="min-w-0">
      <label className="mb-1 block text-xs font-semibold text-blue-800">{label}</label>
      <select name={name} value={value ?? ""} onChange={onChange} disabled={disabled} className={`${fieldClass} disabled:cursor-not-allowed disabled:bg-blue-50`}>
        <option value="">Select</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}

function NumberInput({ label, name, value, onChange }) {
  return (
    <div className="min-w-0">
      {label && <label className="mb-1 block text-[11px] font-medium text-blue-700">{label}</label>}
      <input type="number" min="0" name={name} value={value ?? ""} onChange={onChange} className={fieldClass} />
    </div>
  );
}

function DateInput({ label, name, value, onChange }) {
  return (
    <div className="min-w-0">
      <label className="mb-1 block text-xs font-semibold text-blue-800">{label}</label>
      <input type="date" name={name} value={value ?? ""} onChange={onChange} className={fieldClass} />
    </div>
  );
}
