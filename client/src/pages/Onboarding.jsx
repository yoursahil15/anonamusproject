import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const defaults = {
  name: "",
  firmType: "Proprietorship",
  contactEmail: "",
  contactNumber: "",
  address: { country: "India", state: "", city: "", office: "", pinCode: "" },
  professionalDetails: {
    frn: "",
    membershipNumber: "",
    primaryContact: "",
    designation: "",
    gstin: "",
  },
  businessDetails: {
    employees: "",
    clients: "",
    documentTypes: [],
    activities: "",
    workflow: "",
  },
  settings: {
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    currency: "INR",
  },
};
export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(defaults);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    API.get("/auth/onboarding")
      .then(({ data: r }) => {
        setStep(r.tenant.onboardingStep || 1);
        setData((d) => ({
          ...d,
          ...r.tenant,
          address: { ...d.address, ...r.tenant.address },
          professionalDetails: {
            ...d.professionalDetails,
            ...r.tenant.professionalDetails,
          },
          businessDetails: {
            ...d.businessDetails,
            ...r.tenant.businessDetails,
          },
          settings: { ...d.settings, ...r.tenant.settings },
        }));
      })
      .catch(() => {});
  }, []);
  const set = (section, key, value) =>
    setData((d) =>
      section
        ? { ...d, [section]: { ...d[section], [key]: value } }
        : { ...d, [key]: value },
    );
  const save = async () => {
    setError("");
    setBusy(true);
    const section = [
      null,
      "address",
      "professionalDetails",
      "businessDetails",
      "settings",
    ][step];
    const payload =
      step === 1
        ? {
            name: data.name,
            firmType: data.firmType,
            contactEmail: data.contactEmail,
            contactNumber: data.contactNumber,
            address: data.address,
          }
        : { [section]: data[section] };
    try {
      const { data: r } = await API.put("/auth/onboarding", {
        step,
        data: payload,
      });
      if (r.completed) {
        navigate("/tenant-dashboard", { replace: true });
        return;
      }
      setStep((s) => s + 1);
    } catch (e) {
      setError(e.response?.data?.msg || "Unable to save these details.");
    } finally {
      setBusy(false);
    }
  };
  const field = (label, section, key, required = false, type = "text") => (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        required={required}
        type={type}
        value={section ? data[section]?.[key] || "" : data[key] || ""}
        onChange={(e) => set(section, key, e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-600"
      />
    </label>
  );
  const titles = [
    "Basic firm information",
    "Professional information",
    "Business requirements",
    "Account configuration",
  ];
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <p className="text-sm font-semibold text-blue-700">
          Firm setup · Step {step} of 4
        </p>
        <div className="mt-3 h-1.5 rounded-full bg-slate-100">
          <div
            className="h-1.5 rounded-full bg-blue-700 transition-all"
            style={{ width: `${step * 25}%` }}
          />
        </div>
        <h1 className="mt-6 text-2xl font-semibold">{titles[step - 1]}</h1>
        <p className="mt-2 text-sm text-slate-500">
          Save each step and return later. Optional details can be completed
          later.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {step === 1 && (
            <>
              {field("Firm name", null, "name", true)}
              <label className="block text-sm font-medium">
                Firm type
                <select
                  className="mt-1.5 w-full rounded-xl border p-2.5"
                  value={data.firmType}
                  onChange={(e) => set(null, "firmType", e.target.value)}
                >
                  {[
                    "Proprietorship",
                    "Partnership",
                    "LLP",
                    "Private Limited",
                    "Other",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              {field("Business email", null, "contactEmail", true, "email")}
              {field("Contact number", null, "contactNumber", true)}
              {[
                ["Country", "country"],
                ["State", "state"],
                ["City", "city"],
                ["Office address", "office"],
                ["PIN code", "pinCode"],
              ].map(([label, key]) =>
                field(label, "address", key, key === "country"),
              )}
            </>
          )}
          {step === 2 && (
            <>
              {field(
                "CA Firm Registration Number (optional)",
                "professionalDetails",
                "frn",
              )}
              {field(
                "ICAI membership number (optional)",
                "professionalDetails",
                "membershipNumber",
              )}
              {field(
                "Primary contact person (optional)",
                "professionalDetails",
                "primaryContact",
              )}
              {field(
                "Professional designation (optional)",
                "professionalDetails",
                "designation",
              )}
              {field("GSTIN (optional)", "professionalDetails", "gstin")}
            </>
          )}
          {step === 3 && (
            <>
              {field(
                "Number of employees (optional)",
                "businessDetails",
                "employees",
              )}
              {field(
                "Approximate number of clients (optional)",
                "businessDetails",
                "clients",
              )}
              {field(
                "Document types generated (optional)",
                "businessDetails",
                "documentTypes",
              )}
              {field(
                "Main business activities (optional)",
                "businessDetails",
                "activities",
              )}
              {field(
                "Preferred document workflow (optional)",
                "businessDetails",
                "workflow",
              )}
            </>
          )}
          {step === 4 && (
            <>
              {field("Timezone", "settings", "timezone")}
              {field("Date format", "settings", "dateFormat")}
              {field("Currency", "settings", "currency")}
            </>
          )}
        </div>
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        <div className="mt-7 flex justify-between">
          <button
            disabled={step === 1 || busy}
            onClick={() => setStep((s) => s - 1)}
            className="rounded-xl border px-4 py-2.5 text-sm disabled:opacity-40"
          >
            Back
          </button>
          <button
            disabled={busy}
            onClick={save}
            className="rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-medium text-white"
          >
            {busy
              ? "Saving…"
              : step === 4
                ? "Complete setup"
                : "Save and continue"}
          </button>
        </div>
      </section>
    </main>
  );
}
