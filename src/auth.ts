// Auth.js v5 server config (Node runtime).
// Email + password admin sign-in via the Credentials provider.
// Per-user bcryptjs hashes stored in users.password_hash.
// ADMIN_PASSWORD env var still works as a transition fallback — used
// when a user's password_hash is empty (i.e. they haven't been seeded
// or migrated yet).

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import * as schema from "@/db/schema";
import { authConfig, isAdminEmail } from "@/auth.config";

function getAuthDb() {
  const url =
    process.env.DATABASE_URL?.trim().replace(/\\n$/, "") ||
    "postgresql://placeholder@localhost:5432/placeholder";
  const client = postgres(url, {
    prepare: false,
    connect_timeout: 10,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    max: 1,
  });
  return drizzle(client, { schema });
}

const authDb = getAuthDb();

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Sheepdog Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) {
          console.log("[auth] missing email or password");
          return null;
        }
        if (!isAdminEmail(email)) {
          console.log("[auth] email not on ADMIN_EMAILS allowlist:", email);
          return null;
        }

        const [user] = await authDb
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, email))
          .limit(1);
        if (!user) {
          console.log("[auth] no users row for allowlisted email:", email);
          return null;
        }
        if (user.role !== "admin") {
          console.log("[auth] user is not an admin:", email);
          return null;
        }

        // Per-user bcrypt hash takes precedence.
        const hash = user.passwordHash?.trim() ?? "";
        let valid = false;
        if (hash) {
          try {
            valid = await bcrypt.compare(password, hash);
          } catch (err) {
            console.error("[auth] bcrypt.compare error:", err);
            valid = false;
          }
        } else {
          // Transition fallback: env-var password until users.password_hash
          // is seeded. Run scripts/seed-admin-passwords.mjs once on prod.
          const expected = process.env.ADMIN_PASSWORD;
          if (!expected) {
            console.error(
              "[auth] no password_hash for user and ADMIN_PASSWORD env not set"
            );
            return null;
          }
          valid = password === expected;
        }

        if (!valid) {
          console.log("[auth] password mismatch for", email);
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.firstName || user.email,
          role: user.role,
        };
      },
    }),
  ],
});
