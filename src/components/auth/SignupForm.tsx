"use client";
import { useActionState } from "react";
import { signUp } from "@/app/auth/actions";

const input = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";
export function SignupForm({ enabled }: { enabled: boolean }) {
  const [state, action, pending] = useActionState(signUp, {});
  const step = state.step || "email";
  return <form action={action} className="space-y-5">
    <ol aria-label="Signup progress" className="flex justify-between gap-3 text-xs text-slate-500">
      {(["email", "verify", "password"] as const).map((item, i) => <li key={item} aria-current={step === item ? "step" : undefined} className={step === item ? "font-bold text-emerald-800" : ""}>{i + 1}. {item === "email" ? "Email" : item === "verify" ? "Verify code" : "Password"}</li>)}
    </ol>
    {step === "email" ? <label className="block text-sm font-medium">Email address
      <input required name="email" type="email" autoComplete="email" maxLength={254} defaultValue={state.email} placeholder="you@example.com" className={input} />
    </label> : <><input type="hidden" name="email" value={state.email || ""} /><p className="break-words text-sm text-slate-600">{state.email}</p></>}
    {step === "verify" && <label className="block text-sm font-medium">Verification code
      <input required name="token" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} placeholder="123456" className={`${input} tracking-[0.3em]`} />
      <span className="mt-2 block text-xs text-slate-500">Enter the six-digit code from your email. Use the newest code if you requested another.</span>
    </label>}
    {step === "password" && <>
      <label className="block text-sm font-medium">Full name<input required name="full_name" autoComplete="name" minLength={2} maxLength={100} className={input} /></label>
      <label className="block text-sm font-medium">Password<input required name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} className={input} /><span className="mt-2 block text-xs text-slate-500">At least 12 characters.</span></label>
      <label className="block text-sm font-medium">Confirm password<input required name="confirm_password" type="password" autoComplete="new-password" minLength={12} maxLength={128} className={input} /></label>
    </>}
    {!enabled && <p role="status" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Sign-in is being prepared. Please check back soon.</p>}
    {state.error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{state.error}</p>}
    {state.success && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">{state.success}</p>}
    <button name="intent" value={step === "email" ? "send" : step === "verify" ? "verify" : "complete"} disabled={pending || !enabled} className="w-full rounded-xl bg-gradient-to-r from-[#305a49] to-[#183d64] px-5 py-3 font-semibold text-white disabled:opacity-50">{pending ? "Please wait…" : step === "email" ? "Send verification code" : step === "verify" ? "Verify email" : "Save password and continue"}</button>
    {step === "verify" && <div className="flex items-center justify-between gap-4 text-sm">
      <button name="intent" value="resend" formNoValidate disabled={pending || !enabled} className="text-emerald-800 underline disabled:opacity-50">Resend code</button>
      <a href="/register" className="text-slate-600 underline">Change email</a>
    </div>}
    {step === "verify" && <p className="text-xs text-slate-500">Wait at least 60 seconds between code requests.</p>}
    <p className="text-xs text-slate-500">Already registered? Sign in below. Verifying an existing email here lets you choose a new password for that account.</p>
  </form>;
}
