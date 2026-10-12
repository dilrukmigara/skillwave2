import Link from "next/link";
export default function NotFound() {
  return <main className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center bg-background text-foreground"><p className="text-emerald-600 font-semibold">404</p><h1 className="text-3xl font-bold">Page not found</h1><p>This page may have moved. Explore our courses from the home page.</p><Link href="/" className="rounded-xl bg-[#305a49] px-6 py-3 text-white">Back to SkillWave</Link></main>;
}
