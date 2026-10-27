
import { useAppTheme } from '@/context/app-theme-context';
import { useUserRequest } from '@/context/user-request-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    case 'delivery_resubmit':
      return { pathname: '/user-tabs/delivery-resubmit', params };
    case 'ready_for_pickup':
    case 'awaiting_pickup_response':
    case 'reschedule_needed':
      return { pathname: '/user-tabs/ready-for-pickup', params };
    case 'return_delivery':
      return { pathname: '/user-tabs/return-delivery', params };
    case 'feedback':
      return { pathname: '/user-tabs/final-feedback', params };
    case 'complete':
      return { pathname: '/user-tabs/user-dashboard', params };
    default:
      return { pathname: '/user-tabs/tracker', params };
  }
}

function mapFirestoreRequest(docSnap) {
  const data = docSnap.data();
  const summary = data.requestSummary || {};
  const assessment = data.assessment || {};
  const itemDetails = data.item || {};

  const itemName =
    summary.item ||
    summary.subtitle ||
    `${itemDetails.brandModel || 'Custom leather item'} - ${
      itemDetails.color || 'Unspecified color'
    }`;

  const stage = data.status || summary.stage || 'pending_review';

  const statusDisplay = {
    pending_review: {
      badge: 'Pending review',
      badgeVariant: 'amber',
      detail: 'Waiting for Admin / Artisan review',
      progress: 0.25,
    },
    declined: {
      badge: 'Declined',
      badgeVariant: 'amber',
      detail: 'Your request was declined',
      progress: null,
    },
    accepted: {
      badge: 'Accepted',
      badgeVariant: 'mint',
      detail: 'Your request has been accepted',
      progress: 0.35,
    },
    payment_directions: {
      badge: 'Payment directions',
      badgeVariant: 'blue',
      detail: 'Review the payment instructions',
      progress: 0.4,
    },
    payment: {
      badge: 'Payment',
      badgeVariant: 'blue',
      detail: 'Complete your payment',
      progress: 0.45,
    },
    awaiting_delivery: {
      badge: 'Awaiting delivery',
      badgeVariant: 'blue',
      detail: 'Confirm your item delivery',
      progress: 0.55,
    },
    delivery_resubmit: {
      badge: 'Resubmit proof',
      badgeVariant: 'amber',
      detail: 'Admin did not receive your item — resubmit proof',
      progress: 0.5,
    },
    in_progress: {
      badge: 'In restoration',
      badgeVariant: 'blue',
      detail: 'Your item is being restored',
      progress: 0.65,
    },
    ready_for_pickup: {
      badge: 'Ready for pickup',
      badgeVariant: 'mint',
      detail: 'Your item is ready for pickup',
      progress: 0.8,
    },
    awaiting_pickup_response: {
      badge: 'Ready for pickup',
      badgeVariant: 'mint',
      detail: 'Restoration complete — confirm pickup schedule',
      progress: 0.8,
    },
    reschedule_needed: {
      badge: 'Reschedule requested',
      badgeVariant: 'amber',
      detail: 'Awaiting artisan approval for requested schedule',
      progress: 0.8,
    },
    return_delivery: {
      badge: 'Return delivery',
      badgeVariant: 'blue',
      detail: 'Your item is being returned',
      progress: 0.9,
    },
    feedback: {
      badge: 'Feedback',
      badgeVariant: 'blue',
      detail: 'Please provide feedback on your service',
      progress: 0.95,
    },
    complete: {
      badge: 'Complete',
      badgeVariant: 'mint',
      detail: 'Service completed',
      progress: 1,
    },
  };

  const display = statusDisplay[stage] || statusDisplay.pending_review;

  return {
    ...summary,
    firestoreId: docSnap.id,
    order: data.order || summary.order || docSnap.id,
    item: itemName,
    subtitle: itemName,
    stage,
    createdAt: data.createdAt || null,
    badge: display.badge,
    badgeVariant: display.badgeVariant,
    detail: display.detail,
    progress: display.progress,
    serviceProtocol:
      assessment.protocolTitle || summary.serviceProtocol || '',
    fee: assessment.fee ?? summary.fee ?? 0,
    clientName:
      data.personal?.fullName || summary.clientName || 'Client',
    findings: assessment.findings || summary.findings || '',
    damageTags: assessment.damageTags || summary.damageTags || [],
    protocolSteps: assessment.protocolSteps || summary.protocolSteps || [],
    clientNotes: assessment.clientNotes || summary.clientNotes || '',
    declineReason: data.declineReason || summary.declineReason || '',
    notifications: data.notifications || summary.notifications || [],
    timeline: data.timeline || summary.timeline || [],
  };
}

export default function UserDashboardScreen() {
  const { palette } = useAppTheme();
  const { setSelectedOrder } = useUserRequest();

  const [today, setToday] = useState('');
  const [userData, setUserData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestError, setRequestError] = useState('');
  const [authReady, setAuthReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

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

  // Subscribe to authentication changes and the signed-in user's profile
  // and requests. State updates occur in subscription callbacks.
  useEffect(() => {
    let unsubscribeProfile = null;
    let unsubscribeRequests = null;
    let active = true;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!active) return;

      // Clean up listeners belonging to the previous account.
      unsubscribeProfile?.();
      unsubscribeRequests?.();
      unsubscribeProfile = null;
      unsubscribeRequests = null;

      if (!user) {
        setUserData(null);
        setRequests([]);
        setRequestError('Please log in to view your service requests.');
        setLoadingRequests(false);
        setSignedIn(false);
        setAuthReady(true);
        return;
      }

      setSignedIn(true);
      setAuthReady(true);
      setLoadingRequests(true);
      setRequestError('');

      unsubscribeProfile = onSnapshot(
        doc(db, 'users', user.uid),
        (snapshot) => {
          if (!active) return;

          if (!snapshot.exists()) {
            setUserData({
              name:
                user.displayName ||
                user.email?.split('@')[0] ||
                'Client',
              email: user.email || '',
            });
            console.warn(
              'No Firestore profile found for UID:',
              user.uid,
            );
            return;
          }

          const data = snapshot.data();

          setUserData({
            ...data,
            email: data.email || user.email || '',
          });
        },
        (error) => {
          if (!active) return;

          console.error(
            'Failed to load user profile:',
            error.code,
            error.message,
          );
        },
      );

      unsubscribeRequests = onSnapshot(
        query(
          collection(db, 'serviceRequests'),
          where('userId', '==', user.uid),
        ),
        (snapshot) => {
          if (!active) return;

          const userRequests = snapshot.docs
            .map(mapFirestoreRequest)
            .sort((a, b) => {
              const aTime = a.createdAt?.toMillis?.() || 0;
              const bTime = b.createdAt?.toMillis?.() || 0;
              return bTime - aTime;
            });

          setRequests(userRequests);
          setLoadingRequests(false);
          setRequestError('');
        },
        (error) => {
          if (!active) return;

          console.error(
            'Failed to load service requests:',
            error.code,
            error.message,
          );

          setRequestError(
            'Unable to load your service requests. Please check your connection and Firestore permissions.',
          );
          setLoadingRequests(false);
        },
      );
    });

    return () => {
      active = false;
      unsubscribeAuth();
      unsubscribeProfile?.();
      unsubscribeRequests?.();
    };
  }, []);

  const fullName =
    `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim();

  const displayName =
    fullName ||
    userData?.name ||
    auth.currentUser?.displayName ||
    auth.currentUser?.email?.split('@')[0] ||
    'Client';

  const current = requests.filter(
    (request) => request.stage !== 'complete',
  );
  const previous = requests.filter(
    (request) => request.stage === 'complete',
  );

  const openRequest = (request) => {
    setSelectedOrder(request.order);
    router.push(routeForStage(request.stage, request.order));
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: palette.background }]}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
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

          <Text style={[styles.date, { color: palette.textSecondary }]}>
            {today}
          </Text>

          <Text style={[styles.helper, { color: palette.textSecondary }]}>
            Track current and previous restoration services. Tap a request to
            continue its step.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Current services
          </Text>

          <Text style={[styles.sectionCount, { color: palette.textSecondary }]}>
            {!authReady || loadingRequests ? '—' : current.length}
          </Text>
        </View>

        {!authReady || loadingRequests ? (
          <View style={[styles.emptyCard, { backgroundColor: palette.card }]}>
            <ActivityIndicator color={palette.accent} />
            <Text style={{ color: palette.textSecondary, marginTop: 10 }}>
              Loading your service requests...
            </Text>
          </View>
        ) : !signedIn ? (
          <View style={[styles.emptyCard, { backgroundColor: palette.card }]}>
            <Text style={{ color: palette.textSecondary, lineHeight: 20 }}>
              Please log in to view your service requests.
            </Text>
          </View>
        ) : requestError ? (
          <View style={[styles.emptyCard, { backgroundColor: palette.card }]}>
            <Text style={{ color: palette.textSecondary, lineHeight: 20 }}>
              {requestError}
            </Text>
          </View>
        ) : current.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: palette.card }]}>
            <Text style={{ color: palette.textSecondary, lineHeight: 20 }}>
              No active requests. Start one from the Services tab.
            </Text>
          </View>
        ) : (
          current.map((request) => (
            <Pressable
              key={request.firestoreId || request.order}
              style={[
                styles.requestCard,
                { backgroundColor: palette.card },
              ]}
              onPress={() => openRequest(request)}
            >
              <View style={styles.requestHeader}>
                <Text
                  style={[
                    styles.requestTitle,
                    { color: palette.textPrimary },
                  ]}
                >
                  Request {request.order}
                </Text>

                <StatusBadge request={request} />
              </View>

              <Text
                style={[styles.requestItem, { color: palette.textSecondary }]}
              >
                {request.item}
              </Text>

              {request.progress != null ? (
                <View style={styles.progressSection}>
                  <View
                    style={[
                      styles.progressTrack,
                      { backgroundColor: palette.softCard },
                    ]}
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

              <Text
                style={[
                  styles.requestDetail,
                  { color: palette.textSecondary },
                ]}
              >
                {request.detail}
              </Text>
            </Pressable>
          ))
        )}

        {!loadingRequests && signedIn && !requestError && previous.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text
                style={[styles.sectionTitle, { color: palette.textPrimary }]}
              >
                Previous services
              </Text>

              <Text
                style={[
                  styles.sectionCount,
                  { color: palette.textSecondary },
                ]}
              >
                {previous.length}
              </Text>
            </View>

            {previous.map((request) => (
              <Pressable
                key={request.firestoreId || request.order}
                style={[
                  styles.requestCard,
                  { backgroundColor: palette.card },
                ]}
                onPress={() => openRequest(request)}
              >
                <View style={styles.requestHeader}>
                  <Text
                    style={[
                      styles.requestTitle,
                      { color: palette.textPrimary },
                    ]}
                  >
                    Request {request.order}
                  </Text>

                  <StatusBadge request={request} />
                </View>

                <Text
                  style={[styles.requestItem, { color: palette.textSecondary }]}
                >
                  {request.item}
                </Text>

                <Text
                  style={[
                    styles.requestDetail,
                    { color: palette.textSecondary },
                  ]}
                >
                  {request.detail}
                </Text>
              </Pressable>
            ))}
          </>
        ) : null}

        <Pressable
          style={[
            styles.primaryButton,
            { backgroundColor: palette.accent },
          ]}
          onPress={() => router.push('/user-tabs/atelier-checklist')}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>
            New restoration request
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.secondaryButton,
            {
              backgroundColor: palette.card,
              borderColor: palette.softCard,
            },
          ]}
          onPress={() => router.push('/user-tabs/chatbot')}
        >
          <Ionicons
            name="chatbubbles-outline"
            size={18}
            color={palette.accent}
          />
          <Text
            style={[
              styles.secondaryButtonText,
              { color: palette.textPrimary },
            ]}
          >
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
    <Text
      style={[
        styles.statusBadge,
        styleMap[request.badgeVariant] || styles.badgeBlue,
      ]}
    >
      {request.badge || 'Pending review'}
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
  emptyCard: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
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
  primaryButton: {
    marginTop: 4,
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
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
