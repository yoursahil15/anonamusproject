import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", mobile: "", termsAccepted: false });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [needsResend, setNeedsResend] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await API.post("/auth/register", form);
      setMessage(result.data.msg);
      setNeedsResend(result.data.verificationEmailSent === false);
    } catch (err) {
      setError(err.response?.data?.msg || "Registration failed. Check your details and try again.");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setBusy(true);
    setError("");
    try {
      const result = await API.post("/auth/resend-verification", { email: form.email });
      setMessage(result.data.msg);
      setNeedsResend(false);
    } catch (err) {
      setError(err.response?.data?.msg || "Could not resend the verification email.");
    } finally {
      setBusy(false);
    }
  };

  const input = "w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";
  const fields = [["name", "Full name", "text"], ["email", "Work email", "email"], ["mobile", "Mobile number (optional)", "tel"], ["password", "Password (at least 8 characters)", "password"], ["confirmPassword", "Confirm password", "password"]];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <section className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-blue-700">CA Portal</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">Create your firm account</h1>
        <p className="mt-2 text-sm text-slate-500">Start with your account. You’ll add firm details after verifying your email.</p>
        {message ? (
          <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
            {message}
            {needsResend && <button type="button" disabled={busy} onClick={resend} className="mt-3 block font-semibold underline disabled:opacity-60">{busy ? "Sending…" : "Resend verification email"}</button>}
            {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={submit}>
            {fields.map(([key, label, type]) => (
              <label key={key} className="block text-sm font-medium text-slate-700">
                {label}
                <input required={key !== "mobile"} className={`${input} mt-1.5`} type={type} autoComplete={key.toLowerCase().includes("password") ? "new-password" : key === "email" ? "email" : "name"} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
              </label>
            ))}
            <label className="flex items-start gap-2 text-sm text-slate-600">
              <input className="mt-1" type="checkbox" checked={form.termsAccepted} onChange={(event) => setForm({ ...form, termsAccepted: event.target.checked })} />
              I accept the Terms and Conditions.
            </label>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button disabled={busy} className="w-full rounded-xl bg-blue-700 px-4 py-3 font-medium text-white disabled:opacity-60">{busy ? "Creating account…" : "Create account"}</button>
          </form>
        )}
        <p className="mt-6 text-center text-sm text-slate-500">Already registered? <Link className="font-medium text-blue-700" to="/">Sign in</Link></p>
      </section>
    </main>
  );
}
