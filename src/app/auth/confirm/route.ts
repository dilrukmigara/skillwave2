import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabase } from "@/lib/supabase/config";
export async function GET(request: NextRequest) {
  const token_hash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  let location = "/login?notice=invalid-link";
  if (token_hash && (type === "signup" || type === "email" || type === "recovery") && hasSupabase()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) location = type === "recovery" ? "/reset-password" : "/lms";
  }
  return new NextResponse(null, { status: 303, headers: { Location: location, "Cache-Control": "private, no-store" } });
}
