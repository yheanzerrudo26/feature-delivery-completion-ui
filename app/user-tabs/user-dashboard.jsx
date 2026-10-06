import { useAppTheme } from '@/context/app-theme-context';
import { useUserRequest } from '@/context/user-request-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase.js';

function routeForStage(stage, order) {
  const params = { order };
  switch (stage) {
    case 'pending_review':
      return { pathname: '/user-tabs/request-submitted', params };
    case 'declined':
      return { pathname: '/user-tabs/request-declined', params };
    case 'accepted':
      return { pathname: '/user-tabs/request-accepted', params };
    case 'payment_directions':
      return { pathname: '/user-tabs/payment-directions', params };
    case 'payment':
      return { pathname: '/user-tabs/gcash-payment', params };
    case 'awaiting_delivery':
      return { pathname: '/user-tabs/delivery-confirmation', params };
    case 'ready_for_pickup':
      return { pathname: '/user-tabs/ready-for-pickup', params };
    case 'return_delivery':
      return { pathname: '/user-tabs/return-delivery', params };
    case 'feedback':
      return { pathname: '/user-tabs/final-feedback', params };
    default:
      return { pathname: '/user-tabs/tracker', params };
  }
}

export default function UserDashboardScreen() {
  const { palette } = useAppTheme();
  const { requests, setSelectedOrder, updateRequestStage } = useUserRequest();
  const [today, setToday] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const updateDate = () => {
      setToday(
        new Date().toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      );
    };
    updateDate();
    const interval = setInterval(updateDate, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserData({ ...data, email: data.email || user.email });
      }
    });
    return () => unsubscribe();
  }, []);

  const fullName = `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim();
  const displayName = fullName || userData?.name || 'Client';

  const current = requests.filter((request) => request.stage !== 'complete');
  const previous = requests.filter((request) => request.stage === 'complete');

  const openRequest = (request) => {
    setSelectedOrder(request.order);
    router.push(routeForStage(request.stage, request.order));
  };

  // Demo helpers so you can preview accept / decline / pickup from the dashboard.
  const demoAccept = (request) => {
    updateRequestStage(request.order, {
      stage: 'accepted',
      badge: 'Accepted',
      badgeVariant: 'mint',
      detail: 'Continue to payment directions',
      acceptedDate: new Date().toLocaleDateString(),
      progress: 0.35,
      notifications: [
        {
          title: 'Request accepted',
          detail: 'Continue to payment and item tracking.',
        },
      ],
      timeline: [
        { title: 'Request submitted', date: 'Done', done: true },
        { title: 'Admin / Artisan review', date: 'Accepted', done: true },
        { title: 'Payment & delivery', date: 'Next', current: true },
      ],
    });
    setSelectedOrder(request.order);
    router.push({
      pathname: '/user-tabs/request-accepted',
      params: { order: request.order },
    });
  };

  const demoDecline = (request) => {
    updateRequestStage(request.order, {
      stage: 'declined',
      badge: 'Declined',
      badgeVariant: 'amber',
      detail: 'See artisan reason and resubmit',
      progress: null,
      declineReason:
        'The damage-detail photo does not show the full loose seam. Please recapture a closer shot and resubmit.',
    });
    setSelectedOrder(request.order);
    router.push({
      pathname: '/user-tabs/request-declined',
      params: { order: request.order },
    });
  };

  const demoReadyPickup = (request) => {
    updateRequestStage(request.order, {
      stage: 'ready_for_pickup',
      badge: 'Ready for pickup',
      badgeVariant: 'amber',
      detail: 'Review video evidence and confirm schedule',
      progress: 0.8,
    });
    setSelectedOrder(request.order);
    router.push({
      pathname: '/user-tabs/ready-for-pickup',
      params: { order: request.order },
    });
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: palette.background }]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerRow, { backgroundColor: palette.card }]}>
          <Text style={[styles.eyebrow, { color: palette.textSecondary }]}>
            DASHBOARD
          </Text>
          <Text style={[styles.title, { color: palette.textPrimary }]}>
            Welcome back,
          </Text>
          <Text style={[styles.heroName, { color: palette.textPrimary }]}>
            {displayName}
          </Text>
          <Text style={[styles.date, { color: palette.textSecondary }]}>{today}</Text>
          <Text style={[styles.helper, { color: palette.textSecondary }]}>
            Track current and previous restoration services. Tap a request to continue its step.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Current services
          </Text>
          <Text style={[styles.sectionCount, { color: palette.textSecondary }]}>
            {current.length}
          </Text>
        </View>

        {current.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: palette.card }]}>
            <Text style={{ color: palette.textSecondary, lineHeight: 20 }}>
              No active requests. Start one from the Services tab.
            </Text>
          </View>
        ) : (
          current.map((request) => (
            <View key={request.order} style={[styles.requestCard, { backgroundColor: palette.card }]}>
              <Pressable onPress={() => openRequest(request)}>
                <View style={styles.requestHeader}>
                  <Text style={[styles.requestTitle, { color: palette.textPrimary }]}>
                    Request {request.order}
                  </Text>
                  <StatusBadge request={request} />
                </View>
                <Text style={[styles.requestItem, { color: palette.textSecondary }]}>
                  {request.item}
                </Text>
                {request.progress != null ? (
                  <View style={styles.progressSection}>
                    <View
                      style={[styles.progressTrack, { backgroundColor: palette.softCard }]}
                    >
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${request.progress * 100}%` },
                        ]}
                      />
                    </View>
                  </View>
                ) : null}
                <Text style={[styles.requestDetail, { color: palette.textSecondary }]}>
                  {request.detail}
                </Text>
              </Pressable>

              {request.stage === 'pending_review' ? (
                <View style={styles.demoRow}>
                  <Pressable
                    style={[styles.demoBtn, { backgroundColor: '#DDF9EC' }]}
                    onPress={() => demoAccept(request)}
                  >
                    <Text style={{ color: '#157651', fontWeight: '700', fontSize: 12 }}>
                      Demo: Accept
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.demoBtn, { backgroundColor: '#FDECEC' }]}
                    onPress={() => demoDecline(request)}
                  >
                    <Text style={{ color: '#B42318', fontWeight: '700', fontSize: 12 }}>
                      Demo: Decline
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              {request.stage === 'in_progress' ? (
                <Pressable
                  style={[styles.demoBtn, { backgroundColor: '#FFF1C9', marginTop: 8 }]}
                  onPress={() => demoReadyPickup(request)}
                >
                  <Text style={{ color: '#8A6510', fontWeight: '700', fontSize: 12 }}>
                    Demo: Mark ready for pickup
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ))
        )}

        {previous.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
                Previous services
              </Text>
              <Text style={[styles.sectionCount, { color: palette.textSecondary }]}>
                {previous.length}
              </Text>
            </View>
            {previous.map((request) => (
              <Pressable
                key={request.order}
                style={[styles.requestCard, { backgroundColor: palette.card }]}
                onPress={() => openRequest(request)}
              >
                <View style={styles.requestHeader}>
                  <Text style={[styles.requestTitle, { color: palette.textPrimary }]}>
                    Request {request.order}
                  </Text>
                  <StatusBadge request={request} />
                </View>
                <Text style={[styles.requestItem, { color: palette.textSecondary }]}>
                  {request.item}
                </Text>
                <Text style={[styles.requestDetail, { color: palette.textSecondary }]}>
                  {request.detail}
                </Text>
              </Pressable>
            ))}
          </>
        ) : null}

        <Pressable
          style={[styles.primaryButton, { backgroundColor: palette.accent }]}
          onPress={() => router.push('/user-tabs/atelier-checklist')}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>New restoration request</Text>
        </Pressable>

        <Pressable
          style={[
            styles.secondaryButton,
            { backgroundColor: palette.card, borderColor: palette.softCard },
          ]}
          onPress={() => router.push('/user-tabs/chatbot')}
        >
          <Ionicons name="chatbubbles-outline" size={18} color={palette.accent} />
          <Text style={[styles.secondaryButtonText, { color: palette.textPrimary }]}>
            Open restoration chatbot
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatusBadge({ request }) {
  const styleMap = {
    blue: styles.badgeBlue,
    amber: styles.badgeAmber,
    mint: styles.badgeMint,
  };
  return (
    <Text style={[styles.statusBadge, styleMap[request.badgeVariant] || styles.badgeBlue]}>
      {request.badge}
    </Text>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 16, gap: 14, paddingBottom: 28 },
  headerRow: { borderRadius: 20, padding: 18, gap: 6 },
  eyebrow: { letterSpacing: 2, fontSize: 12, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '700', marginTop: 4 },
  heroName: { fontSize: 26, fontWeight: '700' },
  date: { fontSize: 14, marginTop: 2 },
  helper: { fontSize: 13, lineHeight: 19, marginTop: 6 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  sectionCount: { fontSize: 13, fontWeight: '600' },
  emptyCard: { borderRadius: 16, padding: 16 },
  requestCard: { borderRadius: 18, padding: 14, gap: 8 },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  requestTitle: { fontSize: 17, fontWeight: '700' },
  requestItem: { fontSize: 14, lineHeight: 20 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '700',
    overflow: 'hidden',
  },
  badgeBlue: { backgroundColor: '#D8E8FF', color: '#215AA8' },
  badgeAmber: { backgroundColor: '#FFE6B8', color: '#8A5A06' },
  badgeMint: { backgroundColor: '#DDF9EC', color: '#157651' },
  progressSection: { gap: 6 },
  progressTrack: { height: 6, borderRadius: 999, overflow: 'hidden' },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#2E8BFF',
  },
  requestDetail: { fontSize: 13 },
  demoRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  demoBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  primaryButton: {
    marginTop: 4,
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  secondaryButton: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButtonText: { fontSize: 15, fontWeight: '600' },
});
