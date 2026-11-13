import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { GOV_API_BASE } from "@/lib/familycard";

export const dynamic = "force-dynamic";

/**
 * GET /api/pdf?application_id=<id>&lang=bn — login required.
 * Proxies the OFFICIAL 5-page application form PDF from
 * /global/applicants_copy. Verified live: both the 10-digit application
 * id (10-digit application id) and the 7-digit internal id return
 * the same official PDF.
 */
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "লগইন করা প্রয়োজন।" }, { status: 401 });
  }

  const applicationId = req.nextUrl.searchParams.get("application_id") ?? "";
  const lang = req.nextUrl.searchParams.get("lang") ?? "bn";
  if (!/^\d{7,10}$/.test(applicationId)) {
    return NextResponse.json(
      { error: "আবেদন আইডি সঠিক নয়।" },
      { status: 400 },
    );
  }

  const upstream = await fetch(
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
    },
  );
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
      "Content-Disposition": `attachment; filename="family-card-application-${applicationId}.pdf"`,
    },
  });
}
