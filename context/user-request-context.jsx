
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from 'react';
import { auth, db } from '../lib/firebase';

const PHOTO_SLOTS = [
  'Front',
  'Side',
  'Heel',
  'Sole',
  'Damage Detail',
];

function createPhotoState() {
  return PHOTO_SLOTS.reduce((acc, label) => {
    acc[label] = {
      asset: null,
      status: 'empty',
      clarity: null,
      framing: null,
      lighting: null,
      message: '',
    };
    return acc;
  }, {});
}

function createInitialDraft() {
  return {
    personal: {
      fullName: '',
      email: '',
      mobile: '',
      address: '',
    },
    item: {
      itemType: 'Leather bag',
      brandModel: '',
      color: '',
      serviceConcern: 'Repair',
      damageNotes: '',
    },
    photos: createPhotoState(),
    assessment: {
      findings:
        'Moderate dryness and surface scuffing on the body panels. Loose stitching along the right side seam. Color is slightly faded at high-contact edges.',
      damageTags: [
        'Dry leather',
        'Surface scuffs',
        'Loose stitching',
        'Faded edges',
      ],
      protocolTitle: 'Repair & Deep Conditioning',
      protocolSteps: [
        'Reinforce and restitch the side seam',
        'Deep clean and condition dry panels',
        'Color-blend faded contact edges',
      ],
      clientNotes: '',
      confidence: 92,
      fee: 2850,
    },
    delivery: {
      courier: '',
      trackingNo: '',
      receiptUri: null,
      proofUri: null,
      sharedLink: '',
    },
    pickup: {
      scheduleWorks: true,
      availabilityNotes: '',
      proposedDate: 'October 16, 2026',
      proposedWindow: '2:00 PM – 4:00 PM',
    },
    feedback: {
      received: false,
      rating: 0,
      comments: '',
      tags: [],
    },
  };
}

function mapFirestoreUserRequest(docSnap) {
  const data = docSnap.data();
  const summary = data.requestSummary || {};
  const assessment = data.assessment || {};
  const itemDetails = data.item || {};
  const delivery = data.delivery || {};

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
      detail: 'Awaiting artisan approval for your requested schedule',
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
      assessment.protocolTitle || summary.serviceProtocol || 'Repair & Deep Conditioning',
    fee: Number(assessment.fee ?? summary.fee ?? 0),
    clientName:
      data.personal?.fullName || summary.clientName || 'Client',
    findings: assessment.findings || summary.findings || '',
    damageTags: assessment.damageTags || summary.damageTags || [],
    protocolSteps: assessment.protocolSteps || summary.protocolSteps || [],
    clientNotes: assessment.clientNotes || summary.clientNotes || '',
    declineReason: data.declineReason || summary.declineReason || '',
    notifications: data.notifications || summary.notifications || [],
    timeline: data.timeline || summary.timeline || [],
    artisan: data.artisan || summary.artisan || {
      name: 'Mabuli Artisan',
      contact: '0917-123-4567',
    },
    acceptedDate: data.acceptedDate || summary.acceptedDate || 'Today',
    turnaround: data.turnaround || summary.turnaround || '7–10 business days',
    delivery: {
      courier: delivery.courier || summary.delivery?.courier || '',
      trackingNo: delivery.trackingNo || summary.delivery?.trackingNo || '',
      receiptUri: delivery.receiptUri || summary.delivery?.receiptUri || null,
      proofUri: delivery.proofUri || delivery.receiptUri || summary.delivery?.proofUri || summary.delivery?.receiptUri || null,
      sharedLink: delivery.sharedLink || summary.delivery?.sharedLink || '',
      resubmitComment: delivery.resubmitComment || summary.delivery?.resubmitComment || '',
    },
    paymentStatus: data.paymentStatus || summary.paymentStatus || 'Unpaid',
    paymentRef: data.paymentRef || summary.paymentRef || '',
    adminDeliveryNote:
      data.adminDeliveryNote || summary.adminDeliveryNote || '',
    deliveryRejectedAt:
      data.deliveryRejectedAt || summary.deliveryRejectedAt || null,
    completion: data.completion || summary.completion || {
      videoUploaded: false,
      videoUri: null,
      videoName: '',
      report: '',
      conditionScore: '',
      materials: '',
      careAdvice: '',
    },
    pickup: data.pickup || summary.pickup || {
      date: '',
      window: '',
      alternate: '',
      clientResponse: null,
      clientAvailability: '',
      preferredDate: '',
      preferredWindow: '',
    },
    itemNotReceivedReportedAt:
      data.itemNotReceivedReportedAt || summary.itemNotReceivedReportedAt || null,
    itemNotReceivedNote:
      data.itemNotReceivedNote || summary.itemNotReceivedNote || '',
    returnRescheduleDate:
      data.returnRescheduleDate || summary.returnRescheduleDate || null,
    returnRescheduleWindow:
      data.returnRescheduleWindow || summary.returnRescheduleWindow || null,
    itemNotReceivedResolved:
      data.itemNotReceivedResolved !== undefined
        ? data.itemNotReceivedResolved
        : summary.itemNotReceivedResolved !== undefined
          ? summary.itemNotReceivedResolved
          : !data.itemNotReceivedReportedAt,
    returnDelivery: data.returnDelivery || summary.returnDelivery || {
      proofUri: null,
      sharedLink: '',
      courier: '',
      trackingNo: '',
      dispatchedAt: null,
    },
  };
}

// No hardcoded demo requests.
function createDefaultUserProfile() {
  return {
    name: 'Client',
    email: '',
    mobile: '',
    address: '',
  };
}

const photoAttempts = {};

function resetPhotoAttempts() {
  Object.keys(photoAttempts).forEach((key) => {
    delete photoAttempts[key];
  });
}

function simulatePhotoQuality(label, asset) {
  // Preserves the original simulated photo-quality behavior.
  photoAttempts[label] = (photoAttempts[label] || 0) + 1;
  const attempt = photoAttempts[label];

  if (label === 'Sole' && attempt === 1) {
    return {
      asset,
      status: 'fail',
      clarity: 'ok',
      framing: 'fail',
      lighting: 'ok',
      message: 'Framing too wide',
    };
  }

  if (
    label === 'Damage Detail' &&
    attempt === 1 &&
    Math.random() > 0.4
  ) {
    return {
      asset,
      status: 'fail',
      clarity: 'ok',
      framing: 'ok',
      lighting: 'fail',
      message: 'Lighting too dim',
    };
  }

  return {
    asset,
    status: 'pass',
    clarity: 'ok',
    framing: 'ok',
    lighting: 'ok',
    message: '',
  };
}

/**
 * Saves photo metadata and its local URI only.
 * Actual image files are not uploaded to Firebase Storage.
 */
function getLocalPhotoData(photo) {
  if (!photo) {
    return null;
  }

  const asset = photo.asset;

  return {
    uri:
      typeof asset === 'string'
        ? asset
        : asset?.uri || null,
    fileName: asset?.fileName || null,
    mimeType: asset?.mimeType || asset?.type || null,
    width: asset?.width || null,
    height: asset?.height || null,
    status: photo.status || 'empty',
    clarity: photo.clarity || null,
    framing: photo.framing || null,
    lighting: photo.lighting || null,
    message: photo.message || '',
  };
}

const UserRequestContext = createContext(undefined);

export function UserRequestProvider({ children }) {
  const [draft, setDraft] = useState(createInitialDraft);
  const [requests, setRequests] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const requestsRef = useRef(requests);
  useEffect(() => {
    requestsRef.current = requests;
  }, [requests]);

  const [userProfile, setUserProfile] = useState(
    createDefaultUserProfile,
  );

  // Wait for Firebase authentication before reading the profile and requests.
  useEffect(() => {
    let active = true;
    let unsubscribeRequests = null;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!active) {
          return;
        }

        if (unsubscribeRequests) {
          unsubscribeRequests();
          unsubscribeRequests = null;
        }

        if (!currentUser) {
          setUserProfile(createDefaultUserProfile());
          setRequests([]);
          setLoadingRequests(false);
          return;
        }

        setLoadingRequests(true);

        // Listen for requests of the logged in user
        try {
          const userRequestsQuery = query(
            collection(db, 'serviceRequests'),
            where('userId', '==', currentUser.uid),
          );

          unsubscribeRequests = onSnapshot(
            userRequestsQuery,
            (snapshot) => {
              if (!active) return;
              const userRequests = snapshot.docs
                .map(mapFirestoreUserRequest)
                .sort((a, b) => {
                  const aTime = a.createdAt?.toMillis?.() || 0;
                  const bTime = b.createdAt?.toMillis?.() || 0;
                  return bTime - aTime;
                });
              setRequests(userRequests);
              setLoadingRequests(false);
            },
            (error) => {
              console.error('Failed to load user service requests:', error);
              if (active) setLoadingRequests(false);
            },
          );
        } catch (error) {
          console.error('Error attaching requests listener:', error);
          if (active) setLoadingRequests(false);
        }

        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (!active) {
            return;
          }

          const data = userSnap.exists()
            ? userSnap.data()
            : {};

          if (!userSnap.exists()) {
            console.warn(
              'No Firestore user profile found for UID:',
              currentUser.uid,
            );
          }

          const fullName =
            data.name ||
            `${data.firstName || ''} ${data.lastName || ''}`.trim() ||
            currentUser.displayName ||
            currentUser.email?.split('@')[0] ||
            'Client';

          const profile = {
            name: fullName,
            email: data.email || currentUser.email || '',
            mobile: data.mobile || data.phone || '',
            address: data.address || '',
          };

          setUserProfile(profile);

          setDraft((current) => ({
            ...current,
            personal: {
              fullName:
                current.personal.fullName || profile.name,
              email:
                current.personal.email || profile.email,
              mobile:
                current.personal.mobile || profile.mobile,
              address:
                current.personal.address || profile.address,
            },
          }));
        } catch (error) {
          console.error(
            'Failed to load user profile:',
            error.code,
            error.message,
          );

          if (!active) {
            return;
          }

          setUserProfile({
            name:
              currentUser.displayName ||
              currentUser.email?.split('@')[0] ||
              'Client',
            email: currentUser.email || '',
            mobile: '',
            address: '',
          });
        }
      },
    );

    return () => {
      active = false;
      unsubscribeAuth();
      if (unsubscribeRequests) {
        unsubscribeRequests();
      }
    };
  }, []);

  const updatePersonalField = useCallback(
    (field, value) => {
      setDraft((current) => ({
        ...current,
        personal: {
          ...current.personal,
          [field]: value,
        },
      }));
    },
    [],
  );

  const updateItemField = useCallback((field, value) => {
    setDraft((current) => ({
      ...current,
      item: {
        ...current.item,
        [field]: value,
      },
    }));
  }, []);

  const updatePhoto = useCallback((label, asset) => {
    setDraft((current) => ({
      ...current,
      photos: {
        ...current.photos,
        [label]: simulatePhotoQuality(label, asset),
      },
    }));
  }, []);

  const updateAssessmentField = useCallback(
    (field, value) => {
      setDraft((current) => ({
        ...current,
        assessment: {
          ...current.assessment,
          [field]: value,
        },
      }));
    },
    [],
  );

  const toggleDamageTag = useCallback((tag) => {
    setDraft((current) => {
      const tags = current.assessment.damageTags || [];
      const next = tags.includes(tag)
        ? tags.filter((item) => item !== tag)
        : [...tags, tag];

      return {
        ...current,
        assessment: {
          ...current.assessment,
          damageTags: next,
        },
      };
    });
  }, []);

  const updateDeliveryField = useCallback(
    (field, value) => {
      setDraft((current) => ({
        ...current,
        delivery: {
          ...current.delivery,
          [field]: value,
        },
      }));
    },
    [],
  );

  const updatePickupField = useCallback((field, value) => {
    setDraft((current) => ({
      ...current,
      pickup: {
        ...current.pickup,
        [field]: value,
      },
    }));
  }, []);

  const updateFeedbackField = useCallback(
    (field, value) => {
      setDraft((current) => ({
        ...current,
        feedback: {
          ...current.feedback,
          [field]: value,
        },
      }));
    },
    [],
  );

  const toggleFeedbackTag = useCallback((tag) => {
    setDraft((current) => {
      const tags = current.feedback.tags || [];
      const next = tags.includes(tag)
        ? tags.filter((item) => item !== tag)
        : [...tags, tag];

      return {
        ...current,
        feedback: {
          ...current.feedback,
          tags: next,
        },
      };
    });
  }, []);

  const resetDraft = useCallback(() => {
    resetPhotoAttempts();

    setDraft({
      ...createInitialDraft(),
      personal: {
        fullName: userProfile.name || '',
        email: userProfile.email || '',
        mobile: userProfile.mobile || '',
        address: userProfile.address || '',
      },
    });
  }, [userProfile]);

  const photoEntries = Object.values(draft.photos);

  const completedPhotos = photoEntries.filter(
    (photo) => photo.asset,
  ).length;

  const passedPhotos = photoEntries.filter(
    (photo) => photo.status === 'pass',
  ).length;

  const failedPhotos = photoEntries.filter(
    (photo) => photo.status === 'fail',
  ).length;

  const allPhotosPassed = PHOTO_SLOTS.every(
    (label) => draft.photos[label]?.status === 'pass',
  );

  // Updates local state and persists stage changes to Firestore.
  const updateRequestStage = useCallback(
    async (order, patch) => {
      setRequests((current) =>
        current.map((request) =>
          request.order === order
            ? { ...request, ...patch }
            : request,
        ),
      );

      try {
        const target = requestsRef.current.find((r) => r.order === order);
        const firestoreId = target?.firestoreId;
        if (firestoreId) {
          const firestorePatch = {
            updatedAt: serverTimestamp(),
          };
          if (patch.stage !== undefined) {
            firestorePatch.status = patch.stage;
            firestorePatch['requestSummary.stage'] = patch.stage;
          }
          if (patch.badge !== undefined) {
            firestorePatch['requestSummary.badge'] = patch.badge;
          }
          if (patch.badgeVariant !== undefined) {
            firestorePatch['requestSummary.badgeVariant'] = patch.badgeVariant;
          }
          if (patch.detail !== undefined) {
            firestorePatch['requestSummary.detail'] = patch.detail;
          }
          if (patch.progress !== undefined) {
            firestorePatch['requestSummary.progress'] = patch.progress;
          }
          if (patch.delivery !== undefined) {
            firestorePatch.delivery = patch.delivery;
            firestorePatch['requestSummary.delivery'] = patch.delivery;
          }
          if (patch.paymentStatus !== undefined) {
            firestorePatch.paymentStatus = patch.paymentStatus;
            firestorePatch['requestSummary.paymentStatus'] = patch.paymentStatus;
          }
          if (patch.feedback !== undefined) {
            firestorePatch.feedback = patch.feedback;
            firestorePatch['requestSummary.feedback'] = patch.feedback;
          }
          if ('adminDeliveryNote' in patch) {
            firestorePatch.adminDeliveryNote = patch.adminDeliveryNote;
            firestorePatch['requestSummary.adminDeliveryNote'] = patch.adminDeliveryNote;
          }
          if ('deliveryRejectedAt' in patch) {
            firestorePatch.deliveryRejectedAt = patch.deliveryRejectedAt;
            firestorePatch['requestSummary.deliveryRejectedAt'] = patch.deliveryRejectedAt;
          }
          if (patch.pickup !== undefined) {
            firestorePatch.pickup = patch.pickup;
            firestorePatch['requestSummary.pickup'] = patch.pickup;
          }
          if (patch.completion !== undefined) {
            firestorePatch.completion = patch.completion;
            firestorePatch['requestSummary.completion'] = patch.completion;
          }
          if (patch.itemNotReceivedReportedAt !== undefined) {
            firestorePatch.itemNotReceivedReportedAt = patch.itemNotReceivedReportedAt;
            firestorePatch['requestSummary.itemNotReceivedReportedAt'] = patch.itemNotReceivedReportedAt;
          }
          if (patch.itemNotReceivedNote !== undefined) {
            firestorePatch.itemNotReceivedNote = patch.itemNotReceivedNote;
            firestorePatch['requestSummary.itemNotReceivedNote'] = patch.itemNotReceivedNote;
          }
          if (patch.returnRescheduleDate !== undefined) {
            firestorePatch.returnRescheduleDate = patch.returnRescheduleDate;
            firestorePatch['requestSummary.returnRescheduleDate'] = patch.returnRescheduleDate;
          }
          if (patch.returnRescheduleWindow !== undefined) {
            firestorePatch.returnRescheduleWindow = patch.returnRescheduleWindow;
            firestorePatch['requestSummary.returnRescheduleWindow'] = patch.returnRescheduleWindow;
          }
          if (patch.itemNotReceivedResolved !== undefined) {
            firestorePatch.itemNotReceivedResolved = patch.itemNotReceivedResolved;
            firestorePatch['requestSummary.itemNotReceivedResolved'] = patch.itemNotReceivedResolved;
          }
          if (patch.notifications !== undefined) {
            firestorePatch.notifications = patch.notifications;
            firestorePatch['requestSummary.notifications'] = patch.notifications;
          }
          if (patch.returnDelivery !== undefined) {
            firestorePatch.returnDelivery = patch.returnDelivery;
            firestorePatch['requestSummary.returnDelivery'] = patch.returnDelivery;
          }
          if (patch.timeline !== undefined) {
            firestorePatch.timeline = patch.timeline;
            firestorePatch['requestSummary.timeline'] = patch.timeline;
          }
          await updateDoc(doc(db, 'serviceRequests', firestoreId), firestorePatch);
        }
      } catch (err) {
        console.error('Failed to sync request stage to Firestore:', err);
      }
    },
    [],
  );

  /**
   * Creates a service request in Firestore.
   * Returns the order number after the save succeeds.
   */
  const submitDraft = useCallback(async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error(
        'Please log in before submitting a service request.',
      );
    }

    if (!allPhotosPassed) {
      throw new Error(
        'Please complete all five photos and make sure they pass the photo checks.',
      );
    }

    // Snapshot the form so edits during saving don't change the request.
    const submittedDraft = draft;

    const itemName = `${
      submittedDraft.item.brandModel || 'Custom leather item'
    } - ${submittedDraft.item.color || 'Unspecified color'}`;

    // Uses the Firestore counter to generate a unique order number.
    const counterRef = doc(db, 'counters', 'serviceOrders');

    const nextNumber = await runTransaction(
      db,
      async (transaction) => {
        const counterSnap = await transaction.get(counterRef);

        const lastNumber = counterSnap.exists()
          ? Number(counterSnap.data().lastNumber) || 48
          : 48;

        const next = lastNumber + 1;

        transaction.set(
          counterRef,
          {
            lastNumber: next,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        );

        return next;
      },
    );

    const order = `#${String(nextNumber).padStart(3, '0')}`;
    const requestRef = doc(
      collection(db, 'serviceRequests'),
    );

    const newRequest = {
      order,
      item: itemName,
      badge: 'Pending review',
      badgeVariant: 'amber',
      progress: 0.25,
      detail: 'Waiting for Admin / Artisan review',
      stage: 'pending_review',
      subtitle: itemName,
      serviceProtocol:
        submittedDraft.assessment.protocolTitle,
      fee: submittedDraft.assessment.fee,
      clientName:
        submittedDraft.personal.fullName || userProfile.name,
      artisan: {
        name: '',
        contact: '',
      },
      declineReason: '',
      acceptedDate: '',
      turnaround: '7–10 business days',
      findings: submittedDraft.assessment.findings,
      damageTags: submittedDraft.assessment.damageTags,
      protocolSteps: submittedDraft.assessment.protocolSteps,
      clientNotes: submittedDraft.assessment.clientNotes,
      reportTags:
        submittedDraft.assessment.damageTags.slice(0, 4),
      notifications: [
        {
          title: 'Request submitted',
          detail:
            'Your restoration request is pending review.',
        },
        {
          title: 'AI assessment attached',
          detail: `${submittedDraft.assessment.confidence}% confidence · ${submittedDraft.assessment.protocolTitle}`,
        },
      ],
      timeline: [
        {
          title: 'Request submitted',
          date: 'Just now',
          done: true,
          current: true,
        },
        {
          title: 'Admin / Artisan review',
          date: 'Pending',
          done: false,
        },
        {
          title: 'Decision & next step',
          date: '',
          done: false,
        },
        {
          title: 'Payment & drop-off',
          date: '',
          done: false,
        },
        {
          title: 'Restoration',
          date: '',
          done: false,
        },
        {
          title: 'Return & feedback',
          date: '',
          done: false,
        },
      ],
    };

    // Stores request data and photo metadata only, not image files.
    const firestoreData = {
      order,
      userId: currentUser.uid,
      status: 'pending_review',
      item: { ...submittedDraft.item },
      personal: { ...submittedDraft.personal },
      assessment: { ...submittedDraft.assessment },
      photos: Object.fromEntries(
        PHOTO_SLOTS.map((label) => [
          label,
          getLocalPhotoData(submittedDraft.photos[label]),
        ]),
      ),
      delivery: {
        courier: submittedDraft.delivery.courier || '',
        trackingNo: submittedDraft.delivery.trackingNo || '',
        receiptUri: submittedDraft.delivery.receiptUri || null,
        proofUri: submittedDraft.delivery.proofUri || submittedDraft.delivery.receiptUri || null,
        sharedLink: submittedDraft.delivery.sharedLink || '',
      },
      pickup: { ...submittedDraft.pickup },
      feedback: { ...submittedDraft.feedback },
      requestSummary: newRequest,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(requestRef, firestoreData);

    // Update local state only after Firestore confirms the save.
    const requestForUI = {
      ...newRequest,
      firestoreId: requestRef.id,
    };

    setRequests((current) => [
      requestForUI,
      ...current,
    ]);

    setSelectedOrder(order);
    resetDraft();

    return order;
  }, [
    allPhotosPassed,
    draft,
    userProfile,
    resetDraft,
  ]);

  const value = useMemo(
    () => ({
      draft,
      requests,
      loadingRequests,
      selectedOrder,
      setSelectedOrder,
      userProfile,
      photoSlots: PHOTO_SLOTS,
      updatePersonalField,
      updateItemField,
      updatePhoto,
      updateAssessmentField,
      toggleDamageTag,
      updateDeliveryField,
      updatePickupField,
      updateFeedbackField,
      toggleFeedbackTag,
      updateRequestStage,
      submitDraft,
      resetDraft,
      completedPhotos,
      passedPhotos,
      failedPhotos,
      allPhotosPassed,
    }),
    [
      draft,
      requests,
      loadingRequests,
      selectedOrder,
      userProfile,
      updatePersonalField,
      updateItemField,
      updatePhoto,
      updateAssessmentField,
      toggleDamageTag,
      updateDeliveryField,
      updatePickupField,
      updateFeedbackField,
      toggleFeedbackTag,
      updateRequestStage,
      submitDraft,
      resetDraft,
      completedPhotos,
      passedPhotos,
      failedPhotos,
      allPhotosPassed,
    ],
  );

  return (
    <UserRequestContext.Provider value={value}>
      {children}
    </UserRequestContext.Provider>
  );
}

export function useUserRequest() {
  const context = useContext(UserRequestContext);

  if (!context) {
    throw new Error(
      'useUserRequest must be used inside UserRequestProvider',
    );
  }

  return context;
}
