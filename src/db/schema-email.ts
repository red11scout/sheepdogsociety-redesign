import {
  pgTable,
  text,
  uuid,
  integer,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./schema";

/**
 * Log of ad-hoc emails Jeremy sends from /admin/email. Resend logs the actual
 * deliveries; this is the in-app history (who sent what, to whom, how many).
 */
export const broadcastLog = pgTable("broadcast_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  sentBy: text("sent_by").references(() => users.id, { onDelete: "set null" }),
  subject: text("subject").notNull(),
  /** 'leaders' | 'groups' | 'everyone' */
  audienceType: text("audience_type").notNull(),
  /** e.g. { groupIds: [...] } when audienceType = 'groups' */
  audienceDetail: jsonb("audience_detail")
    .$type<{ groupIds?: string[] }>()
    .notNull()
    .default({}),
  recipientCount: integer("recipient_count").notNull().default(0),
  /** 'sent' | 'partial' | 'failed' */
  status: text("status").notNull().default("sent"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
