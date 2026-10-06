import {
  InfoBanner,
  PrimaryButton,
  RequestScreenHeader,
  SectionCard,
} from '@/components/RequestUI';
import { useAppTheme } from '@/context/app-theme-context';
import { useUserRequest } from '@/context/user-request-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GcashPaymentScreen() {
  const { palette } = useAppTheme();
  const { order } = useLocalSearchParams();
  const { requests, updateRequestStage, setSelectedOrder } = useUserRequest();
  const request =
    requests.find((item) => item.order === order) || requests[0];
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (!paid) return;
    const timer = setTimeout(() => {
      updateRequestStage(request.order, {
        stage: 'awaiting_delivery',
        badge: 'Awaiting drop-off',
        badgeVariant: 'amber',
        detail: 'Upload courier e-receipt after booking delivery',
        progress: 0.4,
      });
      setSelectedOrder(request.order);
      router.replace({
        pathname: '/user-tabs/delivery-confirmation',
        params: { order: request.order },
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [paid, request.order, setSelectedOrder, updateRequestStage]);

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: palette.background }]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <RequestScreenHeader
          title="GCash Payment"
          subtitle="Scan the dynamic QR code to pay the service fee."
        />

        <SectionCard>
          <Text style={{ color: palette.textSecondary }}>Service fee</Text>
          <Text style={[styles.fee, { color: palette.textPrimary }]}>
            ₱{(request.fee || 0).toLocaleString()}
          </Text>
          <Text style={{ color: palette.textSecondary }}>
            Request {request.order}
          </Text>
        </SectionCard>

        <SectionCard style={styles.qrCard}>
          <View style={styles.qrBox}>
            <Ionicons name="qr-code" size={120} color={palette.accent} />
          </View>
          <Text style={[styles.qrNote, { color: palette.textSecondary }]}>
            Secure dynamic QR · refreshes with each transaction
          </Text>
        </SectionCard>

        <SectionCard>
          <View style={styles.statusRow}>
            {paid ? (
              <Ionicons name="checkmark-circle" size={22} color="#157651" />
            ) : (
              <ActivityIndicator color={palette.accent} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusTitle, { color: palette.textPrimary }]}>
                {paid ? 'Payment detected' : 'Waiting for payment'}
              </Text>
              <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
                Channel: GCash · Ref: MB-{String(request.order).replace('#', '')}
              </Text>
            </View>
          </View>
        </SectionCard>

        <InfoBanner
          tone="info"
          text="When payment is detected in the database, the app moves to delivery confirmation automatically."
        />

        <PrimaryButton
          label="I've completed payment"
          variant="secondary"
          disabled={paid}
          onPress={() => setPaid(true)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 16, gap: 14, paddingBottom: 32 },
  fee: { fontSize: 32, fontWeight: '700' },
  qrCard: { alignItems: 'center' },
  qrBox: {
    width: 180,
    height: 180,
    borderRadius: 20,
    backgroundColor: '#F7F9FC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D5DEEA',
  },
  qrNote: { fontSize: 12, textAlign: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusTitle: { fontSize: 15, fontWeight: '700' },
});
