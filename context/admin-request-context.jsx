
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { db } from '../lib/firebase';

const AdminRequestContext = createContext(undefined);

function formatSubmittedAt(timestamp) {
  if (!timestamp) return 'Recently submitted';

  const date =
    typeof timestamp.toDate === 'function'
      ? timestamp.toDate()
      : new Date(timestamp);

  if (Number.isNaN(date.getTime())) return 'Recently submitted';

  return date.toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getPhotoLabels(photos) {
  if (!photos) return [];

  if (Array.isArray(photos)) {
    return photos.map((photo) =>
      typeof photo === 'string' ? photo : photo?.label || 'Photo',
    );
  }

  return Object.entries(photos)
    .filter(([, photo]) => Boolean(photo))
    .map(([label]) => label);
}

function mapFirestoreRequest(documentSnapshot) {
  const data = documentSnapshot.data();
  const summary = data.requestSummary || {};
  const personal = data.personal || {};
  const itemData = data.item || {};
  const assessment = data.assessment || {};
  const delivery = data.delivery || {};

  const order = data.order || summary.order || documentSnapshot.id;
  const stage = data.status || summary.stage || 'pending_review';

  const stageLabels = {
    pending_review: ['Pending review', 'amber'],
    accepted: ['Accepted', 'mint'],
    declined: ['Declined', 'amber'],
    payment_directions: ['Payment directions', 'blue'],
    payment: ['Awaiting payment', 'amber'],
    awaiting_delivery: ['Awaiting delivery', 'amber'],
    in_progress: ['In restoration', 'blue'],
    ready_for_pickup: ['Ready for pickup', 'mint'],
    return_delivery: ['Return in transit', 'blue'],
    feedback: ['Awaiting feedback', 'amber'],
    complete: ['Complete', 'mint'],
    reschedule_needed: ['Reschedule needed', 'amber'],
    awaiting_pickup_response: ['Awaiting pickup response', 'amber'],
  };

  const [badge, badgeVariant] = stageLabels[stage] || [
    stage.replaceAll('_', ' '),
    'amber',
  ];

  const itemName = [
    itemData.brandModel || itemData.itemType || 'Leather item',
    itemData.color,
  ]
    .filter(Boolean)
    .join(' - ');

  const photoLabels = getPhotoLabels(data.photos);

  return {
    ...summary,
    id: order,
    order,
    firestoreId: documentSnapshot.id,
    userId: data.userId || '',
    clientName:
      personal.fullName ||
      summary.clientName ||
      'Client',
    mobile: personal.mobile || '',
    email: personal.email || '',
    submittedAt: formatSubmittedAt(data.createdAt),
    stage,
    badge,
    badgeVariant,
    item: itemName || summary.item || 'Leather item',
    colorMaterial: [itemData.color, itemData.material]
      .filter(Boolean)
      .join(' · ') || 'Not specified',
    declaredIssue:
      itemData.damageNotes ||
      itemData.serviceConcern ||
      'Not specified',
    returnMethod: delivery.courier
      ? `Courier delivery · ${delivery.courier}`
      : summary.returnMethod || 'Not specified',
    serviceProtocol:
      assessment.protocolTitle ||
      summary.serviceProtocol ||
      'Pending assessment',
    fee: Number(assessment.fee ?? summary.fee ?? 0),
    photos: photoLabels,
    ai: {
      confidence: Number(assessment.confidence ?? summary.ai?.confidence ?? 0),
      summary:
        assessment.findings ||
        summary.ai?.summary ||
        'No assessment details available.',
      tags:
        assessment.damageTags ||
        summary.ai?.tags ||
        [],
    },
    clientNotes:
      assessment.clientNotes ||
      summary.clientNotes ||
      '',
    paymentStatus: data.paymentStatus || summary.paymentStatus || 'Unpaid',
    paymentRef: data.paymentRef || summary.paymentRef || '',
    courier: data.courier || summary.courier || null,
    declineReason: data.declineReason || summary.declineReason || '',
    pickup: data.pickup || summary.pickup || {
      date: '',
      window: '',
      alternate: '',
      clientResponse: null,
      clientAvailability: '',
    },
    completion: data.completion || summary.completion || {
      videoUploaded: false,
      videoName: '',
      report: '',
      conditionScore: '',
      materials: '',
      careAdvice: '',
    },
    feedback: data.feedback || summary.feedback || null,
  };
}

export function AdminRequestProvider({ children }) {
  const [requests, setRequests] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const requestsQuery = query(
      collection(db, 'serviceRequests'),
      orderBy('createdAt', 'desc'),
    );

    const unsubscribe = onSnapshot(
      requestsQuery,
      (snapshot) => {
        const firestoreRequests = snapshot.docs.map(
          mapFirestoreRequest,
        );

        setRequests(firestoreRequests);
        setLoadError('');
        setLoading(false);

        setSelectedId((currentId) => {
          if (
            currentId &&
            firestoreRequests.some((request) => request.id === currentId)
          ) {
            return currentId;
          }

          return firestoreRequests[0]?.id ?? null;
        });
      },
      (error) => {
        console.error('Failed to load service requests:', error);
        setLoadError(error.message || 'Unable to load service requests.');
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const updateRequest = useCallback(async (id, patch) => {
    const request = requests.find(
      (item) => item.id === id || item.firestoreId === id,
    );

    if (!request?.firestoreId) {
      throw new Error('This request could not be found in Firestore.');
    }

    const firestorePatch = {
      updatedAt: serverTimestamp(),
    };

    if (patch.stage !== undefined) {
      firestorePatch.status = patch.stage;
    }

    if (patch.declineReason !== undefined) {
      firestorePatch.declineReason = patch.declineReason;
    }

    if (patch.clientNotification !== undefined) {
      firestorePatch.clientNotification = patch.clientNotification;
    }

    if (patch.paymentStatus !== undefined) {
      firestorePatch.paymentStatus = patch.paymentStatus;
    }

    if (patch.paymentRef !== undefined) {
      firestorePatch.paymentRef = patch.paymentRef;
    }

    if (patch.pickup !== undefined) {
      firestorePatch.pickup = patch.pickup;
    }

    if (patch.courier !== undefined) {
      firestorePatch.courier = patch.courier;
    }

    if (patch.completion !== undefined) {
      firestorePatch.completion = patch.completion;
    }

    if (patch.feedback !== undefined) {
      firestorePatch.feedback = patch.feedback;
    }

    await updateDoc(
      doc(db, 'serviceRequests', request.firestoreId),
      firestorePatch,
    );
  }, [requests]);

  const acceptRequest = useCallback(
    (id) =>
      updateRequest(id, {
        stage: 'accepted',
      }),
    [updateRequest],
  );

  const declineRequest = useCallback(
    (id, reason, notification) =>
      updateRequest(id, {
        stage: 'declined',
        declineReason: reason,
        clientNotification: notification,
      }),
    [updateRequest],
  );

  const confirmItemReceived = useCallback(
    (id) =>
      updateRequest(id, {
        stage: 'in_progress',
      }),
    [updateRequest],
  );

  const sendPickupNotice = useCallback(
    (id, pickup) =>
      updateRequest(id, {
        stage: 'awaiting_pickup_response',
        pickup: {
          ...pickup,
          clientResponse: null,
        },
      }),
    [updateRequest],
  );

  const reschedulePickup = useCallback(
    (id, pickup, reason, notification) =>
      updateRequest(id, {
        stage: 'awaiting_pickup_response',
        pickup: {
          ...pickup,
          clientResponse: null,
          rescheduleReason: reason,
        },
        clientNotification: notification,
      }),
    [updateRequest],
  );

  const markReturnSent = useCallback(
    (id) =>
      updateRequest(id, {
        stage: 'return_delivery',
      }),
    [updateRequest],
  );

  const selectedRequest =
    requests.find((item) => item.id === selectedId) || requests[0] || null;

  const counts = useMemo(() => {
    const byStage = (stage) =>
      requests.filter((item) => item.stage === stage).length;

    return {
      pendingReview: byStage('pending_review'),
      awaitingDelivery: byStage('awaiting_delivery'),
      inProgress: byStage('in_progress'),
      rescheduleNeeded: byStage('reschedule_needed'),
      awaitingPickup: byStage('awaiting_pickup_response'),
      complete: byStage('complete'),
      paid: requests.filter((item) => item.paymentStatus === 'Paid').length,
      unpaid: requests.filter((item) => item.paymentStatus !== 'Paid').length,
    };
  }, [requests]);

  const value = useMemo(
    () => ({
      requests,
      selectedId,
      setSelectedId,
      selectedRequest,
      counts,
      loading,
      loadError,
      updateRequest,
      acceptRequest,
      declineRequest,
      confirmItemReceived,
      sendPickupNotice,
      reschedulePickup,
      markReturnSent,
    }),
    [
      requests,
      selectedId,
      selectedRequest,
      counts,
      loading,
      loadError,
      updateRequest,
      acceptRequest,
      declineRequest,
      confirmItemReceived,
      sendPickupNotice,
      reschedulePickup,
      markReturnSent,
    ],
  );

  return (
    <AdminRequestContext.Provider value={value}>
      {children}
    </AdminRequestContext.Provider>
  );
}

export function useAdminRequest() {
  const context = useContext(AdminRequestContext);

  if (!context) {
    throw new Error(
      'useAdminRequest must be used inside AdminRequestProvider',
    );
  }

  return context;
}

export function routeForAdminStage(stage, id) {
  const params = { id };

  switch (stage) {
    case 'pending_review':
    case 'accepted':
      return { pathname: '/admin-tabs/request-review', params };

    case 'declined':
      return { pathname: '/admin-tabs/decline-request', params };

    case 'awaiting_delivery':
      return { pathname: '/admin-tabs/delivery-proof', params };

    case 'in_progress':
    case 'awaiting_pickup_response':
      return { pathname: '/admin-tabs/completion-pickup', params };

    case 'reschedule_needed':
      return { pathname: '/admin-tabs/reschedule-pickup', params };

    case 'complete':
      return { pathname: '/admin-tabs/completed-service', params };

    default:
      return { pathname: '/admin-tabs/request-review', params };
  }
}
