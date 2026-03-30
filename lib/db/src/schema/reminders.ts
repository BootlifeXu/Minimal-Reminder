import { pgTable, text, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./auth";

export const remindersTable = pgTable("reminders", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  notes: text("notes").notNull().default(""),
  dateTime: timestamp("date_time", { withTimezone: true }).notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  priority: varchar("priority", { length: 10 }).notNull().default("medium"),
  category: varchar("category", { length: 20 }).notNull().default("personal"),
  repeatInterval: varchar("repeat_interval", { length: 20 }).notNull().default("none"),
  isSnoozed: boolean("is_snoozed").notNull().default(false),
  snoozeUntil: timestamp("snooze_until", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertReminderSchema = createInsertSchema(remindersTable).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type Reminder = typeof remindersTable.$inferSelect;
