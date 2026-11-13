import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { auth, type Session } from "./auth";
import { COLLECTIONS, getDb, ObjectId, type UserDoc } from "./db";
import { isAdminEmail } from "./admin-email";

/**
 * Access control — the approval gate.
 *
 * - Every new account starts as role "user" + approved false (see the
 *   signup hook in lib/auth.ts) and CANNOT use search, saved, profile
 *   or PDF download until an admin approves it.
 * - Admins bypass the gate. An account is an admin when its stored
 *   role is "admin" OR its email matches ADMIN_EMAIL (so the owner's
 *   pre-existing account becomes admin the moment the env var is set).
 * - Enforcement is server-side only: page guards redirect, API guards
 *   answer 401/403. The header/nav only HIDES links — it never grants
 *   access by itself. The MongoDB user document is the source of
 *   truth; the session object is never trusted for the decision.
 */

export interface Access {
  role: "admin" | "user";
  approved: boolean;
  isAdmin: boolean;
}

export function resolveAccess(user: {
  email?: string | null;
  role?: unknown;
  approved?: unknown;
}): Access {
  const role: "admin" | "user" =
    user.role === "admin" || isAdminEmail(user.email ?? undefined)
      ? "admin"
      : "user";
  const approved = user.approved === true || role === "admin";
  return { role, approved, isAdmin: role === "admin" };
}

/**
 * Load the fresh user document (source of truth) and resolve access.
 * If the account's email matches ADMIN_EMAIL but the stored document
 * is not an admin yet (e.g. created before the system existed), upgrade
 * it on the spot so the dashboard stays consistent.
 */
export async function getUserAccess(
  userId: string,
): Promise<{ user: UserDoc | null; access: Access }> {
  const denied: Access = { role: "user", approved: false, isAdmin: false };
  let user: UserDoc | null = null;
  try {
    if (ObjectId.isValid(userId)) {
      user = await getDb()
        .collection<UserDoc>(COLLECTIONS.users)
        .findOne({ _id: new ObjectId(userId) });
    }
  } catch {
    user = null;
  }
  if (!user) return { user: null, access: denied };
  const access = resolveAccess(user);
  if (
    isAdminEmail(user.email) &&
    (user.role !== "admin" || user.approved !== true)
  ) {
    try {
      await getDb()
        .collection<UserDoc>(COLLECTIONS.users)
        .updateOne(
          { _id: user._id },
          { $set: { role: "admin", approved: true } },
        );
      user.role = "admin";
      user.approved = true;
    } catch {
      // Best-effort upgrade — the runtime grant above already applies.
    }
  }
  return { user, access };
}

export interface SessionAccess {
  session: Session;
  user: UserDoc | null;
  access: Access;
}

/** Session + fresh access, or null when not logged in.
 * Never throws: if the session lookup fails (e.g. the database is
 * unreachable), the guards treat it as "not logged in" and redirect
 * to /signin instead of letting the page crash into a blank 500 —
 * that blank page is exactly what users saw after login when the
 * database hiccuped. */
export async function getSessionWithAccess(): Promise<SessionAccess | null> {
  let session: Session | null = null;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    return null;
  }
  if (!session) return null;
  const { user, access } = await getUserAccess(session.user.id);
  return { session, user, access };
}

/** Page guard: logged in AND approved. Pending users go to /pending. */
export async function requireApproved(): Promise<SessionAccess> {
  const result = await getSessionWithAccess();
  if (!result) redirect("/signin");
  if (!result.access.approved) redirect("/pending");
  return result;
}

/**
 * Page guard: admin only. Not logged in → /signin; pending → /pending;
 * approved but not admin → home with a Bangla "admin only" banner
 * (?msg=admin-only, rendered by the home page).
 */
export async function requireAdmin(): Promise<SessionAccess> {
  const result = await getSessionWithAccess();
  if (!result) redirect("/signin");
  if (!result.access.approved) redirect("/pending");
  if (!result.access.isAdmin) redirect("/?msg=admin-only");
  return result;
}

const PENDING_MESSAGE =
  "আপনার অ্যাকাউন্ট এখনো অ্যাডমিনের অনুমোদন পায়নি — অনুমোদন পেলেই সার্চ করতে পারবেন।";

/** API guard: 401 when logged out, 403 when the account is pending. */
export async function requireApprovedApi(): Promise<
  SessionAccess | NextResponse
> {
  const result = await getSessionWithAccess();
  if (!result) {
    return NextResponse.json(
      { error: "লগইন করা প্রয়োজন।" },
      { status: 401 },
    );
  }
  if (!result.access.approved) {
    return NextResponse.json({ error: PENDING_MESSAGE }, { status: 403 });
  }
  return result;
}

/** API guard: admin only (401 logged out, 403 pending or not admin). */
export async function requireAdminApi(): Promise<
  SessionAccess | NextResponse
> {
  const result = await getSessionWithAccess();
  if (!result) {
    return NextResponse.json(
      { error: "লগইন করা প্রয়োজন।" },
      { status: 401 },
    );
  }
  if (!result.access.approved) {
    return NextResponse.json({ error: PENDING_MESSAGE }, { status: 403 });
  }
  if (!result.access.isAdmin) {
    return NextResponse.json(
      { error: "এই কাজটি শুধু অ্যাডমিন করতে পারেন।" },
      { status: 403 },
    );
  }
  return result;
}
