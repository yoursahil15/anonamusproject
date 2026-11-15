import { useState } from "react";
import { Link } from "react-router-dom";
import { KeyRound, Mail, Phone, UserRound } from "lucide-react";
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

  const fields = [
    ["name", "Full name", "text", UserRound],
    ["email", "Work email", "email", Mail],
    ["mobile", "Mobile number (optional)", "tel", Phone],
    ["password", "Password (at least 8 characters)", "password", KeyRound],
    ["confirmPassword", "Confirm password", "password", KeyRound],
  ];

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#d5d5d5] px-4 py-8 sm:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "radial-gradient(ellipse at 12% 84%, #8a8a8a 0 10%, transparent 36%), radial-gradient(ellipse at 90% 72%, #969696 0 14%, transparent 40%), linear-gradient(170deg, #dedede 0 57%, #bcbcbc 58%, #d3d3d3 70%, #a5a5a5 71%, #d0d0d0 83%)" }} />
      <section className="relative grid w-full max-w-[920px] overflow-hidden shadow-2xl md:min-h-[570px] md:grid-cols-2">
        <div className="flex flex-col bg-[#1B2223] px-7 py-8 sm:px-12 sm:py-10">
          <Link to="/" className="mx-auto inline-flex items-center gap-2 text-base font-medium text-white/75" aria-label="CA Portal home">
            <span className="relative inline-block h-4 w-4 bg-[#14a085] before:absolute before:-right-1 before:-top-1 before:h-3 before:w-2 before:bg-[#e8591e]" />
            CA Portal
          </Link>
          <h1 className="mt-8 text-center text-lg font-medium text-[#2bb3c0]">Create your account</h1>
          <p className="mt-2 text-center text-xs leading-5 text-slate-400">Start with your account. You can add firm details after verifying your email.</p>

          {message ? (
            <div role="status" className="mt-7 rounded-sm border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm leading-6 text-emerald-100">
              {message}
              {needsResend && <button type="button" disabled={busy} onClick={resend} className="mt-3 block font-semibold text-[#2bb3c0] underline disabled:opacity-60">{busy ? "Sending…" : "Resend verification email"}</button>}
              {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
            </div>
          ) : (
            <form className="mt-7 space-y-3" onSubmit={submit}>
              {fields.map(([key, label, type, Icon]) => (
                <label key={key} className="flex overflow-hidden rounded-sm bg-[#454c4d] focus-within:ring-2 focus-within:ring-[#2bb3c0]">
                  <span className="flex w-14 shrink-0 items-center justify-center border-r border-white/15 text-slate-300"><Icon size={15} /></span>
                  <input required={key !== "mobile"} aria-label={label} placeholder={label} className="min-w-0 flex-1 bg-transparent px-4 py-4 text-sm text-white outline-none placeholder:text-slate-400 focus:bg-white/[0.03]" type={type} autoComplete={key.toLowerCase().includes("password") ? "new-password" : key === "email" ? "email" : key === "mobile" ? "tel" : "name"} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
                </label>
              ))}
              <label className="flex items-start gap-2 pt-1 text-xs leading-5 text-slate-200">
                <input className="mt-1 accent-[#2bb3c0]" type="checkbox" checked={form.termsAccepted} onChange={(event) => setForm({ ...form, termsAccepted: event.target.checked })} />
                <span>I agree to the <a href="#terms" onClick={(event) => event.preventDefault()} className="text-[#e8591e]">Terms and Conditions</a>.</span>
              </label>
              {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
              <button disabled={busy} className="w-full rounded-sm bg-[#2bb3c0] px-5 py-4 text-sm font-semibold uppercase text-white transition hover:bg-[#239eaa] disabled:opacity-60">{busy ? "Creating account…" : "Register"}</button>
            </form>
          )}
          <p className="mt-auto pt-8 text-center text-xs text-slate-400">CA Portal · Secure account registration</p>
        </div>

        <div className="relative flex min-h-64 items-end overflow-hidden bg-gradient-to-br from-sky-500 via-cyan-700 to-sky-950 px-8 py-10 sm:px-10 md:min-h-0">
          <div aria-hidden="true" className="absolute inset-0 opacity-80" style={{ background: "linear-gradient(180deg, #91d8ed55, transparent 42%), radial-gradient(ellipse at 72% 20%, #d7f5ff55, transparent 35%)" }} />
          <svg aria-hidden="true" viewBox="0 0 700 500" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
            <path d="M0 170 95 110 150 140 245 65 318 124 405 48 495 118 575 54 700 120V500H0Z" fill="#2f91b7" opacity=".55" />
            <path d="m0 240 100-65 72 42 105-88 83 61 92-81 97 78 81-56 70 45V500H0Z" fill="#08749d" opacity=".72" />
            <path d="m0 315 95-72 78 40 93-58 97 76 97-82 84 68 77-58 79 48V500H0Z" fill="#07577e" opacity=".86" />
            <path d="m0 386 109-50 77 39 96-54 93 57 100-63 83 54 70-40 72 45v126H0Z" fill="#063f64" />
          </svg>
          <div className="relative z-10 max-w-sm text-white">
            <h2 className="text-3xl font-light sm:text-4xl">Already have an account?</h2>
            <p className="mt-3 text-sm leading-6 text-white/90">Sign in to continue to your document workspace.</p>
            <Link to="/" className="mt-5 inline-flex rounded-sm border border-white/50 bg-white/15 px-5 py-2.5 text-sm font-semibold uppercase text-white transition hover:bg-white/25">Login now</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
