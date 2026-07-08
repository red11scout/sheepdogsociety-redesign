import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { SANDBOX, SandboxWriteError, isWriteSql } from "@/lib/sandbox";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * When SANDBOX_READONLY is set, wrap the postgres-js client so any write
 * statement is rejected at the driver seam. drizzle executes every query via
 * `client.unsafe(sql, params)` (and, inside transactions, `tx.unsafe(...)`),
 * so guarding `unsafe` — plus the tagged-template call and `begin` — covers
 * all paths. Reads pass straight through; this is the belt-and-suspenders
 * backstop behind cron removal and the absence of send-capable keys.
 */
function readOnlyGuard<T extends object>(client: T): T {
  if (!SANDBOX) return client;
  const guardUnsafe = (fn: (...a: unknown[]) => unknown) =>
    (...args: unknown[]) => {
      if (isWriteSql(args[0])) throw new SandboxWriteError(String(args[0]).slice(0, 80));
      return fn(...args);
    };
  return new Proxy(client, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (prop === "unsafe" && typeof value === "function") {
        return guardUnsafe(value.bind(target));
      }
      if (prop === "begin" && typeof value === "function") {
        // Proxy the transaction's sql handle so writes inside a tx are caught too.
        return (...args: unknown[]) => {
          const cb = args[args.length - 1];
          if (typeof cb === "function") {
            args[args.length - 1] = (txSql: object) =>
              (cb as (s: object) => unknown)(readOnlyGuard(txSql));
          }
          return (value as (...a: unknown[]) => unknown).apply(target, args);
        };
      }
      return typeof value === "function" ? value.bind(target) : value;
    },
    apply(target, thisArg, args) {
      // Tagged-template / direct call form: `sql`...`` — first arg is the strings array.
      const strings = args[0] as unknown;
      const text = Array.isArray(strings) ? strings.join(" ") : strings;
      if (isWriteSql(text)) throw new SandboxWriteError(String(text).slice(0, 80));
      return (target as (...a: unknown[]) => unknown).apply(thisArg, args);
    },
  }) as T;
}

// DATABASE_URL on Vercel points at the Neon pooled endpoint (host
// suffix is `-pooler`). That's the prod database for the entire
// runtime app (this client + Auth.js in src/auth.ts both read it).
// The Marketplace integration also injects DATABASE_URL_UNPOOLED for
// migration scripts that need a stable session.
//
// History: prior to 2026-05-08 prod was on Supabase; we cut over to
// Neon to get first-class Vercel env-var sync and per-preview DB
// branching. See docs/MIGRATIONS.md.
function getDb() {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL?.trim().replace(/\\n$/, "");
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    const client = postgres(connectionString, {
      // Neon's pgbouncer-style pooler is transaction-mode; prepared
      // statements aren't supported, so prepare must be off.
      prepare: false,
      // Match Supabase pooler-side limits. Each Vercel serverless function
      // runs in its own process; max=20 lets parallel page-load fan-out
      // (e.g. dashboard's 8-query Promise.all + per-page layout queries)
      // run without queueing on the client side.
      max: 20,
      connect_timeout: 10,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
    });
    _db = drizzle(readOnlyGuard(client), { schema });
  }
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
