import { useEffect, useState } from "react";
import API from "../services/api";
import { useParams } from "react-router-dom";
import { Landmark } from "lucide-react";

export default function AddBank() {
  const { companyId } = useParams();

  const [banks, setBanks] = useState([]);

  const [bankForm, setBankForm] = useState({
    companyId,

    bankName: "",
    ifsc: "",
    accountNumber: "",
    bankCity: "",
    bankAddress: "",
    bankState: "",
  });

  // ================= FETCH BANKS =================

  const fetchBanks = async () => {
    try {
      const res = await API.get(`/banks/${companyId}`);

      setBanks(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  // ================= HANDLE CHANGE =================

  const handleChange = (e) => {
    setBankForm({
      ...bankForm,
      [e.target.name]: e.target.value,
    });
  };

  // ================= ADD BANK =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/banks", bankForm);

      alert("Bank Added Successfully");

      fetchBanks();
    } catch (err) {
      alert(err.response?.data?.msg || "Bank add failed");
    }
  };
const handleDeleteBank = async (bankId) => {
  try {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this loan account?"
    );

    if (!confirmDelete) return;

    await API.delete(`/banks/${bankId}`);

    alert("Bank deleted successfully");

    fetchBanks(selectedCompany._id);
  } catch (error) {
    console.log(error);

    alert(
      error.response?.data?.msg ||
        "Failed to delete bank"
    );
  }
};
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Landmark className="text-blue-600" />

        <h1 className="text-2xl font-bold">Add Bank Details</h1>
      </div>

      {/* BANK FORM */}

      <div className="bg-white p-6 rounded-xl shadow">
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-3">
          <input
            name="bankName"
            placeholder="Bank Name"
            onChange={handleChange}
            className="border px-2 h-7 text-sm rounded-md"
            required
          />

          <input
            name="ifsc"
            placeholder="IFSC Code"
            onChange={handleChange}
            className="border px-2 h-7 text-sm rounded-md uppercase"
            maxLength={11}
            required
          />

          <input
            name="accountNumber"
            placeholder="Account Number"
            onChange={handleChange}
            className="border px-2 h-7 text-sm rounded-md"
            required
          />

          <input
            name="bankCity"
            placeholder="Bank City"
            onChange={handleChange}
            className="border px-2 h-7 text-sm rounded-md"
            required
          />

          <input
            name="bankAddress"
            placeholder="Bank Address"
            onChange={handleChange}
            className="border px-2 h-7 text-sm rounded-md"
            required
          />

          <input
            name="bankState"
            placeholder="Bank State"
            onChange={handleChange}
            className="border px-2 h-7 text-sm rounded-md"
            required
          />

          <button
            type="submit"
            className="md:col-span-2 bg-green-600 text-white h-8 text-sm rounded-md"
          >
            Add Bank
          </button>
        </form>
      </div>

      {/* BANK LIST */}

      {banks.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-4">Bank List</h2>

          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border">Bank</th>
                <th className="p-3 border">IFSC</th>
                <th className="p-3 border">Account</th>
              </tr>
            </thead>

            <tbody>
              {banks.map((b) => (
                <tr key={b._id}>
                  <td className="p-3 border">{b.bankName}</td>

                  <td className="p-3 border">{b.ifsc}</td>

                  <td className="p-3 border">{b.accountNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
