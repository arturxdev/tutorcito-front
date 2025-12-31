import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  console.log("🔐 [Auth Callback] Received request");
  console.log("🔐 [Auth Callback] Code present:", code ? "✓" : "✗");
  console.log("🔐 [Auth Callback] Redirect to:", next);

  if (code) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("❌ [Auth Callback] Error exchanging code:", error.message);
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent(error.message)}`
        );
      }

      console.log("✅ [Auth Callback] Session created successfully");
      console.log("✅ [Auth Callback] User email:", data.user?.email);
      console.log("🔄 [Auth Callback] Redirecting to:", `${origin}${next}`);

      // Redirect to dashboard
      return NextResponse.redirect(`${origin}${next}`);
    } catch (err) {
      console.error("❌ [Auth Callback] Unexpected error:", err);
      return NextResponse.redirect(
        `${origin}/login?error=unexpected_error`
      );
    }
  }

  console.error("❌ [Auth Callback] No code provided");
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
