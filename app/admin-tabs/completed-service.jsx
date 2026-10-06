import {
  PrimaryButton,
  RequestScreenHeader,
  SectionCard,
} from '@/components/RequestUI';
import { useAppTheme } from '@/context/app-theme-context';
import { useAdminRequest } from '@/context/admin-request-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CompletedServiceScreen() {
  const { palette } = useAppTheme();
  const { id } = useLocalSearchParams();
  const { requests } = useAdminRequest();
  const request =
    requests.find((item) => item.id === id) ||
    requests.find((item) => item.stage === 'complete') ||
    requests[0];

  const feedback = request.feedback || {
    rating: 5,
    date: '—',
    comments: 'No feedback recorded yet.',
    tags: [],
    concerns: 'None',
    followUp: '—',
    warranty: '30-day workmanship warranty',
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: palette.background }]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <RequestScreenHeader
          title="Completed Service"
          subtitle="Archived record with delivery confirmation and client feedback."
          rightLabel={request.id}
          onBack={() => router.replace('/admin-tabs/admin-view-logs')}
        />

        <View style={styles.badgeRow}>
          <Text style={styles.archived}>Archived</Text>
        </View>

        <SectionCard style={styles.successCard}>
          <Ionicons name="checkmark-circle" size={26} color="#157651" />
          <Text style={{ color: '#157651', fontWeight: '700', flex: 1 }}>
            Service closed · item returned to client
          </Text>
        </SectionCard>

        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Final delivery confirmation
          </Text>
          <Text style={{ color: palette.textPrimary, fontWeight: '600' }}>
            Collected by {request.clientName}
          </Text>
          <Text style={{ color: palette.textSecondary }}>
            Released by Mabuli Artisan · {request.courier?.deliveredAt || '—'}
          </Text>
          <View style={styles.tagRow}>
            <Pill label="Client signature" />
            <Pill label="Pickup photo" />
            <Pill label="Release logged" />
          </View>
        </SectionCard>

        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Client rating & feedback
          </Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={feedback.rating >= star ? 'star' : 'star-outline'}
                size={22}
                color="#F7B541"
              />
            ))}
          </View>
          <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
            Received {feedback.date}
          </Text>
          <Text style={[styles.quote, { color: palette.textSecondary }]}>
            “{feedback.comments}”
          </Text>
          <View style={styles.tagRow}>
            {(feedback.tags || []).map((tag) => (
              <Pill key={tag} label={tag} tone="amber" />
            ))}
          </View>
        </SectionCard>

        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Concerns & follow-up
          </Text>
          <Row label="Concerns" value={feedback.concerns} palette={palette} />
          <Row label="Care follow-up" value={feedback.followUp} palette={palette} />
          <Row label="Warranty" value={feedback.warranty} palette={palette} />
        </SectionCard>

        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Full service report
          </Text>
          <Text style={{ color: palette.textSecondary }}>
            {request.completion?.report || 'Restoration report on file.'}
          </Text>
          <Text style={{ color: palette.textSecondary, marginTop: 4 }}>
            Protocol: {request.serviceProtocol} · Fee ₱
            {(request.fee || 0).toLocaleString()}
          </Text>
        </SectionCard>

        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Activity log status
          </Text>
          <Text style={{ color: palette.textSecondary }}>
            Archived under Logs · retention 24 months · last updated on close.
          </Text>
        </SectionCard>

        <PrimaryButton
          label="Open Full Activity Log"
          variant="secondary"
          icon="folder-open-outline"
          onPress={() => router.push('/admin-tabs/admin-view-logs')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, palette }) {
  return (
    <View style={styles.row}>
      <Text style={{ color: palette.textSecondary, width: 110 }}>{label}</Text>
      <Text style={{ color: palette.textPrimary, fontWeight: '600', flex: 1 }}>
        {value}
      </Text>
    </View>
  );
}

function Pill({ label, tone = 'mint' }) {
  const map = {
    mint: { bg: '#DDF9EC', color: '#157651' },
    amber: { bg: '#FFF1C9', color: '#8A6510' },
  };
  const style = map[tone] || map.mint;
  return (
    <Text style={[styles.pill, { backgroundColor: style.bg, color: style.color }]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 16, gap: 14, paddingBottom: 36 },
  badgeRow: { flexDirection: 'row' },
  archived: {
    backgroundColor: '#E5EAF2',
    color: '#4A5670',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: '700',
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#E8F8EF',
    borderColor: '#A8DFC0',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: '700',
  },
  stars: { flexDirection: 'row', gap: 4 },
  quote: { fontSize: 14, lineHeight: 20, fontStyle: 'italic' },
  row: { flexDirection: 'row', gap: 8 },
});
