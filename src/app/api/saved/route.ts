import { NextRequest, NextResponse } from "next/server";
import { requireApprovedApi } from "@/lib/access";
import { COLLECTIONS, getDb, ObjectId, regexEscape, toPlain } from "@/lib/db";
import { saveApplicationRecord } from "@/lib/save-application";

export const dynamic = "force-dynamic";

/** GET /api/saved — the logged-in user's saved applications (newest first). */
export async function GET(req: NextRequest) {
  const gate = await requireApprovedApi();
  if (gate instanceof NextResponse) return gate;
  const session = gate.session;
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const query: Record<string, unknown> = { userId: session.user.id };
  if (q) {
    const re = { $regex: regexEscape(q), $options: "i" };
    query.$or = [
      { applicationId: re },
      { nameBn: re },
      { nameEn: re },
    ];
  }
  const rows = await getDb()
    .collection(COLLECTIONS.savedApplications)
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();
  return NextResponse.json({ items: rows.map((r) => toPlain(r)) });
}

/** POST /api/saved — explicitly save one application (the "সেভ করুন"
 *  button on a search result). Body: { applicationId, data } where
 *  data is the sanitized record the search returned. The record is
 *  re-sanitized server-side and upserted, so tapping Save twice is
 *  safe — the second tap just updates the same row. */
export async function POST(req: NextRequest) {
  const gate = await requireApprovedApi();
  if (gate instanceof NextResponse) return gate;
  const session = gate.session;
  let body: {
    applicationId?: string;
    data?: Record<string, unknown>;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "ভুল অনুরোধ।" }, { status: 400 });
  }
  const applicationId = String(body.applicationId ?? "").trim();
  if (!/^\d{10}$/.test(applicationId) || !body.data) {
    return NextResponse.json(
      { error: "আবেদন আইডি ও তথ্য দিন।" },
      { status: 400 },
    );
  }
  const data = {
    ...body.data,
    application_id: applicationId,
  } as Parameters<typeof saveApplicationRecord>[1];
  const ok = await saveApplicationRecord(session.user.id, data);
  if (!ok) {
    return NextResponse.json(
      { error: "সেভ করা যায়নি।" },
      { status: 400 },
    );
  }
  return NextResponse.json({ ok: true, saved: true });
}

/** DELETE /api/saved?id=<saved id> — delete one of the user's own rows. */
export async function DELETE(req: NextRequest) {
  const gate = await requireApprovedApi();
  if (gate instanceof NextResponse) return gate;
  const session = gate.session;
  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: "আইডি দিন।" }, { status: 400 });
  }
  await getDb()
    .collection(COLLECTIONS.savedApplications)
    .deleteOne({ _id: new ObjectId(id), userId: session.user.id });
  return NextResponse.json({ ok: true });
}
