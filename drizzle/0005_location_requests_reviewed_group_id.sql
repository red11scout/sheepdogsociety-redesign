-- Phase A: link an approved plant request to the draft group created from it.
-- Adds location_requests.reviewed_group_id (idempotency + "View group" link).
--
-- HAND-WRITTEN on purpose. Do NOT regenerate this with `drizzle-kit generate`:
-- the migration journal is out of sync with the live prod schema, so generate
-- emits a destructive diff (DROP TABLE for the retired member-community tables
-- + re-ADD of columns that already exist). apply-neon-migration.mjs re-runs
-- every *.sql file, so both statements below are written to be safe to re-run.
ALTER TABLE "location_requests" ADD COLUMN IF NOT EXISTS "reviewed_group_id" uuid;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "location_requests"
    ADD CONSTRAINT "location_requests_reviewed_group_id_groups_id_fk"
    FOREIGN KEY ("reviewed_group_id") REFERENCES "groups"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
