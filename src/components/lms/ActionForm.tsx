"use client";
import { useActionState } from "react";
import type { FormState } from "@/app/auth/actions";
export function ActionForm({
  action,
  children,
  label,
  confirm,
}: {
  action: (state: FormState, data: FormData) => Promise<FormState>;
  children?: React.ReactNode;
  label: string;
  confirm?: string;
}) {
  const [state, submit, pending] = useActionState(action, {});
  return (
    <form
      action={submit}
      className="space-y-4"
      onSubmit={(event) => {
        if (confirm && !window.confirm(confirm)) event.preventDefault();
      }}
    >
      {children}
      <button
        disabled={pending}
        className="rounded-xl bg-[#305a49] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#234438] disabled:opacity-50"
      >
        {pending ? "Saving…" : label}
      </button>
      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-emerald-800">
          {state.success}
        </p>
      )}
    </form>
  );
}
