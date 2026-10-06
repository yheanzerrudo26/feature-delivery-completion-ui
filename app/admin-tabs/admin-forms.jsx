import React, { useState } from 'react';
import {
  PrimaryButton,
  RequestScreenHeader,
  SectionCard,
} from '@/components/RequestUI';
import { useAppTheme } from '@/context/app-theme-context';
import {
  routeForAdminStage,
  useAdminRequest,
} from '@/context/admin-request-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending_review', label: 'Review' },
  { key: 'awaiting_delivery', label: 'Delivery' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'reschedule_needed', label: 'Reschedule' },
  { key: 'complete', label: 'Done' },
];

export default function AdminFormsScreen() {
  const { palette } = useAppTheme();
  const { requests, counts, setSelectedId } = useAdminRequest();
  const [filter, setFilter] = useState('all');

  const visible = requests.filter((item) => {
    if (filter === 'all') return item.stage !== 'declined';
    return item.stage === filter;
  });

  const openRequest = (request) => {
    setSelectedId(request.id);
    router.push(routeForAdminStage(request.stage, request.id));
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: palette.background }]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <RequestScreenHeader
          title="Forms inbox"
          subtitle="Review requests, delivery proof, completion forms, and reschedule cases."
          showBack={false}
        />

        <View style={styles.statsRow}>
          <Stat label="Pending review" value={counts.pendingReview} tone="amber" />
          <Stat label="Delivery proof" value={counts.awaitingDelivery} tone="blue" />
          <Stat label="Reschedule" value={counts.rescheduleNeeded} tone="amber" />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((item) => {
            const active = filter === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => setFilter(item.key)}
                style={[
                  styles.filterChip,
                  active
                    ? { backgroundColor: palette.accent }
                    : { backgroundColor: palette.softCard },
                ]}
              >
                <Text
                  style={{
                    color: active ? '#fff' : palette.textPrimary,
                    fontWeight: '700',
                    fontSize: 12,
                  }}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {visible.map((request) => (
          <Pressable
            key={request.id}
            onPress={() => openRequest(request)}
            style={[styles.card, { backgroundColor: palette.card }]}
          >
            <View style={styles.cardTop}>
              <Text style={[styles.id, { color: palette.textPrimary }]}>
                {request.id}
              </Text>
              <StatusPill label={request.badge} tone={request.badgeVariant} />
            </View>
            <Text style={[styles.name, { color: palette.textPrimary }]}>
              {request.clientName}
            </Text>
            <Text style={{ color: palette.textSecondary }}>{request.item}</Text>
            <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
              {request.serviceProtocol} · ₱{(request.fee || 0).toLocaleString()}
            </Text>
            <View style={styles.cardFooter}>
              <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
                {request.submittedAt}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={palette.textSecondary} />
            </View>
          </Pressable>
        ))}

        {visible.length === 0 ? (
          <SectionCard>
            <Text style={{ color: palette.textSecondary }}>
              No forms in this filter.
            </Text>
          </SectionCard>
        ) : null}

        <PrimaryButton
          label="Open payment monitoring"
          variant="secondary"
          icon="card-outline"
          onPress={() => router.push('/admin-tabs/admin-payment')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, tone }) {
  const map = {
    amber: { bg: '#FFF1C9', color: '#8A6510' },
    blue: { bg: '#E8F1FF', color: '#215AA8' },
  };
  const style = map[tone] || map.blue;
  return (
    <View style={[styles.stat, { backgroundColor: style.bg }]}>
      <Text style={{ color: style.color, fontSize: 22, fontWeight: '700' }}>
        {value}
      </Text>
      <Text style={{ color: style.color, fontSize: 11, fontWeight: '600' }}>
        {label}
      </Text>
    </View>
  );
}

function StatusPill({ label, tone }) {
  const map = {
    amber: { bg: '#FFE6B8', color: '#8A5A06' },
    blue: { bg: '#D8E8FF', color: '#215AA8' },
    mint: { bg: '#DDF9EC', color: '#157651' },
  };
  const style = map[tone] || map.amber;
  return (
    <Text style={[styles.pill, { backgroundColor: style.bg, color: style.color }]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 16, gap: 12, paddingBottom: 32 },
  statsRow: { flexDirection: 'row', gap: 8 },
  stat: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    gap: 2,
  },
  filterRow: { gap: 8, paddingVertical: 2 },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  card: {
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  id: { fontSize: 16, fontWeight: '700' },
  name: { fontSize: 18, fontWeight: '700', marginTop: 2 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  pill: {
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '700',
  },
});
