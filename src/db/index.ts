import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { SANDBOX, SandboxWriteError, isWriteSql } from "@/lib/sandbox";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * When SANDBOX_READONLY is set, directly patch `client.unsafe` — the exact
 * method drizzle calls for every query (see drizzle-orm/postgres-js/session:
 * `client.unsafe(query, params)`). A direct method replacement is more
 * reliable than a Proxy get-trap, which drizzle's destructuring of `this`
 * can bypass. Transaction handles from `client.begin(fn)` get the same patch
 * so writes inside a tx are caught too. This is the belt behind the Postgres-
 * level `default_transaction_read_only` suspenders set on the connection.
 */
function patchUnsafe(sqlObj: any): void {
  if (!sqlObj || typeof sqlObj.unsafe !== "function" || sqlObj.__roGuarded) return;
  const orig = sqlObj.unsafe.bind(sqlObj);
  sqlObj.unsafe = (query: unknown, params?: unknown, opts?: unknown) => {
    if (isWriteSql(query)) throw new SandboxWriteError(String(query).slice(0, 80));
    return orig(query, params, opts);
  };
  try {
    Object.defineProperty(sqlObj, "__roGuarded", { value: true });
  } catch {
    /* non-configurable; ignore */
  }
}

function readOnlyGuard<T extends object>(client: T): T {
  if (!SANDBOX) return client;
  patchUnsafe(client);
  const c = client as any;
  if (typeof c.begin === "function") {
    const origBegin = c.begin.bind(c);
    c.begin = (...args: unknown[]) => {
      const cb = args[args.length - 1];
      if (typeof cb === "function") {
        args[args.length - 1] = (txSql: any) => {
          patchUnsafe(txSql);
          return (cb as (s: unknown) => unknown)(txSql);
        };
      }
      return origBegin(...args);
    };
  }
  return client;
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
      // SANDBOX: ask Postgres to make every transaction read-only at the
      // server. Enforced by Postgres itself regardless of the ORM path;
      // pairs with the app-level unsafe() patch above. (If the pooler drops
      // the startup option, the app-level guard still blocks writes.)
      ...(SANDBOX
        ? { connection: { options: "-c default_transaction_read_only=on" } }
        : {}),
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
