import KeyboardAwareScreen from '@/components/KeyboardAwareScreen';
import {
  InfoBanner,
  PrimaryButton,
  RequestScreenHeader,
  SectionCard,
} from '@/components/RequestUI';
import { useAppTheme } from '@/context/app-theme-context';
import { useUserRequest } from '@/context/user-request-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function PaymentDirectionsScreen() {
  const { palette } = useAppTheme();
  const { order } = useLocalSearchParams();
  const { requests } = useUserRequest();
  const request =
    requests.find((item) => item.order === order) ||
    (order ? requests.find((item) => String(item.order).includes(order)) : null) ||
    requests[0];
  const [agreed, setAgreed] = useState(false);

  if (!request) {
    return (
      <KeyboardAwareScreen
        style={{ backgroundColor: palette.background }}
        contentContainerStyle={[styles.container, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}
      >
        <Text style={{ color: palette.textSecondary }}>Loading payment details...</Text>
        <PrimaryButton
          label="Return to Dashboard"
          style={{ marginTop: 16 }}
          onPress={() => router.replace('/user-tabs/user-dashboard')}
        />
      </KeyboardAwareScreen>
    );
  }

  return (
    <KeyboardAwareScreen
      style={{ backgroundColor: palette.background }}
      contentContainerStyle={styles.container}
      bottomPadding={140}
    >
      <RequestScreenHeader
        title="Payment Directions"
        subtitle="Read the warnings before paying the service fee."
        onBack={() => router.replace('/user-tabs/user-dashboard')}
      />

      <InfoBanner
        tone="warn"
        text="Before you pay: the schedule is reserved only after the service fee is confirmed. Delivery cost is paid separately to the courier."
      />

      <SectionCard>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Payment summary
        </Text>
        <Row label="Request" value={request?.order} palette={palette} />
        <Row label="Service" value={request?.serviceProtocol} palette={palette} />
        <Row
          label="Service fee"
          value={`₱${(request?.fee || 0).toLocaleString()}`}
          palette={palette}
          bold
        />
      </SectionCard>

      <SectionCard>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Payment & delivery directions
        </Text>
        {[
          'Pay only the service fee in-app via GCash QR.',
          'Delivery / courier cost is paid at drop-off, not in this payment.',
          'If delivery is Cash by Recipient and unpaid, service will not start.',
          'Book a third-party courier (e.g. Grab Express) after payment.',
          'Upload the proof picture and shared item link so the artisan can confirm receipt.',
        ].map((item, index) => (
          <View key={item} style={styles.listRow}>
            <Text style={[styles.listIndex, { color: palette.accent }]}>
              {index + 1}.
            </Text>
            <Text style={[styles.listText, { color: palette.textSecondary }]}>
              {item}
            </Text>
          </View>
        ))}
      </SectionCard>

      <Pressable
        style={styles.agreeRow}
        onPress={() => setAgreed((value) => !value)}
      >
        <View
          style={[
            styles.checkbox,
            agreed
              ? { backgroundColor: palette.accent, borderColor: palette.accent }
              : { borderColor: palette.textSecondary },
          ]}
        >
          {agreed ? <Text style={styles.checkMark}>✓</Text> : null}
        </View>
        <Text style={[styles.agreeText, { color: palette.textPrimary }]}>
          I understand the payment covers the service fee only, not delivery.
        </Text>
      </Pressable>

      <PrimaryButton
        label="Continue to GCash"
        icon="qr-code-outline"
        disabled={!agreed}
        onPress={() =>
          router.push({
            pathname: '/user-tabs/gcash-payment',
            params: { order: request.order },
          })
        }
      />
    </KeyboardAwareScreen>
  );
}

function Row({ label, value, palette, bold }) {
  return (
    <View style={styles.row}>
      <Text style={{ color: palette.textSecondary }}>{label}</Text>
      <Text
        style={{
          color: palette.textPrimary,
          fontWeight: bold ? '700' : '600',
          fontSize: bold ? 18 : 14,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 8, gap: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
  listRow: { flexDirection: 'row', gap: 8 },
  listIndex: { fontWeight: '700', width: 18 },
  listText: { flex: 1, fontSize: 13, lineHeight: 19 },
  agreeRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
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
  agreeText: { flex: 1, fontSize: 13, lineHeight: 19 },
});
