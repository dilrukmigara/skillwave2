import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { hasSupabase } from "./supabase/config";
import { dashboards, loginPages, isRole, type Role } from "./roles";
export async function requireUser(role?: Role) {
  const login = role ? loginPages[role] : "/login";
  if (!hasSupabase()) redirect(`${login}?notice=unavailable`);
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) redirect(login);
  if (!user.email_confirmed_at) redirect(`${login}?notice=verify`);
  const { data: membership, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (roleError) redirect("/account-unavailable");
  const actualRole: Role = membership?.role ?? "student";
  if (!isRole(actualRole)) redirect("/account-unavailable");
  if (role && actualRole !== role) redirect(dashboards[actualRole]);
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,full_name,email")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) redirect("/account-unavailable");
  if (!profile) {
    const name =
      String(user.user_metadata?.full_name || "Student")
        .trim()
        .slice(0, 100) || "Student";
    const { error: createError } = await supabase
      .from("profiles")
      .insert({ id: user.id, full_name: name, email: user.email });
    if (createError && createError.code !== "23505")
      redirect("/account-unavailable");
  }
  return {
    supabase,
    user,
    role: actualRole,
    name:
      profile?.full_name ||
      String(user.user_metadata?.full_name || "Student").slice(0, 100),
  };
}
