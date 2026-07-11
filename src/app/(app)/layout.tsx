import { auth } from "@/lib/auth-compat";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/admin/sign-in");

  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));

  // Session with no matching user row, or a user still awaiting approval —
  // bounce to the (admin-only) sign-in. Auth is admin-only, so in practice an
  // authenticated user is always an active admin; this stays as a safe guard.
  if (!currentUser || currentUser.status === "pending") redirect("/admin/sign-in");

  return <>{children}</>;
}
