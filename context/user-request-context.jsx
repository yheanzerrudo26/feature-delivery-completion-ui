import { doc, getDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, db } from '../lib/firebase';

const PHOTO_SLOTS = ['Front', 'Side', 'Heel', 'Sole', 'Damage Detail'];

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
      damageTags: ['Dry leather', 'Surface scuffs', 'Loose stitching', 'Faded edges'],
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

const initialRequests = [
  {
    order: '#045',
    item: 'Coach Willow Tote - Cognac brown',
    badge: 'Pending review',
    badgeVariant: 'amber',
    progress: 0.25,
    detail: 'Waiting for Admin / Artisan review',
    stage: 'pending_review',
    subtitle: 'Coach Willow Tote - Cognac brown',
    serviceProtocol: 'Repair & Deep Conditioning',
    fee: 2850,
    clientName: 'Maria Santos',
    artisan: { name: 'Juan Dela Cruz', contact: '+63 917 555 0142' },
    declineReason: '',
    acceptedDate: '',
    turnaround: '7–10 business days',
    reportTags: ['Dry leather', 'Surface scuffs', 'Loose stitching'],
    notifications: [
      {
        title: 'Request submitted',
        detail: 'Your restoration request is pending review.',
      },
    ],
    timeline: [
      { title: 'Request submitted', date: 'Just now', done: true, current: true },
      { title: 'Admin / Artisan review', date: 'Pending', done: false },
      { title: 'Decision & next step', date: '', done: false },
    ],
  },
  {
    order: '#044',
    item: 'Gucci Marmont Wallet - Black',
    badge: 'In restoration',
    badgeVariant: 'blue',
    progress: 0.65,
    detail: 'Artisan is restoring your item',
    stage: 'in_progress',
    subtitle: 'Gucci Marmont Wallet - Black',
    serviceProtocol: 'The Foundation',
    fee: 1800,
    clientName: 'Maria Santos',
    artisan: { name: 'Juan Dela Cruz', contact: '+63 917 555 0142' },
    declineReason: '',
    acceptedDate: 'Oct 1, 2026',
    turnaround: '5–7 business days',
    reportTags: ['Edge wear', 'Color fade'],
    notifications: [
      {
        title: 'Service in progress',
        detail: 'Your artisan has started restoration.',
      },
    ],
    timeline: [
      { title: 'Request submitted', date: 'Sep 28', done: true },
      { title: 'Accepted', date: 'Oct 1', done: true },
      { title: 'Payment confirmed', date: 'Oct 2', done: true },
      { title: 'Item received', date: 'Oct 3', done: true },
      { title: 'Restoration', date: 'In progress', current: true },
      { title: 'Ready for pickup', date: '', done: false },
    ],
  },
  {
    order: '#038',
    item: 'Hermès Kelly Soft - Etoupe',
    badge: 'Complete',
    badgeVariant: 'mint',
    progress: null,
    detail: 'Service completed and feedback received',
    stage: 'complete',
    subtitle: 'Hermès Kelly Soft - Etoupe',
    serviceProtocol: 'The Heritage Glass',
    fee: 3500,
    clientName: 'Maria Santos',
    artisan: { name: 'Juan Dela Cruz', contact: '+63 917 555 0142' },
    declineReason: '',
    acceptedDate: 'Sep 10, 2026',
    turnaround: '10–14 business days',
    reportTags: ['Color restored', 'Edges sealed'],
    notifications: [
      { title: 'Order completed', detail: 'Item released and feedback submitted.' },
    ],
    timeline: [
      { title: 'Request submitted', date: 'Sep 5', done: true },
      { title: 'Accepted', date: 'Sep 10', done: true },
      { title: 'Payment confirmed', date: 'Sep 11', done: true },
      { title: 'Restoration', date: 'Sep 20', done: true },
      { title: 'Returned', date: 'Sep 28', done: true },
      { title: 'Feedback submitted', date: 'Sep 29', done: true },
    ],
  },
];

const photoAttempts = {};

function resetPhotoAttempts() {
  Object.keys(photoAttempts).forEach((key) => {
    delete photoAttempts[key];
  });
}

function simulatePhotoQuality(label, asset) {
  // Demo quality rules so the UI can show Passed / Recapture like the mockups.
  // First Sole upload fails once; Damage Detail may fail on the first try.
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

  if (label === 'Damage Detail' && attempt === 1 && Math.random() > 0.4) {
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

const UserRequestContext = createContext(undefined);

export function UserRequestProvider({ children }) {
  const [draft, setDraft] = useState(createInitialDraft);
  const [requests, setRequests] = useState(initialRequests);
  const [selectedOrder, setSelectedOrder] = useState(initialRequests[0].order);
  const [userProfile, setUserProfile] = useState({
    name: 'Client',
    email: '',
    mobile: '',
    address: '',
  });

  useEffect(() => {
    const readUser = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setUserProfile({ name: 'Client', email: '', mobile: '', address: '' });
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
        const data = userSnap.data() || {};
        const fullName =
          data?.name ||
          `${data?.firstName || ''} ${data?.lastName || ''}`.trim() ||
          currentUser.displayName ||
          currentUser.email?.split('@')[0] ||
          'Client';

        const profile = {
          name: fullName,
          email: data?.email || currentUser.email || '',
          mobile: data?.mobile || data?.phone || '',
          address: data?.address || '',
        };

        setUserProfile(profile);
        setDraft((current) => ({
          ...current,
          personal: {
            fullName: current.personal.fullName || profile.name,
            email: current.personal.email || profile.email,
            mobile: current.personal.mobile || profile.mobile,
            address: current.personal.address || profile.address,
          },
        }));
      } catch (_error) {
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
    };

    readUser();
  }, []);

  const updatePersonalField = (field, value) => {
    setDraft((current) => ({
      ...current,
      personal: { ...current.personal, [field]: value },
    }));
  };

  const updateItemField = (field, value) => {
    setDraft((current) => ({
      ...current,
      item: { ...current.item, [field]: value },
    }));
  };

  const updatePhoto = (label, asset) => {
    setDraft((current) => ({
      ...current,
      photos: {
        ...current.photos,
        [label]: simulatePhotoQuality(label, asset),
      },
    }));
  };

  const updateAssessmentField = (field, value) => {
    setDraft((current) => ({
      ...current,
      assessment: { ...current.assessment, [field]: value },
    }));
  };

  const toggleDamageTag = (tag) => {
    setDraft((current) => {
      const tags = current.assessment.damageTags || [];
      const next = tags.includes(tag)
        ? tags.filter((item) => item !== tag)
        : [...tags, tag];
      return {
        ...current,
        assessment: { ...current.assessment, damageTags: next },
      };
    });
  };

  const updateDeliveryField = (field, value) => {
    setDraft((current) => ({
      ...current,
      delivery: { ...current.delivery, [field]: value },
    }));
  };

  const updatePickupField = (field, value) => {
    setDraft((current) => ({
      ...current,
      pickup: { ...current.pickup, [field]: value },
    }));
  };

  const updateFeedbackField = (field, value) => {
    setDraft((current) => ({
      ...current,
      feedback: { ...current.feedback, [field]: value },
    }));
  };

  const toggleFeedbackTag = (tag) => {
    setDraft((current) => {
      const tags = current.feedback.tags || [];
      const next = tags.includes(tag)
        ? tags.filter((item) => item !== tag)
        : [...tags, tag];
      return {
        ...current,
        feedback: { ...current.feedback, tags: next },
      };
    });
  };

  const resetDraft = () => {
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
  };

  const photoEntries = Object.values(draft.photos);
  const completedPhotos = photoEntries.filter((photo) => photo.asset).length;
  const passedPhotos = photoEntries.filter((photo) => photo.status === 'pass').length;
  const failedPhotos = photoEntries.filter((photo) => photo.status === 'fail').length;
  const allPhotosPassed = PHOTO_SLOTS.every(
    (label) => draft.photos[label]?.status === 'pass',
  );

  const updateRequestStage = (order, patch) => {
    setRequests((current) =>
      current.map((request) =>
        request.order === order ? { ...request, ...patch } : request,
      ),
    );
  };

  const submitDraft = () => {
    const nextNumber =
      46 +
      requests.filter((request) => request.order.startsWith('#')).length;
    const order = `#${String(nextNumber).padStart(3, '0')}`;
    const itemName = `${draft.item.brandModel || 'Custom leather item'} - ${
      draft.item.color || 'Unspecified color'
    }`;

    const newRequest = {
      order,
      item: itemName,
      badge: 'Pending review',
      badgeVariant: 'amber',
      progress: 0.25,
      detail: 'Waiting for Admin / Artisan review',
      stage: 'pending_review',
      subtitle: itemName,
      serviceProtocol: draft.assessment.protocolTitle,
      fee: draft.assessment.fee,
      clientName: draft.personal.fullName || userProfile.name,
      artisan: { name: 'Juan Dela Cruz', contact: '+63 917 555 0142' },
      declineReason: '',
      acceptedDate: '',
      turnaround: '7–10 business days',
      findings: draft.assessment.findings,
      damageTags: draft.assessment.damageTags,
      protocolSteps: draft.assessment.protocolSteps,
      clientNotes: draft.assessment.clientNotes,
      reportTags: draft.assessment.damageTags.slice(0, 4),
      notifications: [
        {
          title: 'Request submitted',
          detail: 'Your restoration request is pending review.',
        },
        {
          title: 'AI assessment attached',
          detail: `${draft.assessment.confidence}% confidence · ${draft.assessment.protocolTitle}`,
        },
      ],
      timeline: [
        { title: 'Request submitted', date: 'Just now', done: true, current: true },
        { title: 'Admin / Artisan review', date: 'Pending', done: false },
        { title: 'Decision & next step', date: '', done: false },
        { title: 'Payment & drop-off', date: '', done: false },
        { title: 'Restoration', date: '', done: false },
        { title: 'Return & feedback', date: '', done: false },
      ],
    };

    setRequests((current) => [newRequest, ...current]);
    setSelectedOrder(order);
    resetDraft();
    return order;
  };

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
      submitDraft,
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
    throw new Error('useUserRequest must be used inside UserRequestProvider');
  }
  return context;
}
