import { useAppTheme } from "@/context/app-theme-context";
import { useUserRequest } from "@/context/user-request-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../lib/firebase.js";

export default function UserDashboardScreen() {
  const { palette } = useAppTheme();
  const { requests, setSelectedOrder } = useUserRequest();

  const [today, setToday] = useState("");
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options = {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      };
      setToday(now.toLocaleDateString(undefined, options));
    };
    updateDate();
    const interval = setInterval(updateDate, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const ref = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserData({
          ...data,
          email: data.email || user.email,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const fullName =
    `${userData?.firstName || ""} ${userData?.lastName || ""}`.trim();
  const displayName = fullName || userData?.name || "Client";

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: palette.background }]}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerRow, { backgroundColor: palette.card }]}>
          <View>
            <Text style={[styles.eyebrow, { color: palette.textSecondary }]}>
              HOME - MY REQUESTS
            </Text>
            <Text style={[styles.title, { color: palette.textPrimary }]}>
              Welcome back,
            </Text>
            <Text style={[styles.heroName, { color: palette.textPrimary }]}>
              {displayName}
            </Text>
            <Text style={[styles.date, { color: palette.textSecondary }]}>
              {today}
            </Text>
          </View>
        </View>

        {requests.map((request) => (
          <Pressable
            key={request.order}
            style={[styles.requestCard, { backgroundColor: palette.card }]}
            onPress={() => {
              setSelectedOrder(request.order);
              router.push("/user-tabs/tracker");
            }}
          >
            <View style={styles.requestHeader}>
              <Text
                style={[styles.requestTitle, { color: palette.textPrimary }]}
              >
                Order {request.order}
              </Text>
              <Text
                style={[
                  styles.statusBadge,
                  request.badgeVariant === "blue" ? styles.badgeBlue : null,
                  request.badgeVariant === "amber" ? styles.badgeAmber : null,
                  request.badgeVariant === "mint" ? styles.badgeMint : null,
                ]}
              >
                {request.badge}
              </Text>
            </View>
            <Text
              style={[styles.requestItem, { color: palette.textSecondary }]}
            >
              {request.item}
            </Text>

            {request.progress !== null ? (
              <View style={styles.progressSection}>
                <Text
                  style={[
                    styles.progressLabel,
                    { color: palette.textSecondary },
                  ]}
                >
                  Restoration progress
                </Text>
                <View
                  style={[
                    styles.progressTrack,
                    { backgroundColor: palette.softCard },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${request.progress * 100}%` },
                    ]}
                  />
                </View>
              </View>
            ) : null}

            <Text
              style={[styles.requestDetail, { color: palette.textSecondary }]}
            >
              {request.detail}
            </Text>
          </Pressable>
        ))}

        <Pressable
          style={[
            styles.primaryButton,
            {
              backgroundColor: palette.softCard,
              borderColor: palette.textSecondary,
            },
          ]}
          onPress={() => router.push("/user-tabs/atelier-checklist")}
        >
          <Ionicons name="add" size={18} color={palette.textPrimary} />
          <Text
            style={[styles.primaryButtonText, { color: palette.textPrimary }]}
          >
            Submit new restoration request
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 16, gap: 14 },
  headerRow: { borderRadius: 20, padding: 16, gap: 8 },
  eyebrow: { letterSpacing: 2, fontSize: 12 },
  title: { fontSize: 32, fontWeight: "700" },
  heroName: { fontSize: 30, fontWeight: "700" },
  date: { fontSize: 15 },
  requestCard: { borderRadius: 20, padding: 14, gap: 10 },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  requestTitle: { fontSize: 22, fontWeight: "600" },
  requestItem: { fontSize: 14, lineHeight: 20 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
  },
  badgeBlue: { backgroundColor: "#D8E8FF", color: "#215AA8" },
  badgeAmber: { backgroundColor: "#FFE6B8", color: "#8A5A06" },
  badgeMint: { backgroundColor: "#DDF9EC", color: "#157651" },
  progressSection: { gap: 6 },
  progressLabel: { fontSize: 13 },
  progressTrack: { height: 6, borderRadius: 999, overflow: "hidden" },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#2E8BFF",
  },
  requestDetail: { fontSize: 13 },
  primaryButton: {
    marginTop: 4,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: { fontSize: 16, fontWeight: "700" },
});
