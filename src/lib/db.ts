import { Db, MongoClient, ObjectId } from "mongodb";

/**
 * Native MongoDB driver — no ORM.
 *
 * - Connection string comes from DATABASE_URL only (mongodb:// or
 *   mongodb+srv://). There is no other database variable.
 * - Database name: `familycard`.
 * - Collections: users, sessions, accounts, verifications (Better Auth,
 *   via the MongoDB adapter with usePlural), saved_applications and
 *   search_history (this app's own data).
 *
 * The client is created lazily and never connects at import time, so
 * `next build` works even before DATABASE_URL is set. The first real
 * query connects. If DATABASE_URL is missing at runtime, the first
 * query throws a clear Bangla error instead of crashing the build.
 */

const DB_NAME = "familycard";

// Placeholder URI used ONLY so the client can be constructed at import
// time (e.g. during `next build`). No connection is ever attempted
// against it: every real operation goes through getDb(), which throws
// when DATABASE_URL is not set.
const FALLBACK_URI = "mongodb://localhost:27017/familycard";

let client: MongoClient | null = null;

export function getClient(): MongoClient {
  if (!client) {
    client = new MongoClient(process.env.DATABASE_URL ?? FALLBACK_URI);
  }
  return client;
}

export function getDb(): Db {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL সেট করা হয়নি।");
  }
  return getClient().db(DB_NAME);
}

export const COLLECTIONS = {
  users: "users",
  sessions: "sessions",
  accounts: "accounts",
  verifications: "verifications",
  savedApplications: "saved_applications",
  searchHistory: "search_history",
} as const;

export { ObjectId };

/** A saved application as stored in MongoDB (sanitized — no NID/mobile). */
export interface SavedApplicationDoc {
  _id?: ObjectId;
  id?: string;
  userId: string;
  applicationId: string;
  internalId?: string | null;
  nameBn?: string | null;
  nameEn?: string | null;
  status?: string | null;
  score?: number | null;
  allowanceAmount?: number | null;
  approveDate?: string | null;
  createdAtGov?: string | null;
  officeName?: string | null;
  paymentBlank: boolean;
  familyMembers?: number | null;
  rawJson: string;
  createdAt: Date;
  updatedAt: Date;
}

/** One search attempt by a user. queryLabel is masked — the NID itself
 *  is NEVER stored. Re-runs use the applicationId when known. */
export interface SearchHistoryDoc {
  _id?: ObjectId;
  id?: string;
  userId: string;
  mode: "tracking" | "idcard";
  queryLabel: string;
  applicationId?: string | null;
  found: boolean;
  createdAt: Date;
}

/** Convert a MongoDB document to a plain JSON-safe object:
 *  _id (ObjectId) -> id (string), Date -> ISO string, recursively. */
export function toPlain<T>(doc: T): T {
  if (doc === null || doc === undefined) return doc;
  if (doc instanceof ObjectId) return doc.toHexString() as T;
  if (doc instanceof Date) return doc.toISOString() as T;
  if (Array.isArray(doc)) return doc.map((v) => toPlain(v)) as T;
  if (typeof doc === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(doc as Record<string, unknown>)) {
      if (k === "_id") {
        out.id = v instanceof ObjectId ? v.toHexString() : String(v);
      } else {
        out[k] = toPlain(v);
      }
    }
    return out as T;
  }
  return doc;
}

/** Escape a value for a MongoDB case-insensitive "contains" search. */
export function regexEscape(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
