import { NextRequest, NextResponse } from "next/server";
import { requireApprovedApi } from "@/lib/access";
import { COLLECTIONS, getDb, type SearchResultStatus } from "@/lib/db";
import {
  checkPdfAvailable,
  officialPdfUrl,
  sanitizeForDisplay,
  searchApplicant,
} from "@/lib/familycard";
import { saveApplicationRecord } from "@/lib/save-application";

export const dynamic = "force-dynamic";

/** Exactly 7 digits (internal id) or exactly 10 digits (application id). */
const ID_RE = /^(\d{7}|\d{10})$/;

/**
 * POST /api/pdf-search — login required.
 * Body: { id, captchaToken?, captchaValue? }
 *
 * "আইডি দিয়ে PDF" — the PDF-download shortcut. The official PDF
 * endpoint needs NO captcha and accepts BOTH the 10-digit application
 * id and the 7-digit internal id, so:
 * - 7-digit id: only the PDF is checked/offered (a tracking lookup
 *   returns nothing for internal ids — verified against the live API).
 *   No captcha is needed.
 * - 10-digit id: the normal tracking lookup runs too (captcha is
 *   required for it, exactly like the tracking mode), and the basic
 *   result info is returned above the download button. A hit is also
 *   auto-saved, like a normal search.
 *
 * EVERY attempt is recorded in search_history (result "pdf" when the
 * PDF is available, "found" when the tracking lookup hits, "not_found"
 * when neither does, "error" on failure). Only the id itself is
 * stored — it is a public application id, not an NID/mobile.
 */
export async function POST(req: NextRequest) {
  const gate = await requireApprovedApi();
  if (gate instanceof NextResponse) return gate;
  const session = gate.session;
  const userId = session.user.id;

  let body: {
    id?: string;
    captchaToken?: string;
    captchaValue?: number | string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "ভুল অনুরোধ।" }, { status: 400 });
  }

  const id = (body.id ?? "").trim();
  if (!ID_RE.test(id)) {
    return NextResponse.json(
      { error: "আইডি ৭ ডিজিট (ভেতরের আইডি) বা ১০ ডিজিট (আবেদন আইডি) হতে হবে।" },
      { status: 400 },
    );
  }
  const isTenDigit = id.length === 10;

  // A tracking lookup needs a solved captcha — only the 10-digit path
  // does one, so only it requires the captcha fields.
  const captchaValue = Number(body.captchaValue);
  if (isTenDigit && (!body.captchaToken || !Number.isFinite(captchaValue))) {
    return NextResponse.json(
      { error: "১০ ডিজিটের আইডির জন্য ক্যাপচার উত্তর দিন।" },
      { status: 400 },
    );
  }

  async function recordHistory(
    result: SearchResultStatus,
    applicationId: string | null,
  ) {
    try {
      await getDb()
        .collection(COLLECTIONS.searchHistory)
        .insertOne({
          userId,
          mode: "idpdf",
          queryLabel: `আইডি PDF ${id}`,
          queryId: id,
          applicationId,
          found: result === "found" || result === "pdf",
          result,
          createdAt: new Date(),
        });
    } catch {
      // History must never break the request.
    }
  }

  try {
    // 10-digit: tracking lookup + PDF check in parallel.
    // 7-digit: PDF check only.
    const [tracking, pdfOk] = await Promise.all([
      isTenDigit
        ? searchApplicant({
            mode: "tracking",
            trackingNo: id,
            captchaToken: body.captchaToken as string,
            captchaValue,
          })
        : Promise.resolve(null),
      checkPdfAvailable(id),
    ]);

    const data = tracking?.data ?? null;
    let saved = false;
    if (data) {
      saved = await saveApplicationRecord(userId, data);
    }

    const result: SearchResultStatus = data
      ? "found"
      : pdfOk
        ? "pdf"
        : "not_found";
    await recordHistory(result, data ? String(data.application_id ?? id) : null);

    return NextResponse.json({
      status: true,
      pdfOk,
      pdfUrl: pdfOk ? officialPdfUrl(id) : null,
      data: data ? sanitizeForDisplay(data) : null,
      saved,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "PDF খুঁজতে ব্যর্থ হয়েছে।";
    await recordHistory("error", null);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
