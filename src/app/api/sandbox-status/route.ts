import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { SANDBOX, SandboxWriteError } from "@/lib/sandbox";

export const dynamic = "force-dynamic";

/**
 * Safety self-test for the read-only sandbox. Reports whether SANDBOX_READONLY
 * is active, proves a SELECT works, and proves a write is rejected by the DB
 * guard (the attempted statement — CREATE TEMP TABLE — is blocked before it
 * ever executes, so nothing is created). Returns booleans only; no secrets.
 */
export async function GET() {
  const result: {
    sandbox: boolean;
    readWorks: boolean;
    writeBlocked: boolean;
    note: string;
  } = { sandbox: SANDBOX, readWorks: false, writeBlocked: false, note: "" };

  try {
    await db.execute(sql`select 1 as ok`);
    result.readWorks = true;
  } catch (e) {
    result.note += `read-failed: ${e instanceof Error ? e.message : String(e)}; `;
  }

  try {
    // Real 0-row write probe. Either the app guard throws SandboxWriteError
    // before Postgres, or Postgres rejects it as a read-only transaction —
    // both count as blocked. Affects no rows even in the impossible case it runs.
    await db.execute(sql`update users set id = id where 1 = 0`);
    result.writeBlocked = false;
    result.note += "WRITE NOT BLOCKED — investigate; ";
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const dbReadOnly = /read-only transaction|cannot execute .* in a read-only/i.test(msg);
    result.writeBlocked = e instanceof SandboxWriteError || dbReadOnly;
    result.note += e instanceof SandboxWriteError
      ? "write blocked by app guard; "
      : dbReadOnly
        ? "write blocked by Postgres read-only; "
        : `write threw (unexpected): ${msg}; `;
  }

  return NextResponse.json(result, {
    status: result.sandbox && result.writeBlocked ? 200 : 500,
  });
}
