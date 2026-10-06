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
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DeliveryProofScreen() {
  const { palette } = useAppTheme();
  const { id } = useLocalSearchParams();
  const { requests, confirmItemReceived, setSelectedId } = useAdminRequest();
  const request =
    requests.find((item) => item.id === id) ||
    requests.find((item) => item.stage === 'awaiting_delivery') ||
    requests[0];

  const [verified, setVerified] = useState(false);
  const courier = request.courier || {};

  const handleConfirm = () => {
    if (!verified) return;
    confirmItemReceived(request.id);
    setSelectedId(request.id);
    Alert.alert(
      'Item received',
      'Restoration can now begin for this request.',
      [{ text: 'OK', onPress: () => router.replace('/admin-tabs/admin-forms') }],
    );
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: palette.background }]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <RequestScreenHeader
          title="Delivery Proof Review"
          subtitle="Review the client courier e-receipt before starting restoration."
          rightLabel={request.id}
          onBack={() => router.replace('/admin-tabs/admin-forms')}
        />

        <View style={styles.badgeRow}>
          <Text style={styles.inTransit}>In transit</Text>
        </View>

        <SectionCard>
          <View style={styles.receiptHeader}>
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
              Client courier e-receipt
            </Text>
            <Text style={styles.verified}>Verified file</Text>
          </View>
          <View style={[styles.receiptBox, { backgroundColor: palette.softCard }]}>
            <Text style={[styles.courierName, { color: palette.textPrimary }]}>
              {courier.name || 'Courier'}
            </Text>
            <Text style={{ color: palette.textSecondary }}>
              Tracking · {courier.trackingNo || '—'}
            </Text>
            <Text style={{ color: palette.textSecondary }}>
              From {courier.sender || request.clientName}
            </Text>
            <Text style={{ color: palette.textSecondary }}>
              To {courier.recipient || 'Mabuli Atelier Workshop'}
            </Text>
            <View style={styles.barcode}>
              <Ionicons name="barcode-outline" size={36} color={palette.accent} />
            </View>
          </View>
        </SectionCard>

        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Delivery and payment
          </Text>
          <Row
            label="Payment"
            value={request.paymentStatus}
            tone={request.paymentStatus === 'Paid' ? 'mint' : 'amber'}
            palette={palette}
          />
          <Row
            label="Reference"
            value={request.paymentRef || '—'}
            palette={palette}
          />
          <Row
            label="Courier status"
            value={courier.status || 'Pending'}
            palette={palette}
          />
          <Row
            label="Delivered at"
            value={courier.deliveredAt || '—'}
            palette={palette}
          />
          <View style={styles.tagRow}>
            <Pill label="Payment cleared" tone="mint" />
            <Pill label="Proof matched" tone="mint" />
            <Pill label="Receipt pending confirm" tone="amber" />
          </View>
        </SectionCard>

        <InfoBanner
          tone="warn"
          text="Do not begin restoration until item identity and condition are verified against the intake photos."
        />

        <Pressable style={styles.checkRow} onPress={() => setVerified((v) => !v)}>
          <View
            style={[
              styles.checkbox,
              verified
                ? { backgroundColor: palette.accent, borderColor: palette.accent }
                : { borderColor: palette.textSecondary },
            ]}
          >
            {verified ? <Text style={styles.checkMark}>✓</Text> : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: palette.textPrimary, fontWeight: '700' }}>
              Item identity and condition verified
            </Text>
            <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
              Matches request photos and declared damage notes.
            </Text>
          </View>
        </Pressable>

        <PrimaryButton
          label="Confirm Item Received"
          icon="checkmark"
          disabled={!verified}
          onPress={handleConfirm}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, palette, tone }) {
  return (
    <View style={styles.row}>
      <Text style={{ color: palette.textSecondary, width: 110 }}>{label}</Text>
      {tone ? (
        <Pill label={value} tone={tone} />
      ) : (
        <Text style={{ color: palette.textPrimary, fontWeight: '600', flex: 1 }}>
          {value}
        </Text>
      )}
    </View>
  );
}

function Pill({ label, tone }) {
  const map = {
    mint: { bg: '#DDF9EC', color: '#157651' },
    amber: { bg: '#FFE6B8', color: '#8A5A06' },
    blue: { bg: '#D8E8FF', color: '#215AA8' },
  };
  const style = map[tone] || map.blue;
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
  inTransit: {
    backgroundColor: '#FFE6B8',
    color: '#8A5A06',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: '700',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verified: {
    backgroundColor: '#DDF9EC',
    color: '#157651',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '700',
  },
  receiptBox: {
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  courierName: { fontSize: 18, fontWeight: '700' },
  barcode: { marginTop: 10, alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: '700',
  },
  checkRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkMark: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
