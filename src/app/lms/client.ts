import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const db = url && key ? createClient(url, key) : null;
export function database() {
  if (!db)
    throw new Error(
      "The learning portal is being connected. Please contact SkillWave for enrollment.",
    );
  return db;
}
export async function rows(table: string, order?: string) {
  let query = database().from(table).select("*");
  if (order) query = query.order(order);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
export async function rpc(name: string, args: Record<string, unknown>) {
  const { data, error } = await database().rpc(name, args);
  if (error) throw error;
  return data;
}
export async function save(table: string, values: Record<string, unknown>) {
  const { error } = await database().from(table).upsert(values);
  if (error) throw error;
}
export async function upload(
  file: File,
  category: "payments" | "assignments",
  uid: string,
) {
  if (
    !["application/pdf", "image/jpeg", "image/png"].includes(file.type) ||
    file.size > 10 * 1024 * 1024 ||
    file.size === 0
  )
    throw new Error("Choose a PDF, JPG or PNG file, up to 10 MB.");
  const ext =
    file.type === "application/pdf"
      ? "pdf"
      : file.type === "image/png"
        ? "png"
        : "jpg";
  const path = `${uid}/${category}/${crypto.randomUUID()}.${ext}`;
  const { error } = await database()
    .storage.from("lms-private")
    .upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}
export async function openFile(path: string) {
  const { data, error } = await database()
    .storage.from("lms-private")
    .createSignedUrl(path, 60);
  if (error) throw error;
  window.open(data.signedUrl, "_blank", "noopener,noreferrer");
}
export function youtubeId(value: string) {
  if (/^[\w-]{11}$/.test(value)) return value;
  try {
    const u = new URL(value);
    if (u.hostname === "youtu.be")
      return u.pathname.slice(1).match(/^[\w-]{11}$/)?.[0] || "";
    if (
      ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(u.hostname)
    ) {
      const id = u.searchParams.get("v") || u.pathname.split("/").pop() || "";
      return /^[\w-]{11}$/.test(id) ? id : "";
    }
  } catch {}
  return "";
}
export const when = (v: string) =>
  new Date(v).toLocaleString("en-LK", {
    timeZone: "Asia/Colombo",
    dateStyle: "medium",
    timeStyle: "short",
  });
