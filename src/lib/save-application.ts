import { COLLECTIONS, getDb } from "./db";
import {
  isPaymentBlank,
  sanitizeForStorage,
  type ApplicantData,
} from "./familycard";

/**
 * Shared save/upsert for one application record (sanitized — no NID /
 * mobile ever stored). Used by the search route (auto-save), the
 * PDF-search route and the explicit Save button (POST /api/saved), so
 * all three paths store exactly the same fields.
 * Returns false when the record has no application id to key on.
 */
export async function saveApplicationRecord(
  userId: string,
  data: ApplicantData,
): Promise<boolean> {
  const applicationId = String(data.application_id ?? "");
  if (!applicationId) return false;
  const clean = sanitizeForStorage(data);
  const now = new Date();
  const fields = {
    nameBn: data.name_bn ?? null,
    nameEn: data.name_en ?? null,
    status: data.status != null ? String(data.status) : null,
    score: typeof data.score === "number" ? data.score : null,
    allowanceAmount:
      typeof data.allowance_amount === "number" ? data.allowance_amount : null,
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
    updatedAt: now,
  };
  await getDb()
    .collection(COLLECTIONS.savedApplications)
    .updateOne(
      { userId, applicationId },
      { $set: fields, $setOnInsert: { createdAt: now } },
      { upsert: true },
    );
  return true;
}
