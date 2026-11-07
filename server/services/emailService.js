import nodemailer from "nodemailer";

const transporter = () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  if (!user || !pass) throw new Error("Email delivery is not configured");
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
};

export const sendVerificationEmail = async (to, token) => {
  const url = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email?token=${encodeURIComponent(token)}`;
  await transporter().sendMail({ from: process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER, to, subject: "Verify your CA Portal email", html: `<p>Verify your email to continue setting up your firm.</p><p><a href="${url}">Verify email</a></p><p>This link expires in 30 minutes.</p>` });
};

export const sendOtpEmail = async (to, otp) => {
  await transporter().sendMail({ from: process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER, to, subject: "CA Portal verification code", text: `Your verification code is ${otp}. It expires in 10 minutes.` });
};
