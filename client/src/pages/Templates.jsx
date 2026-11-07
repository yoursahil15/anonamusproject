import { FileText, Download, Plus } from "lucide-react";
import { useState } from "react";

export default function Templates() {
  const [templates, setTemplates] = useState([
    {
      key: "COVERING_LETTER",
      name: "Covering Letter",
      file: "/templates/covering-letter.docx",
    },
    {
      key: "BANK_INTEREST_CERTIFICATE",
      name: "Bank Interest Certificate",
      file: "/templates/bank-interest.xlsx",
    },
    {
      key: "APPENDIX_A",
      name: "Appendix A",
      file: "/templates/appendix-a.xlsx",
    },
    {
      key: "APPENDIX_B",
      name: "Appendix B",
      file: "/templates/appendix-b.xlsx",
    },
    {
      key: "APPENDIX_C",
      name: "Appendix C",
      file: "/templates/appendix-c.xlsx", // ✅ FIXED
    },
    {
      key: "AFFIDAVIT",
      name: "Affidavit",
      file: "/templates/affidavit.docx",
    },
    {
      key: "POWER_SUBSIDY",
      name: "Power Subsidy",
      file: "/templates/power-subsidy.xlsx",
    },
    {
      key: "INTEREST_SUBSIDY",
      name: "Interest Subsidy",
      file: "/templates/interest-subsidy.xlsx",
    },
    {
      key: "ELP_FORM",
      name: "ELP Form",
      file: "/templates/elp.xlsx",
    },
    {
      key: "PRODUCTION_EXTRACT",
      name: "Production Extract",
      file: "/templates/production-extract.xlsx",
    },
    {
      key: "DISBURSEMENT_AGREEMENT",
      name: "Disbursement Agreement",
      file: "/templates/disbursement-agreement.rtf",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    file: "",
  });

  const addTemplate = () => {
    if (!newTemplate.name || !newTemplate.file) return;

    setTemplates([
      ...templates,
      {
        key: newTemplate.name.toUpperCase().replace(/ /g, "_"),
        name: newTemplate.name,
        file: newTemplate.file,
      },
    ]);

    setNewTemplate({ name: "", file: "" });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="text-blue-600" />
          <h1 className="text-2xl font-bold">Templates</h1>
        </div>

        {/* ADD BUTTON */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Template
        </button>
      </div>

      {/* ADD FORM */}
      {showForm && (
        <div className="bg-white p-4 rounded-xl border space-y-3">
          <input
            type="text"
            placeholder="Template Name"
            value={newTemplate.name}
            onChange={(e) =>
              setNewTemplate({ ...newTemplate, name: e.target.value })
            }
            className="w-full border p-2 rounded"
          />

          <input
            type="text"
            placeholder="File URL (.docx / .xlsx)"
            value={newTemplate.file}
            onChange={(e) =>
              setNewTemplate({ ...newTemplate, file: e.target.value })
            }
            className="w-full border p-2 rounded"
          />

          <button
            onClick={addTemplate}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Save Template
          </button>
        </div>
      )}

      {/* TEMPLATE LIST */}
      <div className="space-y-4">
        {templates.map((template, index) => (
          <div
            key={index}
            className="w-full bg-white rounded-xl shadow-sm hover:shadow-md transition border px-6 py-4 flex items-center justify-between"
          >
            {/* LEFT */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText className="text-blue-600" />
              </div>

              <h2 className="text-lg font-semibold text-blue-600">
                {template.name}
              </h2>
            </div>

            {/* DOWNLOAD */}
            <a
              href={template.file}
              download
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition text-sm font-medium"
            >
              <Download size={16} />
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
