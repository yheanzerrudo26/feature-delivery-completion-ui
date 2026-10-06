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
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReturnDeliveryScreen() {
  const { palette } = useAppTheme();
  const { order } = useLocalSearchParams();
  const { requests, updateRequestStage, setSelectedOrder } = useUserRequest();
  const request =
    requests.find((item) => item.order === order) || requests[0];

  const steps = [
    { title: 'Booked by artisan', done: true },
    { title: 'Picked up from workshop', done: true },
    { title: 'In transit to you', current: true, meta: 'ETA 3:25 PM' },
    { title: 'Item received', done: false, meta: 'Waiting for confirmation' },
  ];

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: palette.background }]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <RequestScreenHeader
          title="Return Delivery"
          subtitle="Track the return courier and confirm when your item arrives."
          rightLabel="5 of 6"
        />

        <InfoBanner
          tone="warn"
          text="Waiting for your item. Check the package condition before confirming receipt."
        />

        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Agreed pickup schedule
          </Text>
          <Text style={{ color: palette.textPrimary, fontWeight: '600' }}>
            October 16, 2026 · 2:00 PM – 4:00 PM
          </Text>
          <Text style={{ color: palette.textSecondary }}>
            Actually picked up at 2:37 PM
          </Text>
        </SectionCard>

        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Return courier e-receipt
          </Text>
          <View style={styles.receiptRow}>
            <Ionicons name="document-text-outline" size={22} color={palette.accent} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: palette.textPrimary, fontWeight: '600' }}>
                artisan-return-receipt.png
              </Text>
              <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
                Uploaded by {request.artisan?.name || 'Artisan'}
              </Text>
            </View>
          </View>
        </SectionCard>

        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Delivery tracking summary
          </Text>
          {steps.map((step, index) => (
            <View key={step.title} style={styles.timelineRow}>
              <View style={styles.rail}>
                <View
                  style={[
                    styles.dot,
                    step.done
                      ? { backgroundColor: '#157651' }
                      : step.current
                        ? { backgroundColor: '#F7B541' }
                        : { backgroundColor: '#C5CDD9' },
                  ]}
                />
                {index < steps.length - 1 ? <View style={styles.line} /> : null}
              </View>
              <View style={styles.copy}>
                <Text style={{ color: palette.textPrimary, fontWeight: '600' }}>
                  {step.title}
                </Text>
                {step.meta ? (
                  <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
                    {step.meta}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
          <Text style={{ color: palette.textSecondary, marginTop: 4 }}>
            Courier: GrabExpress · Tracking: GE-RET-{String(request.order).replace('#', '')}
          </Text>
        </SectionCard>

        <PrimaryButton
          label="Refresh Tracking"
          variant="secondary"
          icon="refresh"
          onPress={() => {}}
        />
        <PrimaryButton
          label="Confirm Item Arrived"
          icon="checkmark"
          onPress={() => {
            updateRequestStage(request.order, {
              stage: 'feedback',
              badge: 'Confirm receipt',
              badgeVariant: 'amber',
              detail: 'Confirm receipt and leave feedback',
              progress: 0.95,
            });
            setSelectedOrder(request.order);
            router.push({
              pathname: '/user-tabs/final-feedback',
              params: { order: request.order },
            });
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 16, gap: 14, paddingBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  receiptRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  timelineRow: { flexDirection: 'row', gap: 12 },
  rail: { width: 16, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  line: { width: 2, flex: 1, backgroundColor: '#C5CDD9', marginVertical: 4 },
  copy: { flex: 1, paddingBottom: 14, gap: 2 },
});
