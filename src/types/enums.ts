// user roles in the system
export enum UserRole{
    REGULAR_USER = 'regular_user',
    IT_STAFF = 'it_staff',
    SECURITY = 'security',
    ADMIN = 'admin'
}


// Equipments status

export enum EquipmentStatus {
  AVAILABLE = 'available',
  CHECKED_OUT = 'checked_out',
  MAINTENANCE = 'maintenance',
  DAMAGED = 'damaged',
  MISSING = 'missing',
  RETIRED = 'retired'
}

/**
 * Equipment Categories
 */
export enum EquipmentCategory {
  LAPTOP = 'laptop',
  DESKTOP = 'desktop',
  PROJECTOR = 'projector',
  CAMERA = 'camera',
  MICROPHONE = 'microphone',
  TABLET = 'tablet',
  MONITOR = 'monitor',
  PRINTER = 'printer',
  PHONE = 'phone',
  ACCESSORIES = 'accessories',
  OTHER = 'other',
}

/**
 * Equipment Condition
 */
export enum EquipmentCondition {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  DAMAGED = 'damaged',
}

/**
 * Checkout Status
 */
export enum CheckoutStatus {
  ACTIVE = 'active',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  MISSING = 'missing',
  CANCELLED = 'cancelled',
}

/**
 * Notification Types
 */
export enum NotificationType {
  REMINDER = 'reminder',
  OVERDUE = 'overdue',
  SCORE_UPDATE = 'score_update',
  SYSTEM = 'system',
  MAINTENANCE = 'maintenance',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}


/**
 * Alert Priority Levels
 */
export enum AlertPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}


/**
 * Responsibility Score Levels
 */
export const SCORE_LEVELS = {
  TRUSTED: { min: 90, max: 100, label: 'Trusted User', color: 'success' },
  GOOD: { min: 70, max: 89, label: 'Good Standing', color: 'info' },
  FAIR: { min: 50, max: 69, label: 'Fair Standing', color: 'warning' },
  AT_RISK: { min: 0, max: 49, label: 'At Risk', color: 'danger' },
} as const

/**
 * Score Changes
 */
export const SCORE_CHANGES = {
  ON_TIME_RETURN: 2,
  LATE_1_DAY: -5,
  LATE_2_3_DAYS: -10,
  LATE_MORE_THAN_3_DAYS: -15,
  MINOR_DAMAGE: -10,
  MAJOR_DAMAGE: -30,
  LOST_EQUIPMENT: -50,
} as const

/**
 * Checkout Time Limits (in days)
 */
export const CHECKOUT_LIMITS = {
  TRUSTED_USER: 7,
  GOOD_STANDING: 5,
  FAIR_STANDING: 3,
  AT_RISK: 1,
} as const
