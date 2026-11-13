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
  const res = await fetchWithTimeout(`${GOV_API_BASE}/captcha`, {
    headers: GOV_HEADERS,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`ক্যাপচা আনতে ব্যর্থ হয়েছে (HTTP ${res.status})`);
  }
  return (await res.json()) as CaptchaResponse;
}

export type SearchMode = "tracking" | "idcard" | "idpdf";

/** Mask an NID/BRN for history labels: first 3 + "***" + last 2.
 *  The full number is never stored anywhere. */
export function maskNid(nid: string): string {
  const clean = (nid ?? "").trim();
  if (clean.length <= 5) return "***";
  return `${clean.slice(0, 3)}***${clean.slice(-2)}`;
}

/** Check whether the official PDF exists for an application/internal
 *  id — GETs the applicants_copy endpoint and cancels the body after
 *  the headers arrive, so no PDF bytes are downloaded. Works with
 *  both the 10-digit application id and the 7-digit internal id.
 *  Any failure (timeout, network, non-PDF answer) means "no PDF" —
 *  it never throws, so a slow/unknown id degrades to a clean
 *  not-found instead of hanging the request. */
export async function checkPdfAvailable(
  applicationId: string,
): Promise<boolean> {
  let res: Response;
  try {
    res = await fetchWithTimeout(
      `${GOV_API_BASE}/global/applicants_copy?application_id=${encodeURIComponent(
        applicationId,
      )}&lang=bn`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
          Origin: "https://fc.bhata.gov.bd",
          Referer: "https://fc.bhata.gov.bd/application-tracking",
          Accept: "application/pdf",
        },
        cache: "no-store",
      },
      30000,
    );
  } catch {
    return false;
  }
  const ok =
    res.ok && (res.headers.get("content-type") ?? "").includes("pdf");
  try {
    await res.body?.cancel();
  } catch {
    // Ignore — the connection is already closing.
  }
  return ok;
}

export interface SearchInput {
  mode: SearchMode;
  trackingNo?: string;
  nid?: string;
  dateOfBirth?: string;
  captchaToken: string;
  captchaValue: number;
}

/** fetch() with a hard timeout — the government API sometimes hangs
 *  on unknown ids, and an unbounded fetch would freeze the request
 *  (and the user's form) forever. Aborts throw a Bangla error. */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  ms = 30000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new Error("সরকারি সার্ভার থেকে সাড়া আসছে না — আবার চেষ্টা করুন।");
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
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

  const res = await fetchWithTimeout(`${GOV_API_BASE}/global/applicants_tracking`, {
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
