import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

import type {
  Category,
  Priority,
  Reminder,
  ReminderFilter,
  RepeatInterval,
} from "@/types/reminder";

const STORAGE_KEY = "@reminders_v1";
const AUTH_TOKEN_KEY = "auth_session_token";

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function getApiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  return domain ? `https://${domain}` : "";
}

async function getAuthToken(): Promise<string | null> {
  if (Platform.OS === "web") return null;
  try {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

interface RemindersContextValue {
  reminders: Reminder[];
  isLoading: boolean;
  isSyncing: boolean;
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
  const [isSyncing, setIsSyncing] = useState(false);

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
      tryServerSync();
    }
  };

  const tryServerSync = async () => {
    const token = await getAuthToken();
    if (!token) return;
    const apiBase = getApiBase();
    if (!apiBase) return;

    try {
      setIsSyncing(true);
      const res = await fetch(`${apiBase}/api/reminders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.reminders)) {
        const serverReminders: Reminder[] = data.reminders.map(normalizeReminder);
        setReminders(serverReminders);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(serverReminders));
      }
    } catch {
      // silently fail — local data stays
    } finally {
      setIsSyncing(false);
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

  const serverCreateReminder = async (reminder: Reminder) => {
    const token = await getAuthToken();
    if (!token) return;
    const apiBase = getApiBase();
    if (!apiBase) return;
    try {
      await fetch(`${apiBase}/api/reminders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: reminder.id,
          title: reminder.title,
          notes: reminder.notes,
          dateTime: reminder.dateTime,
          isCompleted: reminder.isCompleted,
          priority: reminder.priority,
          category: reminder.category,
          repeatInterval: reminder.repeatInterval,
          isSnoozed: reminder.isSnoozed,
          snoozeUntil: reminder.snoozeUntil,
        }),
      });
    } catch {
      // silently fail
    }
  };

  const serverUpdateReminder = async (id: string, data: Partial<Reminder>) => {
    const token = await getAuthToken();
    if (!token) return;
    const apiBase = getApiBase();
    if (!apiBase) return;
    try {
      await fetch(`${apiBase}/api/reminders/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
    } catch {
      // silently fail
    }
  };

  const serverDeleteReminder = async (id: string) => {
    const token = await getAuthToken();
    if (!token) return;
    const apiBase = getApiBase();
    if (!apiBase) return;
    try {
      await fetch(`${apiBase}/api/reminders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
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
      await serverCreateReminder(newReminder);
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
      await serverUpdateReminder(id, { ...data, updatedAt: new Date().toISOString() });
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
      await serverDeleteReminder(id);
    },
    [reminders]
  );

  const toggleComplete = useCallback(
    async (id: string) => {
      const reminder = reminders.find((r) => r.id === id);
      if (!reminder) return;
      await updateReminder(id, { isCompleted: !reminder.isCompleted });
    },
    [reminders, updateReminder]
  );

  const snoozeReminder = useCallback(
    async (id: string, minutes: number) => {
      const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();
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
    return reminders.filter((r) => new Date(r.dateTime) < now && !r.isCompleted);
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
    (category: Category): Reminder[] =>
      reminders.filter((r) => r.category === category && !r.isCompleted),
    [reminders]
  );

  return (
    <RemindersContext.Provider
      value={{
        reminders,
        isLoading,
        isSyncing,
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

function normalizeReminder(r: any): Reminder {
  return {
    id: r.id,
    title: r.title,
    notes: r.notes ?? "",
    dateTime: r.dateTime,
    isCompleted: r.isCompleted ?? false,
    priority: r.priority ?? "medium",
    category: r.category ?? "personal",
    repeatInterval: r.repeatInterval ?? "none",
    isSnoozed: r.isSnoozed ?? false,
    snoozeUntil: r.snoozeUntil ?? null,
    notificationId: null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export function useReminders(): RemindersContextValue {
  const ctx = useContext(RemindersContext);
  if (!ctx) throw new Error("useReminders must be used within RemindersProvider");
  return ctx;
}
