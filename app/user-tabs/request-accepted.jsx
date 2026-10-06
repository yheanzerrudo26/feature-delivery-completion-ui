import {
  PrimaryButton,
  RequestScreenHeader,
  SectionCard,
} from '@/components/RequestUI';
import { useAppTheme } from '@/context/app-theme-context';
import { useUserRequest } from '@/context/user-request-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RequestAcceptedScreen() {
  const { palette } = useAppTheme();
  const { order } = useLocalSearchParams();
  const { requests, setSelectedOrder } = useUserRequest();
  const request =
    requests.find((item) => item.order === order) || requests[0];

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: palette.background }]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <RequestScreenHeader
          title="Request Accepted"
          subtitle="Your request was accepted. Continue to payment and tracking."
        />

        <View style={styles.hero}>
          <View style={styles.icon}>
            <Ionicons name="checkmark" size={32} color="#157651" />
          </View>
          <Text style={[styles.heroTitle, { color: palette.textPrimary }]}>
            Ready for the next step
          </Text>
        </View>

        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Transaction summary
          </Text>
          <SummaryRow label="Client" value={request.clientName || 'Client'} />
          <SummaryRow label="Item" value={request.item} />
          <SummaryRow
            label="Date accepted"
            value={request.acceptedDate || 'Today'}
          />
          <SummaryRow
            label="Turnaround"
            value={request.turnaround || '7–10 business days'}
          />
        </SectionCard>

        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Selected service protocol
          </Text>
          <Text style={[styles.protocol, { color: palette.accent }]}>
            {request.serviceProtocol}
          </Text>
          <View style={styles.feeRow}>
            <Text style={{ color: palette.textSecondary }}>Service fee</Text>
            <Text style={[styles.fee, { color: palette.textPrimary }]}>
              ₱{(request.fee || 0).toLocaleString()}
            </Text>
          </View>
        </SectionCard>

        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Assigned artisan
          </Text>
          <Text style={{ color: palette.textPrimary, fontWeight: '600' }}>
            {request.artisan?.name || 'Artisan'}
          </Text>
          <Text style={{ color: palette.textSecondary }}>
            {request.artisan?.contact || 'Contact shared after acceptance'}
          </Text>
        </SectionCard>

        <PrimaryButton
          label="Continue to Payment Directions"
          icon="arrow-forward"
          onPress={() => {
            setSelectedOrder(request.order);
            router.push({
              pathname: '/user-tabs/payment-directions',
              params: { order: request.order },
            });
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value }) {
  const { palette } = useAppTheme();
  return (
    <View style={styles.summaryRow}>
      <Text style={{ color: palette.textSecondary, fontSize: 13 }}>{label}</Text>
      <Text
        style={{
          color: palette.textPrimary,
          fontSize: 14,
          fontWeight: '600',
          flex: 1,
          textAlign: 'right',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 16, gap: 14, paddingBottom: 32 },
  hero: { alignItems: 'center', gap: 10, paddingVertical: 8 },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DDF9EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { fontSize: 20, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  protocol: { fontSize: 16, fontWeight: '700' },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fee: { fontSize: 22, fontWeight: '700' },
});
