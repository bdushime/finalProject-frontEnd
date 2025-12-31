// Mock data for Student pages

export const studentMockData = {
    student: {
        id: 'STU-2024-001',
        name: 'M Juls',
        email: 'juls.m@auca.ac.rw',
        studentId: '25111',
        phone: '+250 788 123 456',
        department: 'Networks & Communication System',
        year: 'Year 3',
        photo: '/api/placeholder/150/150',
        joinDate: '2025-12-1',
    },
};

export const borrowedItems = [
    {
        id: 'BR-001',
        equipmentId: 'PRJ-001',
        equipmentName: 'Epson PowerLite 2250U',
        category: 'Projector',
        borrowedDate: '2025-12-01',
        dueDate: '2025-12-10',
        returnDate: null,
        status: 'active',
        condition: 'good',
        location: 'Building C, Equipment Room',
        requestId: 'REQ-001',
        approvedBy: 'IT Staff - Jane Smith',
        approvedDate: '2025-11-30',
    },
    {
        id: 'BR-002',
        equipmentId: 'PRJ-002',
        equipmentName: 'BenQ LU960',
        category: 'Projector',
        borrowedDate: null,
        dueDate: null,
        returnDate: null,
        status: 'pending',
        condition: 'good',
        location: 'Building C, AV Closet',
        requestId: 'REQ-002',
        approvedBy: null,
        approvedDate: null,
        requestedDate: '2025-12-05',
    },
    {
        id: 'BR-003',
        equipmentId: 'REM-001',
        equipmentName: 'Projector Remote - Standard',
        category: 'Remote',
        borrowedDate: '2025-11-20',
        dueDate: '2025-12-04',
        returnDate: null,
        status: 'overdue',
        condition: 'good',
        location: 'Building C, Equipment Room',
        requestId: 'REQ-003',
        approvedBy: 'IT Staff - Brian Lee',
        approvedDate: '2025-11-19',
    },
];

export const notifications = [
    {
        id: 'NOTIF-001',
        type: 'overdue', // overdue, approved, rejected, reminder, system
        title: 'Item Overdue: Cisco Catalyst 9200',
        message: 'The switch you borrowed for the network lab was due on Dec 2, 2024. Please schedule a return or extension.',
        timestamp: '2024-12-03T10:30:00',
        read: false,
        actionUrl: '/student/borrowed-items',
    },
    {
        id: 'NOTIF-002',
        type: 'approved',
        title: 'Request Approved: ThinkPad X1 Carbon',
        message: 'Your ThinkPad X1 Carbon checkout is ready. Pick it up at the Innovation Hub (Locker 2B).',
        timestamp: '2024-11-27T14:20:00',
        read: false,
        actionUrl: '/student/borrowed-items',
    },
    {
        id: 'NOTIF-003',
        type: 'reminder',
        title: 'Return Reminder: Epson EB-2247U Projector',
        message: 'Your Epson EB-2247U Projector is due in 3 days (Dec 6, 2024).',
        timestamp: '2024-12-03T09:00:00',
        read: true,
        actionUrl: '/student/borrowed-items',
    },
    {
        id: 'NOTIF-004',
        type: 'system',
        title: 'System Maintenance Scheduled',
        message: 'The equipment tracking system will be under maintenance on Nov 15, 2024 from 1:00 AM to 3:00 AM.',
        timestamp: '2024-11-10T16:45:00',
        read: true,
        actionUrl: null,
    },
    {
        id: 'NOTIF-005',
        type: 'rejected',
        title: 'Request Rejected: GoPro HERO 12',
        message: 'Your request for "GoPro HERO 12" has been rejected. Reason: Equipment reserved for field deployment this week.',
        timestamp: '2024-11-29T11:15:00',
        read: false,
        actionUrl: '/student/browse',
    },
];

export const borrowHistory = [
    {
        id: 'HIST-001',
        equipmentName: 'MacBook Pro 16"',
        category: 'Laptop',
        borrowedDate: '2024-10-05',
        returnedDate: '2024-10-14',
        status: 'returned',
        conditionBorrowed: 'excellent',
        conditionReturned: 'excellent',
        daysBorrowed: 9,
    },
    {
        id: 'HIST-002',
        equipmentName: 'Epson PowerLite Projector',
        category: 'Projector',
        borrowedDate: '2024-08-01',
        returnedDate: '2024-08-05',
        status: 'returned',
        conditionBorrowed: 'good',
        conditionReturned: 'good',
        daysBorrowed: 4,
    },
    {
        id: 'HIST-003',
        equipmentName: 'iPad Pro 12.9"',
        category: 'Tablet',
        borrowedDate: '2024-07-15',
        returnedDate: '2024-07-20',
        status: 'returned',
        conditionBorrowed: 'excellent',
        conditionReturned: 'excellent',
        daysBorrowed: 5,
    },
    {
        id: 'HIST-004',
        equipmentName: 'Epson EB-FH52 Projector',
        category: 'Projector',
        borrowedDate: '2024-06-10',
        returnedDate: '2024-06-18',
        status: 'returned',
        conditionBorrowed: 'good',
        conditionReturned: 'good',
        daysBorrowed: 8,
    },
];

export const dashboardStats = {
    totalBorrowed: 5,
    activeBorrows: 2,
    pendingRequests: 1,
    overdueItems: 1,
    returnedItems: 1,
    score: 92, // Score out of 100 based on timely returns
};

export const faqData = [
    {
        id: 'FAQ-001',
        question: 'How long can I borrow equipment?',
        answer: 'The standard borrowing period is 5 Hours. Some equipment may have different borrowing periods based on availability and type.',
    },
    {
        id: 'FAQ-002',
        question: 'What happens if I return equipment late?',
        answer: 'Late returns may result in penalties or restrictions on future borrowing. Please return equipment on or before the due date.',
    },
    {
        id: 'FAQ-003',
        question: 'Can I extend my borrowing period?',
        answer: 'Yes, you can request an extension through the system.',
    },
    {
        id: 'FAQ-004',
        question: 'What should I do if equipment is damaged?',
        answer: 'Report any damage immediately when returning the equipment. You may be held responsible for damages that occurred during your borrowing period.',
    },
    {
        id: 'FAQ-005',
        question: 'How do I scan QR codes?',
        answer: 'Use the QR code scanner in the borrow request page. Make sure your device camera has permission to access the camera.',
    },
    {
        id: 'FAQ-006',
        question: 'Can I borrow multiple items at once?',
        answer: 'Yes, you can borrow multiple items, but each request needs to be approved separately by IT staff.',
    },
        {
        id: 'FAQ-007',
        question: 'Can I reserve equipment in advance?',
        answer: 'Yes! Use the "Reserve" option when submitting a request to schedule future use.',
    },
];

