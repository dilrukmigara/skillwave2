"use client";
import { useActionState } from "react";
import Link from "next/link";
import {
  signIn,
  signUp,
  forgotPassword,
  resetPassword,
} from "@/app/auth/actions";
import type { Role } from "@/lib/roles";
type Mode = "login" | "register" | "forgot" | "reset";
const actions = {
  login: signIn,
  register: signUp,
  forgot: forgotPassword,
  reset: resetPassword,
};
export function AuthForm({
  mode = "login",
  role = "student",
  enabled,
}: {
  mode?: Mode;
  role?: Role;
  enabled: boolean;
}) {
  const [state, action, pending] = useActionState(actions[mode], {});
  const input =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="portal" value={role} />
      {mode === "register" && (
        <label className="block text-sm font-medium">
          Full name
          <input
            required
            name="full_name"
            autoComplete="name"
            minLength={2}
            maxLength={100}
            className={input}
          />
        </label>
      )}
      {mode !== "reset" && (
        <label className="block text-sm font-medium">
          Email address
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            className={input}
            placeholder="you@example.com"
          />
        </label>
      )}
      {mode !== "forgot" && (
        <label className="block text-sm font-medium">
          {mode === "reset" ? "New password" : "Password"}
          <input
            required
            name="password"
            type="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            minLength={mode === "login" ? 1 : 12}
            maxLength={128}
            className={input}
          />
          {mode !== "login" && (
            <span className="mt-2 block text-xs text-slate-500">
              At least 12 characters.
            </span>
          )}
        </label>
      )}
      {(mode === "register" || mode === "reset") && (
        <label className="block text-sm font-medium">
          Confirm password
          <input
            required
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            className={input}
          />
        </label>
      )}
      {mode === "login" && (
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-emerald-800 underline"
          >
            Forgot password?
          </Link>
        </div>
      )}
      {!enabled && (
        <p
          role="status"
          className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900"
        >
          Sign-in is being prepared. Please check back soon.
        </p>
      )}
      {state.error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-800"
        >
          {state.error}
        </p>
      )}
      {state.success && (
        <p
          role="status"
          className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900"
        >
          {state.success}
        </p>
      )}
      <button
        disabled={pending || !enabled}
        className="w-full rounded-xl bg-gradient-to-r from-[#305a49] to-[#183d64] px-5 py-3 font-semibold text-white disabled:opacity-50"
      >
        {pending
          ? "Please wait…"
          : {
              login: "Sign in",
              register: "Create student account",
              forgot: "Send reset link",
              reset: "Save new password",
            }[mode]}
      </button>
    </form>
  );
}
