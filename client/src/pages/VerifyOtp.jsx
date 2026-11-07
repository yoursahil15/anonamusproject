import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react";
import API from "../services/api";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) {
      alert("Email missing. Please login again.");
      navigate("/", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timer <= 0) return undefined;
    const interval = window.setInterval(() => {
      setTimer((previous) => Math.max(0, previous - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timer]);

  const handleChange = (value, index) => {
    const digits = value.replace(/\D/g, "");
    if (!digits && value !== "") return;

    const nextOtp = [...otp];
    if (digits.length > 1) {
      const pastedDigits = digits.slice(0, 6).split("");
      pastedDigits.forEach((digit, offset) => {
        if (index + offset < 6) nextOtp[index + offset] = digit;
      });
      setOtp(nextOtp);
      inputsRef.current[Math.min(index + pastedDigits.length, 5)]?.focus();
      setError("");
      return;
    }

    nextOtp[index] = digits;
    setOtp(nextOtp);
    setError("");

    if (digits && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (event.key === "ArrowRight" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      setError("Enter the complete 6-digit OTP.");
      inputsRef.current[otp.findIndex((digit) => !digit)]?.focus();
      return;
    }

    try {
      setLoading(true);
      setError("");
      await API.post("/auth/verify-otp", { email, otp: finalOtp });
      alert("OTP verified successfully. Please log in.");
      navigate("/", { replace: true });
    } catch (err) {
      console.error("OTP verification failed:", err.response?.data || err.message);
      setError(err.response?.data?.msg || err.response?.data?.message || "OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const tempPassword = localStorage.getItem("tempPassword");
    if (!tempPassword) {
      setError("Your login session has expired. Please return to login and try again.");
      return;
    }

    try {
      setResending(true);
      setError("");
      await API.post("/auth/login", { email, password: tempPassword });
      setOtp(["", "", "", "", "", ""]);
      setTimer(60);
      inputsRef.current[0]?.focus();
      alert("A new OTP has been requested.");
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  };

  const formattedTimer = `00:${String(timer).padStart(2, "0")}`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <section className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <button
          type="button"
          onClick={() => navigate("/", { replace: true })}
          className="mb-5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        >
          <ArrowLeft size={14} />
          Back to login
        </button>

        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <ShieldCheck size={20} />
        </div>

        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Verify your OTP</h1>
        <p className="mt-1.5 text-sm leading-5 text-slate-500">
          Enter the 6-digit code sent to{" "}
          <span className="font-medium text-slate-700">{email}</span>.
        </p>

        {error && (
          <div role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5">
          <div className="grid grid-cols-6 gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => { inputsRef.current[index] = element; }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                pattern="[0-9]*"
                maxLength={6}
                aria-label={`OTP digit ${index + 1}`}
                value={digit}
                onChange={(event) => handleChange(event.target.value, index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                className="h-11 min-w-0 rounded-md border border-slate-300 bg-white text-center text-base font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                disabled={loading || resending}
              />
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Code expires in <span className="font-medium text-slate-700">{formattedTimer}</span></span>
            {timer > 0 ? (
              <span>Check your inbox</span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading || resending}
                className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                {resending && <RefreshCw size={12} className="animate-spin" />}
                Resend OTP
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || resending}
            className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <RefreshCw size={14} className="animate-spin" />}
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          Secure verification for your CA Portal account
        </p>
      </section>
    </main>
  );
}
