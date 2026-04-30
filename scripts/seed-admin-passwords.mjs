#!/usr/bin/env node
// Seed bcrypt password_hash for every admin user.
//
// Usage:
//   NEON_DATABASE_URL='postgresql://...' \
//     ADMIN_PASSWORD='JESUS33king' \
//     node scripts/seed-admin-passwords.mjs
//
// Targets every users row where role='admin'. Skips users where the
// supplied password already matches their existing hash.
//
// Notes:
//  - Make sure migration 0003_admin_password_hash.sql has been applied first.
//  - Cost factor 12 to match the Auth.js v5 brief.
//  - Logs which users got their hash set, never logs the password itself.

import postgres from "postgres";
import bcrypt from "bcryptjs";

const url = process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL;
if (!url) {
  console.error("Set NEON_DATABASE_URL (or DATABASE_URL).");
  process.exit(1);
}

const password = process.env.ADMIN_PASSWORD ?? "JESUS33king";
if (password.length < 6) {
  console.error("ADMIN_PASSWORD must be at least 6 characters.");
  process.exit(1);
}

const sql = postgres(url, { prepare: false, max: 1 });

try {
  const admins = await sql`
    SELECT id, email, password_hash
    FROM users
    WHERE role = 'admin'
  `;

  if (admins.length === 0) {
    console.log("No users with role='admin' found.");
    console.log("If you expected admins, check that the users rows exist and");
    console.log("their role column is set to 'admin'.");
    process.exit(0);
  }

  console.log(`Found ${admins.length} admin user(s).`);
  const hash = await bcrypt.hash(password, 12);
  let touched = 0;
  let already = 0;

  for (const a of admins) {
    if (a.password_hash) {
      const same = await bcrypt.compare(password, a.password_hash);
      if (same) {
        console.log(`  · ${a.email} — already set, skipping.`);
        already += 1;
        continue;
      }
    }
    await sql`
      UPDATE users
      SET password_hash = ${hash},
          must_change_password = false,
          updated_at = NOW()
      WHERE id = ${a.id}
    `;
    console.log(`  ✓ ${a.email} — hashed and saved.`);
    touched += 1;
  }

  console.log("");
  console.log(`Done. ${touched} updated, ${already} already had matching hash.`);
  console.log("Admins can now sign in at /admin/sign-in.");
} catch (err) {
  console.error("Seed failed:", err);
  process.exit(1);
} finally {
  await sql.end();
}
