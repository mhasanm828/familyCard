import { NextRequest, NextResponse } from "next/server";
import { requireApprovedApi } from "@/lib/access";
import { COLLECTIONS, getDb, toPlain } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/saved/export?format=csv|json — download the logged-in user's
 * saved applications. Only sanitized fields are exported (no NID /
 * mobile — those are never stored in the first place).
 */

function csvCell(value: unknown): string {
  const s =
    value === null || value === undefined ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  const gate = await requireApprovedApi();
  if (gate instanceof NextResponse) return gate;
  const session = gate.session;
  const format = req.nextUrl.searchParams.get("format") ?? "csv";
  const rows = await getDb()
    .collection(COLLECTIONS.savedApplications)
    .find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .toArray();
  const items = rows.map((r) => toPlain(r)) as Record<string, unknown>[];

  if (format === "json") {
    const body = JSON.stringify(items, null, 2);
    return new NextResponse(body, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="family-card-saved.json"',
      },
    });
  }

  const header = [
    "application_id",
    "name_bn",
    "name_en",
    "status",
    "pmt_score",
    "allowance_amount",
    "office",
    "payment_blank",
    "family_members",
    "created_at",
  ];
  const lines = [
    header.join(","),
    ...items.map((r) =>
      [
        r.applicationId,
        r.nameBn,
        r.nameEn,
        r.status,
        r.score,
        r.allowanceAmount,
        r.officeName,
        r.paymentBlank ? "yes" : "no",
        r.familyMembers,
        r.createdAt,
      ]
        .map(csvCell)
        .join(","),
    ),
  ];
  // BOM so Excel opens the Bangla text correctly.
  const body = "\uFEFF" + lines.join("\r\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="family-card-saved.csv"',
    },
  });
}
