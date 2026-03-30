import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useReminders } from "@/context/RemindersContext";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { reminders, deleteReminder } = useReminders();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [defaultReminder, setDefaultReminder] = useState(true);

  const topPadding = Platform.OS === "web" ? insets.top + 67 : insets.top;

  const totalReminders = reminders.length;
  const completedReminders = reminders.filter((r) => r.isCompleted).length;
  const activeReminders = totalReminders - completedReminders;

  const handleClearCompleted = () => {
    const completed = reminders.filter((r) => r.isCompleted);
    if (completed.length === 0) {
      Alert.alert("Nothing to clear", "You have no completed reminders.");
      return;
    }
    Alert.alert(
      "Clear Completed",
      `This will delete ${completed.length} completed reminder${completed.length !== 1 ? "s" : ""}. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            completed.forEach((r) => deleteReminder(r.id));
            if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    if (reminders.length === 0) {
      Alert.alert("Nothing to clear", "You have no reminders.");
      return;
    }
    Alert.alert(
      "Clear All Reminders",
      `This will permanently delete all ${reminders.length} reminder${reminders.length !== 1 ? "s" : ""}. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => {
            reminders.forEach((r) => deleteReminder(r.id));
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPadding, paddingBottom: insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Settings</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activeReminders}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{completedReminders}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalReminders}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
      <View style={styles.card}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Feather name="bell" size={18} color={Colors.light.text} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Enable Notifications</Text>
              <Text style={styles.settingSubtitle}>Ring once at reminder time</Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={(val) => {
              setNotificationsEnabled(val);
              if (Platform.OS !== "web") Haptics.selectionAsync();
            }}
            trackColor={{ false: Colors.light.border, true: Colors.light.text }}
            thumbColor={Colors.light.background}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Feather name="clock" size={18} color={Colors.light.text} />
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Default Reminder Alert</Text>
              <Text style={styles.settingSubtitle}>Alert at scheduled time</Text>
            </View>
          </View>
          <Switch
            value={defaultReminder}
            onValueChange={(val) => {
              setDefaultReminder(val);
              if (Platform.OS !== "web") Haptics.selectionAsync();
            }}
            trackColor={{ false: Colors.light.border, true: Colors.light.text }}
            thumbColor={Colors.light.background}
          />
        </View>
      </View>

      <Text style={styles.sectionLabel}>DATA</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.actionRow} onPress={handleClearCompleted}>
          <View style={styles.settingInfo}>
            <Feather name="check-circle" size={18} color={Colors.light.text} />
            <Text style={styles.settingTitle}>Clear Completed</Text>
          </View>
          <Feather name="chevron-right" size={16} color={Colors.light.textTertiary} />
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.actionRow} onPress={handleClearAll}>
          <View style={styles.settingInfo}>
            <Feather name="trash-2" size={18} color={Colors.light.text} />
            <Text style={[styles.settingTitle, styles.destructiveText]}>Clear All Reminders</Text>
          </View>
          <Feather name="chevron-right" size={16} color={Colors.light.textTertiary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>APP</Text>
      <View style={styles.card}>
        <View style={styles.actionRow}>
          <View style={styles.settingInfo}>
            <Feather name="info" size={18} color={Colors.light.text} />
            <Text style={styles.settingTitle}>Version</Text>
          </View>
          <Text style={styles.versionText}>1.0.0</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.actionRow}>
          <View style={styles.settingInfo}>
            <Feather name="database" size={18} color={Colors.light.text} />
            <Text style={styles.settingTitle}>Storage</Text>
          </View>
          <Text style={styles.versionText}>Local only</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    letterSpacing: -0.5,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textTertiary,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 24,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingText: {
    gap: 2,
  },
  settingTitle: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.light.text,
  },
  settingSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  destructiveText: {
    color: Colors.light.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginLeft: 46,
  },
  versionText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textTertiary,
  },
});
