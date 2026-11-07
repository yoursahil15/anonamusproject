import { useEffect, useState } from "react";
import API from "../services/api";
import {
  User, Mail, Phone, Lock, ShieldCheck, Save, RefreshCw,
  UserRound, CheckCircle2,
} from "lucide-react";

const initialForm = {
  fname: "", lname: "", email: "", mobile: "",
  oldPassword: "", newPassword: "",
};

function ProfileField({ label, name, value, onChange, icon: Icon, type = "text", placeholder, maxLength, autoComplete, required = false }) {
  return (
    <div className="min-w-0">
      <label htmlFor={name} className="mb-1 block text-xs font-semibold text-slate-600">
        {label}{required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      <div className="relative rounded-lg border border-slate-200 bg-white transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
        <Icon size={16} aria-hidden="true" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          id={name} name={name} type={type} value={value} onChange={onChange}
          placeholder={placeholder} maxLength={maxLength} autoComplete={autoComplete}
          required={required}
          className="w-full bg-transparent py-2 pl-9 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}

export default function Profile() {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      const user = raw ? JSON.parse(raw) : null;
      if (user) {
        setFormData({
          fname: user.fname || "", lname: user.lname || "",
          email: user.email || "", mobile: user.mobile || "",
          oldPassword: "", newPassword: "",
        });
      }
    } catch (error) {
      console.error("Unable to load profile:", error);
    }
  }, []);

  const handleChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;
    if (name === "fname" || name === "lname") {
      value = value.replace(/[^A-Za-z ]/g, "").replace(/\s{2,}/g, " ");
    }
    if (name === "mobile") value = value.replace(/\D/g, "").slice(0, 10);
    if (name === "email") value = value.trim().toLowerCase();
    setSuccessMessage("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");

    const fname = formData.fname.trim();
    const lname = formData.lname.trim();

    if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(fname)) return alert("Enter a valid first name.");
    if (!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(lname)) return alert("Enter a valid last name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return alert("Enter a valid email address.");
    if (!/^[6-9]\d{9}$/.test(formData.mobile)) return alert("Enter a valid 10-digit mobile number.");

    if (formData.newPassword) {
      if (!formData.oldPassword) return alert("Please enter your current password.");
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
      if (!passwordRegex.test(formData.newPassword)) {
        return alert("Password must contain uppercase, lowercase, a number, a special character, and at least 8 characters.");
      }
    } else if (formData.oldPassword) {
      return alert("Enter a new password too, or clear the current password field.");
    }

    try {
      setLoading(true);
      await API.put("/auth/update", { ...formData, fname, lname });

      const raw = localStorage.getItem("user");
      const user = raw ? JSON.parse(raw) : {};
      localStorage.setItem("user", JSON.stringify({
        ...user, fname, lname, email: formData.email, mobile: formData.mobile,
      }));

      setFormData((prev) => ({ ...prev, fname, lname, oldPassword: "", newPassword: "" }));
      setShowPasswordSection(false);
      setSuccessMessage("Your profile has been updated successfully.");
    } catch (err) {
      console.error("Profile update failed:", err);
      alert(err.response?.data?.msg || "Unable to update your profile.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    try {
      const raw = localStorage.getItem("user");
      const user = raw ? JSON.parse(raw) : {};
      setFormData({
        fname: user.fname || "", lname: user.lname || "",
        email: user.email || "", mobile: user.mobile || "",
        oldPassword: "", newPassword: "",
      });
      setShowPasswordSection(false);
      setSuccessMessage("");
    } catch {
      setFormData(initialForm);
    }
  };

  const initials = `${formData.fname.charAt(0)}${formData.lname.charAt(0)}`.toUpperCase() || "U";

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-5xl space-y-3">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" /> Account settings
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">My Profile</h1>
            <p className="mt-0.5 text-xs text-slate-500">Manage your personal information and account security.</p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
            <ShieldCheck size={15} /> Profile &amp; security
          </div>
        </header>


        {successMessage && (
          <div role="status" className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            <CheckCircle2 size={17} className="mt-0.5 shrink-0" /> {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-blue-50/80 to-white px-3.5 py-2.5 sm:px-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700"><UserRound size={18} /></div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Personal information</h2>
                <p className="mt-0.5 text-xs text-slate-500">Keep your contact details up to date.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:p-4">
              <ProfileField label="First name" name="fname" value={formData.fname} onChange={handleChange} icon={User} placeholder="Enter first name" maxLength={30} autoComplete="given-name" required />
              <ProfileField label="Last name" name="lname" value={formData.lname} onChange={handleChange} icon={User} placeholder="Enter last name" maxLength={30} autoComplete="family-name" required />
              <ProfileField label="Email address" name="email" type="email" value={formData.email} onChange={handleChange} icon={Mail} placeholder="you@company.com" maxLength={100} autoComplete="email" required />
              <ProfileField label="Mobile number" name="mobile" type="tel" value={formData.mobile} onChange={handleChange} icon={Phone} placeholder="10-digit mobile number" maxLength={10} autoComplete="tel" required />
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-gradient-to-r from-violet-50/80 to-white px-3.5 py-2.5 sm:px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700"><Lock size={18} /></div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Password &amp; security</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Change your password only when needed.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPasswordSection((show) => !show);
                  setFormData((prev) => ({ ...prev, oldPassword: "", newPassword: "" }));
                }}
                className="shrink-0 rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-50"
              >
                {showPasswordSection ? "Cancel change" : "Change password"}
              </button>
            </div>

            {showPasswordSection ? (
              <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:p-4">
                <ProfileField label="Current password" name="oldPassword" type="password" value={formData.oldPassword} onChange={handleChange} icon={Lock} placeholder="Enter current password" autoComplete="current-password" required />
                <ProfileField label="New password" name="newPassword" type="password" value={formData.newPassword} onChange={handleChange} icon={Lock} placeholder="At least 8 characters" autoComplete="new-password" required />
                <div className="rounded-lg border border-amber-100 bg-amber-50/70 px-3 py-2.5 text-xs leading-5 text-amber-800 sm:col-span-2">
                  Use at least 8 characters with uppercase and lowercase letters, a number, and a special character.
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-3.5 py-3 sm:px-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><ShieldCheck size={17} /></div>
                <div>
                  <p className="text-sm font-medium text-slate-800">Password protected</p>
                  <p className="mt-0.5 text-xs text-slate-500">Password fields stay hidden until you choose to change it.</p>
                </div>
              </div>
            )}
          </section>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-end">
            <button type="button" onClick={resetForm} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
              Reset changes
            </button>
            <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? "Saving changes..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
