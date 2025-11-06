export const categories = [
  'All Categories',
  'Laptop',
  'Tablet',
  'Camera',
  'Audio',
  'Video',
  'Projector',
  'Accessories',
];

export const equipmentData = [
  {
    id: 'EQ-001',
    name: 'MacBook Pro 16"',
    category: 'Laptop',
    brand: 'Apple',
    model: 'MacBook Pro 16" M3 Pro',
    description: 'High-performance laptop perfect for video editing, software development, and intensive computing tasks.',
    specs: {
      'Processor': 'Apple M3 Pro',
      'RAM': '32GB',
      'Storage': '1TB SSD',
      'Display': '16.2" Liquid Retina XDR',
      'Battery': 'Up to 22 hours',
    },
    available: 3,
    total: 10,
    condition: 'excellent',
    location: 'Building A, Room 101',
  },
  {
    id: 'EQ-002',
    name: 'Dell XPS 15',
    category: 'Laptop',
    brand: 'Dell',
    model: 'XPS 15 9530',
    description: 'Premium Windows laptop with stunning OLED display and powerful performance for creative professionals.',
    specs: {
      'Processor': 'Intel Core i7-13700H',
      'RAM': '16GB',
      'Storage': '512GB SSD',
      'Display': '15.6" OLED 3.5K',
      'Graphics': 'NVIDIA RTX 4050',
    },
    available: 5,
    total: 8,
    condition: 'excellent',
    location: 'Building A, Room 101',
  },
  {
    id: 'EQ-003',
    name: 'iPad Pro 12.9"',
    category: 'Tablet',
    brand: 'Apple',
    model: 'iPad Pro 12.9" (6th Gen)',
    description: 'Versatile tablet with Apple Pencil support, perfect for digital art, note-taking, and presentations.',
    specs: {
      'Processor': 'Apple M2',
      'RAM': '8GB',
      'Storage': '256GB',
      'Display': '12.9" Liquid Retina XDR',
      'Connectivity': 'Wi-Fi 6E',
    },
    available: 8,
    total: 15,
    condition: 'excellent',
    location: 'Building A, Room 102',
  },
  {
    id: 'EQ-004',
    name: 'Sony A7 III Camera',
    category: 'Camera',
    brand: 'Sony',
    model: 'Alpha A7 III',
    description: 'Full-frame mirrorless camera with exceptional image quality for photography and videography projects.',
    specs: {
      'Sensor': '24.2MP Full-Frame',
      'Video': '4K 30fps',
      'ISO Range': '100-51200',
      'Autofocus': '693-point AF',
      'Battery Life': '710 shots',
    },
    available: 2,
    total: 5,
    condition: 'good',
    location: 'Building B, Media Lab',
  },
  {
    id: 'EQ-005',
    name: 'Canon EOS R6',
    category: 'Camera',
    brand: 'Canon',
    model: 'EOS R6 Mark II',
    description: 'Advanced mirrorless camera with outstanding autofocus and high-speed continuous shooting.',
    specs: {
      'Sensor': '24.2MP Full-Frame',
      'Video': '4K 60fps',
      'ISO Range': '100-102400',
      'Autofocus': 'Dual Pixel CMOS AF II',
      'Burst Rate': '40 fps',
    },
    available: 1,
    total: 4,
    condition: 'excellent',
    location: 'Building B, Media Lab',
  },
  {
    id: 'EQ-006',
    name: 'Shure SM7B Microphone',
    category: 'Audio',
    brand: 'Shure',
    model: 'SM7B',
    description: 'Professional studio microphone ideal for podcasting, vocals, and broadcast applications.',
    specs: {
      'Type': 'Dynamic',
      'Frequency Response': '50Hz - 20kHz',
      'Polar Pattern': 'Cardioid',
      'Output Impedance': '150 ohms',
      'Connector': 'XLR',
    },
    available: 6,
    total: 10,
    condition: 'excellent',
    location: 'Building B, Audio Studio',
  },
  {
    id: 'EQ-007',
    name: 'Rode Wireless GO II',
    category: 'Audio',
    brand: 'Rode',
    model: 'Wireless GO II',
    description: 'Compact wireless microphone system perfect for interviews, vlogs, and mobile content creation.',
    specs: {
      'Channels': '2',
      'Range': 'Up to 200m',
      'Battery': 'Up to 7 hours',
      'Recording': 'On-board 32-bit float',
      'Connectivity': 'USB-C',
    },
    available: 4,
    total: 8,
    condition: 'excellent',
    location: 'Building B, Audio Studio',
  },
  {
    id: 'EQ-008',
    name: 'Epson PowerLite Projector',
    category: 'Projector',
    brand: 'Epson',
    model: 'PowerLite 2250U',
    description: 'High-brightness projector suitable for presentations in large lecture halls and conference rooms.',
    specs: {
      'Brightness': '5000 lumens',
      'Resolution': 'WUXGA (1920x1200)',
      'Contrast': '15000:1',
      'Lamp Life': 'Up to 12000 hours',
      'Connectivity': 'HDMI, VGA, USB, Wireless',
    },
    available: 5,
    total: 8,
    condition: 'good',
    location: 'Building C, Equipment Room',
  },
  {
    id: 'EQ-009',
    name: 'DJI Ronin RS3',
    category: 'Video',
    brand: 'DJI',
    model: 'Ronin RS3',
    description: 'Professional camera gimbal stabilizer for smooth video production and filmmaking.',
    specs: {
      'Payload': 'Up to 3kg',
      'Battery': 'Up to 12 hours',
      'Tilt Range': '-95° to 240°',
      'Weight': '1.3kg',
      'Modes': '3-axis stabilization',
    },
    available: 3,
    total: 6,
    condition: 'excellent',
    location: 'Building B, Media Lab',
  },
  {
    id: 'EQ-010',
    name: 'Wacom Cintiq Pro 24',
    category: 'Accessories',
    brand: 'Wacom',
    model: 'Cintiq Pro 24',
    description: 'Professional pen display for digital artists, designers, and illustrators.',
    specs: {
      'Screen Size': '24 inches',
      'Resolution': '4K (3840x2160)',
      'Color Accuracy': '99% Adobe RGB',
      'Pen Pressure': '8192 levels',
      'Touch': 'Multi-touch support',
    },
    available: 2,
    total: 4,
    condition: 'excellent',
    location: 'Building D, Design Lab',
  },
  {
    id: 'EQ-011',
    name: 'GoPro HERO 12',
    category: 'Camera',
    brand: 'GoPro',
    model: 'HERO 12 Black',
    description: 'Rugged action camera for capturing adventures and dynamic footage.',
    specs: {
      'Video': '5.3K60 / 4K120',
      'Sensor': '27MP',
      'Stabilization': 'HyperSmooth 6.0',
      'Waterproof': 'Up to 10m',
      'Battery': 'Up to 70 min',
    },
    available: 7,
    total: 12,
    condition: 'good',
    location: 'Building B, Media Lab',
  },
  {
    id: 'EQ-012',
    name: 'Microsoft Surface Pro 9',
    category: 'Tablet',
    brand: 'Microsoft',
    model: 'Surface Pro 9',
    description: '2-in-1 laptop and tablet perfect for versatile work and study environments.',
    specs: {
      'Processor': 'Intel Core i7',
      'RAM': '16GB',
      'Storage': '256GB SSD',
      'Display': '13" PixelSense',
      'Battery': 'Up to 15.5 hours',
    },
    available: 6,
    total: 10,
    condition: 'excellent',
    location: 'Building A, Room 102',
  },
];

export function getEquipmentById(id) {
  return equipmentData.find((e) => e.id === id);
}

export function searchEquipment({ query, status }) {
  const q = (query ?? "").toLowerCase();
  return equipmentData
    .filter((e) =>
      !q ||
      e.name.toLowerCase().includes(q) ||
      e.brand.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q)
    )
    .map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      status: e.available > 0 ? "Available" : "Unavailable",
    }))
    .filter((e) => (status ? e.status === status : true));
}

export function listCheckoutEligible(search) {
  const q = search.toLowerCase();
  return equipmentData
    .filter((e) => e.available > 0)
    .filter((e) => !q || e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q))
    .map((e) => ({ id: e.id, name: e.name, description: e.description, status: "Available" }));
}

export function listActiveCheckouts() {
  return [
    { checkoutId: "CO-1001", equipmentName: "Canon EOS M50", checkedOutAt: "2025-10-28", dueDate: "2025-11-11" },
    { checkoutId: "CO-1002", equipmentName: "Dell XPS 15", checkedOutAt: "2025-10-30", dueDate: "2025-11-06" },
  ];
}

export function listCheckoutHistory(query) {
  const rows = [
    { id: "H-1", item: "MacBook Pro 16\"", outAt: "2025-09-01", returnedAt: "2025-09-10", status: "Returned" },
    { id: "H-2", item: "Sony A7 III Camera", outAt: "2025-10-10", returnedAt: null, status: "On loan" },
    { id: "H-3", item: "Epson PowerLite Projector", outAt: "2025-08-01", returnedAt: "2025-08-05", status: "Returned" },
  ];
  const q = (query ?? "").toLowerCase();
  return rows.filter((r) => !q || r.item.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
}

export function listNotifications() {
  return [
    { id: "N-1", title: "Due soon: Dell XPS 15", description: "Return by Nov 6, 2025", time: "2h ago" },
    { id: "N-2", title: "Checkout approved", description: "MacBook Pro 16\" request approved", time: "1d ago" },
    { id: "N-3", title: "System maintenance", description: "Portal maintenance on Nov 8, 1-3 AM", time: "3d ago" },
  ];
}


