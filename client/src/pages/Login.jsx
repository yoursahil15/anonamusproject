import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import API from "../services/api";
import { clearAuthData, getUserLandingPath } from "../utils/auth";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

/* =========================================================
   LOGIN
========================================================= */

const fieldClass =
  "h-9 w-full rounded-lg border border-slate-300 bg-white pl-9 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50";

export default function Login() {
  const [authenticatedPath] = useState(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      if (storedUser && !token) clearAuthData();
      return null;
    }

    try {
      const path = getUserLandingPath(JSON.parse(storedUser));
      if (path) return path;
    } catch {
      // Discard malformed local session data and show the login form.
    }

    clearAuthData();
    return null;
  });

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [capsLock, setCapsLock] = useState(false);

  const navigate = useNavigate();

  if (authenticatedPath) {
    return <Navigate to={authenticatedPath} replace />;
  }

  // ================= INPUT =================

  const handleChange = (e) => {
    setError("");

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordKey = (e) => {
    setCapsLock(e.getModifierState?.("CapsLock") || false);
  };

  // ================= SUBMIT =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    try {
      setLoading(true);

      const res = await API.post("/auth/login", form);

      // ✅ LOGIN SUCCESS

      const token = res?.data?.token;
      const user = res?.data?.user;
      const landingPath = getUserLandingPath(user);

      if (typeof token !== "string" || !token.trim() || !landingPath) {
        clearAuthData();
        setError("Unable to sign in. The server returned an invalid login response.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate(landingPath, { replace: true });
    } catch (err) {
      console.log("Login Error:", err.response?.data);

      // 🔥 OTP REQUIRED CASE
      if (err.response?.status === 403 && err.response?.data?.email) {
        navigate("/verify-otp", {
          state: {
            email: err.response.data.email,
          },
        });

        return;
      }

      if (err.response?.data?.requiresEmailVerification) {
        setError("Please verify your email first. Use the verification link we sent during registration.");
        return;
      }

      // Normal error
      setError(err.response?.data?.msg || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-dvh overflow-hidden bg-[#f4f7fc] text-slate-900 lg:grid lg:grid-cols-[1.02fr_0.98fr]">
      {/* BRAND SIDE */}
      <aside className="relative hidden h-dvh min-h-0 overflow-hidden bg-[#101d3a] text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_12%,rgba(61,122,255,0.28),transparent_38%),radial-gradient(ellipse_at_90%_88%,rgba(38,91,196,0.38),transparent_42%)]" />
        <div className="absolute -right-28 top-24 h-80 w-80 rounded-full border border-white/10" />
        <div className="absolute -right-16 top-36 h-56 w-56 rounded-full border border-white/10" />
        <div className="absolute bottom-[-150px] left-[-110px] h-[360px] w-[360px] rounded-full border border-white/[0.08]" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:38px_38px]" />

        <div className="relative z-10 flex shrink-0 items-center gap-3 px-8 pt-5 xl:px-10">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-lg shadow-black/10">
            <ShieldCheck size={22} strokeWidth={1.8} />
          </span>
          <div>
            <p className="text-[15px] font-semibold tracking-wide">CA Portal</p>
            <p className="mt-0.5 text-xs text-blue-100/65">
              Document workspace
            </p>
          </div>
        </div>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center overflow-hidden px-8 py-4 xl:px-14">
          <div className="max-w-xl">
            <h1 className="max-w-lg text-3xl font-semibold leading-[1.08] tracking-tight xl:text-[42px]">
              Every document.
              <span className="mt-1 block text-blue-300">
                One clear workflow.
              </span>
            </h1>
            <p className="mt-3 max-w-md text-[13px] leading-5 text-slate-300">
              Prepare, review, and manage your office documents in one secure
              workspace.
            </p>
          </div>

          {/* Original, inline workflow illustration — no external image dependency */}
          <div className="relative mt-5 max-w-[470px] rounded-2xl border border-white/10 bg-white/[0.055] p-4 shadow-2xl shadow-black/20 backdrop-blur-sm xl:mt-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-white/90">
                  Workspace overview
                </p>
                <p className="mt-1 text-[11px] text-blue-100/55">
                  Document approval workflow
                </p>
              </div>
              <span className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-medium text-emerald-200">
                Live workflow
              </span>
            </div>
            <div className="grid grid-cols-[1.1fr_0.9fr] gap-3">
              <div className="rounded-xl border border-white/10 bg-[#f8fbff] p-3 text-slate-800 shadow-xl shadow-black/10">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <FileText size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold">Document review</p>
                    <p className="mt-0.5 text-[9px] text-slate-500">
                      CA / Client records
                    </p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-2 w-[82%] rounded-full bg-slate-200" />
                  <div className="h-2 w-full rounded-full bg-slate-100" />
                  <div className="h-2 w-[68%] rounded-full bg-slate-100" />
                </div>
                <div className="mt-3 flex items-center justify-between rounded-lg bg-emerald-50 px-2.5 py-1.5">
                  <span className="text-[10px] font-medium text-emerald-800">
                    Verified
                  </span>
                  <CheckCircle2 size={15} className="text-emerald-600" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.07] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-blue-100/70">
                      Review stages
                    </span>
                    <ShieldCheck size={15} className="text-blue-200" />
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="h-2 flex-1 rounded-full bg-emerald-400" />
                    <span className="h-2 flex-1 rounded-full bg-emerald-400" />
                    <span className="h-2 flex-1 rounded-full bg-blue-300/40" />
                  </div>
                  <p className="mt-2 text-[10px] font-medium text-white">
                    Maker → Checker → Approver
                  </p>
                </div>
                <div className="flex-1 rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/20 to-indigo-400/10 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-300/15 text-blue-100">
                    <Lock size={16} />
                  </div>
                  <p className="mt-2 text-[11px] font-semibold text-white">
                    Access protected
                  </p>
                  <p className="mt-1 text-[9px] leading-3.5 text-blue-100/65">
                    Your workspace stays organized and secure.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-blue-100/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />A
              simpler way to keep work moving.
            </div>
          </div>
        </div>
        <div className="relative z-10 flex shrink-0 items-center justify-between px-8 pb-3 text-[10px] text-blue-100/45 xl:px-10">
          <span>CA Portal · Secure document workspace</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </aside>

      {/* LOGIN SIDE */}
      <main className="flex h-dvh min-h-0 min-w-0 flex-col overflow-hidden bg-[#f7f9fd]">
        <header className="flex shrink-0 items-center gap-2.5 border-b border-slate-200/70 bg-white/80 px-4 py-2.5 backdrop-blur lg:hidden">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
            <ShieldCheck size={19} />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">CA Portal</p>
            <p className="text-[11px] text-slate-500">Document workspace</p>
          </div>
        </header>
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-4 py-3 sm:px-6">
          <div className="w-full max-w-[360px]">
            <div className="mb-3">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                <ShieldCheck size={24} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                Welcome back
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                Sign in to your workspace
              </h2>
              <p className="mt-1 text-[13px] leading-5 text-slate-500">
                Use your account credentials to continue.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:p-5">
              {error && (
                <div
                  role="alert"
                  className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700"
                >
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Email address
                  </label>
                  <div className="relative mt-1">
                    <Mail
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      autoFocus
                      placeholder="name@company.com"
                      value={form.email}
                      onChange={handleChange}
                      disabled={loading}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      required
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="text-xs font-semibold text-blue-700 transition hover:text-blue-800 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative mt-1">
                    <Lock
                      size={16}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={handleChange}
                      onKeyUp={handlePasswordKey}
                      onKeyDown={handlePasswordKey}
                      onBlur={() => setCapsLock(false)}
                      disabled={loading}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showPassword}
                      className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {capsLock && (
                    <p
                      role="status"
                      className="mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-amber-700"
                    >
                      <AlertCircle size={12} />
                      Caps Lock is on
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
              <p className="mt-4 text-center text-xs text-slate-500">New to CA Portal? <a className="font-semibold text-blue-700" href="/register">Create a firm account</a></p>
              <div className="my-3 flex items-center gap-3">
                <span className="h-px flex-1 bg-slate-100" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Secure access
                </span>
                <span className="h-px flex-1 bg-slate-100" />
              </div>
              <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                <Lock size={12} className="text-emerald-600" />
                Protected sign-in for your document workspace
              </p>
            </div>
            <p className="mt-3 text-center text-[10px] text-slate-400">
              © {new Date().getFullYear()} CA Portal. All rights reserved.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
