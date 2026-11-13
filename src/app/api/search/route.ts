import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  isPaymentBlank,
  sanitizeForDisplay,
  sanitizeForStorage,
  searchApplicant,
  type SearchMode,
} from "@/lib/familycard";

export const dynamic = "force-dynamic";

const TRACKING_NO_RE = /^[1-9][0-9]{9}$/;
const NID_RE = /^([1-9][0-9]{9}|[1-9][0-9]{16})$/;
const BRN_RE = /^(19|20)[0-9]{15}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * POST /api/search — login required.
 * Body: { mode: "tracking" | "idcard", trackingNo?, nid?, dateOfBirth?,
 *         captchaToken, captchaValue }
 * Forwards the search to the government API (multipart/form-data, exactly
 * like fc.bhata.gov.bd does) and, on a hit, saves the SANITIZED record
 * (no NID / mobile) under the logged-in user.
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

  try {
    const result = await searchApplicant({
      mode: body.mode,
      trackingNo: body.trackingNo?.trim(),
      nid: body.nid?.trim(),
      dateOfBirth: body.dateOfBirth,
      captchaToken: body.captchaToken,
      captchaValue,
    });

    if (!result.data) {
      return NextResponse.json({ status: true, data: null });
    }

    const data = result.data;
    const applicationId = String(data.application_id ?? "");
    if (applicationId) {
      const clean = sanitizeForStorage(data);
      await prisma.savedApplication.upsert({
        where: {
          userId_applicationId: {
            userId: session.user.id,
            applicationId,
          },
        },
        update: {
          nameBn: data.name_bn ?? null,
          nameEn: data.name_en ?? null,
          status: data.status != null ? String(data.status) : null,
          score: typeof data.score === "number" ? data.score : null,
          allowanceAmount:
            typeof data.allowance_amount === "number"
              ? data.allowance_amount
              : null,
          approveDate: data.approve_date ?? null,
          createdAtGov: data.created_at ?? null,
          officeName:
            data.office_has_ward?.office?.name_bn ??
            data.office_has_ward?.office?.name_en ??
            null,
          paymentBlank: isPaymentBlank(data),
          familyMembers:
            typeof data.no_of_family_members === "number"
              ? data.no_of_family_members
              : null,
          internalId: data.id != null ? String(data.id) : null,
          rawJson: JSON.stringify(clean),
        },
        create: {
          userId: session.user.id,
          applicationId,
          nameBn: data.name_bn ?? null,
          nameEn: data.name_en ?? null,
          status: data.status != null ? String(data.status) : null,
          score: typeof data.score === "number" ? data.score : null,
          allowanceAmount:
            typeof data.allowance_amount === "number"
              ? data.allowance_amount
              : null,
          approveDate: data.approve_date ?? null,
          createdAtGov: data.created_at ?? null,
          officeName:
            data.office_has_ward?.office?.name_bn ??
            data.office_has_ward?.office?.name_en ??
            null,
          paymentBlank: isPaymentBlank(data),
          familyMembers:
            typeof data.no_of_family_members === "number"
              ? data.no_of_family_members
              : null,
          internalId: data.id != null ? String(data.id) : null,
          rawJson: JSON.stringify(clean),
        },
      });
    }

    return NextResponse.json({
      status: true,
      data: sanitizeForDisplay(data),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "সার্চ করতে ব্যর্থ হয়েছে।";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
