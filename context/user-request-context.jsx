import { auth, db } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const initialRequests = [
  {
    order: '#311',
    item: 'Chanel Classic Flap - Black Lambskin',
    badge: 'In restoration',
    badgeVariant: 'blue',
    progress: 0.6,
    detail: 'Step 3 of 5 - Deep conditioning',
    stage: 'Deep conditioning',
    subtitle: 'Chanel Classic Flap - Black Lambskin',
    reportTags: ['Leather: Moderate wear', 'Vamp creasing: Present', 'Mold: None', 'Signed by artisan'],
    notifications: [
      { title: 'Deep conditioning started', detail: 'Apr 24 - Your artisan began treatment' },
      { title: 'Handshake completed', detail: 'Apr 22 - Condition verified and signed' },
    ],
    timeline: [
      { title: 'Item intake', date: 'Apr 21, 9:02 AM', done: true },
      { title: 'Atelier assessment', date: 'Apr 21, 11:30 AM', done: true },
      { title: 'Verified handshake', date: 'Apr 22, 8:45 AM', done: true },
      { title: 'Deep conditioning', date: 'In progress', current: true },
      { title: 'Quality control & delivery', date: '', done: false },
    ],
  },
  {
    order: '#302',
    item: 'Louis Vuitton Speedy 30 - Monogram',
    badge: 'Delivery back',
    badgeVariant: 'amber',
    progress: null,
    detail: 'Courier booked for Apr 29 return trip',
    stage: 'Delivery back',
    subtitle: 'Louis Vuitton Speedy 30 - Monogram',
    reportTags: ['Monogram canvas: Stable', 'Handles: Conditioned', 'Delivery: Booked'],
    notifications: [{ title: 'Return delivery scheduled', detail: 'Apr 28 - Rider assigned for return trip' }],
    timeline: [
      { title: 'Item intake', date: 'Apr 18, 10:05 AM', done: true },
      { title: 'Atelier assessment', date: 'Apr 18, 1:20 PM', done: true },
      { title: 'Verified handshake', date: 'Apr 19, 9:10 AM', done: true },
      { title: 'Deep conditioning', date: 'Apr 24, 4:00 PM', done: true },
      { title: 'Quality control & delivery', date: 'Out for return', current: true },
    ],
  },
  {
    order: '#295',
    item: 'Hermes Birkin 35 - Togo Leather',
    badge: 'Complete',
    badgeVariant: 'mint',
    progress: null,
    detail: 'Released after final quality control',
    stage: 'Complete',
    subtitle: 'Hermes Birkin 35 - Togo Leather',
    reportTags: ['Color restored', 'Edges sealed', 'Final QC passed'],
    notifications: [{ title: 'Order completed', detail: 'Apr 17 - Item released to client' }],
    timeline: [
      { title: 'Item intake', date: 'Apr 10, 10:00 AM', done: true },
      { title: 'Atelier assessment', date: 'Apr 10, 1:15 PM', done: true },
      { title: 'Verified handshake', date: 'Apr 11, 8:50 AM', done: true },
      { title: 'Deep conditioning', date: 'Apr 14, 11:00 AM', done: true },
      { title: 'Quality control & delivery', date: 'Completed', done: true },
    ],
  },
];

function createInitialDraft() {
  return {
    general: {
      intakeDate: 'April 28, 2026',
      brandModel: '',
      color: '',
      itemType: 'Bag',
    },
    leatherAssessment: {
      'Vamp creasing': [],
      'Surface damage': [],
      'Color health': [],
      'Biological status': [],
    },
    soleEdge: {
      edgeDressing: [],
      soleCondition: [],
      damageNotes: '',
    },
    serviceProtocol: 'The Heritage Glass',
    customQuote: '',
    photos: {
      Front: null,
      Side: null,
      Heel: null,
      Sole: null,
      'Damage detail': null,
    },
    paymentMethod: 'online',
    paymentChannel: 'GCash',
    signature: '',
    intakeBy: 'Assigned after submission',
  };
}

const UserRequestContext = createContext(undefined);

export function UserRequestProvider({ children }) {
  const [draft, setDraft] = useState(createInitialDraft);
  const [requests, setRequests] = useState(initialRequests);
  const [selectedOrder, setSelectedOrder] = useState(initialRequests[0].order);
  const [userProfile, setUserProfile] = useState({ name: 'Client', email: '' });

  useEffect(() => {
    const readUser = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        setUserProfile({ name: 'Client', email: '' });
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
        const data = userSnap.data();
        const fallbackName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Client';
        setUserProfile({
          name: data?.name || `${data?.firstName || ''} ${data?.lastName || ''}`.trim() || fallbackName,
          email: data?.email || currentUser.email || '',
        });
      } catch (_error) {
        setUserProfile({
          name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Client',
          email: currentUser.email || '',
        });
      }
    };

    readUser();
  }, []);

  const updateGeneralField = (field, value) => {
    setDraft((current) => ({
      ...current,
      general: {
        ...current.general,
        [field]: value,
      },
    }));
  };

  const toggleAssessmentOption = (section, option) => {
    setDraft((current) => {
      const sectionValues = current.leatherAssessment[section] || [];
      const nextValues = sectionValues.includes(option)
        ? sectionValues.filter((item) => item !== option)
        : [...sectionValues, option];

      return {
        ...current,
        leatherAssessment: {
          ...current.leatherAssessment,
          [section]: nextValues,
        },
      };
    });
  };

  const toggleArrayOption = (field, option) => {
    setDraft((current) => {
      const values = current.soleEdge[field] || [];
      const nextValues = values.includes(option) ? values.filter((item) => item !== option) : [...values, option];

      return {
        ...current,
        soleEdge: {
          ...current.soleEdge,
          [field]: nextValues,
        },
      };
    });
  };

  const updateSoleEdgeField = (field, value) => {
    setDraft((current) => ({
      ...current,
      soleEdge: {
        ...current.soleEdge,
        [field]: value,
      },
    }));
  };

  const updateServiceProtocol = (value) => {
    setDraft((current) => ({
      ...current,
      serviceProtocol: value,
    }));
  };

  const updateCustomQuote = (value) => {
    setDraft((current) => ({
      ...current,
      customQuote: value,
    }));
  };

  const updatePhoto = (label, asset) => {
    setDraft((current) => ({
      ...current,
      photos: {
        ...current.photos,
        [label]: asset,
      },
    }));
  };

  const updatePaymentMethod = (value) => {
    setDraft((current) => ({
      ...current,
      paymentMethod: value,
    }));
  };

  const updatePaymentChannel = (value) => {
    setDraft((current) => ({
      ...current,
      paymentChannel: value,
    }));
  };

  const updateSignature = (value) => {
    setDraft((current) => ({
      ...current,
      signature: value,
    }));
  };

  const resetDraft = () => {
    setDraft(createInitialDraft());
  };

  const completedPhotos = Object.values(draft.photos).filter(Boolean).length;
  const allPhotosUploaded = completedPhotos === Object.keys(draft.photos).length;

  const serviceFeeMap = {
    'Essential endurance': 800,
    'The Foundation': 1800,
    'The Heritage Glass': 3500,
  };

  const serviceFee =
    draft.serviceProtocol === 'The Resurrection Protocol'
      ? Number.parseFloat(draft.customQuote || '0') || 0
      : serviceFeeMap[draft.serviceProtocol] || 0;
  const pickupFee = draft.paymentMethod === 'online' ? 150 : 0;
  const returnFee = draft.paymentMethod === 'online' ? 150 : 0;
  const total = serviceFee + pickupFee + returnFee;

  const submitDraft = () => {
    const nextNumber = 312 + requests.filter((request) => request.order.startsWith('#')).length;
    const order = `#${nextNumber}`;
    const itemName = `${draft.general.brandModel || 'Custom leather item'} - ${draft.general.color || 'Unspecified color'}`;
    const selectedReportTags = [
      ...Object.entries(draft.leatherAssessment)
        .filter(([, values]) => values.length)
        .map(([label, values]) => `${label}: ${values.join(', ')}`),
      draft.soleEdge.damageNotes ? `Notes: ${draft.soleEdge.damageNotes}` : null,
      allPhotosUploaded ? 'Verified handshake ready' : 'Awaiting full photo set',
    ].filter(Boolean);

    const newRequest = {
      order,
      item: itemName,
      badge: 'In restoration',
      badgeVariant: 'blue',
      progress: 0.2,
      detail: 'Step 1 of 5 - Intake submitted',
      stage: 'Item intake',
      subtitle: itemName,
      reportTags: selectedReportTags.slice(0, 4),
      notifications: [
        { title: 'Request submitted', detail: 'Your intake form has been sent to the atelier.' },
        { title: 'Payment preference saved', detail: `${draft.paymentMethod === 'online' ? draft.paymentChannel : 'In person'} selected` },
      ],
      timeline: [
        { title: 'Item intake', date: 'Submitted just now', current: true },
        { title: 'Atelier assessment', date: '', done: false },
        { title: 'Verified handshake', date: allPhotosUploaded ? 'Ready for verification' : '', done: false },
        { title: 'Deep conditioning', date: '', done: false },
        { title: 'Quality control & delivery', date: '', done: false },
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
      updateGeneralField,
      toggleAssessmentOption,
      toggleArrayOption,
      updateSoleEdgeField,
      updateServiceProtocol,
      updateCustomQuote,
      updatePhoto,
      updatePaymentMethod,
      updatePaymentChannel,
      updateSignature,
      submitDraft,
      resetDraft,
      completedPhotos,
      allPhotosUploaded,
      serviceFee,
      pickupFee,
      returnFee,
      total,
    }),
    [draft, requests, selectedOrder, userProfile, completedPhotos, allPhotosUploaded, serviceFee, pickupFee, returnFee, total]
  );

  return <UserRequestContext.Provider value={value}>{children}</UserRequestContext.Provider>;
}

export function useUserRequest() {
  const context = useContext(UserRequestContext);

  if (!context) {
    throw new Error('useUserRequest must be used inside UserRequestProvider');
  }

  return context;
}
