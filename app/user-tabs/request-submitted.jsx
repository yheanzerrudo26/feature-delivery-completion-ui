import {
  InfoBanner,
  PrimaryButton,
  RequestScreenHeader,
  SectionCard,
  StepProgress,
} from '@/components/RequestUI';
import { useAppTheme } from '@/context/app-theme-context';
import { useUserRequest } from '@/context/user-request-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RequestSubmittedScreen() {
  const { palette } = useAppTheme();
  const { order } = useLocalSearchParams();
  const { requests, setSelectedOrder, loadingRequests } = useUserRequest();
  const request =
    requests.find((item) => item.order === order) ||
    (order ? requests.find((item) => String(item.order).includes(order)) : null) ||
    requests[0];
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (!redirectedRef.current && request?.stage === 'accepted') {
      redirectedRef.current = true;
      if (request.order) {
        setSelectedOrder(request.order);
      }
      router.replace({
        pathname: '/user-tabs/request-accepted',
        params: { order: request.order },
      });
    }
  }, [request?.stage, request?.order, setSelectedOrder]);

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
            <Ionicons name="document-text-outline" size={48} color={palette.textSecondary} />
            <Text
              style={{
                color: palette.textPrimary,
                fontSize: 18,
                fontWeight: '700',
                marginTop: 12,
              }}
            >
              No Request Found
            </Text>
            <View style={{ marginTop: 20, width: '100%' }}>
              <PrimaryButton
                label="Return to Dashboard"
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
          title="Request Submitted"
          subtitle="Your restoration request is waiting for review."
        />
        <StepProgress activeIndex={3} completedThrough={3} />

        <View style={styles.hero}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={32} color="#157651" />
          </View>
          <Text style={[styles.heroTitle, { color: palette.textPrimary }]}>
            Your request is in!
          </Text>
        </View>

        <SectionCard>
          <View style={styles.rowBetween}>
            <Text style={[styles.requestId, { color: palette.textPrimary }]}>
              Request {request?.order}
            </Text>
            <View style={styles.statusPill}>
              <Text style={styles.statusText}>Pending review</Text>
            </View>
          </View>
          <Text style={[styles.itemText, { color: palette.textSecondary }]}>
            {request?.item}
          </Text>
        </SectionCard>

        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            What happens next
          </Text>
          {(request?.timeline || []).map((item, index) => (
            <View key={item.title} style={styles.timelineRow}>
              <View style={styles.timelineRail}>
                <View
                  style={[
                    styles.dot,
                    item.done || item.current
                      ? { backgroundColor: palette.accent }
                      : { backgroundColor: '#C5CDD9' },
                  ]}
                />
                {index < (request?.timeline?.length || 0) - 1 ? (
                  <View style={styles.line} />
                ) : null}
              </View>
              <View style={styles.timelineCopy}>
                <Text style={[styles.timelineTitle, { color: palette.textPrimary }]}>
                  {item.title}
                </Text>
                <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
                  {item.date || 'Pending'}
                </Text>
              </View>
            </View>
          ))}
        </SectionCard>

        <InfoBanner
          tone="info"
          text="You’ll be notified in the app when the Admin / Artisan accepts or declines this request."
        />

        <PrimaryButton
          label="Return to Dashboard"
          onPress={() => {
            if (request?.order) {
              setSelectedOrder(request.order);
            }
            router.replace('/user-tabs/user-dashboard');
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 16, gap: 14, paddingBottom: 32 },
  hero: { alignItems: 'center', gap: 10, paddingVertical: 8 },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DDF9EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { fontSize: 22, fontWeight: '700' },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  requestId: { fontSize: 18, fontWeight: '700' },
  statusPill: {
    backgroundColor: '#FFE6B8',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: { color: '#8A5A06', fontSize: 11, fontWeight: '700' },
  itemText: { fontSize: 14, lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  timelineRow: { flexDirection: 'row', gap: 12 },
  timelineRail: { alignItems: 'center', width: 16 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  line: { width: 2, flex: 1, backgroundColor: '#C5CDD9', marginVertical: 4 },
  timelineCopy: { flex: 1, paddingBottom: 14, gap: 2 },
  timelineTitle: { fontSize: 14, fontWeight: '600' },
});
