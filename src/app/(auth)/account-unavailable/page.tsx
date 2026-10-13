import Link from "next/link";
import { signOut } from "@/app/auth/actions";
export default function Page() {
  return (
    <main className="min-h-screen grid place-items-center bg-slate-50 p-6 text-slate-900">
      <section className="max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Your account needs attention</h1>
        <p className="my-5 text-slate-600">
          We couldn’t load your learning account. Please try again later or
          contact SkillWave.
        </p>
        <form action={signOut}>
          <button className="rounded-xl bg-[#305a49] px-5 py-3 text-white">
            Sign out
          </button>
        </form>
        <Link href="/#contact" className="mt-5 block underline">
          Contact the academy
        </Link>
      </section>
    </main>
  );
}
