export const getPackageId = (pkg) => pkg?._id ?? pkg?.id ?? "";

export const findPackageById = (packages, id) =>
    packages.find((pkg) => getPackageId(pkg) === id);

export const getPackageDevices = (pkg) => {
    if (!pkg) return [];
    if (Array.isArray(pkg.devices)) return pkg.devices;
    if (Array.isArray(pkg.items)) {
        return pkg.items.map((item, index) =>
            typeof item === "string"
                ? { _id: `item-${index}`, name: item }
                : item
        );
    }
    return [];
};

export const getDeviceId = (device) =>
    typeof device === "object" ? (device._id ?? device.id ?? "") : String(device);

// Render-safe label. If the entry is just a bare ObjectId string (un-populated
// package response), don't dump the raw 24-char hex into the UI — use the last
// 6 chars as a stable short tag so users see "Device #a1b2c3" instead.
export const getDeviceName = (device) => {
    if (device && typeof device === "object") {
        return device.name || device.serialNumber || "Unknown device";
    }
    const id = String(device || "");
    if (!id) return "Unknown device";
    return `Device #${id.slice(-6)}`;
};

export const getDeviceNames = (pkg) => getPackageDevices(pkg).map(getDeviceName);

export const normalizePackage = (pkg) => {
    const devices = getPackageDevices(pkg);
    return {
        ...pkg,
        devices,
        items: getDeviceNames(pkg),
        deviceCount: devices.length,
    };
};

export const normalizePackages = (list) =>
    (Array.isArray(list) ? list : []).map(normalizePackage);

export const findPendingPackageBooking = (transactions, packageId) => {
    if (!Array.isArray(transactions) || !packageId) return null;

    return transactions.find((tx) => {
        const txPackageId =
            tx.packageId ||
            (typeof tx.package === "object" ? tx.package?._id : tx.package);
        const status = (tx.status || "").toLowerCase();
        const isPackageBooking =
            tx.bookingType === "package" || txPackageId || tx.package;
        const isPending =
            status === "pending" ||
            status === "reserved" ||
            status === "awaiting approval";

        return isPackageBooking && txPackageId === packageId && isPending;
    });
};
