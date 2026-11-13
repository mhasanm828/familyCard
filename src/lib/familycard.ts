/**
 * Family Card government API client (server-side only).
 *
 * Verified live from fc.bhata.gov.bd (Nov 2026):
 * - Base: https://familycard-api.bhata.gov.bd/api/v1
 * - Captcha: GET /captcha -> { captcha_token, captcha_image }
 * - Tracking: POST /global/applicants_tracking (multipart/form-data)
 * - Images: GET https://familycard-api.bhata.gov.bd/cloud/<path>
 * - Official PDF: GET /global/applicants_copy?application_id=<id>&lang=bn
 *
 * PRIVACY: the API returns NID / verification numbers and mobile numbers.
 * They are NEVER shown in the UI, never stored in the database and never
 * logged. sanitizeForDisplay() masks them as "***"; sanitizeForStorage()
 * removes them entirely.
 */

export const GOV_API_BASE = "https://familycard-api.bhata.gov.bd/api/v1";
export const GOV_API_HOST = "https://familycard-api.bhata.gov.bd";
export const GOV_SITE = "https://fc.bhata.gov.bd";

const GOV_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  Origin: "https://fc.bhata.gov.bd",
  Referer: "https://fc.bhata.gov.bd/application-tracking",
  Accept: "application/json",
};

export interface CaptchaResponse {
  captcha_token: string;
  captcha_image: string; // data:image/...;base64,... (arithmetic sum)
}

export interface ApplicantData {
  id?: number;
  application_id?: string;
  name_bn?: string;
  name_en?: string;
  father_name_bn?: string;
  father_name_en?: string;
  mother_name_bn?: string;
  mother_name_en?: string;
  date_of_birth?: string;
  age?: number;
  status?: string; // "0" = accepted, not yet approved
  score?: number; // PMT score
  allowance_amount?: number;
  approve_date?: string | null;
  created_at?: string;
  updated_at?: string;
  no_of_family_members?: number;
  current_address?: string;
  permanent_address?: string;
  current_post_code?: string;
  permanent_post_code?: string;
  current_upazila_id?: number;
  current_district_id?: number;
  current_union_id?: number;
  current_ward_id?: number;
  account_name?: string | null;
  account_number?: string | null;
  account_owner?: string;
  account_type?: number;
  bank_name?: string | null;
  branch_name?: string | null;
  mfs_name?: string | null;
  image?: string | null;
  signature?: string | null;
  house_image?: string | null;
  program?: { name_bn?: string; name_en?: string; payment_cycle?: string };
  office_has_ward?: {
    office?: { name_bn?: string; name_en?: string };
  };
  [key: string]: unknown;
}

export interface TrackingResponse {
  status: boolean;
  message?: string;
  data: ApplicantData | null;
}

/** Keys that must never leave the server unmasked. */
const SENSITIVE_KEY = /mobile|verification_number|verification_no|nid_no/i;

function scrub(
  value: unknown,
  mode: "mask" | "remove",
): unknown {
  if (Array.isArray(value)) return value.map((v) => scrub(v, mode));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEY.test(k)) {
        if (mode === "mask") out[k] = "***";
        // mode "remove": drop the key entirely
        continue;
      }
      out[k] = scrub(v, mode);
    }
    return out;
  }
  return value;
}

/** For the UI / raw-JSON view: sensitive values become "***". */
export function sanitizeForDisplay(data: ApplicantData): ApplicantData {
  return scrub(data, "mask") as ApplicantData;
}

/** For the database: sensitive values are deleted completely. */
export function sanitizeForStorage(data: ApplicantData): ApplicantData {
  return scrub(data, "remove") as ApplicantData;
}

/** True when no payment destination exists on the record. */
export function isPaymentBlank(data: ApplicantData): boolean {
  return !data.account_number && !data.account_name && !data.mfs_name;
}

export function statusLabel(status?: string): {
  label: string;
  tone: "amber" | "green" | "red" | "gray";
} {
  switch (String(status ?? "")) {
    case "0":
      return { label: "গৃহীত — অনুমোদন হয়নি", tone: "amber" };
    case "1":
      return { label: "সুপারিশের জন্য পাঠানো হয়েছে", tone: "gray" };
    case "2":
      return { label: "অনুমোদিত", tone: "green" };
    case "3":
      return { label: "অপেক্ষমাণ", tone: "amber" };
    case "4":
      return { label: "বাতিলকৃত", tone: "red" };
    case "5":
      return { label: "সুপারিশকৃত", tone: "green" };
    default:
      return { label: "অবস্থা জানা যায়নি", tone: "gray" };
  }
}

export async function fetchCaptcha(): Promise<CaptchaResponse> {
  const res = await fetch(`${GOV_API_BASE}/captcha`, {
    headers: GOV_HEADERS,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`ক্যাপচা আনতে ব্যর্থ হয়েছে (HTTP ${res.status})`);
  }
  return (await res.json()) as CaptchaResponse;
}

export type SearchMode = "tracking" | "idcard";

export interface SearchInput {
  mode: SearchMode;
  trackingNo?: string;
  nid?: string;
  dateOfBirth?: string;
  captchaToken: string;
  captchaValue: number;
}

export async function searchApplicant(
  input: SearchInput,
): Promise<TrackingResponse> {
  const form = new FormData();
  form.append("captcha_token", input.captchaToken);
  form.append("captcha_value", String(input.captchaValue));
  if (input.mode === "tracking") {
    form.append("tracking_type", "2");
    form.append("tracking_no", input.trackingNo ?? "");
    form.append("nid", "");
    form.append("date_of_birth", "");
  } else {
    form.append("tracking_type", "1");
    form.append("tracking_no", "");
    form.append("nid", input.nid ?? "");
    form.append("date_of_birth", input.dateOfBirth ?? "");
  }

  const res = await fetch(`${GOV_API_BASE}/global/applicants_tracking`, {
    method: "POST",
    headers: GOV_HEADERS,
    body: form,
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as TrackingResponse | null;
  if (!res.ok || !json) {
    throw new Error(
      `সার্চ করতে ব্যর্থ হয়েছে (HTTP ${res.status}) — আবার চেষ্টা করুন।`,
    );
  }
  return json;
}

/** Build the proxied image URL served by our own /api/image route. */
export function proxiedImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return `/api/image?path=${encodeURIComponent(path)}`;
}

export function officialPdfUrl(applicationId: string): string {
  return `/api/pdf?application_id=${encodeURIComponent(applicationId)}`;
}
