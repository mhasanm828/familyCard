import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { COLLECTIONS, getDb, ObjectId, regexEscape, toPlain } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/saved — the logged-in user's saved applications (newest first). */
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "লগইন করা প্রয়োজন।" }, { status: 401 });
  }
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

/** DELETE /api/saved?id=<saved id> — delete one of the user's own rows. */
export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "লগইন করা প্রয়োজন।" }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: "আইডি দিন।" }, { status: 400 });
  }
  await getDb()
    .collection(COLLECTIONS.savedApplications)
    .deleteOne({ _id: new ObjectId(id), userId: session.user.id });
  return NextResponse.json({ ok: true });
}
