"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createAdminClient, staffCreationEnabled } from "@/lib/supabase/admin";
import { provisionLecturer } from "@/lib/provision-staff";
import { emailValue, validId } from "@/lib/roles";
import type { FormState } from "@/app/auth/actions";
const text = (form: FormData, key: string) =>
  String(form.get(key) ?? "").trim();
function refresh() {
  ["/lms", "/admin", "/superadmin"].forEach((path) => revalidatePath(path));
}
function failed() {
  return {
    error: "We couldn’t save this change. Refresh the page and try again.",
  };
}
export async function requestEnrollment(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const { supabase, user } = await requireUser("student");
  const batch_id = text(form, "batch_id");
  if (!validId(batch_id)) return { error: "Choose a valid batch." };
  const { error } = await supabase
    .from("enrollments")
    .insert({ student_id: user.id, batch_id });
  if (error)
    return {
      error:
        error.code === "23505"
          ? "You already have a request for this batch."
          : "This batch is not accepting requests. Please contact SkillWave.",
    };
  refresh();
  return { success: "Request sent. The academy will review your enrollment." };
}
export async function appointLecturer(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const { supabase, user } = await requireUser("superadmin");
  const user_id = text(form, "user_id");
  if (!validId(user_id) || user_id === user.id)
    return { error: "Choose another registered account." };
  const { error } = await supabase
    .from("user_roles")
    .insert({ user_id, role: "lecturer" });
  if (error) return failed();
  refresh();
  return {
    success:
      "Lecturer access granted. They can now use the lecturer sign-in page.",
  };
}
export async function revokeLecturer(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const { supabase, user } = await requireUser("superadmin");
  const user_id = text(form, "user_id");
  if (!validId(user_id) || user_id === user.id)
    return { error: "Choose a lecturer." };
  const { data, error } = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", user_id)
    .eq("role", "lecturer")
    .select("user_id")
    .single();
  if (error || !data) return failed();
  refresh();
  return {
    success: "Lecturer access removed. Reassign their batches when ready.",
  };
}
export async function createCourse(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const { supabase } = await requireUser("superadmin");
  const title = text(form, "title"),
    description = text(form, "description");
  if (title.length < 3 || title.length > 150 || description.length > 2000)
    return {
      error:
        "Enter a course title (3–150 characters) and a description up to 2,000 characters.",
    };
  const { error } = await supabase
    .from("courses")
    .insert({ title, description, published: form.get("published") === "on" });
  if (error) return failed();
  refresh();
  return { success: "Course created. You can now add a batch." };
}
export async function setCoursePublished(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const { supabase } = await requireUser("superadmin");
  const id = text(form, "id");
  if (!validId(id)) return failed();
  const { error } = await supabase
    .from("courses")
    .update({ published: form.get("published") === "true" })
    .eq("id", id)
    .select("id")
    .single();
  if (error) return failed();
  refresh();
  return { success: "Course visibility updated." };
}
export async function createBatch(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const { supabase } = await requireUser("superadmin");
  const course_id = text(form, "course_id"),
    lecturer_id = text(form, "lecturer_id"),
    title = text(form, "title"),
    mode = text(form, "mode"),
    date = text(form, "starts_on");
  if (
    !validId(course_id) ||
    (lecturer_id && !validId(lecturer_id)) ||
    title.length < 2 ||
    title.length > 120 ||
    !["online", "physical", "hybrid"].includes(mode) ||
    (date &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date))))
  )
    return { error: "Check the batch details and try again." };
  const { error } = await supabase
    .from("batches")
    .insert({
      course_id,
      title,
      mode,
      starts_on: date || null,
      lecturer_id: lecturer_id || null,
      enrollment_open: form.get("enrollment_open") === "on",
    });
  if (error) return failed();
  refresh();
  return { success: "Batch created." };
}
export async function updateBatch(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const { supabase } = await requireUser("superadmin");
  const id = text(form, "id"),
    lecturer_id = text(form, "lecturer_id");
  if (!validId(id) || (lecturer_id && !validId(lecturer_id))) return failed();
  const { error } = await supabase
    .from("batches")
    .update({
      lecturer_id: lecturer_id || null,
      enrollment_open: form.get("enrollment_open") === "on",
    })
    .eq("id", id)
    .select("id")
    .single();
  if (error) return failed();
  refresh();
  return { success: "Batch updated." };
}
export async function decideEnrollment(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const { supabase } = await requireUser("superadmin");
  const id = text(form, "id"),
    status = text(form, "status");
  if (!validId(id) || !["active", "rejected", "revoked"].includes(status))
    return failed();
  const { error } = await supabase
    .from("enrollments")
    .update({ status })
    .eq("id", id)
    .select("id")
    .single();
  if (error) return failed();
  refresh();
  return { success: "Enrollment updated." };
}

export async function createLecturerAccount(_: FormState, form: FormData): Promise<FormState> {
  const { user } = await requireUser("superadmin");
  if (!staffCreationEnabled()) return { error: "Staff account creation is not configured yet." };
  const email = emailValue(form.get("email"));
  const name = text(form, "full_name");
  const password = String(form.get("password") || "");
  if (!email || name.length < 2 || name.length > 100)
    return { error: "Enter a valid email and a name between 2 and 100 characters." };
  if (password.length < 10 || password.length > 128)
    return { error: "Use a password between 10 and 128 characters." };
  if (password !== form.get("confirm_password")) return { error: "Passwords do not match." };
  const result = await provisionLecturer(createAdminClient(), { email, password, name, creator: user.id });
  refresh();
  return result;
}
