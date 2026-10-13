export type Role = "student" | "lecturer" | "superadmin";
export const dashboards: Record<Role, string> = {
  student: "/lms",
  lecturer: "/admin",
  superadmin: "/superadmin",
};
export const loginPages: Record<Role, string> = {
  student: "/login",
  lecturer: "/admin/login",
  superadmin: "/superadmin/login",
};
export function isRole(value: unknown): value is Role {
  return value === "student" || value === "lecturer" || value === "superadmin";
}
export function emailValue(value: FormDataEntryValue | null): string {
  const email = String(value ?? "")
    .trim()
    .toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? email
    : "";
}
export function validPassword(value: string): boolean {
  return value.length >= 12 && value.length <= 128;
}
export function validId(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}
