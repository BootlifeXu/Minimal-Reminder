export type Priority = "low" | "medium" | "high";
export type RepeatInterval = "none" | "daily" | "weekly" | "monthly" | "yearly";
export type Category = "personal" | "work" | "health" | "study" | "other";

export interface Reminder {
  id: string;
  title: string;
  notes: string;
  dateTime: string;
  isCompleted: boolean;
  priority: Priority;
  category: Category;
  repeatInterval: RepeatInterval;
  isSnoozed: boolean;
  snoozeUntil: string | null;
  notificationId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderFilter {
  category?: Category | "all";
  priority?: Priority | "all";
  completed?: boolean;
  search?: string;
}
