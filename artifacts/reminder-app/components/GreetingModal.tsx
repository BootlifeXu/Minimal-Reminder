import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";

const GREETING_KEY = "@greeting_last_shown";

function getGreetingMessage(name: string | null, hour: number): { headline: string; sub: string } {
  const firstName = name?.split(" ")[0] ?? null;
  const greet = firstName ? `, ${firstName}` : "";

  if (hour >= 5 && hour < 12) {
    return {
      headline: `Good morning${greet}`,
      sub: "You're off to a great start. Let's make today count.",
    };
  }
  if (hour >= 12 && hour < 17) {
    return {
      headline: `Good afternoon${greet}`,
      sub: "Keep the momentum going — you've got this.",
    };
  }
  if (hour >= 17 && hour < 21) {
    return {
      headline: `Good evening${greet}`,
      sub: "Wind down and review what's left for today.",
    };
  }
  return {
    headline: `Good night${greet}`,
    sub: "Rest up. Your reminders will be here in the morning.",
  };
}

interface GreetingModalProps {
  userName: string | null;
}

export default function GreetingModal({ userName }: GreetingModalProps) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkAndShow();
  }, []);

  const checkAndShow = async () => {
    try {
      const lastShown = await AsyncStorage.getItem(GREETING_KEY);
      const today = new Date().toDateString();
      if (lastShown !== today) {
        setVisible(true);
        await AsyncStorage.setItem(GREETING_KEY, today);
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      }
    } catch {
      // silently fail
    }
  };

  const dismiss = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  if (!visible) return null;

  const hour = new Date().getHours();
  const { headline, sub } = getGreetingMessage(userName, hour);

  const getIcon = () => {
    if (hour >= 5 && hour < 12) return "sun";
    if (hour >= 12 && hour < 17) return "cloud";
    if (hour >= 17 && hour < 21) return "sunset";
    return "moon";
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={dismiss}
    >
      <Animated.View style={[styles.overlay, { opacity }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={dismiss}
        />
        <View
          style={[
            styles.card,
            {
              marginBottom: Platform.OS === "web" ? insets.bottom + 40 : insets.bottom + 20,
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Feather name={getIcon() as any} size={28} color={Colors.light.text} />
          </View>
          <Text style={styles.headline}>{headline}</Text>
          <Text style={styles.sub}>{sub}</Text>
          <TouchableOpacity style={styles.dismissButton} onPress={dismiss}>
            <Text style={styles.dismissText}>Let's go</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  card: {
    width: "92%",
    backgroundColor: Colors.light.background,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  headline: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.light.text,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 21,
    paddingHorizontal: 8,
  },
  dismissButton: {
    marginTop: 8,
    width: "100%",
    backgroundColor: Colors.light.text,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  dismissText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.light.textInverse,
  },
});
