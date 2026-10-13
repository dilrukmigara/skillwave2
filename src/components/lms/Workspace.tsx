import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { dashboards, type Role } from "@/lib/roles";
export const fieldClass =
  "mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-emerald-600";
export function Workspace({
  role,
  name,
  children,
}: {
  role: Role;
  name: string;
  children: React.ReactNode;
}) {
  const labels = {
    student: "My learning",
    lecturer: "Teaching workspace",
    superadmin: "Academy overview",
  };
  return (
    <div className="min-h-screen bg-[#f5f7f8] text-slate-900 lg:flex">
      <aside className="border-b border-slate-200 bg-white p-5 lg:fixed lg:inset-y-0 lg:w-64 lg:border-r lg:p-7">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-[#234b40]"
        >
          <BookOpen /> SkillWave
        </Link>
        <p className="mt-2 text-xs uppercase tracking-widest text-slate-400">
          {role === "lecturer" ? "Lecturer" : role} portal
        </p>
        <nav className="mt-8">
          <Link
            href={dashboards[role]}
            className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-900"
          >
            <LayoutDashboard size={18} />
            {labels[role]}
          </Link>
          <Link
            href="/"
            className="mt-3 flex items-center gap-3 p-3 text-sm text-slate-500"
          >
            <GraduationCap size={18} />
            Public website
          </Link>
        </nav>
        <form action={signOut} className="mt-6 lg:absolute lg:bottom-8">
          <button className="flex items-center gap-2 text-sm text-slate-600">
            <LogOut size={16} /> Sign out
          </button>
        </form>
      </aside>
      <main className="min-w-0 flex-1 px-5 py-8 sm:px-10 lg:ml-64">
        <header className="mb-9 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <p className="text-sm text-slate-500">Welcome back, {name}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              {labels[role]}
            </h1>
          </div>
          <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500">
            <ShieldCheck size={16} />
            SkillWave Academy
          </span>
        </header>
        <div className="mx-auto max-w-6xl space-y-8">{children}</div>
      </main>
    </div>
  );
}
export function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="mb-5 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}
export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl bg-slate-50 p-5 text-sm leading-relaxed text-slate-500">
      {children}
    </p>
  );
}
export function Badge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${status === "active" ? "bg-emerald-50 text-emerald-800" : status === "pending" ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-600"}`}
    >
      {status === "active"
        ? "Enrolled"
        : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
