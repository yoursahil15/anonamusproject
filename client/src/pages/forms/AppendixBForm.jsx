import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import DocumentFormFooter from "../../components/DocumentFormFooter";
import {
  ArrowLeft,
  FileText,
  Building2,
  Phone,
  CalendarDays,
  Zap,
  Wallet,
  Sparkles,
  RefreshCw,
  Save,
  CheckCircle2,
} from "lucide-react";

export default function AppendixBForm({
  editMode = false,
  documentId = null,
  existingDocument = null,
}) {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const clientId = new URLSearchParams(useLocation().search).get("clientId");
  const [selectedCompanyData, setSelectedCompanyData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // ================= STATIC =================
    nameOfCompany: "",
    unitName: "",
    factoryAddress: "",
    factoryPhone: "",
    factoryEmail: "",
    officeAddress: "",
    officePhone: "",
    officeEmail: "",

    place: "",
    date: "",
    authorizedSignatory: "",
    authorizedSignatoryRole: "",

    ecNumber: "",
    ecDate: "",
    eligiblePeriod: { from: "", to: "" },

    subsidyClaimed: "",
    subsidyRate: 1,

    powerCompany: "",
    consumerNumber: "",
    connectionDate: "",
    tariffRate: "",

    meterNumber10: "",
    meterNumber11: "",

    periodOfClaim6: { from: "", to: "" },
    periodOfClaim9: { from: "", to: "" },

    // ================= DYNAMIC =================
    unitsConsumed10: "",
    chargesBilled10: "",
    chargesPaid10: "",

    unitsConsumed11: "",
    chargesBilled11: "",
    chargesPaid11: "",

    electricityWorking: Array.from({ length: 12 }, () => ({
      month: "",
      rate: "",
      units: "",
      billed: "",
      paid: "",
    })),
  });

  // ================= LOAD =================
  useEffect(() => {
    const load = async () => {
      if (!companyId) return;

      const res = await API.get(`/document-master/${companyId}/APPENDIX_B`);

      const companyRes = await API.get(`/companies/${companyId}`);

      setSelectedCompanyData(companyRes.data);

      const defaultSignatory =
        companyRes.data?.authorizedSignatories?.find((s) => s.isDefault) ||
        companyRes.data?.authorizedSignatories?.[0];

      if (res.data?.staticData) {
        setFormData((p) => ({
          ...p,
          ...res.data.staticData,

          authorizedSignatory:
            res.data.staticData.authorizedSignatory ||
            defaultSignatory?.name ||
            "",

          authorizedSignatoryRole:
            res.data.staticData.authorizedSignatoryRole ||
            defaultSignatory?.role ||
            "",
        }));
      }
    };

    load();
  }, [companyId]);

  useEffect(() => {
    if (!editMode || !existingDocument) return;

    const m = existingDocument.metadata || {};

    setFormData((prev) => ({
      ...prev,
      ...m,

      eligiblePeriod: m.eligiblePeriod || {
        from: "",
        to: "",
      },

      periodOfClaim6: m.periodOfClaim6 || {
        from: "",
        to: "",
      },

      periodOfClaim9: m.periodOfClaim9 || {
        from: "",
        to: "",
      },

      electricityWorking:
        m.electricityWorking ||
        Array.from({ length: 12 }, () => ({
          month: "",
          rate: "",
          units: "",
          billed: "",
          paid: "",
        })),
    }));
  }, [editMode, existingDocument]);

  // ================= HANDLER =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((p) => ({
      ...p,
      [name]: value,
    }));
  };

  const updateRow = (i, field, value) => {
    const copy = [...formData.electricityWorking];
    copy[i][field] = value;

    setFormData((p) => ({
      ...p,
      electricityWorking: copy,
    }));
  };

  // ================= GENERATE =================
  const handleGenerate = async () => {
    if (!companyId) {
      window.alert("Missing company ID.");
      return;
    }

    setLoading(true);
    try {
      let url = `/documents/generate-from-master/${companyId}/APPENDIX_B`;
      if (clientId) url += `?clientId=${encodeURIComponent(clientId)}`;

      const response = editMode
        ? await API.put(
            `/documents/edit-generated-document/${documentId}`,
            formData,
            { responseType: "blob" },
          )
        : await API.post(url, formData, { responseType: "blob" });

      const blobUrl = window.URL.createObjectURL(
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data]),
      );
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = editMode ? "APPENDIX_B_Updated.xlsx" : "APPENDIX_B.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
      console.error("Appendix B generation failed:", error);
      window.alert("Failed to generate Appendix B. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="document-form-theme min-h-screen bg-slate-50 px-3 py-4 sm:px-5 lg:px-7">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <FileText size={19} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Appendix B Form
                </h1>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                  {editMode ? "Edit document" : "Document form"}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Electricity subsidy claim and consumption details
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/generate")}
            className="inline-flex h-9 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={15} /> Back to Documents
          </button>
        </header>

        <div className="flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50/70 px-3 py-2.5">
          <CheckCircle2
            size={16}
            className="mt-0.5 shrink-0 text-emerald-700"
          />
          <p className="text-xs leading-5 text-slate-600">
            <span className="font-semibold text-slate-800">
              Before generating:
            </span>{" "}
            Review company, eligibility periods, subsidy details, and
            electricity consumption entries.
          </p>
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <SectionHeading
            icon={Building2}
            title="Company Details"
            description="Company identity, factory and office contact information."
          />
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Company Name"
              name="nameOfCompany"
              value={formData.nameOfCompany}
              onChange={handleChange}
            />
            <Field
              label="Unit Name"
              name="unitName"
              value={formData.unitName}
              onChange={handleChange}
            />
            <Field
              label="Factory Address"
              name="factoryAddress"
              value={formData.factoryAddress}
              onChange={handleChange}
            />
            <Field
              label="Office Address"
              name="officeAddress"
              value={formData.officeAddress}
              onChange={handleChange}
            />
            <Field
              label="EC Number"
              name="ecNumber"
              value={formData.ecNumber}
              onChange={handleChange}
            />
            <DateField
              label="EC Date"
              name="ecDate"
              value={formData.ecDate}
              onChange={handleChange}
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <SectionHeading
            icon={Phone}
            title="Contact Details"
            description="Factory and office contact information."
          />
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field
              label="Factory Phone"
              name="factoryPhone"
              value={formData.factoryPhone}
              onChange={handleChange}
              type="tel"
            />
            <Field
              label="Factory Email"
              name="factoryEmail"
              value={formData.factoryEmail}
              onChange={handleChange}
              type="email"
            />
            <Field
              label="Office Phone"
              name="officePhone"
              value={formData.officePhone}
              onChange={handleChange}
              type="tel"
            />
            <Field
              label="Office Email"
              name="officeEmail"
              value={formData.officeEmail}
              onChange={handleChange}
              type="email"
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <SectionHeading
            icon={CalendarDays}
            title="General & Signatory Details"
            description="Document date, location, and authorized signatory."
          />
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Place"
              name="place"
              value={formData.place}
              onChange={handleChange}
            />
            <DateField
              label="Date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
            <div className="min-w-0">
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Authorized Signatory
              </label>
              <select
                name="authorizedSignatory"
                value={formData.authorizedSignatory || ""}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const signatory =
                    selectedCompanyData?.authorizedSignatories?.find(
                      (item) => item.name === selectedName,
                    );
                  setFormData((prev) => ({
                    ...prev,
                    authorizedSignatory: selectedName,
                    authorizedSignatoryRole: signatory?.role || "",
                  }));
                }}
                className={fieldClass}
              >
                <option value="">Select signatory</option>
                {selectedCompanyData?.authorizedSignatories?.map(
                  (item, index) => (
                    <option key={item._id || index} value={item.name}>
                      {item.name}
                    </option>
                  ),
                )}
              </select>
            </div>
            <Field
              label="Authorized Signatory Role"
              name="authorizedSignatoryRole"
              value={formData.authorizedSignatoryRole}
              onChange={handleChange}
              readOnly
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <SectionHeading
            icon={Wallet}
            title="Subsidy & Eligibility"
            description="Claim amount, subsidy rate, and applicable periods."
          />
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="Subsidy Claimed"
                name="subsidyClaimed"
                value={formData.subsidyClaimed}
                onChange={handleChange}
              />
              <div className="min-w-0">
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Subsidy Rate
                </label>
                <select
                  name="subsidyRate"
                  value={formData.subsidyRate ?? ""}
                  onChange={handleChange}
                  className={fieldClass}
                >
                  <option value="">Select rate</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                </select>
              </div>
            </div>
            <PeriodCard
              title="Eligible Period"
              value={formData.eligiblePeriod}
              onChange={(key, value) =>
                setFormData((prev) => ({
                  ...prev,
                  eligiblePeriod: { ...prev.eligiblePeriod, [key]: value },
                }))
              }
            />
            <PeriodCard
              title="Claim 6% Period"
              value={formData.periodOfClaim6}
              onChange={(key, value) =>
                setFormData((prev) => ({
                  ...prev,
                  periodOfClaim6: { ...prev.periodOfClaim6, [key]: value },
                }))
              }
            />
            <PeriodCard
              title="Claim 9% Period"
              value={formData.periodOfClaim9}
              onChange={(key, value) =>
                setFormData((prev) => ({
                  ...prev,
                  periodOfClaim9: { ...prev.periodOfClaim9, [key]: value },
                }))
              }
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <SectionHeading
            icon={Zap}
            title="Electricity Connection Details"
            description="Power provider, meter identifiers, and tariff information."
          />
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Power Company"
              name="powerCompany"
              value={formData.powerCompany}
              onChange={handleChange}
            />
            <Field
              label="Consumer Number"
              name="consumerNumber"
              value={formData.consumerNumber}
              onChange={handleChange}
            />
            <DateField
              label="Connection Date"
              name="connectionDate"
              value={formData.connectionDate}
              onChange={handleChange}
            />
            <Field
              label="Tariff Rate"
              name="tariffRate"
              value={formData.tariffRate}
              onChange={handleChange}
            />
            <Field
              label="Meter Number 10"
              name="meterNumber10"
              value={formData.meterNumber10}
              onChange={handleChange}
            />
            <Field
              label="Meter Number 11"
              name="meterNumber11"
              value={formData.meterNumber11}
              onChange={handleChange}
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <SectionHeading
            icon={Wallet}
            title="Electricity Charges"
            description="Units consumed and billed/paid charges for blocks 10 and 11."
          />
          <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-3">
              <h3 className="mb-3 text-xs font-bold text-slate-800">
                Block 10
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field
                  label="Units Consumed"
                  name="unitsConsumed10"
                  value={formData.unitsConsumed10}
                  onChange={handleChange}
                />
                <Field
                  label="Electricity Charges Billed"
                  name="chargesBilled10"
                  value={formData.chargesBilled10}
                  onChange={handleChange}
                />
                <Field
                  label="Electricity Charges Paid"
                  name="chargesPaid10"
                  value={formData.chargesPaid10}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <h3 className="mb-3 text-xs font-bold text-slate-800">
                Block 11
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field
                  label="Units Consumed"
                  name="unitsConsumed11"
                  value={formData.unitsConsumed11}
                  onChange={handleChange}
                />
                <Field
                  label="Electricity Charges Billed"
                  name="chargesBilled11"
                  value={formData.chargesBilled11}
                  onChange={handleChange}
                />
                <Field
                  label="Electricity Charges Paid"
                  name="chargesPaid11"
                  value={formData.chargesPaid11}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <SectionHeading
            icon={CalendarDays}
            title="Monthly Electricity Working"
            description="Enter month-wise rate, units consumed, billed charges, and paid charges. Each month is shown in a responsive card to avoid horizontal scrolling."
          />
          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {formData.electricityWorking.map((row, index) => (
              <div
                key={index}
                className="rounded-lg border border-slate-200 p-3"
              >
                <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-slate-800">
                    Month {index + 1}
                  </h3>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">
                    {row.month || "Not selected"}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="min-w-0 sm:col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Month
                    </label>
                    <input
                      type="month"
                      value={
                        row.month
                          ? (() => {
                              const [monthName, shortYear] =
                                row.month.split("-");
                              const monthIndex = [
                                "Jan",
                                "Feb",
                                "Mar",
                                "Apr",
                                "May",
                                "Jun",
                                "Jul",
                                "Aug",
                                "Sep",
                                "Oct",
                                "Nov",
                                "Dec",
                              ].indexOf(monthName);
                              return monthIndex >= 0 && shortYear
                                ? `20${shortYear}-${String(monthIndex + 1).padStart(2, "0")}`
                                : "";
                            })()
                          : ""
                      }
                      onChange={(e) => {
                        if (!e.target.value) {
                          updateRow(index, "month", "");
                          return;
                        }
                        const [year, month] = e.target.value.split("-");
                        const monthNames = [
                          "Jan",
                          "Feb",
                          "Mar",
                          "Apr",
                          "May",
                          "Jun",
                          "Jul",
                          "Aug",
                          "Sep",
                          "Oct",
                          "Nov",
                          "Dec",
                        ];
                        updateRow(
                          index,
                          "month",
                          `${monthNames[Number(month) - 1]}-${year.slice(-2)}`,
                        );
                      }}
                      className={fieldClass}
                    />
                  </div>
                  <Field
                    label="Rate"
                    value={row.rate}
                    onChange={(e) => updateRow(index, "rate", e.target.value)}
                  />
                  <Field
                    label="Units"
                    value={row.units}
                    onChange={(e) => updateRow(index, "units", e.target.value)}
                  />
                  <Field
                    label="Billed"
                    value={row.billed}
                    onChange={(e) => updateRow(index, "billed", e.target.value)}
                  />
                  <Field
                    label="Paid"
                    value={row.paid}
                    onChange={(e) => updateRow(index, "paid", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <DocumentFormFooter
          documentName="Appendix B"
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

const fieldClass =
  "h-9 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:bg-slate-50";

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  readOnly = false,
}) {
  return (
    <div className="min-w-0">
      {label && (
        <label className="mb-1 block text-xs font-semibold text-slate-600">
          {label}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        readOnly={readOnly}
        className={`${fieldClass} ${readOnly ? "bg-slate-50" : ""}`}
      />
    </div>
  );
}

function DateField({ label, name, value, onChange }) {
  return (
    <Field
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      type="date"
    />
  );
}

function PeriodCard({ title, value = {}, onChange }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <h3 className="mb-3 text-xs font-semibold text-slate-800">{title}</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            From
          </label>
          <input
            type="date"
            value={value.from || ""}
            onChange={(e) => onChange("from", e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            To
          </label>
          <input
            type="date"
            value={value.to || ""}
            onChange={(e) => onChange("to", e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>
    </div>
  );
}
