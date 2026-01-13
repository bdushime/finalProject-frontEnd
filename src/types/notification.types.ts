import { NotificationType, AlertPriority } from './enums'

/**
 * Notification Interface
 */
export interface Notification {
  id: string
  userId: string
  type: NotificationType
  priority: AlertPriority
  title: string
  message: string
  read: boolean
  actionUrl?: string
  actionLabel?: string
  relatedEntityId?: string // equipmentId or checkoutId
  relatedEntityType?: 'equipment' | 'checkout' | 'user'
  createdAt: string
  readAt?: string
}

/**
 * Notification Preferences
 */
export interface NotificationPreferences {
  userId: string
  emailEnabled: boolean
  smsEnabled: boolean
  pushEnabled: boolean
  preferences: {
    returnReminders: boolean
    overdueAlerts: boolean
    scoreUpdates: boolean
    systemUpdates: boolean
    maintenanceNotices: boolean
  }
  reminderTiming: {
    firstReminder: number // hours before due
    finalReminder: number // hours before due
  }
  quietHours: {
    enabled: boolean
    startTime: string // HH:mm format
    endTime: string // HH:mm format
  }
}

/**
 * Alert Configuration
 */
export interface AlertConfig {
  type: NotificationType
  priority: AlertPriority
  title: string
  message: string
  sendEmail: boolean
  sendSMS: boolean
  sendPush: boolean
}

/**
 * Notification Statistics
 */
export interface NotificationStats {
  total: number
  unread: number
  byType: {
    [key in NotificationType]: number
  }
  byPriority: {
    [key in AlertPriority]: number
  }
}