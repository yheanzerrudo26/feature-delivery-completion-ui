import {
  PrimaryButton,
  RequestScreenHeader,
  SectionCard,
} from '@/components/RequestUI';
import { useAppTheme } from '@/context/app-theme-context';
import { useUserRequest } from '@/context/user-request-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STAGE_ROUTES = {
  pending_review: '/user-tabs/request-submitted',
  declined: '/user-tabs/request-declined',
  accepted: '/user-tabs/request-accepted',
  payment_directions: '/user-tabs/payment-directions',
  payment: '/user-tabs/gcash-payment',
  awaiting_delivery: '/user-tabs/delivery-confirmation',
  delivery_resubmit: '/user-tabs/delivery-resubmit',
  ready_for_pickup: '/user-tabs/ready-for-pickup',
  awaiting_pickup_response: '/user-tabs/ready-for-pickup',
  reschedule_needed: '/user-tabs/ready-for-pickup',
  return_delivery: '/user-tabs/return-delivery',
  feedback: '/user-tabs/final-feedback',
  in_progress: null,
  complete: null,
};

const STAGE_LABELS = {
  pending_review: 'Pending review',
  declined: 'Declined',
  accepted: 'Accepted',
  payment_directions: 'Payment directions',
  payment: 'Awaiting payment',
  awaiting_delivery: 'Awaiting drop-off',
  delivery_resubmit: 'Resubmit delivery proof',
  in_progress: 'In restoration',
  ready_for_pickup: 'Ready for pickup',
  awaiting_pickup_response: 'Ready for pickup',
  reschedule_needed: 'Reschedule requested',
  return_delivery: 'Return delivery',
  feedback: 'Confirm receipt',
  complete: 'Complete',
};

export default function TrackerScreen() {
  const { palette } = useAppTheme();
  const { order } = useLocalSearchParams();
  const { requests, selectedOrder, setSelectedOrder } = useUserRequest();
  const activeOrder = typeof order === 'string' ? order : selectedOrder;
  const request =
    requests.find((item) => item.order === activeOrder) || requests[0];

  useEffect(() => {
    if (request?.order && request.order !== selectedOrder) {
      setSelectedOrder(request.order);
    }
  }, [request?.order, selectedOrder, setSelectedOrder]);

  if (!request) {
    return (
      <SafeAreaView
        style={[styles.screen, { backgroundColor: palette.background }]}
        edges={['top']}
      >
        <View style={styles.empty}>
          <Text style={{ color: palette.textSecondary }}>No request selected.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const timeline = request.timeline || [];
  const reportTags = request.reportTags || request.damageTags || [];
  const notifications = request.notifications || [];
  const continueRoute = STAGE_ROUTES[request.stage];
  const progressLabel =
    request.progress != null
      ? `${Math.round(request.progress * 100)}%`
      : STAGE_LABELS[request.stage] || request.badge;

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: palette.background }]}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <RequestScreenHeader
          title={`Request ${request.order}`}
          subtitle={request.subtitle || request.item}
          onBack={() => router.replace('/user-tabs/user-dashboard')}
        />

        <SectionCard>
          <View style={styles.progressHeader}>
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
              Overall progress
            </Text>
            <Text style={styles.progressBadge}>{progressLabel}</Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: palette.softCard }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width:
                    request.progress != null
                      ? `${request.progress * 100}%`
                      : request.stage === 'complete'
                        ? '100%'
                        : '20%',
                },
              ]}
            />
          </View>
          <Text style={{ color: palette.textSecondary, fontSize: 13 }}>
            {request.detail}
          </Text>
        </SectionCard>

        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Restoration lifecycle
          </Text>
          <View style={styles.timeline}>
            {timeline.map((item, index) => (
              <View key={`${item.title}-${index}`} style={styles.timelineRow}>
                <View style={styles.timelineRail}>
                  <View
                    style={[
                      styles.timelineMarker,
                      item.done ? styles.timelineMarkerDone : null,
                      item.current ? styles.timelineMarkerCurrent : null,
                    ]}
                  >
                    {item.done ? (
                      <Ionicons name="checkmark" size={12} color="#173B70" />
                    ) : null}
                    {item.current ? (
                      <Ionicons name="arrow-forward" size={12} color="#173B70" />
                    ) : null}
                    {!item.done && !item.current ? (
                      <Text style={styles.timelineCount}>{index + 1}</Text>
                    ) : null}
                  </View>
                  {index < timeline.length - 1 ? (
                    <View
                      style={[
                        styles.timelineLine,
                        { backgroundColor: palette.textSecondary + '60' },
                      ]}
                    />
                  ) : null}
                </View>

                <View style={styles.timelineCopy}>
                  <Text style={[styles.timelineTitle, { color: palette.textPrimary }]}>
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.timelineDate,
                      { color: palette.textSecondary },
                      item.current ? styles.timelineCurrentText : null,
                    ]}
                  >
                    {item.date || 'Pending'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </SectionCard>

        {reportTags.length > 0 ? (
          <SectionCard>
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
              Condition / report tags
            </Text>
            <View style={styles.tagWrap}>
              {reportTags.map((tag) => (
                <Text key={tag} style={styles.tag}>
                  {tag}
                </Text>
              ))}
            </View>
          </SectionCard>
        ) : null}

        {notifications.length > 0 ? (
          <SectionCard>
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
              Notifications
            </Text>
            {notifications.map((item) => (
              <View
                key={item.title}
                style={[
                  styles.notificationCard,
                  { borderTopColor: palette.textSecondary + '30' },
                ]}
              >
                <View style={styles.notificationIcon}>
                  <Ionicons name="notifications-outline" size={18} color="#4FAE89" />
                </View>
                <View style={styles.notificationCopy}>
                  <Text
                    style={[styles.notificationTitle, { color: palette.textPrimary }]}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.notificationDetail,
                      { color: palette.textSecondary },
                    ]}
                  >
                    {item.detail}
                  </Text>
                </View>
              </View>
            ))}
          </SectionCard>
        ) : null}

        {continueRoute ? (
          <PrimaryButton
            label="Continue current step"
            icon="arrow-forward"
            onPress={() =>
              router.push({
                pathname: continueRoute,
                params: { order: request.order },
              })
            }
          />
        ) : null}

        <PrimaryButton
          label="Ask chatbot about this request"
          variant="secondary"
          icon="chatbubbles-outline"
          onPress={() => router.push('/user-tabs/chatbot')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  progressBadge: {
    color: '#205186',
    backgroundColor: '#DCEBFB',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E8BFF',
    borderRadius: 999,
  },
  timeline: { gap: 4 },
  timelineRow: { flexDirection: 'row', gap: 12 },
  timelineRail: { alignItems: 'center' },
  timelineMarker: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CFC8BE',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3EFE8',
  },
  timelineMarkerDone: {
    borderColor: '#C5F3E3',
    backgroundColor: '#C5F3E3',
  },
  timelineMarkerCurrent: {
    borderColor: '#DCEBFB',
    backgroundColor: '#DCEBFB',
  },
  timelineCount: {
    color: '#7B756C',
    fontSize: 11,
    fontWeight: '700',
  },
  timelineLine: {
    width: 1,
    flex: 1,
    minHeight: 34,
    marginVertical: 4,
  },
  timelineCopy: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  timelineDate: {
    fontSize: 13,
    marginTop: 2,
  },
  timelineCurrentText: {
    color: '#2E8BFF',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: '#1E58A6',
    backgroundColor: '#D7E9FF',
    fontWeight: '600',
  },
  notificationCard: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    paddingTop: 12,
  },
  notificationIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#E4FAF0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCopy: {
    flex: 1,
    gap: 2,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  notificationDetail: {
    fontSize: 13,
  },
});
