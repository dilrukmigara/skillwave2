"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { hasSupabase } from "@/lib/supabase/config";
import { dashboards, emailValue, isRole, validPassword } from "@/lib/roles";
export type FormState = { error?: string; success?: string };
const unavailable = {
  error: "Sign-in is not available yet. Please try again later.",
};
function authOrigin() {
  const value = process.env.AUTH_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (!value)
    throw new Error("Set AUTH_SITE_URL before enabling authentication.");
  return new URL(value).origin;
}
export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  if (!hasSupabase()) return unavailable;
  const email = emailValue(form.get("email"));
  const password = String(form.get("password") || "");
  const portal = form.get("portal");
  if (!email || !password || password.length > 128 || !isRole(portal))
    return { error: "Enter a valid email and password." };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user?.email_confirmed_at)
    return {
      error:
        "Unable to sign in. Check your details and verify your email first.",
    };
  const { data: membership, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (roleError) {
    await supabase.auth.signOut();
    return { error: "Your account is not ready. Please contact SkillWave." };
  }
  const role = membership?.role ?? "student";
  if (!isRole(role) || role !== portal) {
    await supabase.auth.signOut();
    return {
      error:
        "This account does not have access to this portal. Choose the correct sign-in below.",
    };
  }
  revalidatePath("/", "layout");
  redirect(dashboards[role]);
}
export async function signUp(_: FormState, form: FormData): Promise<FormState> {
  if (!hasSupabase()) return unavailable;
  const email = emailValue(form.get("email"));
  const full_name = String(form.get("full_name") || "").trim();
  const password = String(form.get("password") || "");
  if (!email || full_name.length < 2 || full_name.length > 100)
    return { error: "Enter your name and a valid email address." };
  if (!validPassword(password))
    return { error: "Use a password between 12 and 128 characters." };
  if (password !== form.get("confirm_password"))
    return { error: "Passwords do not match." };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name },
      emailRedirectTo: `${authOrigin()}/auth/callback`,
    },
  });
  if (error)
    return {
      error:
        "Registration could not be completed. Please try again later, or sign in if you already have an account.",
    };
  if (data.session) await supabase.auth.signOut();
  return {
    success:
      "Check your inbox to confirm your email, then sign in. If you already have an account, use sign in or reset your password.",
  };
}
export async function forgotPassword(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  if (!hasSupabase()) return unavailable;
  const email = emailValue(form.get("email"));
  if (!email) return { error: "Enter a valid email address." };
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${authOrigin()}/auth/callback?next=/reset-password`,
  });
  return {
    success:
      "If an account exists for that email, you will receive a password reset link. Check your inbox and spam folder.",
  };
}
export async function resetPassword(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  if (!hasSupabase()) return unavailable;
  const password = String(form.get("password") || "");
  if (!validPassword(password))
    return { error: "Use a password between 12 and 128 characters." };
  if (password !== form.get("confirm_password"))
    return { error: "Passwords do not match." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return { error: "Your reset link has expired. Request a new one." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error)
    return {
      error:
        "Unable to update your password. Request a fresh reset link and try again.",
    };
  await supabase.auth.signOut({ scope: "global" });
  redirect("/login?notice=password-updated");
}
export async function signOut() {
  if (hasSupabase()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
