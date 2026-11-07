import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  FileText,
  Download,
  Trash2,
  Eye,
  ArrowLeft,
  Building2,
  Search,
  RefreshCw,
  CheckCircle2,
  Files,
  CalendarDays,
  AlertCircle,
  Inbox,
  X,
} from "lucide-react";

function SummaryCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-slate-500">{label}</p>
        <p className="text-xl font-bold leading-tight text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ title, description, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <Icon size={23} />
      </div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-sm text-xs text-slate-500">{description}</p>
    </div>
  );
}

export default function GeneratedDocumentsPage() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [downloadingId, setDownloadingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  // ================= LOAD DATA =================

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [companyRes, docRes] = await Promise.all([
        API.get("/companies"),
        API.get("/documents/generated"),
      ]);

      setCompanies(Array.isArray(companyRes.data) ? companyRes.data : []);

      const approvedDocs = Array.isArray(docRes.data)
        ? docRes.data.filter((doc) => doc.status === "APPROVED")
        : [];

      setDocuments(approvedDocs);
    } catch (err) {
      console.error("Load Error:", err);
      setError("Unable to load generated documents. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ================= COMPANY DOCUMENTS =================

  const getCompanyDocuments = useCallback(
    (companyId) =>
      documents.filter(
        (doc) => String(doc.company?._id) === String(companyId),
      ),
    [documents],
  );

  const selectedCompanyDocuments = useMemo(() => {
    if (!selectedCompany) return [];
    return getCompanyDocuments(selectedCompany._id);
  }, [selectedCompany, getCompanyDocuments]);

  // ================= SEARCH =================

  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return companies;

    return companies.filter((company) => {
      const name = company.nameOfCompany || "";
      const companyDocuments = getCompanyDocuments(company._id);

      return (
        name.toLowerCase().includes(query) ||
        companyDocuments.some(
          (doc) =>
            (doc.documentType || "").toLowerCase().includes(query) ||
            (doc.fileName || "").toLowerCase().includes(query),
        )
      );
    });
  }, [companies, search, getCompanyDocuments]);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return selectedCompanyDocuments;

    return selectedCompanyDocuments.filter(
      (doc) =>
        (doc.documentType || "").toLowerCase().includes(query) ||
        (doc.fileName || "").toLowerCase().includes(query),
    );
  }, [selectedCompanyDocuments, search]);

  // ================= DELETE DOCUMENT =================

  const handleDelete = async (id) => {
    if (deletingId) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this generated document?",
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      setError("");

      await API.delete(`/documents/generated/${id}`);

      setDocuments((current) => current.filter((doc) => doc._id !== id));
    } catch (err) {
      console.error("Delete Error:", err);
      setError(
        err.response?.data?.msg ||
          "Unable to delete this document. Please try again.",
      );
    } finally {
      setDeletingId("");
    }
  };

  // ================= DOWNLOAD DOCUMENT =================

  const handleDownload = async (doc) => {
    if (downloadingId) return;

    let objectUrl;

    try {
      setDownloadingId(doc._id);
      setError("");

      const response = await API.get(
        `/documents/generated/${doc._id}/file`,
        { responseType: "blob" },
      );

      objectUrl = URL.createObjectURL(response.data);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = doc.fileName || doc.documentType || "document";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download Error:", err);

      setError(
        err.response?.status === 410
          ? "This legacy document needs to be migrated to server storage."
          : "Document download failed. Please try again.",
      );
    } finally {
      if (objectUrl) {
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      }
      setDownloadingId("");
    }
  };

  // ================= DATE FORMAT =================

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "Date unavailable";

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ================= SUMMARY =================

  const totalApprovedDocuments = documents.length;
  const companiesWithDocuments = companies.filter((company) =>
    documents.some(
      (doc) => String(doc.company?._id) === String(company._id),
    ),
  ).length;

  // ================= UI =================

  return (
    <div className="min-h-full ">
      <div className="mx-auto max-w-[1500px] space-y-4">
        {/* HEADER */}

        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Files size={20} />
            </div>

            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                {selectedCompany
                  ? selectedCompany.nameOfCompany
                  : "Generated Documents"}
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                {selectedCompany
                  ? "View, download, and manage approved documents."
                  : "Access and manage your approved company documents."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedCompany && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCompany(null);
                  setSearch("");
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">Companies</span>
                <span className="sm:hidden">Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              title="Refresh documents"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          </div>
        </header>

        {/* SUMMARY */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SummaryCard
            icon={FileText}
            label="Approved Documents"
            value={totalApprovedDocuments}
            tone="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            icon={Building2}
            label="Companies with Documents"
            value={companiesWithDocuments}
            tone="bg-emerald-50 text-emerald-600"
          />
        </div>

        {/* ERROR */}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700"
          >
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="rounded p-0.5 hover:bg-red-100"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* MAIN CONTENT */}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* TOOLBAR */}

          <div className="flex flex-col gap-3 border-b border-slate-200 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                {selectedCompany ? "Company Documents" : "Companies"}
              </h2>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {selectedCompany
                  ? `${filteredDocuments.length} approved document${
                      filteredDocuments.length === 1 ? "" : "s"
                    }`
                  : `${filteredCompanies.length} compan${
                      filteredCompanies.length === 1 ? "y" : "ies"
                    } available`}
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={
                  selectedCompany
                    ? "Search documents..."
                    : "Search companies or documents..."
                }
                aria-label={
                  selectedCompany
                    ? "Search company documents"
                    : "Search companies and documents"
                }
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* CONTENT */}

          <div className="p-3 sm:p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <RefreshCw
                  size={22}
                  className="mb-3 animate-spin text-blue-600"
                />
                <p className="text-sm font-semibold text-slate-700">
                  Loading documents
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Please wait while we fetch your data.
                </p>
              </div>
            ) : !selectedCompany ? (
              filteredCompanies.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="No companies found"
                  description="Try a different search term or refresh the list."
                />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredCompanies.map((company) => {
                    const count = getCompanyDocuments(company._id).length;

                    return (
                      <button
                        key={company._id}
                        type="button"
                        onClick={() => setSelectedCompany(company)}
                        className="group flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-left transition hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition group-hover:bg-blue-100">
                            <Building2 size={19} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {company.nameOfCompany || "Unnamed Company"}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-500">
                              {count} approved document{count === 1 ? "" : "s"}
                            </p>
                          </div>
                        </div>

                        <Eye
                          size={17}
                          className="shrink-0 text-slate-400 transition group-hover:text-blue-600"
                        />
                      </button>
                    );
                  })}
                </div>
              )
            ) : filteredDocuments.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No approved documents found"
                description="This company has no documents matching your search."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        Document
                      </th>
                      <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        Uploaded
                      </th>
                      <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                      <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredDocuments.map((doc) => (
                      <tr
                        key={doc._id}
                        className="align-middle transition-colors hover:bg-slate-50/70"
                      >
                        <td className="px-3 py-3">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-600">
                              <FileText size={17} />
                            </div>

                            <div className="min-w-0">
                              <p
                                className="max-w-[280px] truncate text-xs font-semibold text-slate-800"
                                title={doc.documentType}
                              >
                                {doc.documentType || "Untitled Document"}
                              </p>
                              <p
                                className="mt-1 max-w-[280px] truncate text-[11px] text-slate-400"
                                title={doc.fileName}
                              >
                                {doc.fileName || "File name unavailable"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <CalendarDays
                              size={13}
                              className="shrink-0 text-slate-400"
                            />
                            <span className="whitespace-nowrap">
                              {formatDate(doc.uploadedAt)}
                            </span>
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                            <CheckCircle2 size={12} />
                            Approved
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDownload(doc)}
                              disabled={Boolean(downloadingId || deletingId)}
                              title="Download document"
                              aria-label={`Download ${doc.documentType || "document"}`}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {downloadingId === doc._id ? (
                                <RefreshCw
                                  size={13}
                                  className="animate-spin"
                                />
                              ) : (
                                <Download size={13} />
                              )}
                              <span>Download</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(doc._id)}
                              disabled={Boolean(deletingId || downloadingId)}
                              title="Delete document"
                              aria-label={`Delete ${doc.documentType || "document"}`}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId === doc._id ? (
                                <RefreshCw
                                  size={13}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* FOOTER */}

          {!loading && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/70 px-4 py-2.5">
              <p className="text-[10px] text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {selectedCompany
                    ? filteredDocuments.length
                    : filteredCompanies.length}
                </span>{" "}
                {selectedCompany ? "documents" : "companies"}
              </p>

              <span className="text-[10px] text-slate-400">
                Only approved documents are displayed.
              </span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}