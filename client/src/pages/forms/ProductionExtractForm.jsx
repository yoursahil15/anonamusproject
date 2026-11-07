import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import DocumentFormFooter from "../../components/DocumentFormFooter";
import { ArrowLeft, CheckCircle2, FileText, LoaderCircle, Plus, Trash2 } from "lucide-react";

export default function ProductionExtractForm({
  editMode = false,
  documentId = null,
  existingDocument = null,
}) {
  const params = useParams();
  const navigate = useNavigate();
  const companyId = params.companyId || existingDocument?.company?._id;
  const unitOptions = ["Kg", "MT", "Litre", "Rs"];
  const roleOptions = ["Director", "Proprietor", "Partner"];
  const [selectedCompanyData, setSelectedCompanyData] = useState(null);

  // ================= STATIC ====================

  const [staticData, setStaticData] = useState({
    nameOfIndustry: "",
    factoryAddress: "",
    phone: "",

    eligibleProductsAsPerEC: "",

    startMonthYear: "",

    constitution: "",

    directorAddress: "",

    productWithCapacity: [
      {
        name: "",
        capacity: "",
      },
    ],

    ssiRegistration: {
      number: "",
    },

    fixedCapitalInvestment: {
      land: "",
      building: "",
      plantMachinery: "",
      electricals: "",
      other: "",
    },

    financeAgency: "",
    bankName: "",
    workingCapital: "",

    registrations: {
      salesTax: "",
      gst: "",
      factoryAct: "",
      excise: "",
      pollutionNo: "",
      pollutionDate: "",
      localNoc: "",
    },

    workers: "",

    electricity: "",

    waterRequirement: "",

    place: "",

    authorizedSignatory: "",
    authorizedSignatoryRole: "",
  });

  // ================= DYNAMIC =================

  const [financialYear, setFinancialYear] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [date, setDate] = useState("");

  const [rawMaterials, setRawMaterials] = useState([
    { name: "", quantity: "", unit: "", value: "" },
  ]);

  const [productions, setProductions] = useState([
    { name: "", quantity: "", unit: "", value: "" },
  ]);

  const [totalSalesReceipt, setTotalSalesReceipt] = useState("");

  const [salesTax, setSalesTax] = useState("");

  const [electricityUnits, setElectricityUnits] = useState("");

  const [workersEmployed, setWorkersEmployed] = useState("");

  const [workingDays, setWorkingDays] = useState("");

  const [loading, setLoading] = useState(false);

  // ================= LOAD MASTER =================
  useEffect(() => {
    if (editMode) return;

    const loadMaster = async () => {
      try {
        // ================= MASTER =================

        const res = await API.get(
          `/document-master/${companyId}/PRODUCTION_EXTRACT`,
        );

        // ================= COMPANY =================

        const companyRes = await API.get(`/companies/${companyId}`);

        const company = companyRes.data;

        setSelectedCompanyData(company);

        // ================= DEFAULT SIGNATORY =================

        const defaultSignatory =
          company?.authorizedSignatories?.find((s) => s.isDefault) ||
          company?.authorizedSignatories?.[0];

        const data = res.data?.staticData || {};

        setStaticData({
          // ================= COMPANY =================

          nameOfIndustry: data.nameOfIndustry || "",
          factoryAddress: data.factoryAddress || "",
          phone: data.phone || "",

          eligibleProductsAsPerEC: data.eligibleProductsAsPerEC || "",

          startMonthYear: data.startMonthYear || "",

          constitution: data.constitution || "",

          // ✅ AUTHORIZED SIGNATORY

          authorizedSignatory:
            data.authorizedSignatory || defaultSignatory?.name || "",

          authorizedSignatoryRole:
            data.authorizedSignatoryRole || defaultSignatory?.role || "",

          directorAddress: data.directorAddress || "",

          // ================= PRODUCT =================

          productWithCapacity: Array.isArray(data.productWithCapacity)
            ? data.productWithCapacity
            : [
                {
                  name: "",
                  capacity: "",
                },
              ],

          // ================= SSI =================

          ssiRegistration:
            typeof data.ssiRegistration === "object" &&
            data.ssiRegistration !== null
              ? data.ssiRegistration
              : {
                  number: "",
                },

          // ================= INVESTMENT =================

          fixedCapitalInvestment:
            typeof data.fixedCapitalInvestment === "object" &&
            data.fixedCapitalInvestment !== null
              ? {
                  land: data.fixedCapitalInvestment.land || "",
                  building: data.fixedCapitalInvestment.building || "",
                  plantMachinery:
                    data.fixedCapitalInvestment.plantMachinery || "",
                  electricals: data.fixedCapitalInvestment.electricals || "",
                  other: data.fixedCapitalInvestment.other || "",
                }
              : {
                  land: "",
                  building: "",
                  plantMachinery: "",
                  electricals: "",
                  other: "",
                },

          // ================= BANK =================

          financeAgency: data.financeAgency || "",
          bankName: data.bankName || "",
          workingCapital: data.workingCapital || "",

          // ================= REGISTRATIONS =================

          registrations:
            typeof data.registrations === "object" &&
            data.registrations !== null
              ? {
                  salesTax: data.registrations.salesTax || "",
                  gst: data.registrations.gst || "",
                  factoryAct: data.registrations.factoryAct || "",
                  excise: data.registrations.excise || "",
                  pollutionNo: data.registrations.pollutionNo || "",
                  pollutionDate: data.registrations.pollutionDate || "",
                  localNoc: data.registrations.localNoc || "",
                }
              : {
                  salesTax: "",
                  gst: "",
                  factoryAct: "",
                  excise: "",
                  pollutionNo: "",
                  pollutionDate: "",
                  localNoc: "",
                },

          // ================= EMPLOYMENT =================

          workers: data.workers || "",

          // ================= POWER =================

          electricity: data.electricity || "",

          // ================= WATER =================

          waterRequirement: data.waterRequirement || "",

          // ================= FOOTER =================

          place: data.place || "",
        });
      } catch (err) {
        console.log(err);
      }
    };

    loadMaster();
  }, [companyId]);

  useEffect(() => {
    if (!editMode || !existingDocument) return;

    const m = existingDocument.metadata || {};

    setStaticData(
      m.staticData || {
        nameOfIndustry: "",
        factoryAddress: "",
        phone: "",
        eligibleProductsAsPerEC: "",
        startMonthYear: "",
        constitution: "",
        directorAddress: "",
        productWithCapacity: [
          {
            name: "",
            capacity: "",
          },
        ],
        ssiRegistration: {
          number: "",
        },
        fixedCapitalInvestment: {
          land: "",
          building: "",
          plantMachinery: "",
          electricals: "",
          other: "",
        },
        financeAgency: "",
        bankName: "",
        workingCapital: "",
        registrations: {
          salesTax: "",
          gst: "",
          factoryAct: "",
          excise: "",
          pollutionNo: "",
          pollutionDate: "",
          localNoc: "",
        },
        workers: "",
        electricity: "",
        waterRequirement: "",
        place: "",
        authorizedSignatory: "",
        authorizedSignatoryRole: "",
      },
    );

    setFinancialYear(m.financialYear || "");

    setFromDate(m.fromDate || "");

    setToDate(m.toDate || "");

    setDate(m.date || "");

    setRawMaterials(
      m.rawMaterials?.length
        ? m.rawMaterials
        : [
            {
              name: "",
              quantity: "",
              unit: "",
              value: "",
            },
          ],
    );

    setProductions(
      m.products?.length
        ? m.products
        : [
            {
              name: "",
              quantity: "",
              unit: "",
              value: "",
            },
          ],
    );

    setTotalSalesReceipt(m.totalSales || "");

    setSalesTax(m.tax || "");

    setElectricityUnits(m.electricity || "");

    setWorkersEmployed(m.workers || "");

    setWorkingDays(m.workingDays || "");
  }, [editMode, existingDocument]);
  // ================= STATIC CHANGE =================

  const handleStaticChange = (e) => {
    const { name, value } = e.target;

    setStaticData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= RAW MATERIAL =================

  const handleRawChange = (index, field, value) => {
    const updated = [...rawMaterials];

    updated[index][field] = value;

    setRawMaterials(updated);
  };

  const removeRawRow = (index) => setRawMaterials((prev) => prev.filter((_, i) => i !== index));

  const addRawRow = () => {
    setRawMaterials([
      ...rawMaterials,
      { name: "", quantity: "", unit: "", value: "" },
    ]);
  };

  // ================= PRODUCTION =================

  const handleProductionChange = (index, field, value) => {
    const updated = [...productions];

    updated[index][field] = value;

    setProductions(updated);
  };

  const removeProductionRow = (index) => setProductions((prev) => prev.filter((_, i) => i !== index));

  const addProductionRow = () => {
    setProductions([
      ...productions,
      { name: "", quantity: "", unit: "", value: "" },
    ]);
  };

  // ================= FORMAT DATE =================

  const formatDate = (date) => {
    if (!date) return "";

    if (typeof date === "string" && date.length === 10) return date;

    const d = new Date(date);

    if (isNaN(d.getTime())) return "";

    return d.toISOString().split("T")[0];
  };

  // ================= GENERATE =================

  const handleGenerate = async () => {
    try {
      if (!companyId) {
        alert("Company missing");
        return;
      }

      setLoading(true);

      const payload = {
        ...staticData,

        financialYear,

        fromDate: formatDate(fromDate),
        toDate: formatDate(toDate),
        date: formatDate(date),

        rawMaterials,

        products: productions,

        totalSales: totalSalesReceipt,
        tax: salesTax,
        electricity: electricityUnits,
        workers: workersEmployed,
        workingDays,
      };

      const apiUrl = `/documents/generate-production-extract/${companyId}`;

      let res;

      if (editMode) {
        res = await API.put(
          `/documents/edit-generated-document/${documentId}`,
          payload,
          {
            responseType: "blob",
          },
        );
      } else {
        res = await API.post(apiUrl, payload, {
          responseType: "blob",
        });
      }

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = blobUrl;

      const nextVersion = (existingDocument?.version || 1) + 1;

      link.setAttribute(
        "download",
        editMode
          ? `ProductionExtract_V${nextVersion}.xlsx`
          : "production_extract.xlsx",
      );

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);

      alert("Error generating Production Extract");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================

  return (
    <div className="document-form-theme min-h-screen bg-slate-50 px-3 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <FileText size={22} />
            </div>
            <div>
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Production Extract</h1>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${editMode ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                  {editMode ? "Edit document" : "New document"}
                </span>
              </div>
              <p className="max-w-2xl text-sm text-slate-500">Enter company information, production figures and yearly performance details.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/generate")}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} /> Back to Documents
          </button>
        </header>

        <div className="space-y-4">
          <Section number="01" title="Industry & company details" description="Basic information and authorized signatory.">
            <Grid>
              <Input label="Name of industry" name="nameOfIndustry" value={staticData.nameOfIndustry} onChange={handleStaticChange} />
              <Input label="Phone number" name="phone" value={staticData.phone} onChange={handleStaticChange} />
              <Input label="Factory address" name="factoryAddress" value={staticData.factoryAddress} onChange={handleStaticChange} />
              <Input label="Eligible products as per EC" name="eligibleProductsAsPerEC" value={staticData.eligibleProductsAsPerEC} onChange={handleStaticChange} />
              <Input label="Month & year production started" name="startMonthYear" value={staticData.startMonthYear} onChange={handleStaticChange} />
              <Input label="Constitution" name="constitution" value={staticData.constitution} onChange={handleStaticChange} />
              <Input label="Director address" name="directorAddress" value={staticData.directorAddress} onChange={handleStaticChange} />
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Authorized signatory</label>
                <select
                  value={staticData.authorizedSignatory}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    const signatory = selectedCompanyData?.authorizedSignatories?.find((item) => item.name === selectedName);
                    setStaticData((prev) => ({ ...prev, authorizedSignatory: selectedName, authorizedSignatoryRole: signatory?.role || "" }));
                  }}
                  className={fieldClass}
                >
                  <option value="">Select signatory</option>
                  {selectedCompanyData?.authorizedSignatories?.map((item, index) => (
                    <option key={item._id || index} value={item.name}>{item.name}</option>
                  ))}
                </select>
              </div>
              <Input label="Authorized signatory role" name="authorizedSignatoryRole" value={staticData.authorizedSignatoryRole} onChange={handleStaticChange} />
              <Input label="Place" name="place" value={staticData.place} onChange={handleStaticChange} />
            </Grid>
          </Section>

          <Section number="02" title="Products & annual capacity" description="List the products manufactured and their annual capacity.">
            <div className="space-y-3">
              {staticData.productWithCapacity.map((item, index) => (
                <div key={index} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                  <Input label={`Product name ${index + 1}`} value={item.name || ""} onChange={(e) => {
                    const updated = [...staticData.productWithCapacity];
                    updated[index] = { ...updated[index], name: e.target.value };
                    setStaticData((prev) => ({ ...prev, productWithCapacity: updated }));
                  }} placeholder="Enter product name" />
                  <Input label="Annual capacity" value={item.capacity || ""} onChange={(e) => {
                    const updated = [...staticData.productWithCapacity];
                    updated[index] = { ...updated[index], capacity: e.target.value };
                    setStaticData((prev) => ({ ...prev, productWithCapacity: updated }));
                  }} placeholder="e.g. 100 MT" />
                  {staticData.productWithCapacity.length > 1 && (
                    <button type="button" onClick={() => setStaticData((prev) => ({ ...prev, productWithCapacity: prev.productWithCapacity.filter((_, i) => i !== index) }))} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-rose-200 px-3 text-sm font-medium text-rose-600 hover:bg-rose-50">
                      <Trash2 size={15} /> Remove
                    </button>
                  )}
                </div>
              ))}
              <AddButton onClick={() => setStaticData((prev) => ({ ...prev, productWithCapacity: [...prev.productWithCapacity, { name: "", capacity: "" }] }))}>Add product</AddButton>
            </div>
          </Section>

          <Section number="03" title="Fixed capital investment" description="Amounts in rupees lakhs.">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Land", "land"], ["Building", "building"], ["Plant & machinery", "plantMachinery"], ["Electricals", "electricals"], ["Other assets", "other"],
              ].map(([label, key]) => (
                <Input key={key} label={label} value={staticData.fixedCapitalInvestment[key]} onChange={(e) => setStaticData((prev) => ({ ...prev, fixedCapitalInvestment: { ...prev.fixedCapitalInvestment, [key]: e.target.value } }))} placeholder="Amount in lakhs" />
              ))}
            </div>
          </Section>

          <Section number="04" title="Finance & registrations" description="Banking, finance agency and statutory registration details.">
            <Grid>
              <Input label="Finance agency" name="financeAgency" value={staticData.financeAgency} onChange={handleStaticChange} />
              <Input label="Bank name" name="bankName" value={staticData.bankName} onChange={handleStaticChange} />
              <Input label="Working capital" name="workingCapital" value={staticData.workingCapital} onChange={handleStaticChange} />
              <Input label="SSI registration number" value={staticData.ssiRegistration?.number || ""} onChange={(e) => setStaticData((prev) => ({ ...prev, ssiRegistration: { ...prev.ssiRegistration, number: e.target.value } }))} />
              <Input label="Sales tax registration" value={staticData.registrations?.salesTax || ""} onChange={(e) => setStaticData((prev) => ({ ...prev, registrations: { ...prev.registrations, salesTax: e.target.value } }))} />
              <Input label="GST registration" value={staticData.registrations?.gst || ""} onChange={(e) => setStaticData((prev) => ({ ...prev, registrations: { ...prev.registrations, gst: e.target.value } }))} />
              <Input label="Factory Act registration" value={staticData.registrations?.factoryAct || ""} onChange={(e) => setStaticData((prev) => ({ ...prev, registrations: { ...prev.registrations, factoryAct: e.target.value } }))} />
              <Input label="Excise registration" value={staticData.registrations?.excise || ""} onChange={(e) => setStaticData((prev) => ({ ...prev, registrations: { ...prev.registrations, excise: e.target.value } }))} />
              <Input label="Pollution control number" value={staticData.registrations?.pollutionNo || ""} onChange={(e) => setStaticData((prev) => ({ ...prev, registrations: { ...prev.registrations, pollutionNo: e.target.value } }))} />
              <Input label="Pollution date" type="date" value={staticData.registrations?.pollutionDate || ""} onChange={(e) => setStaticData((prev) => ({ ...prev, registrations: { ...prev.registrations, pollutionDate: e.target.value } }))} />
              <Input label="Local NOC" value={staticData.registrations?.localNoc || ""} onChange={(e) => setStaticData((prev) => ({ ...prev, registrations: { ...prev.registrations, localNoc: e.target.value } }))} />
            </Grid>
          </Section>

          <Section number="05" title="Financial year" description="Define the reporting period for this extract.">
            <Grid>
              <Input label="Financial year" value={financialYear} onChange={(e) => setFinancialYear(e.target.value)} placeholder="e.g. 2025-26" />
              <Input label="From date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              <Input label="To date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              <Input label="Document date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Grid>
          </Section>

          <Section number="06" title="Main raw material consumed" description="Add each material, quantity, unit and value.">
            <DataTable data={rawMaterials} handleChange={handleRawChange} addRow={addRawRow} removeRow={removeRawRow} unitOptions={unitOptions} buttonText="Add raw material" />
          </Section>

          <Section number="07" title="Production of main end products" description="Record the production quantities and values for the period.">
            <DataTable data={productions} handleChange={handleProductionChange} addRow={addProductionRow} removeRow={removeProductionRow} unitOptions={unitOptions} buttonText="Add product" />
          </Section>

          <Section number="08" title="Performance figures" description="Yearly sales, tax, electricity, employment and operating days.">
            <Grid>
              <Input label="Total sales receipt (Rs. lakhs)" value={totalSalesReceipt} onChange={(e) => setTotalSalesReceipt(e.target.value)} />
              <Input label="Sales tax / GST paid" value={salesTax} onChange={(e) => setSalesTax(e.target.value)} />
              <Input label="Electricity units consumed" value={electricityUnits} onChange={(e) => setElectricityUnits(e.target.value)} />
              <Input label="Workers employed" value={workersEmployed} onChange={(e) => setWorkersEmployed(e.target.value)} />
              <Input label="Working days during year" value={workingDays} onChange={(e) => setWorkingDays(e.target.value)} />
            </Grid>
          </Section>
        </div>

        <DocumentFormFooter
          documentName="Production Extract"
          onCancel={() => navigate("/generate")}
          onGenerate={handleGenerate}
          loading={loading}
          editMode={editMode}
        />
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

const fieldClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

function Section({ number, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
        <span className="flex h-8 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-700">{number}</span>
        <div>
          <h2 className="text-sm font-bold text-slate-900 sm:text-base">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function Grid({ children }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Input({ label, value, onChange, name, type = "text", placeholder = "" }) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</label>
      <input type={type} name={name} value={value ?? ""} onChange={onChange} placeholder={placeholder} className={fieldClass} />
    </div>
  );
}

function AddButton({ onClick, children }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100">
      <Plus size={15} /> {children}
    </button>
  );
}

function DataTable({ data, handleChange, addRow, removeRow, unitOptions, buttonText }) {
  return (
    <div className="space-y-3">
      {data.map((row, index) => (
        <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Entry {index + 1}</span>
            {data.length > 1 && (
              <button type="button" onClick={() => removeRow(index)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50">
                <Trash2 size={13} /> Remove
              </button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input label="Name" value={row.name} onChange={(e) => handleChange(index, "name", e.target.value)} placeholder="Enter name" />
            <Input label="Quantity" value={row.quantity} onChange={(e) => handleChange(index, "quantity", e.target.value)} placeholder="Enter quantity" />
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Unit</label>
              <select value={row.unit} onChange={(e) => handleChange(index, "unit", e.target.value)} className={fieldClass}>
                <option value="">Select unit</option>
                {unitOptions.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
              </select>
            </div>
            <Input label="Value / amount" value={row.value} onChange={(e) => handleChange(index, "value", e.target.value)} placeholder="Enter value" />
          </div>
        </div>
      ))}
      <AddButton onClick={addRow}>{buttonText}</AddButton>
    </div>
  );
}
