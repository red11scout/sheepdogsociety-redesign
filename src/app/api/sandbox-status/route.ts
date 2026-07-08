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
    // Guarded write attempt. In sandbox this throws before touching Postgres.
    await db.execute(sql`create temp table _sandbox_probe (x int)`);
    result.writeBlocked = false;
    result.note += "WRITE NOT BLOCKED; ";
  } catch (e) {
    result.writeBlocked = e instanceof SandboxWriteError;
    result.note += result.writeBlocked ? "write blocked by guard; " : `write threw (non-guard): ${e instanceof Error ? e.message : String(e)}; `;
  }

  return NextResponse.json(result, {
    status: result.sandbox && result.writeBlocked ? 200 : 500,
  });
}
