/**
 * Role Configuration - Centralized role rules and defaults
 * * REFACTOR DECISION: Centralizing role-based logic to avoid hardcoding
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
 * Left empty for now as requested, but structure remains intact
 * in case you want to use it for standardizing descriptions later.
 */
export const CategorySpecifications = {};

/**
 * Role-specific form field configurations
 * Defines which fields are visible/required for each role
 */
export const RoleFormConfig = {
    [UserRoles.SECURITY]: {
        // Fields that Security Officers should NOT see or fill
        hiddenFields: ['status'],

        // Default values automatically applied for Security Officers
        defaultValues: {
            status: 'Available', 
        },

        // 👇 FIX: Only require the core fields that actually exist
        requiredFields: ['name', 'category', 'serialNumber', 'location'],
    },

    [UserRoles.IT_STAFF]: {
        hiddenFields: [],
        defaultValues: {
            status: 'Available', 
        },
        // 👇 FIX: Only require the core fields that actually exist
        requiredFields: ['name', 'category', 'serialNumber', 'location'],
    },

    [UserRoles.ADMIN]: {
        hiddenFields: [],
        defaultValues: {
            status: 'Available', 
        },
        // 👇 FIX: Only require the core fields that actually exist
        requiredFields: ['name', 'category', 'serialNumber', 'location'],
    },
};

/**
 * Bulk Upload Configuration by Role
 * Defines which columns are required/optional for bulk uploads
 */
export const BulkUploadConfig = {
    [UserRoles.SECURITY]: {
        // 👇 FIX: Removed brand, model, purchasePrice
        requiredColumns: ['name', 'category', 'serialNumber', 'location'],
        optionalColumns: ['condition', 'description', 'iotTag'],
        excludedColumns: ['status'], 
        defaultValues: {
            status: 'Available',
            condition: 'Good',
        },
    },

    [UserRoles.IT_STAFF]: {
        // 👇 FIX: Removed brand, model, purchasePrice
        requiredColumns: ['name', 'category', 'serialNumber', 'location'],
        optionalColumns: ['condition', 'status', 'description', 'iotTag'],
        excludedColumns: [],
        defaultValues: {
            status: 'Available',
            condition: 'Good',
        },
    },

    [UserRoles.ADMIN]: {
        // 👇 FIX: Removed brand, model, purchasePrice
        requiredColumns: ['name', 'category', 'serialNumber', 'location'],
        optionalColumns: ['condition', 'status', 'description', 'iotTag'],
        excludedColumns: [],
        defaultValues: {
            status: 'Available',
            condition: 'Good',
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
    return []; // Removed to match current schema
};

/**
 * Validate device data based on role
 */
export const validateDeviceData = (role, data) => {
    const errors = {};
    const config = RoleFormConfig[role];

    if (!config) return errors;

    // Check required fields (will no longer check for price, brand, or model)
    config.requiredFields.forEach((field) => {
        if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
            errors[field] = `${field} is required`;
        }
    });

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