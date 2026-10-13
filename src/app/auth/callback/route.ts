import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabase } from "@/lib/supabase/config";
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  let location = "/login?notice=invalid-link";
  if (code && hasSupabase()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) location = request.nextUrl.searchParams.get("next") === "/reset-password" ? "/reset-password" : "/lms";
  }
  // Fixed relative destinations preserve the browser origin, including preview hosts.
  return new NextResponse(null, { status: 303, headers: { Location: location, "Cache-Control": "private, no-store" } });
}
