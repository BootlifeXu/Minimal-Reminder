import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import type { Category, Priority, Reminder, RepeatInterval } from "@/types/reminder";

interface ReminderFormModalProps {
  visible: boolean;
  reminder?: Reminder | null;
  onClose: () => void;
  onSave: (data: {
    title: string;
    notes: string;
    dateTime: string;
    priority: Priority;
    category: Category;
    repeatInterval: RepeatInterval;
  }) => void;
}

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: "personal", label: "Personal", icon: "user" },
  { value: "work", label: "Work", icon: "briefcase" },
  { value: "health", label: "Health", icon: "activity" },
  { value: "study", label: "Study", icon: "book-open" },
  { value: "other", label: "Other", icon: "more-horizontal" },
];

const REPEATS: { value: RepeatInterval; label: string }[] = [
  { value: "none", label: "Never" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export default function ReminderFormModal({
  visible,
  reminder,
  onClose,
  onSave,
}: ReminderFormModalProps) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dateTime, setDateTime] = useState(
    () => new Date(Date.now() + 60 * 60 * 1000)
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState<Category>("personal");
  const [repeatInterval, setRepeatInterval] = useState<RepeatInterval>("none");
  const [titleError, setTitleError] = useState(false);

  useEffect(() => {
    if (visible) {
      if (reminder) {
        setTitle(reminder.title);
        setNotes(reminder.notes);
        setDateTime(new Date(reminder.dateTime));
        setPriority(reminder.priority);
        setCategory(reminder.category);
        setRepeatInterval(reminder.repeatInterval);
      } else {
        setTitle("");
        setNotes("");
        setDateTime(new Date(Date.now() + 60 * 60 * 1000));
        setPriority("medium");
        setCategory("personal");
        setRepeatInterval("none");
      }
      setTitleError(false);
    }
  }, [visible, reminder]);

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError(true);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSave({
      title: title.trim(),
      notes: notes.trim(),
      dateTime: dateTime.toISOString(),
      priority,
      category,
      repeatInterval,
    });
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          {
            paddingTop: Platform.OS === "web" ? insets.top + 20 : 20,
            paddingBottom: insets.bottom + 20,
          },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {reminder ? "Edit Reminder" : "New Reminder"}
          </Text>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <TextInput
              style={[styles.titleInput, titleError && styles.inputError]}
              placeholder="Reminder title"
              placeholderTextColor={Colors.light.textTertiary}
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                if (t.trim()) setTitleError(false);
              }}
              returnKeyType="next"
              autoFocus
            />
            <TextInput
              style={styles.notesInput}
              placeholder="Notes (optional)"
              placeholderTextColor={Colors.light.textTertiary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>WHEN</Text>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => {
                  setShowDatePicker(true);
                  setShowTimePicker(false);
                }}
              >
                <Feather name="calendar" size={15} color={Colors.light.text} />
                <Text style={styles.dateTimeText}>{formatDate(dateTime)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => {
                  setShowTimePicker(true);
                  setShowDatePicker(false);
                }}
              >
                <Feather name="clock" size={15} color={Colors.light.text} />
                <Text style={styles.dateTimeText}>{formatTime(dateTime)}</Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && Platform.OS !== "web" && (
              <DateTimePicker
                value={dateTime}
                mode="date"
                minimumDate={new Date()}
                onChange={(_, selected) => {
                  setShowDatePicker(false);
                  if (selected) {
                    const merged = new Date(dateTime);
                    merged.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
                    setDateTime(merged);
                  }
                }}
              />
            )}
            {showTimePicker && Platform.OS !== "web" && (
              <DateTimePicker
                value={dateTime}
                mode="time"
                onChange={(_, selected) => {
                  setShowTimePicker(false);
                  if (selected) {
                    const merged = new Date(dateTime);
                    merged.setHours(selected.getHours(), selected.getMinutes());
                    setDateTime(merged);
                  }
                }}
              />
            )}

            {Platform.OS === "web" && (
              <input
                type="datetime-local"
                value={dateTime.toISOString().slice(0, 16)}
                onChange={(e) => setDateTime(new Date(e.target.value))}
                style={{
                  marginTop: 8,
                  padding: 10,
                  borderRadius: 8,
                  border: `1px solid ${Colors.light.border}`,
                  fontSize: 14,
                  fontFamily: "Inter_400Regular",
                  width: "100%",
                  boxSizing: "border-box" as const,
                }}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>REPEAT</Text>
            <View style={styles.chipRow}>
              {REPEATS.map((r) => (
                <TouchableOpacity
                  key={r.value}
                  style={[styles.chip, repeatInterval === r.value && styles.chipActive]}
                  onPress={() => setRepeatInterval(r.value)}
                >
                  <Text
                    style={[styles.chipText, repeatInterval === r.value && styles.chipTextActive]}
                  >
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PRIORITY</Text>
            <View style={styles.chipRow}>
              {PRIORITIES.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  style={[styles.chip, priority === p.value && styles.chipActive]}
                  onPress={() => setPriority(p.value)}
                >
                  <View
                    style={[
                      styles.priorityDot,
                      {
                        backgroundColor:
                          p.value === "high"
                            ? Colors.light.priorityHigh
                            : p.value === "medium"
                            ? Colors.light.priorityMedium
                            : Colors.light.priorityLow,
                      },
                    ]}
                  />
                  <Text
                    style={[styles.chipText, priority === p.value && styles.chipTextActive]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CATEGORY</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.value}
                  style={[styles.categoryButton, category === c.value && styles.categoryButtonActive]}
                  onPress={() => setCategory(c.value)}
                >
                  <Feather
                    name={c.icon as any}
                    size={18}
                    color={category === c.value ? Colors.light.textInverse : Colors.light.text}
                  />
                  <Text
                    style={[styles.categoryLabel, category === c.value && styles.categoryLabelActive]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.modalBackground,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerButton: {
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  cancelText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  saveText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
    textAlign: "right",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textTertiary,
    letterSpacing: 0.8,
  },
  titleInput: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.light.border,
    paddingVertical: 8,
    paddingHorizontal: 0,
  },
  notesInput: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 10,
    padding: 12,
    minHeight: 72,
    marginTop: 4,
    backgroundColor: Colors.light.inputBackground,
  },
  inputError: {
    borderBottomColor: Colors.light.text,
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 10,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.light.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  dateTimeText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  chipActive: {
    backgroundColor: Colors.light.text,
    borderColor: Colors.light.text,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
  },
  chipTextActive: {
    color: Colors.light.textInverse,
  },
  priorityDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
    minWidth: "45%",
    flex: 1,
  },
  categoryButtonActive: {
    backgroundColor: Colors.light.text,
    borderColor: Colors.light.text,
  },
  categoryLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
  },
  categoryLabelActive: {
    color: Colors.light.textInverse,
  },
});
