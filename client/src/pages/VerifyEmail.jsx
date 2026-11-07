import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import API from "../services/api";

export default function VerifyEmail() {
  const [params] = useSearchParams(); const navigate = useNavigate(); const [error,setError]=useState(""); const [email,setEmail]=useState(""); const [notice,setNotice]=useState("");
  useEffect(()=>{ let active=true; const token=params.get("token"); if(!token){setError("Verification link is missing or invalid.");return;} API.post("/auth/verify-email",{token}).then(({data})=>{if(!active)return;localStorage.setItem("token",data.token);localStorage.setItem("user",JSON.stringify(data.user));navigate("/onboarding",{replace:true});}).catch(err=>{if(active)setError(err.response?.data?.msg||"This verification link could not be used.");});return()=>{active=false;};},[params,navigate]);
  const resend=async(e)=>{e.preventDefault();setNotice("");try{const {data}=await API.post("/auth/resend-verification",{email});setNotice(data.msg);}catch{setNotice("Unable to send verification email. Please try again later.");}};
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-5"><section className="max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm"><h1 className="text-xl font-semibold">Verify your email</h1><p className="mt-3 text-sm text-slate-600">{error||"Checking your verification link…"}</p>{error&&<><form onSubmit={resend} className="mt-5 flex gap-2"><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Work email" className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm"/><button className="rounded-xl bg-blue-700 px-3 py-2 text-sm font-medium text-white">Resend</button></form>{notice&&<p className="mt-3 text-sm text-slate-600">{notice}</p>}<Link className="mt-5 inline-block text-sm font-medium text-blue-700" to="/">Return to sign in</Link></>}</section></main>;
}
