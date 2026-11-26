import { NextRequest, NextResponse } from "next/server";
import { GOV_API_HOST } from "@/lib/familycard";

export const dynamic = "force-dynamic";

/**
 * GET /api/public-image?path=ctm/stage/applications/...jpg — NO login.
 * Public twin of /api/image for the public /new-search result view:
 * the photos belong to the record the visitor just looked up by its
 * 10-digit application id (the same record the government tracking
 * page shows publicly). Same strict path validation as /api/image —
 * only relative storage paths, no "..", no absolute or remote URLs.
 */
export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path") ?? "";
  if (
    !path ||
    path.includes("..") ||
    path.startsWith("http") ||
    path.startsWith("/") ||
    !/^(ctm|storage|cloud)\//.test(path)
  ) {
    return NextResponse.json({ error: "ভুল ছবির ঠিকানা।" }, { status: 400 });
  }

  const upstream = await fetch(`${GOV_API_HOST}/cloud/${path}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      Referer: "https://fc.bhata.gov.bd/application-tracking",
    },
    cache: "no-store",
  });
  if (!upstream.ok) {
    return NextResponse.json(
      { error: `ছবি আনতে ব্যর্থ হয়েছে (HTTP ${upstream.status})` },
      { status: 502 },
    );
  }
  const buf = await upstream.arrayBuffer();
  return new NextResponse(buf, {
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
