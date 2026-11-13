import { NextResponse } from "next/server";
import { getSessionWithAccess } from "@/lib/access";

/**
 * GET /api/route-after-login — where should this account land right
 * after a successful login? The server resolves it from the fresh
 * MongoDB user document (the source of truth), so the client never
 * has to guess the role:
 * - admin → /admin
 * - pending (not approved) → /pending
 * - approved user → /profile
 * - not logged in → 401
 * Used by /auth/callback, the single landing page for email AND
 * social logins.
 */
export async function GET() {
  const result = await getSessionWithAccess();
  if (!result) {
    return NextResponse.json(
      { error: "লগইন করা প্রয়োজন।" },
      { status: 401 },
    );
  }
  const { access } = result;
  const destination = access.isAdmin
    ? "/admin"
    : !access.approved
      ? "/pending"
      : "/profile";
  return NextResponse.json({ destination });
}
