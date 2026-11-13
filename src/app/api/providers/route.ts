import { NextResponse } from "next/server";
import { socialProvidersEnabled } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/providers — which social logins are actually configured.
 * Only booleans are returned; no credentials ever leave the server.
 */
export async function GET() {
  return NextResponse.json(socialProvidersEnabled);
}
