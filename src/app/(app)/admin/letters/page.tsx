import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth-compat";
import { db } from "@/db";
import { users, letters } from "@/db/schema";
import { eq, isNull, desc } from "drizzle-orm";
import { createLetter, softDeleteLetter } from "@/server/letters";

export const dynamic = "force-dynamic";

export default async function AdminLettersPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/admin/sign-in");
  const [me] = await db.select().from(users).where(eq(users.id, userId));
  if (me?.role !== "admin") redirect("/");

  const params = (await searchParams) ?? {};
  const filter = params.status ?? "all";

  let rows = await db
    .select({
      id: letters.id,
      slug: letters.slug,
      issueNumber: letters.issueNumber,
      title: letters.title,
      themeWord: letters.themeWord,
      status: letters.status,
      publishedAt: letters.publishedAt,
      updatedAt: letters.updatedAt,
    })
    .from(letters)
    .where(isNull(letters.deletedAt))
    .orderBy(desc(letters.updatedAt));

  if (filter !== "all") {
    rows = rows.filter((r) => r.status === filter);
  }

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <span className="section-mark">§ Admin</span>
          <div className="hairline flex-1" />
        </div>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <h1 className="display-soft text-3xl text-foreground md:text-4xl">
            Letters
          </h1>
          <form action={createLetter}>
            <button
              type="submit"
              className="lift inline-flex h-11 items-center gap-2 bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
            >
              Start a new letter
            </button>
          </form>
        </div>
      </div>

      <nav className="flex flex-wrap gap-1 mb-6 text-sm">
        {[
          { v: "all", label: "All" },
          { v: "draft", label: "Drafts" },
          { v: "scheduled", label: "Scheduled" },
          { v: "published", label: "Published" },
          { v: "archived", label: "Archived" },
        ].map((opt) => (
          <Link
            key={opt.v}
            href={`/admin/letters?status=${opt.v}`}
            className={`px-3 py-1.5 text-xs uppercase tracking-[0.14em] transition-colors ${
              filter === opt.v
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <div className="border border-dashed border-border p-12 text-center">
          <p className="display-soft text-2xl mb-2">No letters yet.</p>
          <p className="font-serif text-muted-foreground">
            Click <strong>Start a new letter</strong> above. We&apos;ll walk you through it.
          </p>
        </div>
      ) : (
        <div className="border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/40">
              <tr className="text-left">
                <Th>Issue</Th>
                <Th>Title</Th>
                <Th>Status</Th>
                <Th>Last edited</Th>
                <Th>{""}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id}>
                  <Td>
                    <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      No. {row.issueNumber}
                    </span>
                  </Td>
                  <Td>
                    <Link
                      href={`/admin/letters/${row.id}`}
                      className="display-soft text-base hover:text-primary"
                    >
                      {row.title}
                    </Link>
                    {row.themeWord ? (
                      <span className="ml-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {row.themeWord}
                      </span>
                    ) : null}
                  </Td>
                  <Td>
                    <StatusPill status={row.status} />
                  </Td>
                  <Td>
                    <span className="font-body text-xs text-muted-foreground">
                      {row.updatedAt.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </Td>
                  <Td>
                    <form
                      action={async () => {
                        "use server";
                        await softDeleteLetter(row.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="font-body text-xs text-muted-foreground hover:text-destructive"
                      >
                        Trash
                      </button>
                    </form>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-12 pt-6 border-t border-border text-center">
        <p className="font-body text-sm text-muted-foreground">
          Need help? <a href="mailto:beargodwin@gmail.com" className="link-editorial">Email Drew</a>
        </p>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="section-mark px-4 py-3 text-left">
      {children}
    </th>
  );
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-middle">{children}</td>;
}
function StatusPill({ status }: { status: string }) {
  const tone =
    status === "published"
      ? "border-olive/40 bg-olive/10 text-olive"
      : status === "scheduled"
      ? "border-brass/40 bg-brass/10 text-brass"
      : status === "archived"
      ? "border-stone/40 bg-stone/10 text-stone"
      : "border-border bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-block border px-2 py-0.5 text-xs uppercase tracking-wider ${tone}`}
    >
      {status}
    </span>
  );
}
