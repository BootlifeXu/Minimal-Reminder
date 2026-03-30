import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
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
import SectionHeader from "@/components/SectionHeader";
import SnoozeModal from "@/components/SnoozeModal";
import Colors from "@/constants/colors";
import { useReminders } from "@/context/RemindersContext";
import type { Category, Priority, Reminder, RepeatInterval } from "@/types/reminder";

type FilterTab = "all" | "today" | "upcoming" | "completed";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    reminders,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleComplete,
    snoozeReminder,
    getTodayReminders,
    getUpcomingReminders,
    getOverdueReminders,
  } = useReminders();

  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [snoozeTarget, setSnoozeTarget] = useState<string | null>(null);

  const getDisplayReminders = () => {
    switch (filterTab) {
      case "today":
        return getTodayReminders();
      case "upcoming":
        return getUpcomingReminders();
      case "completed":
        return reminders.filter((r) => r.isCompleted);
      default:
        return reminders.filter((r) => !r.isCompleted);
    }
  };

  const displayReminders = getDisplayReminders();
  const overdueReminders = filterTab === "all" ? getOverdueReminders() : [];
  const normalReminders =
    filterTab === "all"
      ? displayReminders.filter((r) => {
          const now = new Date();
          return new Date(r.dateTime) >= now;
        })
      : displayReminders;

  const handleDelete = (id: string) => {
    if (Platform.OS !== "web") {
      Alert.alert("Delete Reminder", "This will permanently delete this reminder.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteReminder(id),
        },
      ]);
    } else {
      deleteReminder(id);
    }
  };

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
    } else {
      await addReminder(data);
    }
    setShowForm(false);
    setEditingReminder(null);
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setShowForm(true);
  };

  const handleSnoozeSelect = async (minutes: number) => {
    if (snoozeTarget) {
      await snoozeReminder(snoozeTarget, minutes);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setSnoozeTarget(null);
  };

  const topPadding = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const FILTER_TABS: { value: FilterTab; label: string }[] = [
    { value: "all", label: "Active" },
    { value: "today", label: "Today" },
    { value: "upcoming", label: "Upcoming" },
    { value: "completed", label: "Done" },
  ];

  const renderItem = ({ item }: { item: Reminder }) => (
    <ReminderCard
      reminder={item}
      onToggle={() => toggleComplete(item.id)}
      onPress={() => handleEdit(item)}
      onDelete={() => handleDelete(item.id)}
      onSnooze={() => setSnoozeTarget(item.id)}
    />
  );

  const ListHeader = () => (
    <View>
      <View style={[styles.pageHeader, { paddingTop: topPadding }]}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.pageTitle}>Reminders</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingReminder(null);
            setShowForm(true);
            if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Feather name="plus" size={22} color={Colors.light.textInverse} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {FILTER_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.value}
            style={[styles.filterTab, filterTab === tab.value && styles.filterTabActive]}
            onPress={() => setFilterTab(tab.value)}
          >
            <Text
              style={[
                styles.filterTabText,
                filterTab === tab.value && styles.filterTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filterTab === "all" && overdueReminders.length > 0 && (
        <SectionHeader title="Overdue" count={overdueReminders.length} />
      )}
    </View>
  );

  const renderListData = () => {
    if (filterTab === "all") {
      const combined: (Reminder | { type: "separator"; title: string })[] = [
        ...overdueReminders,
        ...(normalReminders.length > 0
          ? [{ type: "separator" as const, title: "SCHEDULED" }]
          : []),
        ...normalReminders,
      ];
      return combined;
    }
    return displayReminders;
  };

  const renderCombinedItem = ({
    item,
  }: {
    item: Reminder | { type: "separator"; title: string };
  }) => {
    if ("type" in item && item.type === "separator") {
      return <SectionHeader title={item.title} count={normalReminders.length} />;
    }
    const reminder = item as Reminder;
    return (
      <ReminderCard
        reminder={reminder}
        onToggle={() => toggleComplete(reminder.id)}
        onPress={() => handleEdit(reminder)}
        onDelete={() => handleDelete(reminder.id)}
        onSnooze={() => setSnoozeTarget(reminder.id)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={renderListData() as any[]}
        keyExtractor={(item: any) => item.id || item.title}
        renderItem={filterTab === "all" ? (renderCombinedItem as any) : renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <EmptyState
            icon="bell"
            title="No reminders"
            subtitle={
              filterTab === "completed"
                ? "Complete some reminders to see them here."
                : "Tap the + button to add your first reminder."
            }
          />
        }
        contentContainerStyle={[
          styles.list,
          displayReminders.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />

      <ReminderFormModal
        visible={showForm}
        reminder={editingReminder}
        onClose={() => {
          setShowForm(false);
          setEditingReminder(null);
        }}
        onSave={handleSave}
      />

      <SnoozeModal
        visible={snoozeTarget !== null}
        onClose={() => setSnoozeTarget(null)}
        onSnooze={handleSnoozeSelect}
      />
    </View>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.text,
    alignItems: "center",
    justifyContent: "center",
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 4,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  filterTabActive: {
    backgroundColor: Colors.light.text,
    borderColor: Colors.light.text,
  },
  filterTabText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  filterTabTextActive: {
    color: Colors.light.textInverse,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  listEmpty: {
    flex: 1,
    minHeight: 400,
  },
});
