import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";
import {
  Building2,
  FileText,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const TEMPLATES = [
  {
    value: "covering-letter",
    label: "Covering Letter",
    route: "covering-letter-form",
    category: "General Documents",
  },
  {
    value: "appendix-a",
    label: "Appendix A",
    route: "appendix-a-form",
    category: "Appendices",
  },
  {
    value: "appendix-b",
    label: "Appendix B",
    route: "appendix-b-form",
    category: "Appendices",
  },
  {
    value: "appendix-c",
    label: "Appendix C",
    route: "appendix-c-form",
    category: "Appendices",
  },
  {
    value: "affidavit",
    label: "Affidavit",
    route: "affidavit-form",
    category: "General Documents",
  },
  {
    value: "bank-interest",
    label: "Bank Interest Certificate",
    route: "bank-interest-form",
    category: "Financial Documents",
  },
  {
    value: "power-subsidy",
    label: "Power Subsidy Annexure",
    route: "power-subsidy-form",
    category: "Subsidy Documents",
  },
  {
    value: "interest-subsidy",
    label: "Interest Subsidy Annexure",
    route: "interest-subsidy-form",
    category: "Subsidy Documents",
  },
  {
    value: "elp-form",
    label: "ELP Employment Form",
    route: "elp-form",
    category: "General Documents",
  },
  {
    value: "production-extract",
    label: "Production Extract",
    route: "production-extract-form",
    category: "Financial Documents",
  },
  {
    value: "disbursement-agreement",
    label: "Disbursement Agreement",
    route: "disbursement-agreement-form",
    category: "Financial Documents",
  },
];

export default function GenerateDocument() {
  const [searchParams] = useSearchParams();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(() => searchParams.get("companyId") || "");
  const [selectedTemplate, setSelectedTemplate] = useState(() => searchParams.get("template") || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================= FETCH COMPANIES =================

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await API.get("/companies");
      setCompanies(res.data);
    } catch (err) {
      console.error("COMPANY FETCH ERROR:", err);
      setError("Unable to load companies. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // ================= COMPANY CHANGE =================

  const handleCompanyChange = (e) => {
    setSelectedCompany(e.target.value);
    setSelectedTemplate("");
  };

  // ================= SELECTED DATA =================

  const selectedCompanyData = companies.find(
    (company) => company._id === selectedCompany,
  );

  const selectedTemplateData = TEMPLATES.find(
    (template) => template.value === selectedTemplate,
  );

  // ================= NAVIGATION =================

  const handleNavigation = () => {
    if (!selectedCompany) {
      alert("Please select company");
      return;
    }

    if (!selectedTemplateData) {
      alert("Please select a document template");
      return;
    }

    window.location.href = `/${selectedTemplateData.route}/${selectedCompany}`;
  };

  // ================= UI =================

  return (
    <div className="min-h-full pb-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* HEADER */}

        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-700">
              Document workflow
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Generate Document
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Choose a company and template to prepare a document.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchCompanies}
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </header>

        {/* ERROR MESSAGE */}

        {error && (
          <div role="alert" className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertCircle size={16} className="shrink-0" />
            <span className="flex-1">{error}</span>

            <button
              type="button"
              onClick={fetchCompanies}
              className="font-semibold underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        {/* MAIN CARD */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* CARD HEADER */}

          <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <FileText size={17} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Document Details
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Choose the company and document type.
              </p>
            </div>
          </div>

          {/* FORM */}

          <div className="space-y-6 p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* COMPANY */}

              <div>
                <label
                  htmlFor="company"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Company Name <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Building2
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    id="company"
                    value={selectedCompany}
                    onChange={handleCompanyChange}
                    disabled={loading}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  >
                    <option value="">
                      {loading ? "Loading companies..." : "Select a company"}
                    </option>

                    {companies.map((company) => (
                      <option key={company._id} value={company._id}>
                        {company.nameOfCompany}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCompanyData && (
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-600">
                    <CheckCircle2 size={12} />
                    Company selected
                  </p>
                )}
              </div>

              {/* TEMPLATE */}

              <div>
                <label
                  htmlFor="template"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Document Template <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <FileText
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    id="template"
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    disabled={!selectedCompany || loading}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">Select a template</option>

                    {[
                      "General Documents",
                      "Appendices",
                      "Financial Documents",
                      "Subsidy Documents",
                    ].map((category) => (
                      <optgroup key={category} label={category}>
                        {TEMPLATES.filter(
                          (template) => template.category === category,
                        ).map((template) => (
                          <option key={template.value} value={template.value}>
                            {template.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {!selectedCompany && (
                  <p className="mt-1.5 text-[11px] text-slate-400">
                    Select a company first.
                  </p>
                )}
              </div>
            </div>

            {/* SELECTED TEMPLATE PREVIEW */}

            {selectedTemplateData && (
              <div className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm ring-1 ring-slate-200">
                    <FileText size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {selectedTemplateData.label}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Company:{" "}
                      <span className="font-medium text-slate-700">
                        {selectedCompanyData?.nameOfCompany}
                      </span>
                    </p>
                  </div>
                </div>

                <span className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                  <CheckCircle2 size={12} />
                  Ready to open
                </span>
              </div>
            )}

            {/* ACTIONS */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                <span className="text-red-500">*</span> Required selections
              </p>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCompany("");
                    setSelectedTemplate("");
                  }}
                  disabled={!selectedCompany && !selectedTemplate}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Reset
                </button>

                <button
                  type="button"
                  onClick={handleNavigation}
                  disabled={!selectedCompany || !selectedTemplate || loading}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Open Document
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER NOTE */}

        <p className="px-1 text-xs text-slate-500">
          Select a company before choosing a document template.
        </p>
      </div>
    </div>
  );
}
