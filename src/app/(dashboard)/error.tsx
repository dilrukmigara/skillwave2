"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="min-h-screen grid place-items-center bg-slate-50 p-6 text-slate-900">
      <div className="max-w-md rounded-2xl bg-white p-8">
        <h1 className="text-2xl font-bold">We couldn’t load your workspace</h1>
        <p className="my-4 text-slate-500">
          Please try again. Your saved information has not been changed.
        </p>
        <button
          onClick={reset}
          className="rounded-xl bg-[#305a49] px-5 py-3 text-white"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
