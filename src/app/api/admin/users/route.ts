import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, resolveAccess } from "@/lib/access";
import { isAdminEmail } from "@/lib/admin-email";
import { COLLECTIONS, getDb, ObjectId, toPlain, type UserDoc } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Admin user management — /api/admin/users (admin only).
 *
 * GET — all users, newest first (name, email, role, approved, createdAt).
 * PATCH { userId, action } — action: "approve" | "revoke" |
 * "makeAdmin" | "removeAdmin".
 *
 * Server-side protections (the dashboard UI also hides the buttons):
 * - Nobody can revoke or demote themselves.
 * - The last remaining admin cannot be revoked or demoted.
 * - The ADMIN_EMAIL (owner) account cannot be revoked or demoted —
 *   its admin status comes from the env var, so change the env var.
 * - Revoking an admin also removes the admin role, otherwise the
 *   admin bypass in lib/access.ts would re-approve them instantly.
 */

type Action = "approve" | "revoke" | "makeAdmin" | "removeAdmin";

function publicUser(user: UserDoc) {
  const plain = toPlain(user) as unknown as Record<string, unknown>;
  const access = resolveAccess({
    email: typeof plain.email === "string" ? plain.email : null,
    role: plain.role,
    approved: plain.approved,
  });
  return {
    id: String(plain.id ?? ""),
    name: typeof plain.name === "string" ? plain.name : "",
    email: typeof plain.email === "string" ? plain.email : "",
    role: access.role,
    approved: access.approved,
    isOwner: isAdminEmail(
      typeof plain.email === "string" ? plain.email : null,
    ),
    createdAt: typeof plain.createdAt === "string" ? plain.createdAt : "",
  };
}

export async function GET() {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;
  const users = await getDb()
    .collection<UserDoc>(COLLECTIONS.users)
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  return NextResponse.json({ users: users.map(publicUser) });
}

export async function PATCH(req: NextRequest) {
  const gate = await requireAdminApi();
  if (gate instanceof NextResponse) return gate;
  const adminId = gate.session.user.id;

  let body: { userId?: string; action?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "ভুল অনুরোধ।" }, { status: 400 });
  }
  const userId = String(body.userId ?? "").trim();
  const action = body.action as Action;
  if (
    !userId ||
    !ObjectId.isValid(userId) ||
    !["approve", "revoke", "makeAdmin", "removeAdmin"].includes(action)
  ) {
    return NextResponse.json({ error: "ভুল অনুরোধ।" }, { status: 400 });
  }

  const usersCol = getDb().collection<UserDoc>(COLLECTIONS.users);
  const target = await usersCol.findOne({ _id: new ObjectId(userId) });
  if (!target) {
    return NextResponse.json(
      { error: "ব্যবহারকারী পাওয়া যায়নি।" },
      { status: 404 },
    );
  }
  const targetAccess = resolveAccess(target);
  const isSelf = userId === adminId;

  // The owner account's admin status comes from ADMIN_EMAIL — the
  // dashboard cannot take it away; change the env var instead.
  if (
    (action === "revoke" || action === "removeAdmin") &&
    isAdminEmail(target.email)
  ) {
    return NextResponse.json(
      {
        error:
          "এই অ্যাকাউন্টটি ADMIN_EMAIL দিয়ে অ্যাডমিন — এখান থেকে সরানো যাবে না।",
      },
      { status: 403 },
    );
  }

  if ((action === "revoke" || action === "removeAdmin") && isSelf) {
    return NextResponse.json(
      { error: "নিজের অ্যাক্সেস বদলানো যায় না।" },
      { status: 403 },
    );
  }

  if (
    (action === "revoke" && targetAccess.isAdmin) ||
    action === "removeAdmin"
  ) {
    // Stored admins only — the ADMIN_EMAIL owner is already blocked
    // above, so counting stored "admin" roles is the right check.
    const adminCount = await usersCol.countDocuments({ role: "admin" });
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "শেষ অ্যাডমিনকে সরানো যাবে না — আগে আরেকজনকে অ্যাডমিন বানান।" },
        { status: 403 },
      );
    }
  }

  let update: Record<string, unknown>;
  switch (action) {
    case "approve":
      update = { approved: true };
      break;
    case "revoke":
      // An admin who is revoked also loses the role, otherwise the
      // admin bypass would approve them again at once.
      update = targetAccess.isAdmin
        ? { approved: false, role: "user" }
        : { approved: false };
      break;
    case "makeAdmin":
      update = { role: "admin", approved: true };
      break;
    case "removeAdmin":
      update = { role: "user" };
      break;
  }

  await usersCol.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { ...update, updatedAt: new Date() } },
  );
  const updated = await usersCol.findOne({ _id: new ObjectId(userId) });
  if (!updated) {
    return NextResponse.json(
      { error: "ব্যবহারকারী পাওয়া যায়নি।" },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true, user: publicUser(updated) });
}
