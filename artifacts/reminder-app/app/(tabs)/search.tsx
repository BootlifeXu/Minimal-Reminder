import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
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

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { getFilteredReminders, updateReminder, deleteReminder, toggleComplete, snoozeReminder } = useReminders();
  const [query, setQuery] = useState("");
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [snoozeTarget, setSnoozeTarget] = useState<string | null>(null);

  const results = query.trim()
    ? getFilteredReminders({ search: query.trim() })
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
        <Text style={styles.title}>Search</Text>
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color={Colors.light.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search reminders..."
          placeholderTextColor={Colors.light.textTertiary}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          autoFocus={false}
          clearButtonMode="while-editing"
        />
        {query.length > 0 && (
          <Feather
            name="x"
            size={16}
            color={Colors.light.textTertiary}
            onPress={() => setQuery("")}
          />
        )}
      </View>

      {query.trim() === "" ? (
        <View style={styles.emptyPrompt}>
          <Text style={styles.emptyPromptText}>
            Type to search through your reminders
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
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
              icon="search"
              title="No results"
              subtitle={`Nothing found for "${query}"`}
            />
          }
          contentContainerStyle={[
            styles.list,
            results.length === 0 && styles.listEmpty,
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      {results.length > 0 && query.trim() !== "" && (
        <View style={styles.resultCount}>
          <Text style={styles.resultCountText}>
            {results.length} {results.length === 1 ? "result" : "results"}
          </Text>
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    padding: 0,
  },
  emptyPrompt: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyPromptText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textTertiary,
    textAlign: "center",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  listEmpty: {
    flex: 1,
  },
  resultCount: {
    position: "absolute",
    bottom: Platform.OS === "web" ? 34 : 90,
    alignSelf: "center",
    backgroundColor: Colors.light.text,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  resultCountText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textInverse,
  },
});
