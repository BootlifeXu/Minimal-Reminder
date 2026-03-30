import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";

import type {
  Category,
  Priority,
  Reminder,
  ReminderFilter,
  RepeatInterval,
} from "@/types/reminder";

const STORAGE_KEY = "@reminders_v1";

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

interface RemindersContextValue {
  reminders: Reminder[];
  isLoading: boolean;
  addReminder: (data: Omit<Reminder, "id" | "createdAt" | "updatedAt" | "notificationId" | "isCompleted" | "isSnoozed" | "snoozeUntil">) => Promise<void>;
  updateReminder: (id: string, data: Partial<Omit<Reminder, "id" | "createdAt">>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  snoozeReminder: (id: string, minutes: number) => Promise<void>;
  getFilteredReminders: (filter: ReminderFilter) => Reminder[];
  getUpcomingReminders: () => Reminder[];
  getTodayReminders: () => Reminder[];
  getOverdueReminders: () => Reminder[];
  getRemindersByCategory: (category: Category) => Reminder[];
}

const RemindersContext = createContext<RemindersContextValue | null>(null);

export function RemindersProvider({ children }: { children: React.ReactNode }) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setReminders(JSON.parse(stored));
      }
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  };

  const saveReminders = async (updated: Reminder[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // silently fail
    }
  };

  const scheduleNotification = async (reminder: Reminder): Promise<string | null> => {
    if (Platform.OS === "web") return null;
    try {
      const Notifications = await import("expo-notifications");
      const dateTime = new Date(reminder.dateTime);
      if (dateTime <= new Date()) return null;

      await Notifications.requestPermissionsAsync();

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.notes || "Reminder",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: dateTime,
        },
      });
      return id;
    } catch {
      return null;
    }
  };

  const cancelNotification = async (notificationId: string | null) => {
    if (!notificationId || Platform.OS === "web") return;
    try {
      const Notifications = await import("expo-notifications");
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch {
      // silently fail
    }
  };

  const addReminder = useCallback(
    async (
      data: Omit<Reminder, "id" | "createdAt" | "updatedAt" | "notificationId" | "isCompleted" | "isSnoozed" | "snoozeUntil">
    ) => {
      const now = new Date().toISOString();
      const newReminder: Reminder = {
        ...data,
        id: generateId(),
        isCompleted: false,
        isSnoozed: false,
        snoozeUntil: null,
        notificationId: null,
        createdAt: now,
        updatedAt: now,
      };

      const notificationId = await scheduleNotification(newReminder);
      newReminder.notificationId = notificationId;

      const updated = [newReminder, ...reminders];
      setReminders(updated);
      await saveReminders(updated);
    },
    [reminders]
  );

  const updateReminder = useCallback(
    async (id: string, data: Partial<Omit<Reminder, "id" | "createdAt">>) => {
      const existing = reminders.find((r) => r.id === id);
      if (!existing) return;

      if (existing.notificationId) {
        await cancelNotification(existing.notificationId);
      }

      const updated = reminders.map((r) => {
        if (r.id !== id) return r;
        return { ...r, ...data, updatedAt: new Date().toISOString() };
      });

      const newReminder = updated.find((r) => r.id === id)!;
      const notificationId = await scheduleNotification(newReminder);
      const finalUpdated = updated.map((r) =>
        r.id === id ? { ...r, notificationId } : r
      );

      setReminders(finalUpdated);
      await saveReminders(finalUpdated);
    },
    [reminders]
  );

  const deleteReminder = useCallback(
    async (id: string) => {
      const reminder = reminders.find((r) => r.id === id);
      if (reminder?.notificationId) {
        await cancelNotification(reminder.notificationId);
      }
      const updated = reminders.filter((r) => r.id !== id);
      setReminders(updated);
      await saveReminders(updated);
    },
    [reminders]
  );

  const toggleComplete = useCallback(
    async (id: string) => {
      const reminder = reminders.find((r) => r.id === id);
      if (!reminder) return;
      await updateReminder(id, {
        isCompleted: !reminder.isCompleted,
      });
    },
    [reminders, updateReminder]
  );

  const snoozeReminder = useCallback(
    async (id: string, minutes: number) => {
      const snoozeUntil = new Date(
        Date.now() + minutes * 60 * 1000
      ).toISOString();
      await updateReminder(id, {
        isSnoozed: true,
        snoozeUntil,
        dateTime: snoozeUntil,
      });
    },
    [updateReminder]
  );

  const getFilteredReminders = useCallback(
    (filter: ReminderFilter): Reminder[] => {
      return reminders.filter((r) => {
        if (filter.category && filter.category !== "all" && r.category !== filter.category) return false;
        if (filter.priority && filter.priority !== "all" && r.priority !== filter.priority) return false;
        if (filter.completed !== undefined && r.isCompleted !== filter.completed) return false;
        if (filter.search) {
          const q = filter.search.toLowerCase();
          if (!r.title.toLowerCase().includes(q) && !r.notes.toLowerCase().includes(q)) return false;
        }
        return true;
      });
    },
    [reminders]
  );

  const getTodayReminders = useCallback((): Reminder[] => {
    const today = new Date();
    return reminders.filter((r) => {
      const dt = new Date(r.dateTime);
      return (
        dt.getFullYear() === today.getFullYear() &&
        dt.getMonth() === today.getMonth() &&
        dt.getDate() === today.getDate() &&
        !r.isCompleted
      );
    });
  }, [reminders]);

  const getOverdueReminders = useCallback((): Reminder[] => {
    const now = new Date();
    return reminders.filter((r) => {
      return new Date(r.dateTime) < now && !r.isCompleted;
    });
  }, [reminders]);

  const getUpcomingReminders = useCallback((): Reminder[] => {
    const now = new Date();
    const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return reminders
      .filter((r) => {
        const dt = new Date(r.dateTime);
        return dt >= now && dt <= oneWeek && !r.isCompleted;
      })
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }, [reminders]);

  const getRemindersByCategory = useCallback(
    (category: Category): Reminder[] => {
      return reminders.filter((r) => r.category === category && !r.isCompleted);
    },
    [reminders]
  );

  return (
    <RemindersContext.Provider
      value={{
        reminders,
        isLoading,
        addReminder,
        updateReminder,
        deleteReminder,
        toggleComplete,
        snoozeReminder,
        getFilteredReminders,
        getUpcomingReminders,
        getTodayReminders,
        getOverdueReminders,
        getRemindersByCategory,
      }}
    >
      {children}
    </RemindersContext.Provider>
  );
}

export function useReminders(): RemindersContextValue {
  const ctx = useContext(RemindersContext);
  if (!ctx) throw new Error("useReminders must be used within RemindersProvider");
  return ctx;
}
