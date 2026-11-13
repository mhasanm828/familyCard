import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { COLLECTIONS, getDb, ObjectId, toPlain } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Search history — the logged-in user's recent searches (newest first).
 * Only masked labels are stored; the NID itself is never in the history.
 * Re-runs use the found applicationId (tracking search), so no NID is
 * needed again.
 */

/** GET /api/history — last 20 searches. */
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "লগইন করা প্রয়োজন।" }, { status: 401 });
  }
  const rows = await getDb()
    .collection(COLLECTIONS.searchHistory)
    .find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();
  return NextResponse.json({ items: rows.map((r) => toPlain(r)) });
}

/**
 * DELETE /api/history?id=<history id> — delete one entry.
 * DELETE /api/history?all=1 — clear the whole history.
 */
export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "লগইন করা প্রয়োজন।" }, { status: 401 });
  }
  const all = req.nextUrl.searchParams.get("all") === "1";
  if (all) {
    await getDb()
      .collection(COLLECTIONS.searchHistory)
      .deleteMany({ userId: session.user.id });
    return NextResponse.json({ ok: true });
  }
  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: "আইডি দিন।" }, { status: 400 });
  }
  await getDb()
    .collection(COLLECTIONS.searchHistory)
    .deleteOne({ _id: new ObjectId(id), userId: session.user.id });
  return NextResponse.json({ ok: true });
}
