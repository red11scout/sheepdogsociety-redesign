-- Phase B: broadcast_log — in-app history of Jeremy's ad-hoc emails.
-- HAND-WRITTEN + idempotent (apply-neon-migration.mjs re-runs every *.sql).
-- Do NOT regenerate with drizzle-kit (journal is out of sync with prod).
CREATE TABLE IF NOT EXISTS "broadcast_log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "sent_by" text,
  "subject" text NOT NULL,
  "audience_type" text NOT NULL,
  "audience_detail" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "recipient_count" integer DEFAULT 0 NOT NULL,
  "status" text DEFAULT 'sent' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "broadcast_log"
    ADD CONSTRAINT "broadcast_log_sent_by_users_id_fk"
    FOREIGN KEY ("sent_by") REFERENCES "users"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
