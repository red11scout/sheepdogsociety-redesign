/**
 * Sandbox read-only guard.
 *
 * This repo is a *redesign sandbox* that reuses the PRODUCTION Neon database.
 * It must be provably incapable of mutating live data or triggering outbound
 * side effects (email, SMS, AI generation writes, cron jobs).
 *
 * `SANDBOX_READONLY=true` on the sandbox Vercel project activates every guard:
 *   - db/index.ts wraps the postgres client and rejects any non-SELECT SQL.
 *   - lib/email.ts returns a no-op Resend stub (nothing is sent).
 *   - lib/sms/index.ts short-circuits sendSms() to `not_configured`.
 *   - vercel.json ships with NO crons in the sandbox.
 *   - Server actions / API mutations may additionally call assertWritable().
 *
 * The primary guarantees are: cron schedules are absent, and no send-capable
 * keys (RESEND_*, TWILIO_*) are configured. This module is the belt-and-suspenders
 * backstop so a single missed route can never write to production.
 */

export const SANDBOX = process.env.SANDBOX_READONLY === "true";

export class SandboxWriteError extends Error {
  constructor(op?: string) {
    super(
      `Blocked write in read-only sandbox${op ? ` (${op})` : ""}. ` +
        `SANDBOX_READONLY is set; production data is protected.`
    );
    this.name = "SandboxWriteError";
  }
}

/**
 * Call at the top of any server action or API mutation to fail fast before
 * doing work. No-op when not in sandbox mode.
 */
export function assertWritable(op?: string): void {
  if (SANDBOX) throw new SandboxWriteError(op);
}

/**
 * Classifies a SQL string as a write (DML/DDL) that must be blocked in the
 * sandbox. drizzle's insert()/update()/delete() builders always emit a
 * statement whose first keyword is INSERT/UPDATE/DELETE/MERGE, so a leading-
 * keyword test is a reliable chokepoint. Reads (SELECT/WITH/SHOW/EXPLAIN),
 * transaction control (BEGIN/COMMIT/ROLLBACK/SAVEPOINT), and session setup
 * (SET/DISCARD/DEALLOCATE) all pass through.
 */
export function isWriteSql(sql: unknown): boolean {
  if (typeof sql !== "string") return false;
  const s = sql
    .replace(/^﻿/, "")
    .replace(/^(?:\s|;|\(|\/\*[\s\S]*?\*\/|--[^\n]*\n)+/, "")
    .trimStart();
  return /^(insert|update|delete|merge|truncate|drop|alter|create|grant|revoke|comment|copy|call|do|lock|reindex|vacuum|cluster|refresh|replace|import)\b/i.test(
    s
  );
}
