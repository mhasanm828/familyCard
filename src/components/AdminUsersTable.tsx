"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  approved: boolean;
  /** Email matches ADMIN_EMAIL — the server will refuse revoke/demote. */
  isOwner: boolean;
  createdAt: string;
}

type Action = "approve" | "revoke" | "makeAdmin" | "removeAdmin";

const ACTION_LABEL: Record<Action, string> = {
  approve: "অনুমোদন দিন",
  revoke: "অ্যাক্সেস বাতিল",
  makeAdmin: "অ্যাডমিন বানান",
  removeAdmin: "অ্যাডমিন সরান",
};

/**
 * Admin users table — approve / revoke access and promote / demote
 * admins. The server re-checks everything (last-admin protection,
 * no self-revoke, ADMIN_EMAIL cannot be revoked); this component only
 * renders the result.
 */
export default function AdminUsersTable({
  users: initialUsers,
  currentUserId,
}: {
  users: AdminUserRow[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  async function runAction(user: AdminUserRow, action: Action) {
    setError("");
    setDone("");
    setBusyId(`${user.id}:${action}`);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, action }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        user?: AdminUserRow;
      };
      if (!res.ok || !body.user) {
        setError(body.error ?? "কাজটি করা যায়নি। আবার চেষ্টা করুন।");
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? body.user as AdminUserRow : u)),
      );
      setDone(
        `${user.email} — ${ACTION_LABEL[action]} হয়েছে।`,
      );
    } catch {
      setError("সার্ভারের সাথে সংযোগ হয়নি — আবার চেষ্টা করুন।");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-4">
      {error && (
        <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200 dark:bg-red-950/50 dark:text-red-200 dark:ring-red-900">
          {error}
        </p>
      )}
      {done && (
        <p className="mb-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-900">
          {done}
        </p>
      )}
      {users.length === 0 ? (
        <p className="text-sm text-stone-500 dark:text-stone-400">
          এখনো কোনো ব্যবহারকারী নেই।
        </p>
      ) : (
        <ul className="divide-y divide-stone-100 dark:divide-stone-800">
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            return (
              <li key={user.id} className="flex flex-wrap items-center gap-3 py-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    user.role === "admin"
                      ? "bg-brand-700 text-white"
                      : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300"
                  }`}
                >
                  {(user.name || user.email || "?").trim().charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-stone-800 dark:text-stone-100">
                    {user.name || "—"}
                    {isSelf ? " (আপনি)" : ""}
                    {user.isOwner ? " • মালিক" : ""}
                  </p>
                  <p className="truncate text-xs text-stone-500 dark:text-stone-400">
                    {user.email}
                  </p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold ${
                        user.role === "admin"
                          ? "bg-brand-50 text-brand-700 dark:bg-brand-900/50 dark:text-emerald-300"
                          : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300"
                      }`}
                    >
                      <ShieldCheck className="h-3 w-3" />
                      {user.role === "admin" ? "অ্যাডমিন" : "ব্যবহারকারী"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold ${
                        user.approved
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                      }`}
                    >
                      {user.approved ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          অনুমোদিত
                        </>
                      ) : (
                        <>
                          <Clock3 className="h-3 w-3" />
                          অনুমোদনের অপেক্ষায়
                        </>
                      )}
                    </span>
                    <span className="text-stone-500 dark:text-stone-400">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("bn-BD", {
                            dateStyle: "medium",
                          })
                        : ""}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!user.approved && (
                    <ActionButton
                      label="অনুমোদন দিন"
                      busy={busyId === `${user.id}:approve`}
                      onClick={() => runAction(user, "approve")}
                    />
                  )}
                  {user.approved && !isSelf && !user.isOwner && (
                    <ActionButton
                      label="অ্যাক্সেস বাতিল"
                      danger
                      busy={busyId === `${user.id}:revoke`}
                      onClick={() => runAction(user, "revoke")}
                    />
                  )}
                  {user.role !== "admin" && user.approved && (
                    <ActionButton
                      label="অ্যাডমিন বানান"
                      busy={busyId === `${user.id}:makeAdmin`}
                      onClick={() => runAction(user, "makeAdmin")}
                    />
                  )}
                  {user.role === "admin" && !isSelf && !user.isOwner && (
                    <ActionButton
                      label="অ্যাডমিন সরান"
                      danger
                      busy={busyId === `${user.id}:removeAdmin`}
                      onClick={() => runAction(user, "removeAdmin")}
                    />
                  )}
                  {isSelf && (
                    <span className="flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500">
                      <ShieldOff className="h-3.5 w-3.5" />
                      নিজের অ্যাক্সেস বদলানো যায় না
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ActionButton({
  label,
  busy,
  danger,
  onClick,
}: {
  label: string;
  busy: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition disabled:opacity-60 ${
        danger
          ? "bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-900"
          : "bg-brand-700 text-white hover:bg-brand-800"
      }`}
    >
      {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {label}
    </button>
  );
}
