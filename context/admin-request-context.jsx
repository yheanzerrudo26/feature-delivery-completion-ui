import { createContext, useContext, useMemo, useState } from 'react';

const initialRequests = [
  {
    id: '#039',
    clientName: 'Mia Santos',
    mobile: '+63 917 555 0192',
    email: 'mia.santos@email.com',
    submittedAt: 'Today · 9:14 AM',
    stage: 'pending_review',
    badge: 'Pending review',
    badgeVariant: 'amber',
    item: 'Coach leather satchel',
    colorMaterial: 'Cognac brown · full-grain leather',
    declaredIssue: 'Dry leather, edge wear, loose handle stitch',
    returnMethod: 'Courier delivery',
    serviceProtocol: 'Repair & Deep Conditioning',
    fee: 2850,
    photos: ['Front', 'Side', 'Back', 'Base', 'Damage detail'],
    ai: {
      confidence: 87,
      summary:
        'Moderate restoration recommended. Reinforce handle stitch, deep-condition dry panels, and blend faded edge wear.',
      tags: ['Condition 3/5', 'Low structural risk', '7–10 days'],
    },
    clientNotes:
      'Handle stitch opened further last week. Prefer courier return if possible.',
    paymentStatus: 'Unpaid',
    paymentRef: '',
    courier: null,
    declineReason: '',
    pickup: {
      date: 'Apr 19, 2026',
      window: '2:00 PM – 4:00 PM',
      alternate: 'Apr 20, 10:00 AM – 12:00 PM',
      clientResponse: null,
      clientAvailability: '',
    },
    completion: {
      videoUploaded: true,
      videoName: 'completion-039.mp4',
      report:
        'Handle stitch reinforced. Panels conditioned. Edge color blended and sealed.',
      conditionScore: '4.5/5',
      materials: 'Thread match, conditioner, edge dye',
      careAdvice: 'Condition every 3–4 months. Avoid prolonged sun.',
    },
    feedback: null,
  },
  {
    id: '#041',
    clientName: 'Aria Gomez',
    mobile: '+63 918 222 4401',
    email: 'aria.gomez@email.com',
    submittedAt: 'Yesterday · 4:02 PM',
    stage: 'awaiting_delivery',
    badge: 'In transit',
    badgeVariant: 'amber',
    item: 'Loewe Puzzle Bag',
    colorMaterial: 'Tan calfskin',
    declaredIssue: 'Corner scuffs, dry panels',
    returnMethod: 'Courier delivery',
    serviceProtocol: 'The Foundation',
    fee: 1800,
    photos: ['Front', 'Side', 'Back', 'Base', 'Damage detail'],
    ai: {
      confidence: 91,
      summary: 'Foundation protocol suitable for corner scuffs and dryness.',
      tags: ['Condition 2/5', 'Low risk', '5–7 days'],
    },
    clientNotes: 'Please start as soon as received.',
    paymentStatus: 'Paid',
    paymentRef: 'GC- thr-88421',
    courier: {
      name: 'LBC Express',
      trackingNo: 'LBC-48291033',
      sender: 'Aria Gomez',
      recipient: 'Mabuli Atelier Workshop',
      status: 'Delivered to front desk',
      deliveredAt: 'Today · 11:20 AM',
    },
    declineReason: '',
    pickup: {
      date: '',
      window: '',
      alternate: '',
      clientResponse: null,
      clientAvailability: '',
    },
    completion: {
      videoUploaded: false,
      videoName: '',
      report: '',
      conditionScore: '',
      materials: '',
      careAdvice: '',
    },
    feedback: null,
  },
  {
    id: '#042',
    clientName: 'Ethan Cruz',
    mobile: '+63 919 777 1022',
    email: 'ethan.cruz@email.com',
    submittedAt: 'Oct 2 · 1:40 PM',
    stage: 'in_progress',
    badge: 'In restoration',
    badgeVariant: 'blue',
    item: 'Gucci Marmont Wallet',
    colorMaterial: 'Black leather',
    declaredIssue: 'Edge wear, color fade',
    returnMethod: 'Courier delivery',
    serviceProtocol: 'The Foundation',
    fee: 1800,
    photos: ['Front', 'Side', 'Back', 'Base', 'Damage detail'],
    ai: {
      confidence: 88,
      summary: 'Edge dressing and color touch-up recommended.',
      tags: ['Condition 3/5', 'Low risk', '5–7 days'],
    },
    clientNotes: '',
    paymentStatus: 'Paid',
    paymentRef: 'GC-THR-77102',
    courier: {
      name: 'GrabExpress',
      trackingNo: 'GE-991002',
      sender: 'Ethan Cruz',
      recipient: 'Mabuli Atelier Workshop',
      status: 'Item received',
      deliveredAt: 'Oct 3 · 2:10 PM',
    },
    declineReason: '',
    pickup: {
      date: 'Oct 16, 2026',
      window: '2:00 PM – 4:00 PM',
      alternate: 'Oct 17, 10:00 AM – 12:00 PM',
      clientResponse: null,
      clientAvailability: '',
    },
    completion: {
      videoUploaded: false,
      videoName: '',
      report: '',
      conditionScore: '',
      materials: '',
      careAdvice: '',
    },
    feedback: null,
  },
  {
    id: '#043',
    clientName: 'Lina Reyes',
    mobile: '+63 927 111 8844',
    email: 'lina.reyes@email.com',
    submittedAt: 'Sep 28 · 10:05 AM',
    stage: 'reschedule_needed',
    badge: 'Reschedule needed',
    badgeVariant: 'amber',
    item: 'Hermès Kelly Soft',
    colorMaterial: 'Etoupe Togo',
    declaredIssue: 'Handle wear, dryness',
    returnMethod: 'Courier delivery',
    serviceProtocol: 'The Heritage Glass',
    fee: 3500,
    photos: ['Front', 'Side', 'Back', 'Base', 'Damage detail'],
    ai: {
      confidence: 84,
      summary: 'Heritage protocol for premium handle and panel care.',
      tags: ['Condition 3/5', 'Medium detail', '10–14 days'],
    },
    clientNotes: 'Cannot do original pickup window.',
    paymentStatus: 'Paid',
    paymentRef: 'GC-THR-55019',
    courier: {
      name: 'GrabExpress',
      trackingNo: 'GE-550190',
      sender: 'Lina Reyes',
      recipient: 'Mabuli Atelier Workshop',
      status: 'Item received',
      deliveredAt: 'Sep 30 · 3:40 PM',
    },
    declineReason: '',
    pickup: {
      date: 'Oct 12, 2026',
      window: '2:00 PM – 4:00 PM',
      alternate: 'Oct 13, 10:00 AM – 12:00 PM',
      clientResponse: 'no',
      clientAvailability:
        'I am only available Oct 18 afternoon or Oct 19 morning.',
    },
    completion: {
      videoUploaded: true,
      videoName: 'completion-043.mp4',
      report:
        'Handles conditioned and reshaped. Panels nourished. Edges sealed.',
      conditionScore: '4.8/5',
      materials: 'Conditioner, edge paint, protective finish',
      careAdvice: 'Store stuffed; avoid humidity.',
    },
    feedback: null,
  },
  {
    id: '#038',
    clientName: 'Julian Tan',
    mobile: '+63 916 444 2200',
    email: 'julian.tan@email.com',
    submittedAt: 'Sep 10 · 8:30 AM',
    stage: 'complete',
    badge: 'Archived',
    badgeVariant: 'mint',
    item: 'Bottega Veneta Cassette',
    colorMaterial: 'Intrecciato green',
    declaredIssue: 'Corner abrasion',
    returnMethod: 'Courier delivery',
    serviceProtocol: 'Essential Endurance',
    fee: 800,
    photos: ['Front', 'Side', 'Back', 'Base', 'Damage detail'],
    ai: {
      confidence: 90,
      summary: 'Light restoration and conditioning sufficient.',
      tags: ['Condition 2/5', 'Low risk', '3–5 days'],
    },
    clientNotes: '',
    paymentStatus: 'Paid',
    paymentRef: 'GC-THR-33011',
    courier: {
      name: 'LBC Express',
      trackingNo: 'LBC-330110',
      sender: 'Julian Tan',
      recipient: 'Mabuli Atelier Workshop',
      status: 'Returned to client',
      deliveredAt: 'Sep 18 · 1:15 PM',
    },
    declineReason: '',
    pickup: {
      date: 'Sep 17, 2026',
      window: '1:00 PM – 3:00 PM',
      alternate: '',
      clientResponse: 'yes',
      clientAvailability: '',
    },
    completion: {
      videoUploaded: true,
      videoName: 'completion-038.mp4',
      report: 'Corners cleaned and conditioned. Finish restored.',
      conditionScore: '4.7/5',
      materials: 'Cleaner, conditioner',
      careAdvice: 'Wipe gently after use.',
    },
    feedback: {
      rating: 5,
      date: 'Sep 18, 2026',
      comments:
        'Beautiful work. Bag looks renewed and packaging was careful.',
      tags: ['Craftsmanship', 'Communication'],
      concerns: 'None',
      followUp: 'Conditioning reminder · Dec 18, 2026',
      warranty: '30-day workmanship warranty',
    },
  },
];

const AdminRequestContext = createContext(undefined);

export function AdminRequestProvider({ children }) {
  const [requests, setRequests] = useState(initialRequests);
  const [selectedId, setSelectedId] = useState(initialRequests[0].id);

  const updateRequest = (id, patch) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === id ? { ...request, ...patch } : request,
      ),
    );
  };

  const acceptRequest = (id) => {
    updateRequest(id, {
      stage: 'accepted',
      badge: 'Accepted',
      badgeVariant: 'mint',
    });
  };

  const declineRequest = (id, reason, notification) => {
    updateRequest(id, {
      stage: 'declined',
      badge: 'Declined',
      badgeVariant: 'amber',
      declineReason: reason,
      clientNotification: notification,
    });
  };

  const confirmItemReceived = (id) => {
    updateRequest(id, {
      stage: 'in_progress',
      badge: 'In restoration',
      badgeVariant: 'blue',
    });
  };

  const sendPickupNotice = (id, pickup) => {
    updateRequest(id, {
      stage: 'awaiting_pickup_response',
      badge: 'Awaiting pickup response',
      badgeVariant: 'amber',
      pickup: {
        ...pickup,
        clientResponse: null,
      },
    });
  };

  const reschedulePickup = (id, pickup, reason, notification) => {
    updateRequest(id, {
      stage: 'awaiting_pickup_response',
      badge: 'New schedule proposed',
      badgeVariant: 'blue',
      pickup: {
        ...pickup,
        clientResponse: null,
        rescheduleReason: reason,
      },
      clientNotification: notification,
    });
  };

  const markReturnSent = (id) => {
    updateRequest(id, {
      stage: 'return_delivery',
      badge: 'Return in transit',
      badgeVariant: 'amber',
    });
  };

  const selectedRequest =
    requests.find((item) => item.id === selectedId) || requests[0];

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
      updateRequest,
      acceptRequest,
      declineRequest,
      confirmItemReceived,
      sendPickupNotice,
      reschedulePickup,
      markReturnSent,
    }),
    [requests, selectedId, selectedRequest, counts],
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
    throw new Error('useAdminRequest must be used inside AdminRequestProvider');
  }
  return context;
}

export function routeForAdminStage(stage, id) {
  const params = { id };
  switch (stage) {
    case 'pending_review':
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
