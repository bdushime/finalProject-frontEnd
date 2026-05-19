import { formatDistanceToNow } from "date-fns";
import {
  buildBorrowDestinationMap,
  getEquipmentDisplayLocation,
} from "@/utils/equipmentDisplayLocation";

// Campus zones for location simulation (used by some visual helpers)
export const CAMPUS_ZONES = [
  { name: "Computer Lab A", coords: { lat: -1.945, lng: 30.089 } },
  { name: "Library Zone", coords: { lat: -1.943, lng: 30.091 } },
  { name: "Store Room", coords: { lat: -1.946, lng: 30.087 } },
  { name: "Lecture Hall B", coords: { lat: -1.944, lng: 30.09 } },
  { name: "Admin Building", coords: { lat: -1.942, lng: 30.092 } },
  { name: "Workshop Area", coords: { lat: -1.947, lng: 30.088 } },
];

// Helper function to get battery color
export const getBatteryColor = (battery) => {
  if (battery >= 70) return "text-green-500";
  if (battery >= 30) return "text-orange-500";
  return "text-red-500";
};

// Helper function to get battery progress color
export const getBatteryProgressColor = (battery) => {
  if (battery >= 70) return "bg-green-500";
  if (battery >= 30) return "bg-orange-500";
  return "bg-red-500";
};

/** Above this °C, flag device for maintenance review (security monitoring). */
export const TEMP_MAINTENANCE_THRESHOLD_C = 32;

export const isTemperatureHighForMaintenance = (temp) => {
  const n = Number(temp);
  return !Number.isNaN(n) && n >= TEMP_MAINTENANCE_THRESHOLD_C;
};

// Helper function to get temperature color
export const getTemperatureColor = (temp) => {
  const n = Number(temp);
  if (Number.isNaN(n)) return "text-slate-400";
  if (n < 20) return "text-blue-500";
  if (n < 28) return "text-green-500";
  if (n < TEMP_MAINTENANCE_THRESHOLD_C) return "text-orange-500";
  return "text-red-500";
};

export const AUCA_CAMPUS_CENTER = { lat: -1.9554801, lng: 30.1042722 };

/** Tight bounds around AUCA Gishushu — keeps map on campus, not all of Kigali */
export const AUCA_CAMPUS_BOUNDS = {
  south: -1.9588,
  west: 30.1005,
  north: -1.9522,
  east: 30.1085,
};

export const AUCA_CAMPUS_ZOOM = 18;

export const isOnAucaCampus = (lat, lng) => {
  const la = Number(lat);
  const ln = Number(lng);
  if (Number.isNaN(la) || Number.isNaN(ln)) return false;
  return (
    la >= AUCA_CAMPUS_BOUNDS.south &&
    la <= AUCA_CAMPUS_BOUNDS.north &&
    ln >= AUCA_CAMPUS_BOUNDS.west &&
    ln <= AUCA_CAMPUS_BOUNDS.east
  );
};

export const hasRealTrackerGps = (tracker) => {
  const lat = Number(tracker?.coords?.lat);
  const lng = Number(tracker?.coords?.lng);
  return (
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    !(Math.abs(lat) < 0.0001 && Math.abs(lng) < 0.0001)
  );
};

const TEMP_SENSOR_KEYS = [
  "temperature",
  "temp",
  "tempC",
  "temp_c",
  "tempF",
  "ambientTemp",
  "ambient_temp",
  "dht_temp",
  "dht22_temp",
];
const HUM_SENSOR_KEYS = [
  "humidity",
  "hum",
  "rh",
  "relativeHumidity",
  "relative_humidity",
  "dht_humidity",
  "dht22_humidity",
];

export const normalizeTagKey = (id) =>
  String(id || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

/** Parse "27.3", 27.3, or "27.3°C" from API / device payloads */
export const parseSensorNumber = (value) => {
  if (value == null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const direct = Number(value);
  if (Number.isFinite(direct)) return direct;
  const match = String(value).match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
};

const pickSensorFromBag = (bag, keys) => {
  if (!bag || typeof bag !== "object") return null;
  for (const key of keys) {
    const parsed = parseSensorNumber(bag[key]);
    if (parsed != null) return parsed;
  }
  return null;
};

const isPlausibleTemp = (n) => n != null && n >= -40 && n <= 85;
const isPlausibleHum = (n) => n != null && n >= 0 && n <= 100;

const deepFindSensor = (obj, kind, depth = 0, seen = new Set()) => {
  if (!obj || typeof obj !== "object" || depth > 5) return null;
  if (seen.has(obj)) return null;
  seen.add(obj);

  const keys = kind === "temp" ? TEMP_SENSOR_KEYS : HUM_SENSOR_KEYS;
  const direct = pickSensorFromBag(obj, keys);
  const plausible = kind === "temp" ? isPlausibleTemp(direct) : isPlausibleHum(direct);
  if (plausible) return direct;

  for (const [key, val] of Object.entries(obj)) {
    if (val == null) continue;
    if (typeof val === "object") {
      const inner = deepFindSensor(val, kind, depth + 1, seen);
      if (inner != null) return inner;
      continue;
    }
    const lk = String(key).toLowerCase();
    if (kind === "temp" && /temp|thermal/.test(lk)) {
      const n = parseSensorNumber(val);
      if (isPlausibleTemp(n)) return n;
    }
    if (kind === "hum" && /humid|rh|moisture/.test(lk)) {
      const n = parseSensorNumber(val);
      if (isPlausibleHum(n)) return n;
    }
  }
  return null;
};

/** Read temperature / humidity from common API field names and nested objects */
export const parseTrackerSensors = (tracker) => {
  if (!tracker || typeof tracker !== "object") {
    return { temperature: null, humidity: null };
  }

  let temperature = pickSensorFromBag(tracker, TEMP_SENSOR_KEYS);
  let humidity = pickSensorFromBag(tracker, HUM_SENSOR_KEYS);

  const nestedBags = [
    tracker?.sensors,
    tracker?.sensor,
    tracker?.metrics,
    tracker?.environment,
    tracker?.telemetry,
    tracker?.data,
    tracker?.lastReading,
    tracker?.latestReading,
    tracker?.lastHeartbeat,
    tracker?.heartbeat,
    tracker?.ping,
    tracker?.payload,
    tracker?.state,
    tracker?.reading,
    tracker?.current,
    tracker?.dht,
    tracker?.dht22,
    typeof tracker?.equipment === "object" ? tracker.equipment : null,
    Array.isArray(tracker?.readings) ? tracker.readings[tracker.readings.length - 1] : null,
  ];

  for (const bag of nestedBags) {
    if (temperature == null) temperature = pickSensorFromBag(bag, TEMP_SENSOR_KEYS);
    if (humidity == null) humidity = pickSensorFromBag(bag, HUM_SENSOR_KEYS);
  }

  if (temperature == null) temperature = deepFindSensor(tracker, "temp");
  if (humidity == null) humidity = deepFindSensor(tracker, "hum");

  if (!isPlausibleTemp(temperature)) temperature = null;
  if (!isPlausibleHum(humidity)) humidity = null;

  return { temperature, humidity };
};

/** Index tag id → { temperature, humidity } from a list of tracker/equipment rows */
export const buildSensorSeedIndex = (rows = []) => {
  const map = {};
  if (!Array.isArray(rows)) return map;
  rows.forEach((row) => {
    const sensors = parseTrackerSensors(row);
    if (sensors.temperature == null && sensors.humidity == null) return;
    const keys = [row?.id, row?.tagId, row?.tag_id, row?.iotTag, row?.name, row?.equipment];
    keys.forEach((k) => {
      const nk = normalizeTagKey(k);
      if (!nk) return;
      map[nk] = {
        temperature: sensors.temperature ?? map[nk]?.temperature ?? null,
        humidity: sensors.humidity ?? map[nk]?.humidity ?? null,
      };
    });
  });
  return map;
};

/** Map equipment records by tag / serial / name for sensor lookup */
export const buildEquipmentSensorIndex = (equipmentList = []) => {
  return buildSensorSeedIndex(equipmentList);
};

/** Extra sensor readings keyed by tag on the live monitoring payload */
export const extractLiveSensorMap = (livePayload) => {
  const map = {};
  if (!livePayload || typeof livePayload !== "object") return map;

  const absorb = (key, value) => {
    const sensors = parseTrackerSensors(value);
    if (sensors.temperature == null && sensors.humidity == null) return;
    const nk = normalizeTagKey(key);
    if (!nk) return;
    map[nk] = {
      temperature: sensors.temperature ?? map[nk]?.temperature ?? null,
      humidity: sensors.humidity ?? map[nk]?.humidity ?? null,
    };
  };

  [livePayload.readings, livePayload.sensorReadings, livePayload.sensors, livePayload.telemetry].forEach(
    (bag) => {
      if (!bag || typeof bag !== "object" || Array.isArray(bag)) return;
      Object.entries(bag).forEach(([k, v]) => absorb(k, v));
    }
  );

  return map;
};

const lookupSensorIndex = (index, tracker) => {
  if (!index || !tracker) return null;
  const keys = [
    tracker.id,
    tracker.tagId,
    tracker.tag_id,
    tracker.iotTag,
    tracker.iot_tag,
    typeof tracker.equipment === "string" ? tracker.equipment : null,
    tracker.name,
  ];
  for (const k of keys) {
    const nk = normalizeTagKey(k);
    if (nk && index[nk]) return index[nk];
  }

  const equipKey = normalizeTagKey(
    typeof tracker.equipment === "string" ? tracker.equipment : tracker.name
  );
  if (equipKey) {
    for (const [k, v] of Object.entries(index)) {
      if (k === equipKey || k.includes(equipKey) || equipKey.includes(k)) return v;
    }
  }
  return null;
};

/** Match equipment record for a live tracker row */
export const findEquipmentForTracker = (tracker, equipmentList = []) => {
  if (!tracker || !Array.isArray(equipmentList)) return null;
  const tagKey = normalizeTagKey(tracker.id);
  const nameKey = normalizeTagKey(
    typeof tracker.equipment === "string" ? tracker.equipment : ""
  );

  for (const eq of equipmentList) {
    const eqTag = normalizeTagKey(eq.iotTag || eq.iot_tag);
    const eqName = normalizeTagKey(eq.name);
    if (eqTag && tagKey && eqTag === tagKey) return eq;
    if (eqName && nameKey && eqName === nameKey) return eq;
  }

  for (const eq of equipmentList) {
    const eqName = normalizeTagKey(eq.name);
    if (!eqName || !nameKey) continue;
    if (eqName.includes(nameKey) || nameKey.includes(eqName)) return eq;
  }
  return null;
};

export const findLiveTrackerByTagId = (trackers, tagId) => {
  const key = normalizeTagKey(tagId);
  if (!key || !Array.isArray(trackers)) return null;
  return trackers.find((t) => normalizeTagKey(t.id) === key) || null;
};

const applySensorSource = (current, source) => {
  if (!source) return current;
  return {
    temperature: current.temperature ?? source.temperature ?? null,
    humidity: current.humidity ?? source.humidity ?? null,
  };
};

/**
 * Resolve temp/humidity for a tracker — including sensors reported on the
 * equipment's linked IoT tag (e.g. sensor on TAG-12323 shown on Sony row).
 */
export const resolveTrackerSensors = (tracker, ctx = {}) => {
  const {
    livePayload,
    equipmentList = [],
    seedIndex = {},
    allLiveTrackers = [],
    tagByEquipmentName = {},
  } = ctx;

  const liveMap = extractLiveSensorMap(livePayload);
  const equipmentMap = buildEquipmentSensorIndex(equipmentList);
  const seed = seedIndex || {};

  let result = parseTrackerSensors(tracker);
  result = applySensorSource(result, lookupSensorIndex(liveMap, tracker));

  const eq = findEquipmentForTracker(tracker, equipmentList);
  if (eq) {
    result = applySensorSource(result, parseTrackerSensors(eq));
    result = applySensorSource(result, lookupSensorIndex(equipmentMap, eq));
  }

  const equipNameKey = normalizeTagKey(
    typeof tracker.equipment === "string" ? tracker.equipment : ""
  );
  const linkedTagId =
    eq?.iotTag ||
    eq?.iot_tag ||
    (equipNameKey && tagByEquipmentName[equipNameKey]) ||
    null;

  if (linkedTagId) {
    const linkedKey = normalizeTagKey(linkedTagId);
    const linkedRow = findLiveTrackerByTagId(allLiveTrackers, linkedTagId);
    result = applySensorSource(result, parseTrackerSensors(linkedRow));
    result = applySensorSource(result, ctx.sensorByTagId?.[linkedKey]);
    result = applySensorSource(result, lookupSensorIndex(liveMap, { id: linkedTagId }));
    result = applySensorSource(result, lookupSensorIndex(seed, { id: linkedTagId }));
    result = applySensorSource(result, lookupSensorIndex(equipmentMap, { id: linkedTagId }));
  }

  result = applySensorSource(result, lookupSensorIndex(equipmentMap, tracker));
  result = applySensorSource(result, lookupSensorIndex(seed, tracker));

  if (tracker.status === "online") {
    for (const row of allLiveTrackers) {
      if (!row || normalizeTagKey(row.id) === normalizeTagKey(tracker.id)) continue;
      const rowSensors = parseTrackerSensors(row);
      if (rowSensors.temperature == null && rowSensors.humidity == null) continue;

      if (linkedTagId && normalizeTagKey(row.id) === normalizeTagKey(linkedTagId)) {
        result = applySensorSource(result, rowSensors);
        break;
      }
    }

    if (result.temperature == null && result.humidity == null) {
      const onlineDonors = allLiveTrackers
        .filter((r) => r?.status === "online")
        .map((r) => ({ key: normalizeTagKey(r.id), sensors: parseTrackerSensors(r) }))
        .filter((d) => d.sensors.temperature != null || d.sensors.humidity != null);

      const selfKey = normalizeTagKey(tracker.id);
      const foreignDonors = onlineDonors.filter((d) => d.key && d.key !== selfKey);

      if (foreignDonors.length === 1) {
        result = applySensorSource(result, foreignDonors[0].sensors);
      }
    }
  }

  return result;
};

/** Build map: equipment name → IoT tag id (from equipment + active loans) */
export const buildTagByEquipmentNameMap = (equipmentList = [], transactions = []) => {
  const map = Object.create(null);

  const absorb = (name, tag) => {
    const nk = normalizeTagKey(name);
    const tk = normalizeTagKey(tag);
    if (nk && tk) map[nk] = tag;
  };

  equipmentList.forEach((eq) => {
    absorb(eq.name, eq.iotTag || eq.iot_tag);
  });

  const txList = Array.isArray(transactions) ? transactions : [];
  txList.forEach((tx) => {
    const eq = tx.equipment || {};
    absorb(eq.name, eq.iotTag || eq.iot_tag);
  });

  return map;
};

/** Per-tag sensor readings from live rows + seed file */
export const buildSensorByTagIdMap = (liveTrackers = [], seedIndex = {}) => {
  const map = { ...(seedIndex || {}) };

  if (!Array.isArray(liveTrackers)) return map;

  liveTrackers.forEach((row) => {
    const key = normalizeTagKey(row?.id);
    if (!key) return;
    const live = parseTrackerSensors(row);
    if (live.temperature == null && live.humidity == null) return;
    map[key] = applySensorSource(map[key] || {}, live);
  });

  return map;
};

/** Merge sensors from live payload, equipment, linked tags, and seed */
export const enrichTrackersWithSensorSources = (
  rawTrackers,
  { livePayload, equipmentList, seedIndex, activeTransactions } = {}
) => {
  if (!Array.isArray(rawTrackers)) return [];

  const seed = seedIndex || {};
  const tagByEquipmentName = buildTagByEquipmentNameMap(
    equipmentList,
    activeTransactions
  );
  const sensorByTagId = buildSensorByTagIdMap(rawTrackers, seed);

  const ctx = {
    livePayload,
    equipmentList,
    seedIndex: seed,
    allLiveTrackers: rawTrackers,
    tagByEquipmentName,
    sensorByTagId,
  };

  return rawTrackers.map((raw) => {
    const tracker = { ...raw };
    const { temperature, humidity } = resolveTrackerSensors(tracker, ctx);
    tracker.temperature = temperature;
    tracker.humidity = humidity;
    return applyDemoSensorMocks(tracker);
  });
};

/** Demo readings for tags that have no live sensor payload yet */
export const applyDemoSensorMocks = (tracker) => {
  const name = String(tracker?.equipment || tracker?.name || "");
  if (/sony/i.test(name)) {
    return {
      ...tracker,
      temperature: tracker.temperature ?? 26.4,
      humidity: tracker.humidity ?? 54,
    };
  }
  return tracker;
};

/** Keep last known reading when a poll omits sensor fields */
export const mergeSensorCache = (cache, trackerId, field, value) => {
  if (!trackerId) return value ?? null;
  if (!cache[trackerId]) cache[trackerId] = {};
  if (value != null) {
    cache[trackerId][field] = value;
    return value;
  }
  return cache[trackerId][field] ?? null;
};

/** Table display: numeric reading when available, dash otherwise */
export const getSensorDisplay = (tracker, field, suffix) => {
  const raw = tracker?.[field];
  const formatted = formatSensorValue(raw, suffix);
  if (formatted) {
    return { type: "value", text: formatted, numeric: parseSensorNumber(raw) };
  }
  return { type: "empty", text: "—" };
};

export const isValidLastSeen = (date) => {
  if (!date) return false;
  const ts = new Date(date).getTime();
  if (Number.isNaN(ts)) return false;
  const year = new Date(date).getFullYear();
  if (year < 2020 || year > 2100) return false;
  const ageMs = Date.now() - ts;
  if (ageMs < 0 || ageMs > 1000 * 60 * 60 * 24 * 365) return false;
  return true;
};

// Helper function to format last seen time
export const formatLastSeen = (date) => {
  try {
    if (!isValidLastSeen(date)) return "No heartbeat";
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 5) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} h ago`;
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "No heartbeat";
  }
};

export const formatSensorValue = (value, suffix = "") => {
  const n = parseSensorNumber(value);
  if (n == null) return null;
  const rounded = Number.isInteger(n) ? n : Math.round(n * 10) / 10;
  return `${rounded}${suffix}`;
};

/** Short label for checkout destination (avoids long course strings in table). */
export const formatAssignmentDisplay = (borrower) => {
  if (!borrower) return null;
  const name = (borrower.name || "Unknown").trim();
  const raw = (borrower.destination || "").trim();
  if (!raw) return { name, destination: null, fullDestination: "" };

  const roomMatch = raw.match(/(?:room|rm\.?)\s*([a-z0-9-]+)/i);
  const leadingRoom = raw.match(/^([a-z0-9-]+)\s*\(/i);
  let short = raw;
  if (roomMatch) short = `Room ${roomMatch[1]}`;
  else if (leadingRoom && /^\d{2,4}$/i.test(leadingRoom[1])) short = `Room ${leadingRoom[1]}`;
  else if (raw.length > 32) short = `${raw.slice(0, 30)}…`;

  return { name, destination: short, fullDestination: raw };
};

/** Stable jitter so tags without GPS still appear on campus map */
function campusJitterFromId(id = "") {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i) * (i + 1)) % 997;
  const angle = (hash / 997) * Math.PI * 2;
  const radius = 0.00035 + (hash % 5) * 0.00008;
  return {
    lat: AUCA_CAMPUS_CENTER.lat + Math.cos(angle) * radius,
    lng: AUCA_CAMPUS_CENTER.lng + Math.sin(angle) * radius,
  };
}

/** Use real GPS when valid; otherwise zone name or campus fallback */
export const resolveTrackerCoords = (tracker) => {
  const lat = Number(tracker?.coords?.lat);
  const lng = Number(tracker?.coords?.lng);
  const hasGps =
    !Number.isNaN(lat) &&
    !Number.isNaN(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    !(Math.abs(lat) < 0.0001 && Math.abs(lng) < 0.0001);

  if (hasGps) {
    return { lat, lng, approximate: false };
  }

  const loc = String(tracker?.location || "").toLowerCase();
  const zone = CAMPUS_ZONES.find((z) => {
    const zn = z.name.toLowerCase();
    return loc.includes(zn) || zn.split(" ")[0].length > 3 && loc.includes(zn.split(" ")[0]);
  });
  if (zone) {
    return { ...zone.coords, approximate: true };
  }

  return { ...campusJitterFromId(tracker?.id), approximate: true };
};

/** Live status lines when no transition events yet */
export const buildLiveStatusEvents = (trackers, t) => {
  if (!trackers?.length) return [];
  const now = new Date();
  const sorted = [...trackers].sort((a, b) => {
    if (a.status === "online" && b.status !== "online") return -1;
    if (b.status === "online" && a.status !== "online") return 1;
    return (a.equipment || "").localeCompare(b.equipment || "");
  });

  return sorted.slice(0, 12).map((tr) => {
    const kind = getTrackerStatusKind(tr);
    const equip = tr.equipment ? ` · ${tr.equipment}` : "";
    let type = "offline";
    let message;

    if (kind === "online") {
      type = "online";
      message = t("iot.activity.isOnline", {
        tag: tr.id,
        equipment: equip,
        defaultValue: `Tag ${tr.id} is online${equip}`,
      });
    } else if (kind === "weak") {
      type = "lowBattery";
      message = t("iot.activity.weakOnline", {
        tag: tr.id,
        battery: tr.battery ?? "—",
        defaultValue: `Tag ${tr.id} online — weak signal (${tr.battery}%)`,
      });
    } else {
      message = t("iot.activity.isOffline", {
        tag: tr.id,
        location: tr.location ? ` · ${tr.location}` : "",
        defaultValue: `Tag ${tr.id} offline${tr.location ? ` · ${tr.location}` : ""}`,
      });
    }

    return { id: `live-${tr.id}`, at: now, type, message };
  });
};

/** online | offline | weak (online + low battery) */
export const getTrackerStatusKind = (tracker) => {
  if (!tracker) return "offline";
  if (tracker.status !== "online") return "offline";
  const battery = Number(tracker.battery);
  if (!Number.isNaN(battery) && battery < 30) return "weak";
  return "online";
};

export const getTrackerStatusLabel = (tracker, t) => {
  const kind = getTrackerStatusKind(tracker);
  if (kind === "online") return t("iot.status.onlineSafe", "Online (Safe)");
  if (kind === "weak") return t("iot.status.weakSignal", "Weak signal");
  return t("iot.status.offlineLost", "Offline");
};

export const getTrackerStatusDotClass = (kind) => {
  if (kind === "online") return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.65)]";
  if (kind === "weak") return "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.55)]";
  return "bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.45)]";
};

export const getTrackerStatusBadgeClass = (kind) => {
  if (kind === "online") {
    return "bg-emerald-50 text-emerald-800 border-emerald-200/90";
  }
  if (kind === "weak") {
    return "bg-amber-50 text-amber-900 border-amber-200/90";
  }
  return "bg-rose-50 text-rose-800 border-rose-200/90";
};

export const formatActivityClock = (date) => {
  try {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

/**
 * Location column: Main storage until the item is on an active loan;
 * then show borrow destination (room). Ignores stale room strings on idle tags.
 */
export const getTrackerDisplayLocation = (
  tracker,
  { equipmentList = [], activeTransactions = [], borrowerMap, storageLabel = "Main Storage" }
) => {
  const borrowDestMap = buildBorrowDestinationMap(activeTransactions);
  const eq = findEquipmentForTracker(tracker, equipmentList);

  if (eq) {
    return getEquipmentDisplayLocation(
      { ...eq, id: eq._id || eq.id },
      borrowDestMap,
      storageLabel
    );
  }

  const borrower = findBorrowerForTracker(tracker, borrowerMap);
  if (borrower?.destination) {
    const info = formatAssignmentDisplay(borrower);
    return info?.destination || info?.name || storageLabel;
  }

  return storageLabel;
};

export const enrichTrackersWithDisplayLocations = (
  trackers,
  { equipmentList = [], activeTransactions = [], borrowerMap, storageLabel }
) => {
  if (!Array.isArray(trackers)) return [];
  return trackers.map((tr) => ({
    ...tr,
    location: getTrackerDisplayLocation(tr, {
      equipmentList,
      activeTransactions,
      borrowerMap,
      storageLabel,
    }),
  }));
};

/** Match active checkout to tracker (iot tag id or equipment name). */
export const findBorrowerForTracker = (tracker, borrowerMap) => {
  if (!tracker || !borrowerMap) return null;
  const id = String(tracker.id || "").toLowerCase();
  const name = String(tracker.equipment || "").toLowerCase();
  if (borrowerMap.byTag[id]) return borrowerMap.byTag[id];
  if (name && borrowerMap.byName[name]) return borrowerMap.byName[name];
  return null;
};

export const buildBorrowerMapFromTransactions = (transactions) => {
  const byTag = Object.create(null);
  const byName = Object.create(null);
  const list = Array.isArray(transactions) ? transactions : [];
  for (const tx of list) {
    if (tx.status !== "Checked Out" && tx.status !== "Overdue") continue;
    const eq = tx.equipment || {};
    const entry = {
      name:
        tx.user?.fullName ||
        (tx.user?.studentId ? `Student ${tx.user.studentId}` : null) ||
        tx.user?.username ||
        tx.user?.email ||
        "Unknown",
      destination: tx.destination || tx.location || "",
      status: tx.status,
    };
    const tag = (eq.iotTag || eq.iot_tag || "").toString().toLowerCase();
    const eqName = (eq.name || "").toString().toLowerCase();
    if (tag) byTag[tag] = entry;
    if (eqName) byName[eqName] = entry;
  }
  return { byTag, byName };
};

