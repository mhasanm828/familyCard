import { NextRequest, NextResponse } from "next/server";
import { GOV_API_BASE } from "@/lib/familycard";

export const dynamic = "force-dynamic";

/**
 * GET /api/public-pdf?application_id=<10-digit id>&lang=bn — NO login.
 * Proxies the OFFICIAL application form PDF from /global/applicants_copy.
 * Deliberately 10-digit application ids ONLY (regex below) — the
 * 7-digit internal id is NOT accepted here, because internal ids are
 * sequential and a public endpoint for them would let anyone enumerate
 * and download other people's forms one after another.
 */
export async function GET(req: NextRequest) {
  const applicationId = req.nextUrl.searchParams.get("application_id") ?? "";
  const lang = req.nextUrl.searchParams.get("lang") ?? "bn";
  if (!/^[1-9][0-9]{9}$/.test(applicationId)) {
    return NextResponse.json(
      { error: "আবেদন আইডি অবশ্যই ১০ ডিজিটের হতে হবে।" },
      { status: 400 },
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  let upstream: Response;
  try {
    upstream = await fetch(
      `${GOV_API_BASE}/global/applicants_copy?application_id=${encodeURIComponent(
        applicationId,
      )}&lang=${encodeURIComponent(lang)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
          Origin: "https://fc.bhata.gov.bd",
          Referer: "https://fc.bhata.gov.bd/application-tracking",
          Accept: "application/pdf",
        },
        cache: "no-store",
        signal: controller.signal,
      },
    );
  } catch {
    clearTimeout(timer);
    return NextResponse.json(
      { error: "সরকারি সার্ভার থেকে সাড়া আসছে না — আবার চেষ্টা করুন।" },
      { status: 502 },
    );
  }
  clearTimeout(timer);
  if (!upstream.ok) {
    return NextResponse.json(
      { error: `PDF আনতে ব্যর্থ হয়েছে (HTTP ${upstream.status})` },
      { status: 502 },
    );
  }
  const buf = await upstream.arrayBuffer();
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="family-card-${applicationId}.pdf"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
