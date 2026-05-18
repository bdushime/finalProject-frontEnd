/**
 * Where equipment appears to "live" in the UI: in storage until an active
 * checkout supplies a borrow destination (room). Avoids showing stale room
 * names on available items whose DB `location` was never reset.
 */

export function normalizeEquipmentStatus(status) {
  return (status || "").toString().trim().toLowerCase().replace(/-/g, " ");
}

/** True when the item is out of storage on an active loan (including overdue). */
export function isOutOnLoan(status) {
  const n = normalizeEquipmentStatus(status);
  if (n === "overdue") return true;
  return n.includes("checked") && n.includes("out");
}

/** @param {unknown[]} activeTransactions - from GET /transactions/active */
export function buildBorrowDestinationMap(activeTransactions) {
  const list = Array.isArray(activeTransactions) ? activeTransactions : [];
  const map = Object.create(null);
  for (const tx of list) {
    const st = (tx?.status || "").toString();
    if (st !== "Checked Out" && st !== "Overdue") continue;
    const eq = tx.equipment;
    const eqId = typeof eq === "object" && eq !== null ? eq._id || eq.id : eq;
    if (!eqId) continue;
    const key = String(eqId);
    const raw = tx.destination != null ? String(tx.destination) : "";
    const room = raw ? raw.split(" (")[0].trim() : "";
    map[key] = room || (tx.location ? String(tx.location).split(" (")[0].trim() : "") || "";
  }
  return map;
}

/**
 * @param {object} device - equipment row
 * @param {Record<string, string>} borrowMap - equipment id -> destination label
 * @param {string} storageLabel - e.g. translated "Main storage"
 */
export function getEquipmentDisplayLocation(device, borrowMap, storageLabel) {
  const label = storageLabel || "Main Storage";
  if (!device) return label;
  const id = String(device._id || device.id || "");
  if (!isOutOnLoan(device.status)) return label;
  const live = id && borrowMap && borrowMap[id];
  if (live) return live;
  const loc = (device.location || "").toString().trim();
  if (loc) return loc;
  return label;
}
