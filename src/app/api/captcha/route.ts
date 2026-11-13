import { NextResponse } from "next/server";
import { fetchCaptcha } from "@/lib/familycard";

export const dynamic = "force-dynamic";

/**
 * GET /api/captcha
 * Fetches a fresh arithmetic captcha from the government API, server-side,
 * and returns the token + base64 image for the search form.
 */
export async function GET() {
  try {
    const captcha = await fetchCaptcha();
    return NextResponse.json({
      captcha_token: captcha.captcha_token,
      captcha_image: captcha.captcha_image,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "ক্যাপচা আনতে ব্যর্থ হয়েছে";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
