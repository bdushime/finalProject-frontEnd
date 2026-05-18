import api from '@/utils/api';

/**
 * Fetch all active packages (all authenticated users).
 * Returns packages with devices populated.
 */
export async function fetchPackages() {
    const res = await api.get('/packages');
    return res.data;
}

/**
 * Fetch a single package by ID (all authenticated users).
 * Returns 404 for students if the package is inactive.
 */
export async function fetchPackageById(id) {
    const res = await api.get(`/packages/${id}`);
    return res.data;
}

/**
 * Create a new package (Security / Admin only).
 * @param {{ name: string, description?: string, deviceIds: string[] }} data
 */
export async function createPackage(data) {
    const res = await api.post('/packages', data);
    return res.data;
}

/**
 * Update a package's name, description, or active status (Security / Admin only).
 * @param {string} id
 * @param {{ name?: string, description?: string, isActive?: boolean }} data
 */
export async function updatePackage(id, data) {
    const res = await api.put(`/packages/${id}`, data);
    return res.data;
}

/**
 * Soft-delete (deactivate) a package (Security / Admin only).
 * Sets isActive to false.
 * @param {string} id
 */
export async function deletePackage(id) {
    const res = await api.delete(`/packages/${id}`);
    return res.data;
}

/**
 * Add devices to a package (Security / Admin only).
 * @param {string} id
 * @param {string[]} deviceIds
 */
export async function addDevicesToPackage(id, deviceIds) {
    const res = await api.patch(`/packages/${id}/devices`, { deviceIds });
    return res.data;
}

/**
 * Remove a single device from a package (Security / Admin only).
 * @param {string} packageId
 * @param {string} deviceId
 */
export async function removeDeviceFromPackage(packageId, deviceId) {
    const res = await api.delete(`/packages/${packageId}/devices/${deviceId}`);
    return res.data;
}

/**
 * Book an entire package (Student only).
 * @param {string} id
 * @param {object} body - { expectedReturnTime, destination, purpose, courseId, ... }
 */
export async function bookPackage(id, body = {}) {
    const res = await api.post(`/packages/${id}/book`, body);
    return res.data;
}

/**
 * Cancel a pending package booking (Student only).
 * @param {string} id
 */
export async function cancelPackageBooking(id) {
    const res = await api.delete(`/packages/${id}/book`);
    return res.data;
}
