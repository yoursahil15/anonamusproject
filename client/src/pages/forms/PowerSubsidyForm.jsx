import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import DocumentFormFooter from "../../components/DocumentFormFooter";
import { ArrowLeft, FileText, Building2, CalendarDays, Landmark, RefreshCw, Save, CheckCircle2, Plus, Trash2 } from "lucide-react";

export default function PowerSubsidyForm({
  editMode = false,
  documentId = null,
  existingDocument = null,
}) {
  const params = useParams();
  const navigate = useNavigate();
  const companyId = params.companyId || existingDocument?.company?._id;

  // ================= STATIC FIELDS =================

  const [nameOfCompany, setNameOfCompany] = useState("");

  const [certificateNo, setCertificateNo] = useState("");

  const [factoryAddress, setFactoryAddress] = useState("");

  const [place, setPlace] = useState("");
  const [authorizedSignatory, setAuthorizedSignatory] = useState("");
  const [authorizedSignatoryRole, setAuthorizedSignatoryRole] = useState("");

  const [authorizedSignatories, setAuthorizedSignatories] = useState([]);

  const [membershipNumber, setMembershipNumber] = useState("");

  // ================= DYNAMIC =================

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  const [totalElectricityPaid, setTotalElectricityPaid] = useState("");

  const [electricityCharges, setElectricityCharges] = useState("");

  const [udin, setUdin] = useState("");

  const [dateOfUdin, setDateOfUdin] = useState("");

  const [loading, setLoading] = useState(false);

  // ================= MONTH TABLE =================

  const [monthsData, setMonthsData] = useState([
    {
      month: "",
      rate: "",
      units: "",
      billed: "",
      paid: "",
      subsidy: "",
    },
  ]);

  // ================= LOAD MASTER =================

  useEffect(() => {
    if (editMode) return;

    const loadMasterData = async () => {
      if (!companyId) return;

      try {
        const res = await API.get(
          `/document-master/${companyId}/POWER_SUBSIDY`,
        );

        if (res.data?.staticData) {
          const s = res.data.staticData;

          setNameOfCompany(s.nameOfCompany || "");

          setCertificateNo(s.certificateNo || "");

          setFactoryAddress(s.factoryAddress || "");

          setPlace(s.place || "");
          // ================= LOAD COMPANY =================

          const companyRes = await API.get(`/companies/${companyId}`);

          const company = companyRes.data;

          const signatories = company.authorizedSignatories || [];

          setAuthorizedSignatories(signatories);

          // DEFAULT SIGNATORY
          const defaultSignatory =
            signatories.find((s) => s.isDefault) || signatories[0];

          // PREFILL
          setAuthorizedSignatory(defaultSignatory?.name || "");
          setAuthorizedSignatoryRole(defaultSignatory?.role || "");

          setMembershipNumber(s.membershipNumber || "");
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

    setCertificateNo(m.certificateNo || "");

    setFactoryAddress(m.factoryAddress || "");

    setPlace(m.place || "");

    setAuthorizedSignatory(m.authorizedSignatory || "");

    setAuthorizedSignatoryRole(m.authorizedSignatoryRole || "");

    setMembershipNumber(m.membershipNumber || "");

    setFromDate(toInputDateFormat(m.fromDate));

    setToDate(toInputDateFormat(m.toDate));

    setTotalElectricityPaid(m.totalElectricityPaid || "");

    setElectricityCharges(m.electricityCharges || "");

    setUdin(m.udin || "");

    setDateOfUdin(toInputDateFormat(m.dateOfUdin));

    setMonthsData(
      m.monthsData?.length
        ? m.monthsData
        : [
            {
              month: "",
              rate: "",
              units: "",
              billed: "",
              paid: "",
              subsidy: "",
            },
          ],
    );
  }, [editMode, existingDocument]);

  // ================= MONTH CHANGE =================

  const handleMonthChange = (index, field, value) => {
    const updated = [...monthsData];

    updated[index][field] = value;

    setMonthsData(updated);
  };

  // ================= ADD ROW =================

  const addRow = () => {
    setMonthsData([
      ...monthsData,
      {
        month: "",
        rate: "",
        units: "",
        billed: "",
        paid: "",
        subsidy: "",
      },
    ]);
  };

  // ================= REMOVE =================

  const removeRow = (index) => {
    const updated = monthsData.filter((_, i) => i !== index);

    setMonthsData(updated);
  };

  // ================= GENERATE =================

  const handleGeneratePowerDoc = async () => {
    try {
      setLoading(true);

      const formData = {
        nameOfCompany,

        certificateNo,

        factoryAddress,

        place,
        authorizedSignatory,
        authorizedSignatoryRole,

        membershipNumber,

        fromDate,

        toDate,

        totalElectricityPaid,

        electricityCharges,

        udin,

        dateOfUdin,

        monthsData,
      };

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
          `/documents/generate-power-subsidy/${companyId}`,
          formData,
          {
            responseType: "blob",
          },
        );
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");

      link.href = url;

      const nextVersion = (existingDocument?.version || 1) + 1;

      link.setAttribute(
        "download",
        editMode ? `PowerSubsidy_V${nextVersion}.docx` : "PowerSubsidy.docx",
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
  function toInputDateFormat(value) {
    if (!value) return "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    try {
      const parts = value.split(/[./-]/);

      if (parts.length !== 3) return "";
    

      const [dd, mm, yyyy] = parts.map(Number);

      if (dd < 1 || dd > 31 || mm < 1 || mm > 12 || yyyy < 1000 || yyyy > 9999) return "";

      return `${yyyy}-${mm.toString().padStart(2, "0")}-${dd.toString().padStart(2, "0")}`;
    } catch (error) {
      console.error("Error parsing date:", error);
      return "";
    }
  }

      // ================= UI =================

  const inputClass =
    "w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
  const labelClass = "mb-1 block text-xs font-semibold text-slate-600";

  return (
    <div className="document-form-theme min-h-screen bg-slate-50 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <FileText size={22} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">Power Subsidy Certificate</h1>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {editMode ? "Edit document" : "Document form"}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">Enter company details, certification period, and monthly electricity subsidy data.</p>
            </div>
          </div>
          <button onClick={() => navigate("/generate")} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50">
            <ArrowLeft size={16} /> Back to Documents
          </button>
        </header>

        <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-700" />
          <div>
            <p className="text-sm font-semibold text-slate-700">Complete all required details before generating</p>
            <p className="mt-0.5 text-xs leading-5 text-slate-600">Company information can be prefilled from master data. Review the dates and monthly schedule before generating the Word document.</p>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <SectionHeading icon={Building2} title="Company Details" description="Static information used in the certificate." />
          <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            <InputField label="Name of Company" value={nameOfCompany} setValue={setNameOfCompany} />
            <InputField label="Factory Address" value={factoryAddress} setValue={setFactoryAddress} />
            <InputField label="Place" value={place} setValue={setPlace} />
            <InputField label="Membership Number" value={membershipNumber} setValue={setMembershipNumber} />
            <InputField label="Certificate Number" value={certificateNo} setValue={setCertificateNo} />
            <div>
              <label className={labelClass}>Authorized Signatory</label>
              <select value={authorizedSignatory} onChange={(e) => {
                const selectedName = e.target.value;
                setAuthorizedSignatory(selectedName);
                const selected = authorizedSignatories.find((s) => s.name === selectedName);
                setAuthorizedSignatoryRole(selected?.role || "");
              }} className={inputClass}>
                <option value="">Select signatory</option>
                {authorizedSignatories.map((s, index) => <option key={index} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <InputField label="Authorized Signatory Role" value={authorizedSignatoryRole} setValue={setAuthorizedSignatoryRole} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <SectionHeading icon={CalendarDays} title="Certification & UDIN Details" description="Set the certification period and supporting reference details." />
          <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            <DateField label="From Date" value={fromDate} setValue={setFromDate} />
            <DateField label="To Date" value={toDate} setValue={setToDate} />
            <InputField label="Total Electricity Paid" value={totalElectricityPaid} setValue={setTotalElectricityPaid} />
            <InputField label="Electricity Charges" value={electricityCharges} setValue={setElectricityCharges} />
            <InputField label="UDIN" value={udin} setValue={setUdin} />
            <DateField label="Date of UDIN" value={dateOfUdin} setValue={setDateOfUdin} />
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <SectionHeading icon={Landmark} title="Monthly Electricity Details" description="Add one row for each month included in the subsidy schedule." />
            <button type="button" onClick={addRow} className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3.5 text-sm font-semibold text-white transition hover:bg-emerald-800">
              <Plus size={16} /> Add Month
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  {["#", "Month", "Rate", "Units", "Billed", "Paid", "Subsidy", "Action"].map((heading) => (
                    <th key={heading} className="border-b border-slate-200 px-3 py-3 font-bold">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthsData.map((row, index) => (
                  <tr key={index} className="transition hover:bg-slate-50/70">
                    <td className="border-b border-slate-100 px-3 py-2 text-xs font-semibold text-slate-400">{String(index + 1).padStart(2, "0")}</td>
                    {Object.keys(row).map((field) => (
                      <td key={field} className="border-b border-slate-100 px-2 py-2">
                        {field === "month" ? (
                          <input type="month" onChange={(e) => {
                            const value = e.target.value;
                            if (value) {
                              const [year, month] = value.split("-");
                              const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                              const formattedMonth = `${monthNames[parseInt(month) - 1]}-${year.slice(-2)}`;
                              handleMonthChange(index, field, formattedMonth);
                            }
                          }} className="h-8 w-full min-w-[130px] rounded-md border border-slate-200 px-2 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                        ) : (
                          <input type="text" value={row[field]} onChange={(e) => handleMonthChange(index, field, e.target.value)} className="h-8 w-full min-w-[85px] rounded-md border border-slate-200 px-2 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                        )}
                      </td>
                    ))}
                    <td className="border-b border-slate-100 px-3 py-2 text-center">
                      <button type="button" onClick={() => removeRow(index)} aria-label={`Remove month row ${index + 1}`} className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-rose-50 hover:text-rose-600">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            {monthsData.length} {monthsData.length === 1 ? "monthly entry" : "monthly entries"} added
          </div>
        </section>

        <DocumentFormFooter
          documentName="Power Subsidy Certificate"
          onCancel={() => navigate("/generate")}
          onGenerate={handleGeneratePowerDoc}
          loading={loading}
          editMode={editMode}
        />
      </div>
    </div>
  );
}

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-emerald-700"><Icon size={18} /></div>
      <div>
        <h2 className="text-sm font-bold text-slate-800">{title}</h2>
        <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  );
}
/* INPUT COMPONENT */
function InputField({ label, value, setValue }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>

      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
    </div>
  );
}

function DateField({ label, value, setValue }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>

      <input
        type="date"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
    </div>
  );
}

function SelectField({ label, value, setValue, options }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>

      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      >
        <option value="">Select</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
