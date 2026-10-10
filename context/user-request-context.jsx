
import {
  collection,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
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

  const [userProfile, setUserProfile] = useState(
    createDefaultUserProfile,
  );

  // Wait for Firebase authentication before reading the profile.
  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!active) {
          return;
        }

        if (!currentUser) {
          setUserProfile(createDefaultUserProfile());
          return;
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
      unsubscribe();
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

  // Updates the current session only.
  // Persist admin stage changes separately to Firestore.
  const updateRequestStage = useCallback((order, patch) => {
    setRequests((current) =>
      current.map((request) =>
        request.order === order
          ? { ...request, ...patch }
          : request,
      ),
    );
  }, []);

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
        receiptUri:
          submittedDraft.delivery.receiptUri || null,
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
