/**
 * The owner's email — the account that is always an admin.
 *
 * Set ADMIN_EMAIL in Vercel env vars (or .env.local) to the email the
 * owner signed up with. Any account with that email is an admin and
 * approved, even if it was created BEFORE this approval system existed
 * (the access check below grants it at runtime and upgrades the stored
 * document on first sight). Never commit a real email here — it comes
 * from the environment only.
 */
export const ADMIN_EMAIL: string | null =
  (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase() || null;

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email || !ADMIN_EMAIL) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}
