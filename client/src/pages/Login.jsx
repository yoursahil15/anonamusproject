import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import API from "../services/api";
import { clearAuthData, getUserLandingPath } from "../utils/auth";
import {
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
} from "lucide-react";

/* =========================================================
   LOGIN
========================================================= */

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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#d5d5d5] px-4 py-8 sm:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70" style={{ background: "radial-gradient(ellipse at 12% 84%, #8a8a8a 0 10%, transparent 36%), radial-gradient(ellipse at 90% 72%, #969696 0 14%, transparent 40%), linear-gradient(170deg, #dedede 0 57%, #bcbcbc 58%, #d3d3d3 70%, #a5a5a5 71%, #d0d0d0 83%)" }} />
      <section className="relative grid w-full max-w-[920px] overflow-hidden shadow-2xl md:min-h-[570px] md:grid-cols-2">
        <aside className="relative flex min-h-64 items-end overflow-hidden bg-gradient-to-br from-sky-500 via-cyan-700 to-sky-950 px-8 py-10 text-white sm:px-10 md:min-h-0">
          <div aria-hidden="true" className="absolute inset-0 opacity-80" style={{ background: "linear-gradient(180deg, #91d8ed55, transparent 42%), radial-gradient(ellipse at 72% 20%, #d7f5ff55, transparent 35%)" }} />
          <svg aria-hidden="true" viewBox="0 0 700 500" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
            <path d="M0 170 95 110 150 140 245 65 318 124 405 48 495 118 575 54 700 120V500H0Z" fill="#2f91b7" opacity=".55" />
            <path d="m0 240 100-65 72 42 105-88 83 61 92-81 97 78 81-56 70 45V500H0Z" fill="#08749d" opacity=".72" />
            <path d="m0 315 95-72 78 40 93-58 97 76 97-82 84 68 77-58 79 48V500H0Z" fill="#07577e" opacity=".86" />
            <path d="m0 386 109-50 77 39 96-54 93 57 100-63 83 54 70-40 72 45v126H0Z" fill="#063f64" />
          </svg>
          <div className="relative z-10 max-w-sm">
            <h1 className="text-3xl font-light sm:text-4xl">Don’t have an account?</h1>
            <p className="mt-3 text-sm leading-6 text-white/90">Create an account to get started with your secure document workspace.</p>
            <a href="/register" className="mt-5 inline-flex rounded-sm border border-white/50 bg-white/15 px-5 py-2.5 text-sm font-semibold uppercase text-white transition hover:bg-white/25">Register now</a>
          </div>
        </aside>

        <section className="flex flex-col bg-[#1B2223] px-7 py-8 sm:px-12 sm:py-10">
          <div className="mx-auto inline-flex items-center gap-2 text-base font-medium text-white/75">
            <span className="relative inline-block h-4 w-4 bg-[#14a085] before:absolute before:-right-1 before:-top-1 before:h-3 before:w-2 before:bg-[#e8591e]" />
            Cashflow
          </div>
          <h2 className="mt-8 text-center text-lg font-medium text-[#2bb3c0]">Login to your account</h2>
          <p className="mt-2 text-center text-xs text-slate-400">Sign in to continue to your workspace.</p>

          <div className="mx-auto mt-7 w-full max-w-[360px]">
            {error && <div role="alert" className="mb-4 flex items-start gap-2 rounded-sm border border-rose-400/30 bg-rose-400/10 px-3 py-2.5 text-xs text-rose-200"><AlertCircle size={14} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="flex overflow-hidden rounded-sm bg-[#454c4d] focus-within:ring-2 focus-within:ring-[#2bb3c0]">
                <span className="flex w-14 shrink-0 items-center justify-center border-r border-white/15 text-slate-300"><Mail size={15} /></span>
                <input id="email" type="email" name="email" autoComplete="email" autoFocus placeholder="Email address" value={form.email} onChange={handleChange} disabled={loading} className="min-w-0 flex-1 bg-transparent px-4 py-4 text-sm text-white outline-none placeholder:text-slate-400 focus:bg-white/[0.03] disabled:opacity-60" required />
              </label>
              <label className="flex overflow-hidden rounded-sm bg-[#454c4d] focus-within:ring-2 focus-within:ring-[#2bb3c0]">
                <span className="flex w-14 shrink-0 items-center justify-center border-r border-white/15 text-slate-300"><KeyRound size={15} /></span>
                <input id="password" type={showPassword ? "text" : "password"} name="password" autoComplete="current-password" placeholder="Password" value={form.password} onChange={handleChange} onKeyUp={handlePasswordKey} onKeyDown={handlePasswordKey} onBlur={() => setCapsLock(false)} disabled={loading} className="min-w-0 flex-1 bg-transparent px-4 py-4 text-sm text-white outline-none placeholder:text-slate-400 focus:bg-white/[0.03] disabled:opacity-60" required />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="px-3 text-slate-300 hover:text-white">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </label>
              {capsLock && <p role="status" className="flex items-center gap-1.5 text-[11px] font-medium text-amber-300"><AlertCircle size={12} />Caps Lock is on</p>}
              <div className="flex items-center justify-between gap-3 pt-1">
                <button type="button" onClick={() => navigate("/forgot-password")} className="text-xs font-medium text-slate-200 transition hover:text-[#2bb3c0] hover:underline">Forgot Password?</button>
                <button type="submit" disabled={loading} className="inline-flex min-w-24 items-center justify-center gap-2 rounded-sm bg-[#2bb3c0] px-5 py-3 text-sm font-semibold uppercase text-white transition hover:bg-[#239eaa] disabled:cursor-not-allowed disabled:opacity-70">
                  {loading ? <><Loader2 size={15} className="animate-spin" />Signing in</> : "Login"}
                </button>
              </div>
            </form>
            <div className="my-7 flex items-center gap-3"><span className="h-px flex-1 border-t border-dotted border-slate-500" /><span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Secure login</span><span className="h-px flex-1 border-t border-dotted border-slate-500" /></div>
            <p className="text-center text-xs leading-5 text-slate-400">Protected sign-in for your document workspace.</p>
          </div>
          <p className="mt-auto pt-8 text-center text-xs text-slate-400">Cashflow · Secure document workspace</p>
        </section>
      </section>
    </main>
  );
}
