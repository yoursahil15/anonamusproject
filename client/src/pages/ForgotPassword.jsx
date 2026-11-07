import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import API from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      setError("");

      const normalizedEmail = email.trim();
      const res = await API.post("/auth/forgot-password", {
        email: normalizedEmail,
      });

      alert(res.data.msg);
      navigate("/reset-password", {
        state: { email: normalizedEmail },
      });
    } catch (err) {
      setError(
        err.response?.data?.msg || "Failed to send OTP. Please try again."
      );
      console.error("Forgot Password Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#f4f7fc] p-3 sm:p-5">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.3)] lg:min-h-[490px] lg:grid-cols-[0.82fr_1.18fr]">
        {/* Compact brand panel */}
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#101d3d] p-7 text-white lg:flex xl:p-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 h-44 w-44 rounded-full border border-white/10" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-blue-500/10 blur-2xl" />

          <div className="relative z-10 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10">
              <ShieldCheck size={19} />
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight">CA Portal</p>
              <p className="text-[10px] text-slate-300">Document workspace</p>
            </div>
          </div>

          <div className="relative z-10 py-8">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200/20 bg-blue-300/10 px-2.5 py-1 text-[10px] font-medium text-blue-100">
              <Sparkles size={12} /> Account recovery
            </span>
            <h1 className="max-w-xs text-3xl font-semibold leading-tight tracking-tight">
              Secure access,
              <span className="block text-blue-300">made simple.</span>
            </h1>
            <p className="mt-3 max-w-xs text-xs leading-5 text-slate-300">
              Receive a one-time code to reset your account password securely.
            </p>
            <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.06] p-3">
              <CheckCircle2 size={17} className="shrink-0 text-emerald-300" />
              <div>
                <p className="text-xs font-medium">Account protection</p>
                <p className="mt-0.5 text-[10px] text-slate-300">Keep your verification code private.</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex justify-between text-[10px] text-blue-100/40">
            <span>CA Portal</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </aside>

        {/* Compact form */}
        <section className="flex min-w-0 flex-col justify-center px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white">
              <ShieldCheck size={17} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">CA Portal</p>
              <p className="text-[10px] text-slate-500">Document workspace</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-6 inline-flex w-fit items-center gap-1.5 rounded-md text-xs font-medium text-slate-500 transition hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <ArrowLeft size={14} /> Back to login
          </button>

          <div className="mb-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <Mail size={20} />
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">
              Forgot password
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              Recover your account
            </h2>
            <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
              Enter your registered email address and we’ll send you a verification code.
            </p>
          </div>

          {error && (
            <div role="alert" className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-700">
                Registered email address
              </label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@company.com"
                  disabled={loading}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  required
                />
              </div>
              <p className="mt-1.5 text-[11px] leading-4 text-slate-500">
                Use an inbox you can access to receive your OTP.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white shadow-md shadow-blue-900/10 transition hover:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  Send verification code
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 flex items-start gap-2 border-t border-slate-100 pt-3.5">
            <ShieldCheck size={14} className="mt-0.5 shrink-0 text-slate-400" />
            <p className="text-[11px] leading-4 text-slate-500">
              Never share your OTP or password with anyone.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
