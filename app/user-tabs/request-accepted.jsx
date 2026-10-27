import {
  PrimaryButton,
  RequestScreenHeader,
  SectionCard,
} from '@/components/RequestUI';
import { useAppTheme } from '@/context/app-theme-context';
import { useUserRequest } from '@/context/user-request-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RequestAcceptedScreen() {
  const { palette } = useAppTheme();
  const { order } = useLocalSearchParams();
  const { requests, setSelectedOrder, loadingRequests } = useUserRequest();
  const request =
    requests.find((item) => item.order === order) ||
    (order ? requests.find((item) => String(item.order).includes(order)) : null) ||
    requests.find((item) => item.stage === 'accepted') ||
    requests[0];

  if (!request) {
    return (
      <SafeAreaView
        style={[
          styles.screen,
          {
            backgroundColor: palette.background,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          },
        ]}
        edges={['top']}
      >
        {loadingRequests ? (
          <>
            <ActivityIndicator size="large" color={palette.accent} />
            <Text style={{ color: palette.textSecondary, marginTop: 12 }}>
              Loading request details...
            </Text>
          </>
        ) : (
          <>
            <Ionicons
              name="checkmark-circle-outline"
              size={52}
              color={palette.accent}
            />
            <Text
              style={{
                color: palette.textPrimary,
                fontSize: 18,
                fontWeight: '700',
                marginTop: 12,
              }}
            >
              No Request Selected
            </Text>
            <Text
              style={{
                color: palette.textSecondary,
                marginTop: 6,
                textAlign: 'center',
              }}
            >
              Please return to the dashboard to select your accepted request.
            </Text>
            <View style={{ marginTop: 20, width: '100%' }}>
              <PrimaryButton
                label="Go to Dashboard"
                onPress={() => router.replace('/user-tabs/user-dashboard')}
              />
            </View>
          </>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: palette.background }]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <RequestScreenHeader
          title="Request Accepted"
          subtitle="Your request was accepted. Continue to payment and tracking."
          onBack={() => router.replace('/user-tabs/user-dashboard')}
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
          <SummaryRow label="Client" value={request?.clientName || 'Client'} />
          <SummaryRow label="Item" value={request?.item || 'Item'} />
          <SummaryRow
            label="Date accepted"
            value={request?.acceptedDate || 'Today'}
          />
          <SummaryRow
            label="Turnaround"
            value={request?.turnaround || '7–10 business days'}
          />
        </SectionCard>

        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Selected service protocol
          </Text>
          <Text style={[styles.protocol, { color: palette.accent }]}>
            {request?.serviceProtocol || 'Repair & Deep Conditioning'}
          </Text>
          <View style={styles.feeRow}>
            <Text style={{ color: palette.textSecondary }}>Service fee</Text>
            <Text style={[styles.fee, { color: palette.textPrimary }]}>
              ₱{(request?.fee || 0).toLocaleString()}
            </Text>
          </View>
        </SectionCard>

        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Assigned artisan
          </Text>
          <Text style={{ color: palette.textPrimary, fontWeight: '600' }}>
            {request?.artisan?.name || 'Mabuli Artisan'}
          </Text>
          <Text style={{ color: palette.textSecondary }}>
            {request?.artisan?.contact || 'Contact shared after acceptance'}
          </Text>
        </SectionCard>

        <PrimaryButton
          label="Continue to Payment Directions"
          icon="arrow-forward"
          onPress={() => {
            if (request?.order) {
              setSelectedOrder(request.order);
            }
            router.push({
              pathname: '/user-tabs/payment-directions',
              params: { order: request?.order },
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
