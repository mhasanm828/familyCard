import { NextRequest, NextResponse } from "next/server";
import { sanitizeForDisplay, searchApplicant } from "@/lib/familycard";

export const dynamic = "force-dynamic";

const TRACKING_NO_RE = /^[1-9][0-9]{9}$/;

/**
 * POST /api/public-search — NO login required, NOTHING is saved.
 * Body: { trackingNo, captchaToken, captchaValue }
 * Application-ID (10-digit tracking number) search ONLY — the same
 * public lookup the government tracking page offers, behind its own
 * captcha. NID/BRN search and the 7-digit internal id are deliberately
 * NOT here: they stay behind login + admin approval on /search, because
 * a public NID lookup would let anyone pull another person's full
 * record, and sequential internal ids are enumerable.
 * Returns the SANITIZED record (no NID / mobile), or { data: null }.
 */
export async function POST(req: NextRequest) {
  let body: {
    trackingNo?: string;
    captchaToken?: string;
    captchaValue?: number | string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "ভুল অনুরোধ।" }, { status: 400 });
  }

  const captchaValue = Number(body.captchaValue);
  if (!body.captchaToken || !Number.isFinite(captchaValue)) {
    return NextResponse.json(
      { error: "ক্যাপচার উত্তর দিন।" },
      { status: 400 },
    );
  }

  const trackingNo = (body.trackingNo ?? "").trim();
  if (!TRACKING_NO_RE.test(trackingNo)) {
    return NextResponse.json(
      { error: "ট্র্যাকিং নম্বর অবশ্যই ১০ ডিজিটের হতে হবে (১–৯ দিয়ে শুরু)।" },
      { status: 400 },
    );
  }

  try {
    const result = await searchApplicant({
      mode: "tracking",
      trackingNo,
      captchaToken: body.captchaToken,
      captchaValue,
    });
    if (!result.data) {
      return NextResponse.json({ status: true, data: null });
    }
    return NextResponse.json({
      status: true,
      data: sanitizeForDisplay(result.data),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "সার্চ করতে ব্যর্থ হয়েছে।";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
