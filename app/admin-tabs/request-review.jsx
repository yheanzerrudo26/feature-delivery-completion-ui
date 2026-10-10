import {
  InfoBanner,
  PrimaryButton,
  RequestScreenHeader,
  SectionCard,
} from '@/components/RequestUI';
import { useAppTheme } from '@/context/app-theme-context';
import { useAdminRequest } from '@/context/admin-request-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RequestReviewScreen() {
  const { palette } = useAppTheme();
  const { id } = useLocalSearchParams();
  const { requests, acceptRequest, setSelectedId } = useAdminRequest();
  const request =
    requests.find((item) => item.id === id) ||
    requests.find((item) => item.stage === 'pending_review') ||
    requests[0];

  
const handleAccept = async () => {
  try {
    await acceptRequest(request.id);
    setSelectedId(request.id);

    Alert.alert(
      'Request accepted',
      'The request status was saved. Client notification still needs to be connected.',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/admin-tabs/admin-forms'),
        },
      ],
    );
  } catch (error) {
    console.error('Failed to accept request:', error);

    Alert.alert(
      'Unable to accept request',
      error.message || 'Please try again.',
    );
  }
};

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: palette.background }]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <RequestScreenHeader
          title="Request Review"
          subtitle="Verify the client submission, AI findings, and supporting photos before deciding."
          rightLabel={request.id}
          onBack={() => router.replace('/admin-tabs/admin-forms')}
        />

        <View style={styles.badgeRow}>
          <StatusPill label={request.badge} tone={request.badgeVariant} />
        </View>

        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Client request
          </Text>
          <Text style={[styles.name, { color: palette.textPrimary }]}>
            {request.clientName}
          </Text>
          <Text style={{ color: palette.textSecondary }}>{request.mobile}</Text>
          <Text style={{ color: palette.textSecondary }}>{request.email}</Text>
          <Text style={{ color: palette.textSecondary, marginTop: 4 }}>
            Submitted {request.submittedAt}
          </Text>
        </SectionCard>

        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Item information
          </Text>
          <Row label="Item" value={request.item} palette={palette} />
          <Row label="Color / material" value={request.colorMaterial} palette={palette} />
          <Row label="Declared issue" value={request.declaredIssue} palette={palette} />
          <Row label="Return method" value={request.returnMethod} palette={palette} />
          <Row label="Suggested protocol" value={request.serviceProtocol} palette={palette} />
        </SectionCard>

        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Submitted photos
          </Text>
          <View style={styles.photoGrid}>
            {request.photos.map((label) => (
              <View
                key={label}
                style={[styles.photoTile, { backgroundColor: palette.softCard }]}
              >
                <Ionicons name="image-outline" size={22} color={palette.accent} />
                <Text style={[styles.photoLabel, { color: palette.textSecondary }]}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </SectionCard>

        <SectionCard>
          <View style={styles.aiHeader}>
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
              AI assessment
            </Text>
            <Text style={styles.confidence}>{request.ai.confidence}% confidence</Text>
          </View>
          <View style={[styles.confidenceTrack, { backgroundColor: palette.softCard }]}>
            <View
              style={[
                styles.confidenceFill,
                { width: `${request.ai.confidence}%` },
              ]}
            />
          </View>
          <Text style={{ color: palette.textSecondary, lineHeight: 20 }}>
            {request.ai.summary}
          </Text>
          <View style={styles.tagRow}>
            {request.ai.tags.map((tag) => (
              <Text key={tag} style={styles.tag}>
                {tag}
              </Text>
            ))}
          </View>
        </SectionCard>

        {request.clientNotes ? (
          <SectionCard>
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
              Client notes
            </Text>
            <Text style={[styles.quote, { color: palette.textSecondary }]}>
              “{request.clientNotes}”
            </Text>
          </SectionCard>
        ) : null}

        <InfoBanner
          tone="info"
          text="Accepting notifies the client and moves them to payment and item tracking. Declining requires a reason sent to the client."
        />

        <View style={styles.actions}>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label="Decline"
              variant="secondary"
              icon="close"
              onPress={() =>
                router.push({
                  pathname: '/admin-tabs/decline-request',
                  params: { id: request.id },
                })
              }
            />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label="Accept Request"
              icon="checkmark"
              onPress={handleAccept}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, palette }) {
  return (
    <View style={styles.row}>
      <Text style={{ color: palette.textSecondary, width: 110, fontSize: 13 }}>
        {label}
      </Text>
      <Text
        style={{
          color: palette.textPrimary,
          flex: 1,
          fontSize: 14,
          fontWeight: '600',
        }}
      >
        {value}
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
  container: { padding: 16, gap: 14, paddingBottom: 36 },
  badgeRow: { flexDirection: 'row' },
  pill: {
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: '700',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700' },
  row: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoTile: {
    width: '31%',
    minHeight: 78,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 8,
  },
  photoLabel: { fontSize: 11, textAlign: 'center' },
  aiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidence: { color: '#215AA8', fontWeight: '700', fontSize: 12 },
  confidenceTrack: { height: 6, borderRadius: 999, overflow: 'hidden' },
  confidenceFill: { height: '100%', backgroundColor: '#2E8BFF' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: '#E8F1FF',
    color: '#215AA8',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: '700',
  },
  quote: { fontSize: 14, lineHeight: 20, fontStyle: 'italic' },
  actions: { flexDirection: 'row', gap: 10 },
});
