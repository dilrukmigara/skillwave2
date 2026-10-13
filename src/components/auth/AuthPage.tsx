import Link from "next/link";
import { BookOpen, ShieldCheck, ArrowLeft } from "lucide-react";
import { SignupForm } from "./SignupForm";
import { AuthForm } from "./AuthForm";
import { staffCreationEnabled } from "@/lib/supabase/admin";
import { hasSupabase } from "@/lib/supabase/config";
import type { Role } from "@/lib/roles";
const notices: Record<string, string> = {
  registered: "Account created. Sign in with your email and password.",
  verify: "Confirm your email before signing in.",
  "password-updated":
    "Your password has been updated. Sign in with your new password.",
  "invalid-link": "This link is invalid or has expired. Request a new link.",
  unavailable: "Your learning portal will be available soon.",
};
export function AuthPage({
  role = "student",
  mode = "login",
  notice,
}: {
  role?: Role;
  mode?: "login" | "register" | "forgot" | "reset";
  notice?: string;
}) {
  const title =
    mode === "register"
      ? "Start your learning journey"
      : mode === "forgot"
        ? "Forgot your password?"
        : mode === "reset"
          ? "Choose a new password"
          : role === "student"
            ? "Welcome back, learner"
            : role === "lecturer"
              ? "Lecturer sign in"
              : "Superadmin sign in";
  return (
    <main className="min-h-screen bg-[#f4f7f6] text-slate-900 lg:grid lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-gradient-to-br from-[#173c32] to-[#102c4a] p-16 text-white lg:flex">
        <Link href="/" className="text-2xl font-bold">
          SkillWave
          <span className="ml-2 font-normal text-emerald-200">Academy</span>
        </Link>
        <div>
          <BookOpen size={48} className="mb-8 text-emerald-300" />
          <h2 className="max-w-lg text-5xl font-bold leading-tight">
            Your next chapter
            <br />
            starts here.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-slate-200">
            One place for your courses, your class community and the skills you
            build along the way.
          </p>
        </div>
        <p className="flex items-center gap-2 text-sm text-emerald-100">
          <ShieldCheck size={18} /> Learn with SkillWave. Grow with confidence.
        </p>
      </section>
      <section className="flex min-h-screen flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2 text-sm text-slate-600"
          >
            <ArrowLeft size={16} /> Back to SkillWave
          </Link>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">
            {role === "student"
              ? "Student learning portal"
              : role === "lecturer"
                ? "Teaching workspace"
                : "Academy management"}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mb-8 mt-3 text-slate-500">
            {mode === "register"
              ? "Create your student account with your name, email and password."
              : mode === "forgot"
                ? "We’ll email you a link to reset your password."
                : role === "student"
                  ? "Sign in to keep moving forward."
                  : "Access is granted by the academy."}
          </p>
          {notice && notices[notice] && (
            <p
              role="status"
              className="mb-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-900"
            >
              {notices[notice]}
            </p>
          )}
          {mode === "register" ? <SignupForm enabled={hasSupabase() && staffCreationEnabled()} /> : <AuthForm mode={mode} role={role} enabled={hasSupabase()} />}
          <div className="mt-7 text-center text-sm">
            {mode === "login" && role === "student" ? (
              <>
                New to SkillWave?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-emerald-800 underline"
                >
                  Create an account
                </Link>
              </>
            ) : (
              <Link href="/login" className="text-emerald-800 underline">
                Student sign in
              </Link>
            )}
          </div>
          <div className="mt-10 flex justify-center gap-5 border-t border-slate-200 pt-6 text-xs text-slate-500">
            <Link href="/admin/login">Lecturer portal</Link>
            <Link href="/superadmin/login">Superadmin portal</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
