import { NextResponse } from "next/server";
import { fetchCaptcha } from "@/lib/familycard";

export const dynamic = "force-dynamic";

/**
 * GET /api/public-captcha — NO login required.
 * Same arithmetic captcha from the government API as /api/captcha,
 * but open to everyone: the public /new-search page needs it, and the
 * government tracking page itself serves this captcha publicly.
 * Only the token + image leave the server — nothing else.
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
