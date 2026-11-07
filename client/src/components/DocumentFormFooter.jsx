import { ArrowRight, CheckCircle2, LoaderCircle } from "lucide-react";

export default function DocumentFormFooter({
  documentName,
  onCancel,
  onGenerate,
  loading = false,
  editMode = false,
  cancelDisabled = false,
}) {
  const actionText = editMode
    ? `Update ${documentName}`
    : `Generate ${documentName}`;

  return (
    <footer className="flex min-w-0 flex-col gap-4 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <p className="flex min-w-0 items-start gap-2 text-sm leading-5 text-slate-600">
        <CheckCircle2
          size={18}
          className="mt-0.5 shrink-0 text-blue-600"
          aria-hidden="true"
        />
        <span>
          Review the details before generating the {documentName} document.
        </span>
      </p>

      <div className="flex w-full shrink-0 flex-col-reverse gap-2 sm:w-auto sm:flex-row">
        <button
          type="button"
          onClick={onCancel}
          disabled={cancelDisabled}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onGenerate}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <LoaderCircle size={16} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              {actionText}
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </footer>
  );
}
