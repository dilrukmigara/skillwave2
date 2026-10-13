import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function provisionLecturer(
  admin: SupabaseClient,
  input: { email: string; password: string; name: string; creator: string },
) {
  // Keep the new identity unable to log in until its database records exist.
  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    ban_duration: "876000h",
    user_metadata: { full_name: input.name },
  });
  if (error || !data.user) return { error: "Account creation failed. Check the details; this email may already be registered." };
  const id = data.user.id;
  const result = await admin.rpc("provision_staff", {
    p_user_id: id, p_email: input.email, p_name: input.name,
    p_role: "lecturer", p_creator: input.creator,
  });
  if (result.error) {
    const cleanup = await admin.auth.admin.deleteUser(id);
    return { error: cleanup.error
      ? "Setup failed. A disabled account remains; contact the project owner before retrying."
      : "Staff setup failed. No account was activated. Please try again." };
  }
  const activated = await admin.auth.admin.updateUserById(id, { ban_duration: "none" });
  if (activated.error) return { error: "The staff record was saved, but login remains disabled. Contact the project owner to activate it." };
  return { success: "Lecturer account created. Share their email and password privately; no email verification is required." };
}
