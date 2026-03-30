import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import EmptyState from "@/components/EmptyState";
import ReminderCard from "@/components/ReminderCard";
import ReminderFormModal from "@/components/ReminderFormModal";
import SnoozeModal from "@/components/SnoozeModal";
import Colors from "@/constants/colors";
import { useReminders } from "@/context/RemindersContext";
import type { Category, Priority, Reminder, RepeatInterval } from "@/types/reminder";

const CATEGORIES: {
  value: Category;
  label: string;
  icon: string;
}[] = [
  { value: "personal", label: "Personal", icon: "user" },
  { value: "work", label: "Work", icon: "briefcase" },
  { value: "health", label: "Health", icon: "activity" },
  { value: "study", label: "Study", icon: "book-open" },
  { value: "other", label: "Other", icon: "more-horizontal" },
];

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const {
    reminders,
    getRemindersByCategory,
    toggleComplete,
    deleteReminder,
    updateReminder,
    snoozeReminder,
  } = useReminders();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [snoozeTarget, setSnoozeTarget] = useState<string | null>(null);

  const getCategoryCount = (cat: Category) =>
    reminders.filter((r) => r.category === cat && !r.isCompleted).length;

  const selectedReminders = selectedCategory
    ? getRemindersByCategory(selectedCategory)
    : [];

  const handleSave = async (data: {
    title: string;
    notes: string;
    dateTime: string;
    priority: Priority;
    category: Category;
    repeatInterval: RepeatInterval;
  }) => {
    if (editingReminder) {
      await updateReminder(editingReminder.id, data);
    }
    setEditingReminder(null);
  };

  const topPadding = Platform.OS === "web" ? insets.top + 67 : insets.top;

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
      </View>

      {!selectedCategory ? (
        <View style={styles.grid}>
          {CATEGORIES.map((cat) => {
            const count = getCategoryCount(cat.value);
            return (
              <TouchableOpacity
                key={cat.value}
                style={styles.categoryCard}
                onPress={() => setSelectedCategory(cat.value)}
              >
                <View style={styles.categoryIconContainer}>
                  <Feather name={cat.icon as any} size={24} color={Colors.light.text} />
                </View>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
                <Text style={styles.categoryCount}>
                  {count} {count === 1 ? "reminder" : "reminders"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <View style={styles.flex}>
          <View style={styles.backRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedCategory(null)}
            >
              <Feather name="arrow-left" size={18} color={Colors.light.text} />
              <Text style={styles.backText}>Categories</Text>
            </TouchableOpacity>
            <Text style={styles.categoryTitle}>
              {CATEGORIES.find((c) => c.value === selectedCategory)?.label}
            </Text>
          </View>

          <FlatList
            data={selectedReminders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ReminderCard
                reminder={item}
                onToggle={() => toggleComplete(item.id)}
                onPress={() => setEditingReminder(item)}
                onDelete={() => deleteReminder(item.id)}
                onSnooze={() => setSnoozeTarget(item.id)}
              />
            )}
            ListEmptyComponent={
              <EmptyState
                icon="inbox"
                title="No reminders"
                subtitle={`No active reminders in ${CATEGORIES.find((c) => c.value === selectedCategory)?.label}`}
              />
            }
            contentContainerStyle={[
              styles.list,
              selectedReminders.length === 0 && styles.listEmpty,
            ]}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      <ReminderFormModal
        visible={editingReminder !== null}
        reminder={editingReminder}
        onClose={() => setEditingReminder(null)}
        onSave={handleSave}
      />

      <SnoozeModal
        visible={snoozeTarget !== null}
        onClose={() => setSnoozeTarget(null)}
        onSnooze={async (mins) => {
          if (snoozeTarget) await snoozeReminder(snoozeTarget, mins);
          setSnoozeTarget(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryCard: {
    width: "47%",
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: 18,
    gap: 8,
  },
  categoryIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  categoryCount: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  backText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  categoryTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  listEmpty: {
    flex: 1,
  },
});
