/**
 * Role Configuration - Centralized role rules and defaults
 * 
 * REFACTOR DECISION: Centralizing role-based logic to avoid hardcoding
 * in individual components. This allows easy modification of role permissions
 * and defaults without touching multiple files.
 */

export const UserRoles = {
    STUDENT: 'Student',
    SECURITY: 'Security',
    IT_STAFF: 'IT',
    ADMIN: 'Admin',
};

/**
 * Category-Driven Specifications Configuration
 * Each category has a defined set of specification fields.
 * This ensures consistent, structured data instead of free-text specs.
 */
export const CategorySpecifications = {
    Laptop: [
        { key: 'ram', label: 'RAM', type: 'text', placeholder: 'e.g., 16GB DDR5' },
        { key: 'storage', label: 'Storage', type: 'text', placeholder: 'e.g., 512GB SSD' },
        { key: 'cpu', label: 'CPU', type: 'text', placeholder: 'e.g., Intel i7-12700H' },
        { key: 'screenSize', label: 'Screen Size', type: 'text', placeholder: 'e.g., 15.6 inches' },
        { key: 'gpu', label: 'GPU (Optional)', type: 'text', placeholder: 'e.g., NVIDIA RTX 3060' },
    ],
    Projector: [
        { key: 'lumens', label: 'Lumens', type: 'number', placeholder: 'e.g., 3500' },
        { key: 'resolution', label: 'Resolution', type: 'text', placeholder: 'e.g., 1920x1080 (Full HD)' },
        { key: 'throwDistance', label: 'Throw Distance', type: 'text', placeholder: 'e.g., 1.5m - 3m' },
        { key: 'connectivity', label: 'Connectivity', type: 'text', placeholder: 'e.g., HDMI, VGA, USB' },
    ],
    Camera: [
        { key: 'megapixels', label: 'Megapixels', type: 'number', placeholder: 'e.g., 24' },
        { key: 'sensorType', label: 'Sensor Type', type: 'text', placeholder: 'e.g., Full Frame CMOS' },
        { key: 'lensMount', label: 'Lens Mount', type: 'text', placeholder: 'e.g., Canon EF Mount' },
        { key: 'videoResolution', label: 'Video Resolution', type: 'text', placeholder: 'e.g., 4K 60fps' },
    ],
    Tablet: [
        { key: 'screenSize', label: 'Screen Size', type: 'text', placeholder: 'e.g., 10.9 inches' },
        { key: 'storage', label: 'Storage', type: 'text', placeholder: 'e.g., 256GB' },
        { key: 'ram', label: 'RAM', type: 'text', placeholder: 'e.g., 8GB' },
        { key: 'os', label: 'Operating System', type: 'text', placeholder: 'e.g., iPadOS 17' },
    ],
    Audio: [
        { key: 'type', label: 'Audio Type', type: 'text', placeholder: 'e.g., Wireless Speaker' },
        { key: 'connectivity', label: 'Connectivity', type: 'text', placeholder: 'e.g., Bluetooth 5.0, AUX' },
        { key: 'power', label: 'Power Output', type: 'text', placeholder: 'e.g., 20W' },
        { key: 'batteryLife', label: 'Battery Life (if applicable)', type: 'text', placeholder: 'e.g., 12 hours' },
    ],
    Microphone: [
        { key: 'type', label: 'Microphone Type', type: 'text', placeholder: 'e.g., Condenser, Dynamic' },
        { key: 'polarPattern', label: 'Polar Pattern', type: 'text', placeholder: 'e.g., Cardioid, Omnidirectional' },
        { key: 'frequency', label: 'Frequency Response', type: 'text', placeholder: 'e.g., 20Hz - 20kHz' },
        { key: 'connectivity', label: 'Connectivity', type: 'text', placeholder: 'e.g., XLR, USB' },
    ],
    Router: [
        { key: 'ports', label: 'Number of Ports', type: 'number', placeholder: 'e.g., 4' },
        { key: 'speed', label: 'Max Speed', type: 'text', placeholder: 'e.g., 1Gbps' },
        { key: 'wifiStandard', label: 'WiFi Standard', type: 'text', placeholder: 'e.g., WiFi 6 (802.11ax)' },
        { key: 'frequency', label: 'Frequency Bands', type: 'text', placeholder: 'e.g., 2.4GHz, 5GHz' },
    ],
    Electronics: [
        { key: 'type', label: 'Device Type', type: 'text', placeholder: 'e.g., Monitor, Printer' },
        { key: 'specifications', label: 'Key Specifications', type: 'text', placeholder: 'e.g., 27 inch 4K, Laser' },
        { key: 'connectivity', label: 'Connectivity', type: 'text', placeholder: 'e.g., USB-C, HDMI' },
    ],
    Accessories: [
        { key: 'type', label: 'Accessory Type', type: 'text', placeholder: 'e.g., Cable, Adapter, Case' },
        { key: 'compatibility', label: 'Compatibility', type: 'text', placeholder: 'e.g., Universal, MacBook' },
        { key: 'specifications', label: 'Specifications', type: 'text', placeholder: 'e.g., 2m USB-C to USB-C' },
    ],
    Video: [
        { key: 'resolution', label: 'Resolution', type: 'text', placeholder: 'e.g., 4K UHD' },
        { key: 'frameRate', label: 'Frame Rate', type: 'text', placeholder: 'e.g., 60fps' },
        { key: 'sensorSize', label: 'Sensor Size', type: 'text', placeholder: 'e.g., 1 inch' },
        { key: 'recordingFormat', label: 'Recording Format', type: 'text', placeholder: 'e.g., MP4, MOV' },
    ],
    Other: [
        { key: 'description', label: 'Description', type: 'text', placeholder: 'Describe the equipment' },
        { key: 'specifications', label: 'Key Specifications', type: 'text', placeholder: 'Enter main specifications' },
    ],
};

/**
 * Role-specific form field configurations
 * Defines which fields are visible/required for each role
 */
export const RoleFormConfig = {
    [UserRoles.SECURITY]: {
        // Fields that Security Officers should NOT see or fill
        hiddenFields: ['status', 'department'],

        // Default values automatically applied for Security Officers
        defaultValues: {
            status: 'Available', // Always set to Available for new devices
        },

        // Fields that are required for Security Officers
        requiredFields: ['name', 'category', 'brand', 'model', 'serialNumber', 'location', 'purchasePrice'],

        // Validation rules specific to Security Officers
        validation: {
            purchasePrice: {
                required: true,
                min: 0,
                message: 'Purchase price is required and must be a valid number ≥ 0',
            },
        },
    },

    [UserRoles.IT_STAFF]: {
        hiddenFields: [],
        defaultValues: {},
        requiredFields: ['name', 'category', 'brand', 'model', 'serialNumber', 'location'],
        validation: {
            purchasePrice: {
                required: false,
                min: 0,
                message: 'Purchase price must be a valid number ≥ 0 if provided',
            },
        },
    },

    [UserRoles.ADMIN]: {
        hiddenFields: [],
        defaultValues: {},
        requiredFields: ['name', 'category', 'serialNumber'],
        validation: {
            purchasePrice: {
                required: false,
                min: 0,
                message: 'Purchase price must be a valid number ≥ 0 if provided',
            },
        },
    },
};

/**
 * Bulk Upload Configuration by Role
 * Defines which columns are required/optional for bulk uploads
 */
export const BulkUploadConfig = {
    [UserRoles.SECURITY]: {
        // Required columns for Security Officer bulk upload
        requiredColumns: ['name', 'category', 'brand', 'model', 'serialNumber', 'location', 'purchasePrice'],

        // Optional columns that can be included
        optionalColumns: ['condition', 'purchaseDate', 'warrantyExpiry', 'description'],

        // Columns that should NOT be in the upload (auto-filled by system)
        excludedColumns: ['status', 'department', 'available', 'total', 'quantity'],

        // Default values to apply for each uploaded row
        defaultValues: {
            status: 'Available',
            condition: 'Good',
        },

        // Validation rules for bulk upload
        validation: {
            purchasePrice: { required: true, min: 0 },
        },
    },

    [UserRoles.IT_STAFF]: {
        requiredColumns: ['name', 'category', 'brand', 'model', 'serialNumber', 'location'],
        optionalColumns: ['condition', 'status', 'department', 'purchasePrice', 'purchaseDate', 'warrantyExpiry', 'description'],
        excludedColumns: ['available', 'total', 'quantity'],
        defaultValues: {
            status: 'Available',
            condition: 'Good',
        },
        validation: {
            purchasePrice: { required: false, min: 0 },
        },
    },

    [UserRoles.ADMIN]: {
        requiredColumns: ['name', 'category', 'serialNumber'],
        optionalColumns: ['brand', 'model', 'condition', 'status', 'department', 'location', 'purchasePrice', 'purchaseDate', 'warrantyExpiry', 'description'],
        excludedColumns: ['available', 'total', 'quantity'],
        defaultValues: {
            status: 'Available',
            condition: 'Good',
        },
        validation: {
            purchasePrice: { required: false, min: 0 },
        },
    },
};

/**
 * Get the display name for a role
 */
export const getRoleDisplayName = (role) => {
    const displayNames = {
        [UserRoles.STUDENT]: 'Student',
        [UserRoles.SECURITY]: 'Security Officer',
        [UserRoles.IT_STAFF]: 'IT Staff',
        [UserRoles.ADMIN]: 'System Administrator',
    };
    return displayNames[role] || role;
};

/**
 * Check if a field should be hidden for a given role
 */
export const isFieldHidden = (role, fieldName) => {
    const config = RoleFormConfig[role];
    return config?.hiddenFields?.includes(fieldName) || false;
};

/**
 * Check if a field is required for a given role
 */
export const isFieldRequired = (role, fieldName) => {
    const config = RoleFormConfig[role];
    return config?.requiredFields?.includes(fieldName) || false;
};

/**
 * Get default values for a role
 */
export const getDefaultValues = (role) => {
    const config = RoleFormConfig[role];
    return config?.defaultValues || {};
};

/**
 * Get specifications configuration for a category
 */
export const getSpecsForCategory = (category) => {
    return CategorySpecifications[category] || CategorySpecifications.Other;
};

/**
 * Validate device data based on role
 */
export const validateDeviceData = (role, data) => {
    const errors = {};
    const config = RoleFormConfig[role];

    if (!config) return errors;

    // Check required fields
    config.requiredFields.forEach((field) => {
        if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
            errors[field] = `${field} is required`;
        }
    });

    // Validate purchase price
    if (config.validation?.purchasePrice) {
        const priceValidation = config.validation.purchasePrice;
        const price = parseFloat(data.purchasePrice);

        if (priceValidation.required && (isNaN(price) || data.purchasePrice === '' || data.purchasePrice === undefined)) {
            errors.purchasePrice = priceValidation.message;
        } else if (!isNaN(price) && price < priceValidation.min) {
            errors.purchasePrice = priceValidation.message;
        }
    }

    return errors;
};

export default {
    UserRoles,
    CategorySpecifications,
    RoleFormConfig,
    BulkUploadConfig,
    getRoleDisplayName,
    isFieldHidden,
    isFieldRequired,
    getDefaultValues,
    getSpecsForCategory,
    validateDeviceData,
};
