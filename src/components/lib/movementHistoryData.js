/**
 * Device Movement History Data
 * Mock fallbacks + helpers to build timeline rows from checkout transactions
 */

const CAMPUS_COORDS = { lat: -1.9554801, lng: 30.1042722 };
const MAIN_STORAGE_LABEL = "Main Storage";

function formatMovementLocation(tx, eventType) {
  if (eventType === "return") {
    const back = (tx.returnLocation || tx.equipment?.location || "").toString().trim();
    if (!back) return MAIN_STORAGE_LABEL;
    const shortBack = back.split(" (")[0].trim();
    return shortBack || MAIN_STORAGE_LABEL;
  }
  const raw = (tx.destination || tx.location || "").toString().trim();
  if (!raw) return MAIN_STORAGE_LABEL;
  const shortDest = raw.split(" (")[0].trim();
  if (shortDest && shortDest !== raw) {
    const roomMatch = shortDest.match(/(?:room|rm\.?)\s*([a-z0-9-]+)/i);
    if (roomMatch) return `Room ${roomMatch[1]}`;
    return shortDest;
  }
  const roomMatch = raw.match(/(?:room|rm\.?)\s*([a-z0-9-]+)/i);
  if (roomMatch) return `Room ${roomMatch[1]}`;
  const leadingRoom = raw.match(/^([a-z0-9-]+)\s*\(/i);
  if (leadingRoom && /^\d{2,4}$/i.test(leadingRoom[1])) return `Room ${leadingRoom[1]}`;
  if (raw.length > 42) return `${raw.slice(0, 40)}…`;
  return raw;
}

function resolveBorrowerName(tx) {
  return (
    tx.user?.fullName ||
    tx.user?.username ||
    tx.user?.email ||
    tx.borrowerName ||
    "Unknown user"
  );
}

/** One row per transaction id */
export function dedupeTransactions(transactions = []) {
  const map = new Map();
  (Array.isArray(transactions) ? transactions : []).forEach((tx) => {
    const id = tx?._id || tx?.id;
    if (id != null) map.set(String(id), tx);
  });
  return [...map.values()];
}

export function dedupeMovements(movements = []) {
  const map = new Map();
  for (const m of movements) {
    const key = m.id || `${m.eventType}|${m.timestamp}|${m.userName}|${m.location}`;
    if (!map.has(key)) map.set(key, m);
  }
  return [...map.values()].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function transactionsToMovements(transactions = [], deviceName = "Equipment") {
  const movements = [];
  const seen = new Set();

  dedupeTransactions(transactions).forEach((tx, idx) => {
    const txKey = String(tx._id || tx.id || idx);
    const userName = resolveBorrowerName(tx);
    const statusNorm = String(tx.status || "")
      .toLowerCase()
      .replace(/-/g, " ");
    const checkoutAt = tx.checkoutTime || tx.checkoutDate || tx.createdAt;
    const returnAt = tx.returnTime || tx.returnDate || tx.actualReturnDate;
    const isReturned = statusNorm === "returned" || statusNorm === "return";
    const isOverdue = statusNorm === "overdue";
    const isCheckedOut =
      statusNorm === "checked out" ||
      (statusNorm.includes("checked") && statusNorm.includes("out"));

    if (checkoutAt) {
      const id = `checkout-${txKey}`;
      if (!seen.has(id)) {
        seen.add(id);
        const dest = formatMovementLocation(tx, "checkout");
        movements.push({
          id,
          timestamp: checkoutAt,
          location: dest,
          coordinates: CAMPUS_COORDS,
          eventType: "checkout",
          userId: tx.user?._id || tx.userId,
          userName,
          action: `Checked out by ${userName} → ${dest}`,
          duration: null,
          status: isCheckedOut || isOverdue ? "active" : "completed",
          deviceName,
        });
      }
    }

    if (returnAt || isReturned) {
      const id = `return-${txKey}`;
      if (!seen.has(id)) {
        seen.add(id);
        const loc = formatMovementLocation(tx, "return");
        movements.push({
          id,
          timestamp: returnAt || tx.updatedAt || checkoutAt,
          location: loc,
          coordinates: CAMPUS_COORDS,
          eventType: "return",
          userId: tx.user?._id || tx.userId,
          userName,
          action: `Returned by ${userName} → ${loc}`,
          duration: null,
          status: "completed",
          deviceName,
        });
      }
    }

    if (isOverdue && checkoutAt) {
      const id = `overdue-${txKey}`;
      if (!seen.has(id)) {
        seen.add(id);
        const dest = formatMovementLocation(tx, "checkout");
        movements.push({
          id,
          timestamp: tx.updatedAt || checkoutAt,
          location: dest,
          coordinates: CAMPUS_COORDS,
          eventType: "geofence_violation",
          userId: tx.user?._id || tx.userId,
          userName,
          action: `Overdue — ${userName} has not returned the item`,
          duration: null,
          status: "violation",
          severity: "medium",
          deviceName,
        });
      }
    }
  });

  return dedupeMovements(movements);
}

/** Merge history + active loans, build timeline, optional storage baseline */
export function buildEquipmentMovementTimeline({
  transactions = [],
  deviceName = "Equipment",
  includeStorageBaseline = true,
}) {
  const loanEvents = transactionsToMovements(dedupeTransactions(transactions), deviceName);
  const hasLoanActivity = loanEvents.some(
    (m) => m.eventType === "checkout" || m.eventType === "return" || m.eventType === "geofence_violation"
  );

  if (hasLoanActivity) {
    return dedupeMovements(loanEvents);
  }

  if (includeStorageBaseline) {
    return buildMainStoragePlaceholderMovements(deviceName);
  }

  return [];
}

export function computeMovementStats(movements = []) {
  return {
    totalMovements: movements.length,
    checkouts: movements.filter((m) => m.eventType === "checkout").length,
    returns: movements.filter((m) => m.eventType === "return").length,
    violations: movements.filter((m) => m.eventType === "geofence_violation").length,
    activeCheckouts: movements.filter((m) => m.status === "active").length,
    lastMovement: movements.length > 0 ? movements[0].timestamp : null,
    uniqueLocations: new Set(movements.map((m) => m.location)).size,
  };
}

export function filterTransactionsForEquipment(transactions, equipmentId, equipmentName = "") {
  const target = String(equipmentId || "");
  const nameLower = String(equipmentName || "").toLowerCase().trim();
  return (Array.isArray(transactions) ? transactions : []).filter((tx) => {
    const txEqId =
      tx.equipment?._id ||
      tx.equipment?.id ||
      tx.equipmentId ||
      tx.equipment_id;
    if (txEqId != null && String(txEqId) === target) return true;
    const txName = String(tx.equipment?.name || "").toLowerCase().trim();
    if (nameLower && txName && txName === nameLower) return true;
    return false;
  });
}

/** Shown when there are no checkout/return records yet — equipment is still in storage */
export function buildMainStoragePlaceholderMovements(deviceName = "Equipment") {
  return [
    {
      id: "main-storage",
      timestamp: new Date().toISOString(),
      location: "Main Storage",
      coordinates: CAMPUS_COORDS,
      eventType: "storage",
      userId: null,
      userName: "—",
      action: "In main storage — not checked out yet",
      duration: null,
      status: "completed",
      deviceName,
    },
  ];
}

// Generate movement history for a device
export function getDeviceMovementHistory(deviceId) {
  // Mock movement history data
  const allMovements = {
    "TTGO-001": [
      {
        id: "M-001",
        timestamp: "2025-01-15T08:30:00Z",
        location: "Computer Lab A - Room 204",
        coordinates: { lat: -1.945, lng: 30.089 },
        eventType: "checkout",
        userId: "U-123",
        userName: "John Doe",
        action: "Checked out by student",
        duration: null,
        status: "active",
      },
      {
        id: "M-002",
        timestamp: "2025-01-15T09:15:00Z",
        location: "Building A - Hallway",
        coordinates: { lat: -1.9445, lng: 30.0895 },
        eventType: "movement",
        userId: "U-123",
        userName: "John Doe",
        action: "Moved to hallway",
        duration: "45 minutes",
        status: "active",
      },
      {
        id: "M-003",
        timestamp: "2025-01-15T10:00:00Z",
        location: "Lecture Hall B - Room 301",
        coordinates: { lat: -1.944, lng: 30.09 },
        eventType: "movement",
        userId: "U-123",
        userName: "John Doe",
        action: "Moved to lecture hall",
        duration: "45 minutes",
        status: "active",
      },
      {
        id: "M-004",
        timestamp: "2025-01-15T12:30:00Z",
        location: "Parking Lot - Building C",
        coordinates: { lat: -1.946, lng: 30.088 },
        eventType: "geofence_violation",
        userId: "U-123",
        userName: "John Doe",
        action: "Geofence violation - Left authorized zone",
        duration: "2.5 hours",
        status: "violation",
        severity: "high",
      },
      {
        id: "M-005",
        timestamp: "2025-01-15T14:00:00Z",
        location: "Computer Lab A - Room 204",
        coordinates: { lat: -1.945, lng: 30.089 },
        eventType: "return",
        userId: "U-123",
        userName: "John Doe",
        action: "Returned to original location",
        duration: "1.5 hours",
        status: "resolved",
      },
      {
        id: "M-006",
        timestamp: "2025-01-14T09:00:00Z",
        location: "Computer Lab A - Room 204",
        coordinates: { lat: -1.945, lng: 30.089 },
        eventType: "checkout",
        userId: "U-456",
        userName: "Jane Smith",
        action: "Checked out by student",
        duration: null,
        status: "completed",
      },
      {
        id: "M-007",
        timestamp: "2025-01-14T11:30:00Z",
        location: "Library Zone - Study Area",
        coordinates: { lat: -1.943, lng: 30.091 },
        eventType: "movement",
        userId: "U-456",
        userName: "Jane Smith",
        action: "Moved to library",
        duration: "2.5 hours",
        status: "completed",
      },
      {
        id: "M-008",
        timestamp: "2025-01-14T16:00:00Z",
        location: "Computer Lab A - Room 204",
        coordinates: { lat: -1.945, lng: 30.089 },
        eventType: "return",
        userId: "U-456",
        userName: "Jane Smith",
        action: "Returned equipment",
        duration: "4.5 hours",
        status: "completed",
      },
    ],
    "TTGO-002": [
      {
        id: "M-101",
        timestamp: "2025-01-15T07:00:00Z",
        location: "Library Zone - Room 206",
        coordinates: { lat: -1.943, lng: 30.091 },
        eventType: "checkout",
        userId: "U-789",
        userName: "Alice Johnson",
        action: "Checked out by student",
        duration: null,
        status: "active",
      },
      {
        id: "M-102",
        timestamp: "2025-01-15T08:00:00Z",
        location: "Unknown Location",
        coordinates: { lat: -1.940, lng: 30.095 },
        eventType: "geofence_violation",
        userId: "U-789",
        userName: "Alice Johnson",
        action: "Geofence violation - Signal lost",
        duration: "1 hour",
        status: "violation",
        severity: "critical",
      },
      {
        id: "M-103",
        timestamp: "2025-01-15T09:30:00Z",
        location: "Admin Building - Floor 2",
        coordinates: { lat: -1.942, lng: 30.092 },
        eventType: "geofence_violation",
        userId: "U-789",
        userName: "Alice Johnson",
        action: "Unauthorized entry into restricted zone",
        duration: "1.5 hours",
        status: "violation",
        severity: "high",
      },
      {
        id: "M-104",
        timestamp: "2025-01-15T11:00:00Z",
        location: "Library Zone - Room 206",
        coordinates: { lat: -1.943, lng: 30.091 },
        eventType: "return",
        userId: "U-789",
        userName: "Alice Johnson",
        action: "Returned to authorized zone",
        duration: "4 hours",
        status: "resolved",
      },
    ],
    "TTGO-003": [
      {
        id: "M-201",
        timestamp: "2025-01-15T06:00:00Z",
        location: "Store Room - Room 208",
        coordinates: { lat: -1.946, lng: 30.087 },
        eventType: "checkout",
        userId: "U-321",
        userName: "Bob Wilson",
        action: "Checked out by student",
        duration: null,
        status: "active",
      },
      {
        id: "M-202",
        timestamp: "2025-01-15T07:30:00Z",
        location: "Workshop Area - Building D",
        coordinates: { lat: -1.947, lng: 30.088 },
        eventType: "movement",
        userId: "U-321",
        userName: "Bob Wilson",
        action: "Moved to workshop",
        duration: "1.5 hours",
        status: "active",
      },
      {
        id: "M-203",
        timestamp: "2025-01-15T10:00:00Z",
        location: "Store Room - Room 208",
        coordinates: { lat: -1.946, lng: 30.087 },
        eventType: "return",
        userId: "U-321",
        userName: "Bob Wilson",
        action: "Returned equipment",
        duration: "4 hours",
        status: "completed",
      },
    ],
    "EQ-001": [
      {
        id: "M-301",
        timestamp: "2025-01-15T08:00:00Z",
        location: "Building A, Room 101",
        coordinates: { lat: -1.945, lng: 30.089 },
        eventType: "checkout",
        userId: "U-111",
        userName: "Sarah Connor",
        action: "Checked out by student",
        duration: null,
        status: "active",
      },
      {
        id: "M-302",
        timestamp: "2025-01-15T09:30:00Z",
        location: "Computer Lab A - Room 204",
        coordinates: { lat: -1.945, lng: 30.089 },
        eventType: "movement",
        userId: "U-111",
        userName: "Sarah Connor",
        action: "Moved to computer lab",
        duration: "1.5 hours",
        status: "active",
      },
      {
        id: "M-303",
        timestamp: "2025-01-15T14:00:00Z",
        location: "Building A, Room 101",
        coordinates: { lat: -1.945, lng: 30.089 },
        eventType: "return",
        userId: "U-111",
        userName: "Sarah Connor",
        action: "Returned equipment",
        duration: "6 hours",
        status: "completed",
      },
    ],
    "EQ-002": [
      {
        id: "M-401",
        timestamp: "2025-01-15T07:00:00Z",
        location: "Room 101",
        coordinates: { lat: -1.945, lng: 30.089 },
        eventType: "checkout",
        userId: "U-222",
        userName: "Mike Johnson",
        action: "Checked out by student",
        duration: null,
        status: "active",
      },
      {
        id: "M-402",
        timestamp: "2025-01-15T10:00:00Z",
        location: "Lecture Hall B - Room 301",
        coordinates: { lat: -1.944, lng: 30.09 },
        eventType: "movement",
        userId: "U-222",
        userName: "Mike Johnson",
        action: "Moved to lecture hall",
        duration: "3 hours",
        status: "active",
      },
    ],
  };

  return allMovements[deviceId] || [];
}

// Get all movements for all devices (for overview page)
export function getAllDeviceMovements(filters = {}) {
  const allMovements = [];
  
  // Get movements for all known devices
  const deviceIds = [
    "TTGO-001", "TTGO-002", "TTGO-003", "TTGO-004", "TTGO-005", "TTGO-006",
    "EQ-001", "EQ-002", "EQ-003", "EQ-004", "EQ-005"
  ];
  
  deviceIds.forEach(deviceId => {
    const movements = getDeviceMovementHistory(deviceId);
    movements.forEach(movement => {
      allMovements.push({
        ...movement,
        deviceId,
        deviceName: getDeviceName(deviceId),
      });
    });
  });

  // Apply filters
  let filtered = allMovements;
  
  if (filters.deviceId) {
    filtered = filtered.filter(m => m.deviceId === filters.deviceId);
  }
  
  if (filters.eventType) {
    filtered = filtered.filter(m => m.eventType === filters.eventType);
  }
  
  if (filters.startDate) {
    filtered = filtered.filter(m => new Date(m.timestamp) >= new Date(filters.startDate));
  }
  
  if (filters.endDate) {
    filtered = filtered.filter(m => new Date(m.timestamp) <= new Date(filters.endDate));
  }
  
  if (filters.status) {
    filtered = filtered.filter(m => m.status === filters.status);
  }

  // Sort by timestamp (newest first)
  return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Helper function to get device name
function getDeviceName(deviceId) {
  const deviceNames = {
    "TTGO-001": "Projector",
    "TTGO-002": "TV Remote",
    "TTGO-003": "Extension Cable",
    "TTGO-004": "TV Remote",
    "TTGO-005": "Apple TV Remote",
    "TTGO-006": "Projector 2",
    "EQ-001": "MacBook Pro 16\"",
    "EQ-002": "Dell XPS 15",
    "EQ-003": "iPad Pro 12.9\"",
    "EQ-004": "Canon EOS R5",
    "EQ-005": "Sony A7III",
  };
  return deviceNames[deviceId] || "Unknown Device";
}

// Get movement statistics for a device
export function getDeviceMovementStats(deviceId) {
  const movements = getDeviceMovementHistory(deviceId);
  
  const stats = {
    totalMovements: movements.length,
    checkouts: movements.filter(m => m.eventType === "checkout").length,
    returns: movements.filter(m => m.eventType === "return").length,
    violations: movements.filter(m => m.eventType === "geofence_violation").length,
    activeCheckouts: movements.filter(m => m.status === "active").length,
    lastMovement: movements.length > 0 ? movements[0].timestamp : null,
    uniqueLocations: new Set(movements.map(m => m.location)).size,
  };
  
  return stats;
}

