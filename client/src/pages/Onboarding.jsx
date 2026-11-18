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
    <main className="onboarding-page min-h-screen px-4 py-8 sm:px-6">
      <header className="onboarding-topbar mx-auto mb-8 flex max-w-5xl items-center justify-between border px-5 py-4">
        <div className="flex items-center gap-3"><span className="onboarding-mark" /><div><p className="text-sm font-semibold text-slate-800">Cashflow</p><p className="text-xs text-slate-500">Office workspace</p></div></div>
        <span className="text-[10px] font-bold tracking-[.12em] text-teal-700">OFFICE SETUP</span>
      </header>
      <section className="onboarding-card mx-auto max-w-3xl border bg-white p-6 sm:p-9">
        <p className="text-xs font-semibold tracking-[.12em] text-orange-600">
          Firm setup · Step {step} of 4
        </p>
        <div className="onboarding-progress mt-3 h-1.5 bg-slate-100">
          <div
            className="h-1.5 transition-all"
            style={{ width: `${step * 25}%` }}
          />
        </div>
        <h1 className="mt-7 text-2xl font-normal text-slate-800 sm:text-[28px]">{titles[step - 1]}</h1>
        <p className="mt-2 text-sm text-slate-500">
          Save each step and return later. Optional details can be completed
          later.
        </p>
        <div className="onboarding-fields mt-7 grid gap-x-5 gap-y-4 sm:grid-cols-2">
          {step === 1 && (
            <>
              {field("Firm name", null, "name", true)}
              <label className="block text-sm font-medium text-slate-700">
                Firm type
                <select
                  className="mt-1.5 w-full border bg-white px-3 py-2.5 outline-none"
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
        {error && <p className="mt-5 border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</p>}
        <div className="mt-8 flex justify-between border-t border-slate-100 pt-5">
          <button
            disabled={step === 1 || busy}
            onClick={() => setStep((s) => s - 1)}
            className="onboarding-back border px-4 py-2.5 text-sm disabled:opacity-40"
          >
            Back
          </button>
          <button
            disabled={busy}
            onClick={save}
            className="onboarding-submit px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {busy
              ? "Saving…"
              : step === 4
                ? "Complete setup"
                : "Save and continue"}
          </button>
        </div>
      </section>
      <style>{`
        .onboarding-page { background:#ececec; color:#333; font-family:Roboto,Arial,sans-serif; }
        .onboarding-topbar { background:#fff; border-color:#e6e6e6; box-shadow:0 1px 3px #0000000d; }
        .onboarding-mark { width:32px; height:32px; display:block; background:linear-gradient(135deg,#e8591e 0 48%,#14a085 49% 100%); }
        .onboarding-card { border-color:#e6e6e6; border-radius:2px; box-shadow:0 1px 3px #00000014; }
        .onboarding-progress > div { background:#14a085; }
        .onboarding-fields input,.onboarding-fields select { border-color:#e6e6e6; border-radius:3px; color:#333; }
        .onboarding-fields input:focus,.onboarding-fields select:focus { border-color:#14a085; box-shadow:0 0 0 2px #14a08522; }
        .onboarding-back { border-color:#ddd; border-radius:2px; color:#555; }
        .onboarding-submit { background:#14a085; border-radius:2px; }
        .onboarding-submit:hover { background:#118a73; }
        @media(max-width:640px) { .onboarding-page { padding-top:16px; } .onboarding-topbar { margin-bottom:20px; } }
      `}</style>
    </main>
  );
}
