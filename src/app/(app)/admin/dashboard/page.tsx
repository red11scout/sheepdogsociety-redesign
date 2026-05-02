import { auth } from "@/lib/auth-compat";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AdminDashboard } from "./admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { userId } = await auth();
  const [user] = await db.select().from(users).where(eq(users.id, userId!));

  if (user?.role !== "admin") redirect("/");

  // Greeting is the brand persona, not the signed-in user — Jeremy is the
  // content lead per the brand-voice doc. The topbar still shows who's
  // actually signed in for accountability.
  return <AdminDashboard greetingName="Jeremy" />;
}
