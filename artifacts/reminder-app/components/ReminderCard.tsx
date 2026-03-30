import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Colors from "@/constants/colors";
import type { Priority, Reminder } from "@/types/reminder";

interface ReminderCardProps {
  reminder: Reminder;
  onToggle: () => void;
  onPress: () => void;
  onDelete: () => void;
  onSnooze: () => void;
}

function PriorityDot({ priority }: { priority: Priority }) {
  const color =
    priority === "high"
      ? Colors.light.priorityHigh
      : priority === "medium"
      ? Colors.light.priorityMedium
      : Colors.light.priorityLow;

  return <View style={[styles.priorityDot, { backgroundColor: color }]} />;
}

function formatDateTime(dateTimeStr: string): string {
  const dt = new Date(dateTimeStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 86400000);
  const dtDay = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());

  const time = dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (dtDay.getTime() === today.getTime()) return `Today, ${time}`;
  if (dtDay.getTime() === tomorrow.getTime()) return `Tomorrow, ${time}`;
  return dt.toLocaleDateString([], { month: "short", day: "numeric" }) + `, ${time}`;
}

const CATEGORY_LABELS: Record<string, string> = {
  personal: "Personal",
  work: "Work",
  health: "Health",
  study: "Study",
  other: "Other",
};

export default function ReminderCard({
  reminder,
  onToggle,
  onPress,
  onDelete,
  onSnooze,
}: ReminderCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isOverdue = new Date(reminder.dateTime) < new Date() && !reminder.isCompleted;

  const handleToggle = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    onToggle();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          reminder.isCompleted && styles.cardCompleted,
          pressed && styles.cardPressed,
        ]}
        onPress={onPress}
      >
        <TouchableOpacity
          style={styles.checkButton}
          onPress={handleToggle}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={[styles.checkbox, reminder.isCompleted && styles.checkboxChecked]}>
            {reminder.isCompleted && (
              <Feather name="check" size={12} color={Colors.light.textInverse} />
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <PriorityDot priority={reminder.priority} />
            <Text
              style={[styles.title, reminder.isCompleted && styles.titleCompleted]}
              numberOfLines={1}
            >
              {reminder.title}
            </Text>
          </View>

          {reminder.notes ? (
            <Text style={styles.notes} numberOfLines={1}>
              {reminder.notes}
            </Text>
          ) : null}

          <View style={styles.meta}>
            <Feather
              name="clock"
              size={11}
              color={isOverdue ? Colors.light.text : Colors.light.textTertiary}
            />
            <Text
              style={[
                styles.dateTime,
                isOverdue && !reminder.isCompleted && styles.dateTimeOverdue,
              ]}
            >
              {formatDateTime(reminder.dateTime)}
            </Text>
            {reminder.repeatInterval !== "none" && (
              <>
                <Feather name="repeat" size={11} color={Colors.light.textTertiary} />
              </>
            )}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {CATEGORY_LABELS[reminder.category]}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          {!reminder.isCompleted && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onSnooze}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="clock" size={15} color={Colors.light.textTertiary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="trash-2" size={15} color={Colors.light.textTertiary} />
          </TouchableOpacity>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  cardCompleted: {
    opacity: 0.5,
  },
  cardPressed: {
    backgroundColor: Colors.light.surface,
  },
  checkButton: {
    marginRight: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.light.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.light.text,
    borderColor: Colors.light.text,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  title: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
    flex: 1,
  },
  titleCompleted: {
    textDecorationLine: "line-through",
    color: Colors.light.textTertiary,
  },
  notes: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    marginLeft: 12,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: 12,
    marginTop: 2,
  },
  dateTime: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textTertiary,
  },
  dateTimeOverdue: {
    color: Colors.light.text,
    fontFamily: "Inter_500Medium",
  },
  categoryBadge: {
    backgroundColor: Colors.light.surface,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginLeft: 4,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    padding: 4,
  },
});
