import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** GET /api/saved — the logged-in user's saved applications (newest first). */
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "লগইন করা প্রয়োজন।" }, { status: 401 });
  }
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const rows = await prisma.savedApplication.findMany({
    where: {
      userId: session.user.id,
      ...(q
        ? {
            OR: [
              { applicationId: { contains: q } },
              { nameBn: { contains: q } },
              { nameEn: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items: rows });
}

/** DELETE /api/saved?id=<saved id> — delete one of the user's own rows. */
export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "লগইন করা প্রয়োজন।" }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!id) {
    return NextResponse.json({ error: "আইডি দিন।" }, { status: 400 });
  }
  await prisma.savedApplication.deleteMany({
    where: { id, userId: session.user.id },
  });
  return NextResponse.json({ ok: true });
}
