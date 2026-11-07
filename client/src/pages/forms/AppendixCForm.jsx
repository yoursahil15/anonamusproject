import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import DocumentFormFooter from "../../components/DocumentFormFooter";

export default function AppendixCForm({
  editMode = false,
  documentId = null,
  existingDocument = null,
}) {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  // ================= COMPANY =================
  const [selectedCompanyData, setSelectedCompanyData] = useState(null);

  // ================= FORM =================
  const [form, setForm] = useState({
    // STATIC
    unitName: "",

    factoryAddress: "",
    factoryPhone: "",
    factoryEmail: "",

    officeAddress: "",
    officePhone: "",
    officeEmail: "",

    bankDetails: [],

    ecNumber: "",
    ecDate: "",

    authorizedSignatory: "",
    authorizedSignatoryRole: "",

    place: "",

    // DYNAMIC
    periodFrom: "",
    periodTo: "",

    interestCharged: "",
    interestPaid: "",

    interestFrom: "",
    interestTo: "",

    date: "",
  });

  // =========================================================
  // LOAD MASTER DATA
  // =========================================================

  useEffect(() => {
    const load = async () => {
      try {
        if (!companyId) return;

        // ================= DOCUMENT MASTER =================

        const res = await API.get(`/document-master/${companyId}/APPENDIX_C`);

        // ================= COMPANY =================

        const companyRes = await API.get(`/companies/${companyId}`);

        const company = companyRes.data;

        setSelectedCompanyData(company);

        // ================= DEFAULT SIGNATORY =================

        const defaultSignatory =
          company?.authorizedSignatories?.find((s) => s.isDefault) ||
          company?.authorizedSignatories?.[0];

        // ================= MASTER DATA =================

        const data = res.data?.staticData || {};

        setForm((prev) => ({
          ...prev,

          // ================= COMPANY =================
          unitName: data.unitName || data.nameOfCompany || "",

          factoryAddress: data.factoryAddress || "",

          factoryPhone: data.factoryPhone || data.contactNumber || "",

          factoryEmail: data.factoryEmail || company.email || "",

          officeAddress:
            data.officeAddress || data.registeredOfficeAddress || "",

          officePhone: data.officePhone || data.contactNumber || "",

          officeEmail: data.officeEmail || company.email || "",

          // ================= EC =================
          ecNumber: data.ecNumber || "",

          ecDate: data.ecDate || "",

          // ================= SIGNATORY =================
          authorizedSignatory:
            data.authorizedSignatory ||
            data.directorName ||
            defaultSignatory?.name ||
            "",

          authorizedSignatoryRole:
            data.authorizedSignatoryRole ||
            data.directorRole ||
            defaultSignatory?.role ||
            "",

          // ================= PLACE =================
          place: data.place || "",

          // ================= BANK DETAILS =================
          bankDetails: data.bankDetails?.length > 0 ? data.bankDetails : [],
        }));
      } catch (error) {
        console.log("APPENDIX C LOAD ERROR:", error);
      }
    };

    load();
  }, [companyId]);

  useEffect(() => {
  if (!editMode || !existingDocument) return;

  const m = existingDocument.metadata || {};

  setForm((prev) => ({
    ...prev,

    unitName: m.unitName || "",
    factoryAddress: m.factoryAddress || "",
    factoryPhone: m.factoryPhone || "",
    factoryEmail: m.factoryEmail || "",

    officeAddress: m.officeAddress || "",
    officePhone: m.officePhone || "",
    officeEmail: m.officeEmail || "",

    bankDetails: m.bankDetails || [],

    ecNumber: m.ecNumber || "",
    ecDate: m.ecDate || "",

    authorizedSignatory:
      m.authorizedSignatory || "",

    authorizedSignatoryRole:
      m.authorizedSignatoryRole || "",

    place: m.place || "",

    periodFrom:
      m.periodOfClaim?.from ||
      m.periodFrom ||
      "",

    periodTo:
      m.periodOfClaim?.to ||
      m.periodTo ||
      "",

    interestCharged:
      m.interestDetails?.[0]?.interestCharged ||
      m.interestCharged ||
      "",

    interestPaid:
      m.interestDetails?.[0]?.interestPaid ||
      m.interestPaid ||
      "",

    interestFrom:
      m.interestDetails?.[0]?.period?.from ||
      m.interestFrom ||
      "",

    interestTo:
      m.interestDetails?.[0]?.period?.to ||
      m.interestTo ||
      "",

    date: m.date || "",
  }));
}, [editMode, existingDocument]);

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handle = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // HANDLE BANK TABLE
  // =========================================================

  const handleBankChange = (index, field, value) => {
    const updated = [...form.bankDetails];

    updated[index][field] = value;

    setForm((prev) => ({
      ...prev,
      bankDetails: updated,
    }));
  };

  // =========================================================
  // GENERATE
  // =========================================================

  const handleGenerate = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const payload = {
        ...form,

        // ================= PERIOD =================
        periodOfClaim: {
          from: form.periodFrom,
          to: form.periodTo,
        },

        // ================= INTEREST =================
        interestDetails: [
          {
            interestCharged: Number(form.interestCharged || 0),

            interestPaid: Number(form.interestPaid || 0),

            period: {
              from: form.interestFrom,
              to: form.interestTo,
            },
          },
        ],
      };

     let res;

if (editMode) {
  res = await API.put(
    `/documents/edit-generated-document/${documentId}`,
    payload,
    {
      responseType: "blob",
    }
  );
} else {
  res = await API.post(
    `/documents/generate-from-master/${companyId}/APPENDIX_C`,
    payload,
    {
      responseType: "blob",
    }
  );
}
      const blob = new Blob([res.data]);

      const link = document.createElement("a");

      link.href = URL.createObjectURL(blob);

      link.download = "APPENDIX_C.xlsx";

      link.click();
    } catch (error) {
      console.log("APPENDIX C GENERATE ERROR:", error);

      alert("Failed to generate Appendix C");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="document-form-theme p-6 bg-gray-50 min-h-screen text-xs">
      <div className="bg-white p-5 rounded-xl shadow-md">
        {/* HEADER */}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-indigo-700">
            Appendix C Form
          </h2>

          <button
            onClick={() => navigate("/generate")}
            className="
      bg-blue-600
      hover:bg-blue-700
      text-white
      px-5
      py-2
      rounded-lg
      shadow
      transition
    "
          >
            ← Back
          </button>
        </div>
        {/* ========================================================= */}
        {/* STATIC DETAILS */}
        {/* ========================================================= */}

        <Section title="Static Details (Prefilled)">
          <Grid>
            <Field
              label="Unit Name"
              name="unitName"
              value={form.unitName}
              onChange={handle}
            />

            <Field
              label="Factory Address"
              name="factoryAddress"
              value={form.factoryAddress}
              onChange={handle}
            />

            <Field
              label="Factory Phone"
              name="factoryPhone"
              value={form.factoryPhone}
              onChange={handle}
            />

            <Field
              label="Factory Email"
              name="factoryEmail"
              value={form.factoryEmail}
              onChange={handle}
            />

            <Field
              label="Office Address"
              name="officeAddress"
              value={form.officeAddress}
              onChange={handle}
            />

            <Field
              label="Office Phone"
              name="officePhone"
              value={form.officePhone}
              onChange={handle}
            />

            <Field
              label="Office Email"
              name="officeEmail"
              value={form.officeEmail}
              onChange={handle}
            />

            {/* ========================================================= */}
            {/* BANK DETAILS TABLE */}
            {/* ========================================================= */}

            <div className="col-span-2">
              <label className="text-[10px] text-gray-500 mb-1 block">
                Loan Bank Details
              </label>

              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full border-collapse text-xs">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2">Bank / PFI</th>

                      <th className="border p-2">Loan A/C No.</th>

                      <th className="border p-2">Loan Date</th>

                      <th className="border p-2">Sanctioned Amount</th>

                      <th className="border p-2">Loan Balance</th>

                      <th className="border p-2">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(form.bankDetails || []).map((bank, index) => (
                      <tr key={index}>
                        {/* BANK NAME */}

                        <td className="border p-1">
                          <input
                            type="text"
                            value={bank.bankName || ""}
                            onChange={(e) =>
                              handleBankChange(
                                index,
                                "bankName",
                                e.target.value,
                              )
                            }
                            className="w-full border rounded p-1 text-xs"
                          />
                        </td>

                        {/* ACCOUNT */}

                        <td className="border p-1">
                          <input
                            type="text"
                            value={bank.loanAccountNumber || ""}
                            onChange={(e) =>
                              handleBankChange(
                                index,
                                "loanAccountNumber",
                                e.target.value,
                              )
                            }
                            className="w-full border rounded p-1 text-xs"
                          />
                        </td>

                        {/* DATE */}

                        <td className="border p-1">
                          <input
                            type="date"
                            value={bank.loanSanctionDate || ""}
                            onChange={(e) =>
                              handleBankChange(
                                index,
                                "loanSanctionDate",
                                e.target.value,
                              )
                            }
                            className="w-full border rounded p-1 text-xs"
                          />
                        </td>

                        {/* SANCTIONED */}

                        <td className="border p-1">
                          <input
                            type="text"
                            value={bank.sanctionedAmount || ""}
                            onChange={(e) =>
                              handleBankChange(
                                index,
                                "sanctionedAmount",
                                e.target.value,
                              )
                            }
                            className="w-full border rounded p-1 text-xs"
                          />
                        </td>

                        {/* BALANCE */}

                        <td className="border p-1">
                          <input
                            type="text"
                            value={bank.loanBalance || ""}
                            onChange={(e) =>
                              handleBankChange(
                                index,
                                "loanBalance",
                                e.target.value,
                              )
                            }
                            className="w-full border rounded p-1 text-xs"
                          />
                        </td>

                        {/* DELETE */}

                        <td className="border p-1 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...form.bankDetails];

                              updated.splice(index, 1);

                              setForm((prev) => ({
                                ...prev,
                                bankDetails: updated,
                              }));
                            }}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                          >
                            X
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ADD ROW */}

              <button
                type="button"
                onClick={() => {
                  setForm((prev) => ({
                    ...prev,

                    bankDetails: [
                      ...(prev.bankDetails || []),

                      {
                        bankName: "",
                        loanAccountNumber: "",
                        loanSanctionDate: "",
                        sanctionedAmount: "",
                        loanBalance: "",
                      },
                    ],
                  }));
                }}
                className="mt-2 bg-green-600 text-white px-4 py-1 rounded text-xs"
              >
                + Add Loan
              </button>
            </div>

            {/* EC */}

            <Field
              label="EC Number"
              name="ecNumber"
              value={form.ecNumber}
              onChange={handle}
            />

            <Field
              label="EC Date"
              type="date"
              name="ecDate"
              value={form.ecDate}
              onChange={handle}
            />

            {/* ========================================================= */}
            {/* AUTHORIZED SIGNATORY */}
            {/* ========================================================= */}

            <div>
              <label className="text-[10px] text-gray-500">
                Authorized Signatory
              </label>

              <select
                name="authorizedSignatory"
                value={form.authorizedSignatory}
                onChange={(e) => {
                  const selectedName = e.target.value;

                  const signatory =
                    selectedCompanyData?.authorizedSignatories?.find(
                      (s) => s.name === selectedName,
                    );

                  setForm((prev) => ({
                    ...prev,

                    authorizedSignatory: selectedName,

                    authorizedSignatoryRole: signatory?.role || "",
                  }));
                }}
                className="border w-full p-1 rounded text-xs"
              >
                <option value="">Select</option>

                {selectedCompanyData?.authorizedSignatories?.map((s, index) => (
                  <option key={index} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ROLE */}

            <Field
              label="Authorized Signatory Role"
              name="authorizedSignatoryRole"
              value={form.authorizedSignatoryRole}
              onChange={handle}
            />

            {/* PLACE */}

            <Field
              label="Place"
              name="place"
              value={form.place}
              onChange={handle}
            />
          </Grid>
        </Section>

        {/* ========================================================= */}
        {/* DYNAMIC DETAILS */}
        {/* ========================================================= */}

        <Section title="Dynamic Details">
          <Grid>
            <Field
              label="Period From"
              type="date"
              name="periodFrom"
              value={form.periodFrom}
              onChange={handle}
            />

            <Field
              label="Period To"
              type="date"
              name="periodTo"
              value={form.periodTo}
              onChange={handle}
            />

            <Field
              label="Interest Charged"
              name="interestCharged"
              value={form.interestCharged}
              onChange={handle}
            />

            <Field
              label="Interest Paid"
              name="interestPaid"
              value={form.interestPaid}
              onChange={handle}
            />

            <Field
              label="Interest From"
              type="date"
              name="interestFrom"
              value={form.interestFrom}
              onChange={handle}
            />

            <Field
              label="Interest To"
              type="date"
              name="interestTo"
              value={form.interestTo}
              onChange={handle}
            />

            <Field
              label="Date"
              type="date"
              name="date"
              value={form.date}
              onChange={handle}
            />
          </Grid>
        </Section>

      </div>
      <div className="mx-auto mt-4 max-w-6xl">
        <DocumentFormFooter
          documentName="Appendix C"
          onCancel={() => navigate("/generate")}
          onGenerate={handleGenerate}
          loading={loading}
          editMode={editMode}
        />
      </div>
    </div>
  );
}

/* ========================================================= */
/* UI COMPONENTS */
/* ========================================================= */

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <h2 className="font-semibold text-gray-700 border-b pb-1 mb-3">
        {title}
      </h2>

      {children}
    </div>
  );
}

function Grid({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="text-[10px] text-gray-500">{label}</label>

      <input {...props} className="border w-full p-1.5 text-xs rounded" />
    </div>
  );
}
