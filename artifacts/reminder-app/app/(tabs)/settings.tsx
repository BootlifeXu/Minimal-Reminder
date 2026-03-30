import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
import { useAuth } from "@/lib/auth";
import { useReminders } from "@/context/RemindersContext";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { reminders, deleteReminder } = useReminders();
  const { user, isAuthenticated, isLoading: authLoading, login, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [defaultReminder, setDefaultReminder] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

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

  const handleLogout = () => {
    Alert.alert("Log out", "Your reminders will remain stored locally.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Account"
    : null;

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

      {/* Account section */}
      <Text style={styles.sectionLabel}>ACCOUNT</Text>
      <View style={styles.card}>
        {authLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={Colors.light.text} />
          </View>
        ) : isAuthenticated && user ? (
          <>
            <View style={styles.profileRow}>
              {user.profileImageUrl ? (
                <Image
                  source={{ uri: user.profileImageUrl }}
                  style={styles.avatar}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Feather name="user" size={18} color={Colors.light.text} />
                </View>
              )}
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{displayName}</Text>
                {user.email && <Text style={styles.profileEmail}>{user.email}</Text>}
              </View>
              <View style={styles.syncBadge}>
                <Feather name="cloud" size={12} color={Colors.light.textSecondary} />
                <Text style={styles.syncBadgeText}>Synced</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.actionRow} onPress={handleLogout}>
              <View style={styles.settingInfo}>
                <Feather name="log-out" size={18} color={Colors.light.text} />
                <Text style={styles.settingTitle}>Log out</Text>
              </View>
              <Feather name="chevron-right" size={16} color={Colors.light.textTertiary} />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.loginButton} onPress={login}>
            <View style={styles.loginContent}>
              <View style={styles.loginIconContainer}>
                <Feather name="cloud" size={22} color={Colors.light.text} />
              </View>
              <View style={styles.loginText}>
                <Text style={styles.loginTitle}>Sync across devices</Text>
                <Text style={styles.loginSubtitle}>Log in to back up and sync your reminders</Text>
              </View>
              <Feather name="chevron-right" size={16} color={Colors.light.textTertiary} />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats */}
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
          <Text style={styles.versionText}>{isAuthenticated ? "Cloud + Local" : "Local only"}</Text>
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
  loadingRow: {
    padding: 20,
    alignItems: "center",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  profileEmail: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
  },
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.light.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  syncBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: Colors.light.textSecondary,
  },
  loginButton: {
    padding: 16,
  },
  loginContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  loginIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: {
    flex: 1,
    gap: 2,
  },
  loginTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.text,
  },
  loginSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
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
