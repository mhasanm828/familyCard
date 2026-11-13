import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { COLLECTIONS, getDb, type SearchResultStatus } from "@/lib/db";
import {
  maskNid,
  sanitizeForDisplay,
  searchApplicant,
  type SearchMode,
} from "@/lib/familycard";
import { saveApplicationRecord } from "@/lib/save-application";

export const dynamic = "force-dynamic";

const TRACKING_NO_RE = /^[1-9][0-9]{9}$/;
const NID_RE = /^([1-9][0-9]{9}|[1-9][0-9]{16})$/;
const BRN_RE = /^(19|20)[0-9]{15}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * POST /api/search — login required.
 * Body: { mode: "tracking" | "idcard", trackingNo?, nid?, dateOfBirth?,
 *         captchaToken, captchaValue }
 * Forwards the search to the government API (multipart/form-data) and, on
 * a hit, saves the SANITIZED record (no NID / mobile) under the logged-in
 * user. EVERY attempt is recorded in search_history — found, not-found
 * and errors alike — with only a masked label (the NID itself is never
 * stored; DOB is never stored).
 * A successful call with no record returns { data: null }.
 */
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json(
      { error: "লগইন করা প্রয়োজন।" },
      { status: 401 },
    );
  }
  const userId = session.user.id;

  let body: {
    mode?: SearchMode;
    trackingNo?: string;
    nid?: string;
    dateOfBirth?: string;
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

  if (body.mode === "tracking") {
    const trackingNo = (body.trackingNo ?? "").trim();
    if (!TRACKING_NO_RE.test(trackingNo)) {
      return NextResponse.json(
        { error: "ট্র্যাকিং নম্বর অবশ্যই ১০ ডিজিটের হতে হবে (১–৯ দিয়ে শুরু)।" },
        { status: 400 },
      );
    }
  } else if (body.mode === "idcard") {
    const nid = (body.nid ?? "").trim();
    if (!NID_RE.test(nid) && !BRN_RE.test(nid)) {
      return NextResponse.json(
        { error: "NID ১০ বা ১৭ ডিজিট, অথবা BRN ১৭ ডিজিট হতে হবে।" },
        { status: 400 },
      );
    }
    if (!body.dateOfBirth || !DATE_RE.test(body.dateOfBirth)) {
      return NextResponse.json(
        { error: "সঠিক জন্ম তারিখ দিন (বছর-মাস-দিন)।" },
        { status: 400 },
      );
    }
  } else {
    return NextResponse.json(
      { error: "সার্চের ধরন নির্বাচন করুন।" },
      { status: 400 },
    );
  }

  // Masked label for the history — the NID itself is never stored,
  // and the date of birth is never stored at all.
  const mode = body.mode as "tracking" | "idcard";
  const queryLabel =
    mode === "tracking"
      ? `ট্র্যাকিং ${(body.trackingNo ?? "").trim()}`
      : `NID ${maskNid(body.nid ?? "")}`;
  const queryId =
    mode === "tracking" ? (body.trackingNo ?? "").trim() : null;

  async function recordHistory(
    result: SearchResultStatus,
    applicationId: string | null,
  ) {
    try {
      await getDb()
        .collection(COLLECTIONS.searchHistory)
        .insertOne({
          userId,
          mode,
          queryLabel,
          queryId,
          applicationId,
          found: result === "found",
          result,
          createdAt: new Date(),
        });
    } catch {
      // History is a nicety — a failed insert must never break a search.
    }
  }

  try {
    const result = await searchApplicant({
      mode,
      trackingNo: body.trackingNo?.trim(),
      nid: body.nid?.trim(),
      dateOfBirth: body.dateOfBirth,
      captchaToken: body.captchaToken,
      captchaValue,
    });

    if (!result.data) {
      await recordHistory("not_found", null);
      return NextResponse.json({ status: true, data: null, saved: false });
    }

    const data = result.data;
    const applicationId = String(data.application_id ?? "");
    const saved = applicationId
      ? await saveApplicationRecord(userId, data)
      : false;
    await recordHistory("found", applicationId || null);

    return NextResponse.json({
      status: true,
      data: sanitizeForDisplay(data),
      saved,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "সার্চ করতে ব্যর্থ হয়েছে।";
    await recordHistory("error", null);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
