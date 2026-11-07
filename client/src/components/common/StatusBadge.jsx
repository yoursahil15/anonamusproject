const STATUS_STYLES = {
  DRAFT: "bg-slate-100 text-slate-700 ring-slate-200",
  PENDING_CHECK: "bg-amber-50 text-amber-800 ring-amber-200",
  CHECKED: "bg-blue-50 text-blue-700 ring-blue-200",
  PENDING_APPROVAL: "bg-violet-50 text-violet-700 ring-violet-200",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED_BY_CHECKER: "bg-red-50 text-red-700 ring-red-200",
  REJECTED_BY_APPROVER: "bg-red-50 text-red-700 ring-red-200",
};

const formatStatus = (status) =>
  String(status || "UNKNOWN")
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function StatusBadge({ status, className = "" }) {
  const normalized = String(status || "").toUpperCase();
  const style = STATUS_STYLES[normalized] || "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${style} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {formatStatus(normalized)}
    </span>
  );
}
