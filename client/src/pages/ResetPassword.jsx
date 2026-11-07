import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff,
  Loader2, LockKeyhole, Mail, ShieldCheck
} from "lucide-react";
import API from "../services/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [form, setForm] = useState({ otp: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setForm((current) => ({
      ...current,
      [name]: name === "otp" ? value.replace(/\D/g, "").slice(0, 6) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    try {
      setLoading(true);
      setError("");
      const res = await API.post("/auth/reset-password", {
        email,
        otp: form.otp,
        password: form.password,
      });
      alert(res.data.msg);
      setForm({ otp: "", password: "" });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.msg || "Reset failed. Check your OTP and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#f4f7fc] text-slate-900 lg:grid lg:grid-cols-[0.85fr_1.15fr]">
      {/* Compact branding panel */}
      <aside className="relative hidden overflow-hidden bg-[#101d3a] text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_12%,rgba(61,122,255,0.25),transparent_40%),radial-gradient(ellipse_at_92%_85%,rgba(38,91,196,0.28),transparent_42%)]" />
        <div className="relative z-10 flex items-center gap-3 px-8 pt-7">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10"><ShieldCheck size={21} /></span>
          <div><p className="text-sm font-semibold">CA Portal</p><p className="text-[11px] text-blue-100/60">Document workspace</p></div>
        </div>
        <div className="relative z-10 px-8 py-8 xl:px-10">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-300/15 text-blue-100"><LockKeyhole size={23} /></div>
          <h1 className="max-w-sm text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">Secure access.<span className="block text-blue-300">Fresh start.</span></h1>
          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-300">Verify your code and set a new password for your account.</p>
          <div className="mt-7 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-3.5">
            <ShieldCheck size={18} className="text-emerald-300" />
            <div><p className="text-xs font-semibold">Protected account access</p><p className="mt-0.5 text-[11px] text-blue-100/60">Your credentials stay private.</p></div>
          </div>
        </div>
        <div className="relative z-10 flex justify-between px-8 pb-5 text-[10px] text-blue-100/40"><span>CA Portal</span><span>© {new Date().getFullYear()}</span></div>
      </aside>

      {/* Reset form */}
      <main className="flex min-h-dvh min-w-0 flex-col bg-[#f7f9fd]">
        <header className="flex items-center gap-2 border-b border-slate-200/70 bg-white px-4 py-2.5 lg:hidden">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white"><ShieldCheck size={17} /></span>
          <span className="text-sm font-semibold">CA Portal</span>
        </header>

        <div className="flex flex-1 items-center justify-center px-4 py-6 sm:px-8">
          <div className="w-full max-w-[390px]">
            <button type="button" onClick={() => navigate("/")} className="mb-5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-blue-700">
              <ArrowLeft size={14} /> Back to sign in
            </button>

            <div className="mb-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100"><LockKeyhole size={20} /></div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-blue-700">Account security</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">Reset password</h2>
              <p className="mt-1.5 text-sm text-slate-500">Verify your OTP and create a new password.</p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_14px_38px_-24px_rgba(15,23,42,0.24)] sm:p-5">
              <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-blue-100 bg-blue-50/70 px-3 py-2.5">
                <Mail size={15} className="shrink-0 text-blue-700" />
                <div className="min-w-0"><p className="text-[10px] text-slate-500">OTP sent to</p><p className="break-all text-xs font-semibold text-slate-800">{email || "Email not provided"}</p></div>
              </div>

              {error && <div role="alert" className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700"><AlertCircle size={14} className="mt-0.5 shrink-0" /><span>{error}</span></div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="block text-xs font-medium text-slate-700">Verification code</label>
                  <input id="otp" name="otp" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="Enter 6-digit OTP" value={form.otp} onChange={handleChange} disabled={loading} required className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-sm tracking-widest outline-none transition placeholder:tracking-normal placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60" />
                </div>

                <div>
                  <label htmlFor="password" className="block text-xs font-medium text-slate-700">New password</label>
                  <div className="relative mt-1.5">
                    <LockKeyhole size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Enter new password" value={form.password} onChange={handleChange} disabled={loading} required className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-9 pr-10 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60" />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700">{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="group inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 text-sm font-semibold text-white shadow-md shadow-blue-900/10 transition hover:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-70">
                  {loading ? <><Loader2 size={15} className="animate-spin" />Resetting...</> : <>Reset password <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" /></>}
                </button>
              </form>

              <div className="mt-4 flex items-start gap-2 border-t border-slate-100 pt-3"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-600" /><p className="text-[11px] leading-4 text-slate-500">Never share your OTP or password with anyone.</p></div>
            </div>
            <p className="mt-4 text-center text-[10px] text-slate-400">© {new Date().getFullYear()} CA Document Management System</p>
          </div>
        </div>
      </main>
    </div>
  );
}
