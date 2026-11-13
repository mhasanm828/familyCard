import {
  Bookmark,
  CheckCircle2,
  Clock3,
  FileDown,
  History,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { requireAdmin, resolveAccess } from "@/lib/access";
import { COLLECTIONS, getDb, toPlain } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin-email";
import AdminUsersTable from "@/components/AdminUsersTable";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "অ্যাডমিন ড্যাশবোর্ড — ফ্যামিলি কার্ড সার্চ",
};

const MODE_LABEL: Record<string, string> = {
  tracking: "ট্র্যাকিং",
  idcard: "আইডি কার্ড",
  idpdf: "আইডি PDF",
};

function StatCard({
  value,
  label,
  sub,
}: {
  value: number | string;
  label: string;
  sub?: string;
}) {
  return (
    <div className="animate-fade-up rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-stone-200 dark:bg-stone-900 dark:ring-stone-800">
      <p className="text-3xl font-bold text-brand-700 dark:text-emerald-400">
        {value}
      </p>
      <p className="mt-1 text-sm font-medium text-stone-700 dark:text-stone-200">
        {label}
      </p>
      {sub ? (
        <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{sub}</p>
      ) : null}
    </div>
  );
}

export default async function AdminPage() {
  const { session } = await requireAdmin();
  const db = getDb();

  const [usersRaw, totalSearches, totalSaved, recentRaw] = await Promise.all([
    db
      .collection(COLLECTIONS.users)
      .find({})
      .sort({ createdAt: -1 })
      .toArray(),
    db.collection(COLLECTIONS.searchHistory).countDocuments({}),
    db.collection(COLLECTIONS.savedApplications).countDocuments({}),
    db
      .collection(COLLECTIONS.searchHistory)
      .find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray(),
  ]);

  const users = usersRaw.map((u) => {
    const plain = toPlain(u) as unknown as Record<string, unknown>;
    const access = resolveAccess({
      email: typeof plain.email === "string" ? plain.email : null,
      role: plain.role,
      approved: plain.approved,
    });
    return {
      id: String(plain.id ?? ""),
      name: typeof plain.name === "string" ? plain.name : "",
      email: typeof plain.email === "string" ? plain.email : "",
      role: access.role,
      approved: access.approved,
      isOwner: isAdminEmail(
        typeof plain.email === "string" ? plain.email : null,
      ),
      createdAt:
        typeof plain.createdAt === "string" ? plain.createdAt : "",
    };
  });

  const pendingCount = users.filter((u) => !u.approved).length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  const emailByUserId = new Map(users.map((u) => [u.id, u.email]));
  const recent = recentRaw.map((r) => {
    const plain = toPlain(r) as unknown as Record<string, unknown>;
    return {
      id: String(plain.id ?? ""),
      userEmail:
        typeof plain.userId === "string"
          ? (emailByUserId.get(plain.userId) ?? "—")
          : "—",
      mode: typeof plain.mode === "string" ? plain.mode : "",
      queryLabel:
        typeof plain.queryLabel === "string" ? plain.queryLabel : "",
      result: typeof plain.result === "string" ? plain.result : "",
      found: plain.found === true,
      createdAt:
        typeof plain.createdAt === "string" ? plain.createdAt : "",
    };
  });

  return (
    <div className="space-y-6 pt-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-stone-800 sm:text-3xl dark:text-stone-100">
          <ShieldCheck className="h-7 w-7 text-brand-700 dark:text-emerald-400" />
          অ্যাডমিন ড্যাশবোর্ড
        </h1>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          লগইন করেছেন: {session.user.name} ({session.user.email}) — শুধু
          অ্যাডমিনরাই এই পেজটি দেখতে পারেন।
        </p>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard value={users.length} label="মোট ব্যবহারকারী" sub="অ্যাকাউন্ট খোলা হয়েছে" />
        <StatCard value={pendingCount} label="অনুমোদনের অপেক্ষায়" sub="এখনো অ্যাক্সেস পায়নি" />
        <StatCard value={totalSearches} label="মোট সার্চ" sub="সব ব্যবহারকারী মিলিয়ে" />
        <StatCard value={totalSaved} label="সেভ করা আবেদন" sub="সব ব্যবহারকারী মিলিয়ে" />
      </section>
      <p className="text-sm text-stone-500 dark:text-stone-400">
        অ্যাডমিন আছেন {adminCount} জন। নতুন অ্যাকাউন্ট নিজে থেকে কিছু দেখতে
        পারে না — নিচে অনুমোদন দিলেই তবে সার্চ করতে পারবে।
      </p>

      {/* Users */}
      <section className="animate-fade-up rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-6 dark:bg-stone-900 dark:ring-stone-800">
        <h2 className="flex items-center gap-2 text-lg font-bold text-stone-800 dark:text-stone-100">
          <Users className="h-5 w-5 text-brand-700 dark:text-emerald-400" />
          সব ব্যবহারকারী ({users.length} জন)
        </h2>
        <AdminUsersTable users={users} currentUserId={session.user.id} />
      </section>

      {/* Recent searches across users */}
      <section className="animate-fade-up rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-6 dark:bg-stone-900 dark:ring-stone-800">
        <h2 className="flex items-center gap-2 text-lg font-bold text-stone-800 dark:text-stone-100">
          <History className="h-5 w-5 text-brand-700 dark:text-emerald-400" />
          সাম্প্রতিক সার্চ — সব ব্যবহারকারী (সর্বশেষ {recent.length}টি)
        </h2>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
            এখনো কোনো সার্চের রেকর্ড নেই।
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-stone-100 dark:divide-stone-800">
            {recent.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-2.5">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    item.found
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                      : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
                  }`}
                >
                  {item.found ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Clock3 className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-stone-800 dark:text-stone-100">
                    {item.queryLabel}
                  </p>
                  <p className="truncate text-xs text-stone-500 dark:text-stone-400">
                    {item.userEmail} • {MODE_LABEL[item.mode] ?? item.mode} •{" "}
                    {item.result === "pdf"
                      ? "PDF পাওয়া গেছে"
                      : item.found
                        ? "পাওয়া গেছে"
                        : item.result === "error"
                          ? "সমস্যা হয়েছে"
                          : "পাওয়া যায়নি"}{" "}
                    •{" "}
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString("bn-BD", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
          <Search className="h-3.5 w-3.5" />
          এখানে শুধু মাস্ক করা লেবেল দেখানো হয় — কারো NID নম্বর কখনো
          দেখানো বা সংরক্ষণ করা হয় না।
        </p>
      </section>

      <p className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
        <Bookmark className="h-3.5 w-3.5" />
        <FileDown className="h-3.5 w-3.5" />
        নতুন অ্যাকাউন্ট খুললেই সার্চ করতে পারে না — উপরে অনুমোদন দেওয়ার
        পরেই তার অ্যাক্সেস খুলে যায়।
      </p>
    </div>
  );
}
