/**
 * Build equipment API payloads — only includes optional fields when provided.
 */
export function buildEquipmentCreatePayload(data) {
    const payload = {
        name: data.name,
        type: data.category,
        description: data.description,
        serialNumber: data.serialNumber,
        status: data.status || "Available",
        condition: data.condition || "Good",
        location: data.location || "Main Storage",
    };

    if (data.iotTag?.trim()) {
        payload.iotTag = data.iotTag.trim();
    }

    if (data.brand?.trim()) {
        payload.brand = data.brand.trim();
    }

    if (data.model?.trim()) {
        payload.model = data.model.trim();
    }

    if (data.purchaseDate) {
        payload.purchaseDate = data.purchaseDate;
    }

    const price = data.purchasePrice ?? data.amount;
    if (price !== undefined && price !== null && String(price).trim() !== "") {
        payload.purchasePrice = Number(price);
    }

    if (data.packageId) {
        payload.packageId = data.packageId;
    }

    return payload;
}

export function buildEquipmentUpdatePayload(data) {
    const payload = {
        name: data.name,
        type: data.category,
        description: data.description,
        serialNumber: data.serialNumber,
        status: data.status,
        condition: data.condition,
        location: data.location,
    };

    if (data.iotTag?.trim()) {
        payload.iotTag = data.iotTag.trim();
    } else {
        payload.iotTag = undefined;
    }

    if (data.brand?.trim()) {
        payload.brand = data.brand.trim();
    }

    if (data.model?.trim()) {
        payload.model = data.model.trim();
    }

    if (data.purchaseDate) {
        payload.purchaseDate = data.purchaseDate;
    }

    const price = data.purchasePrice ?? data.amount;
    if (price !== undefined && price !== null && String(price).trim() !== "") {
        payload.purchasePrice = Number(price);
    }

    return payload;
}
