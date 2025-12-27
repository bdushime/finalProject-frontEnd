export const categories = [
  'All Categories',
  'Projector',
  'Remote',
  'Accessories',
];

export const equipmentData = [
  {
    id: 'PRJ-001',
    name: 'Epson PowerLite 2250U',
    category: 'Projector',
    brand: 'Epson',
    model: 'PowerLite 2250U',
    description: 'High-brightness projector suitable for presentations in large lecture halls and conference rooms.',
    specs: {
      Brightness: '5000 lumens',
      Resolution: 'WUXGA (1920x1200)',
      Contrast: '15000:1',
      'Lamp Life': 'Up to 12000 hours',
      Connectivity: 'HDMI, VGA, USB, Wireless',
    },
    available: 5,
    total: 8,
    condition: 'good',
    location: 'Building C, Equipment Room',
  },
  {
    id: 'PRJ-002',
    name: 'BenQ LU960',
    category: 'Projector',
    brand: 'BenQ',
    model: 'LU960',
    description: 'Installation-grade laser projector for classrooms and lecture theatres.',
    specs: {
      Brightness: '6000 lumens',
      Resolution: 'WUXGA (1920x1200)',
      Contrast: '10000:1',
      'Lamp Life': 'Up to 20000 hours',
      Connectivity: 'HDMI, DisplayPort, HDBaseT',
    },
    available: 3,
    total: 5,
    condition: 'good',
    location: 'Building C, AV Closet',
  },
  {
    id: 'PRJ-003',
    name: 'Optoma EH412ST',
    category: 'Projector',
    brand: 'Optoma',
    model: 'EH412ST',
    description: 'Short-throw projector ideal for small classrooms and labs.',
    specs: {
      Brightness: '4500 lumens',
      Resolution: '1080p',
      Contrast: '20000:1',
      'Lamp Life': 'Up to 15000 hours',
      Connectivity: 'HDMI, VGA, USB',
    },
    available: 4,
    total: 6,
    condition: 'excellent',
    location: 'Building C, Room 201',
  },
  {
    id: 'REM-001',
    name: 'Projector Remote - Standard',
    category: 'Remote',
    brand: 'Generic',
    model: 'Std-Remote',
    description: 'Standard infrared remote compatible with most classroom projectors.',
    specs: { Battery: '2x AAA', Connectivity: 'Infrared' },
    available: 15,
    total: 20,
    condition: 'good',
    location: 'Building C, Equipment Room',
  },
  {
    id: 'REM-002',
    name: 'Wireless Presenter Remote',
    category: 'Remote',
    brand: 'LogiTech',
    model: 'Presenter R700',
    description: 'Wireless presenter with laser pointer and long-range connectivity.',
    specs: { Range: '30m', Battery: 'AA', Connectivity: '2.4GHz USB' },
    available: 8,
    total: 10,
    condition: 'excellent',
    location: 'Building C, Equipment Room',
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


