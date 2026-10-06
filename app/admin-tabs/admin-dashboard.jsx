import { useAppTheme } from '@/context/app-theme-context';
import {
  routeForAdminStage,
  useAdminRequest,
} from '@/context/admin-request-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminDashboardScreen() {
  const { palette } = useAppTheme();
  const { counts, requests, setSelectedId } = useAdminRequest();
  const [today, setToday] = useState('');

  useEffect(() => {
    const updateDate = () => {
      setToday(
        new Date().toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      );
    };
    updateDate();
    const interval = setInterval(updateDate, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const metrics = [
    { label: 'Pending review', value: counts.pendingReview, stage: 'pending_review' },
    { label: 'Delivery proof', value: counts.awaitingDelivery, stage: 'awaiting_delivery' },
    { label: 'In restoration', value: counts.inProgress, stage: 'in_progress' },
    { label: 'Reschedule needed', value: counts.rescheduleNeeded, stage: 'reschedule_needed' },
    { label: 'Awaiting pickup reply', value: counts.awaitingPickup, stage: 'awaiting_pickup_response' },
    { label: 'Completed', value: counts.complete, stage: 'complete' },
  ];

  const attention = requests.filter((item) =>
    ['pending_review', 'awaiting_delivery', 'reschedule_needed'].includes(
      item.stage,
    ),
  );

  const open = (request) => {
    setSelectedId(request.id);
    router.push(routeForAdminStage(request.stage, request.id));
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: palette.background }]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerRow, { backgroundColor: palette.card }]}>
          <Text style={[styles.eyebrow, { color: palette.textSecondary }]}>
            ATELIER COMMAND CENTER
          </Text>
          <Text style={[styles.title, { color: palette.textPrimary }]}>
            Admin Dashboard
          </Text>
          <Text style={[styles.date, { color: palette.textSecondary }]}>{today}</Text>
          <Text style={styles.badge}>Admin / Artisan access</Text>
        </View>

        <View style={styles.grid}>
          {metrics.map((item) => (
            <Pressable
              key={item.label}
              style={[styles.metricCard, { backgroundColor: palette.card }]}
              onPress={() => router.push('/admin-tabs/admin-forms')}
            >
              <Text style={[styles.metricLabel, { color: palette.textSecondary }]}>
                {item.label}
              </Text>
              <Text style={[styles.metricValue, { color: palette.textPrimary }]}>
                {item.value}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: palette.card }]}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Needs attention
          </Text>
          {attention.length === 0 ? (
            <Text style={{ color: palette.textSecondary }}>
              No urgent forms right now.
            </Text>
          ) : (
            attention.map((request) => (
              <Pressable
                key={request.id}
                style={[styles.noteItem, { backgroundColor: palette.softCard }]}
                onPress={() => open(request)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.noteTitle, { color: palette.textPrimary }]}>
                    {request.id} · {request.clientName}
                  </Text>
                  <Text style={{ color: palette.textSecondary, fontSize: 13 }}>
                    {request.badge} · {request.item}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={palette.textSecondary}
                />
              </Pressable>
            ))
          )}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: palette.card }]}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Payment snapshot
          </Text>
          <Text style={{ color: palette.textSecondary }}>
            Paid {counts.paid} · Unpaid / pending {counts.unpaid}
          </Text>
          <Pressable
            style={styles.linkRow}
            onPress={() => router.push('/admin-tabs/admin-payment')}
          >
            <Text style={{ color: palette.accent, fontWeight: '700' }}>
              Open Payments
            </Text>
            <Ionicons name="arrow-forward" size={16} color={palette.accent} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 16, gap: 14, paddingBottom: 32 },
  headerRow: { borderRadius: 20, padding: 16, gap: 6 },
  eyebrow: { letterSpacing: 2, fontSize: 12, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '700' },
  date: { fontSize: 14 },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: '#E6EDF7',
    color: '#173B70',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontWeight: '700',
    fontSize: 12,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricCard: {
    width: '48%',
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  metricLabel: { fontSize: 13 },
  metricValue: { fontSize: 28, fontWeight: '700' },
  sectionCard: { borderRadius: 18, padding: 14, gap: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  noteItem: {
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noteTitle: { fontWeight: '700', fontSize: 14 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
});
