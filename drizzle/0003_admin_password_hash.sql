-- Migration 0003: per-user password_hash on users table
-- Apply via: NEON_DATABASE_URL='...' node scripts/apply-neon-migration.mjs
-- Then seed: NEON_DATABASE_URL='...' node scripts/seed-admin-passwords.mjs

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "password_hash" text DEFAULT '' NOT NULL;

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "must_change_password" boolean NOT NULL DEFAULT true;
