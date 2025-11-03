import { CheckoutStatus } from './enums'
import { Equipment } from './equipment.types'
import { User } from './user.types'

/**
 * Checkout Interface
 */
export interface Checkout {
  id: string
  equipmentId: string
  equipment?: Equipment
  userId: string
  user?: User
  checkoutDate: string
  dueDate: string
  returnDate?: string
  destination: string
  building?: string
  floor?: string
  room?: string
  purpose: string
  checkoutPhoto: string
  returnPhoto?: string
  signature: string
  status: CheckoutStatus
  isOverdue: boolean
  hoursOverdue?: number
  scoreImpact: number
  damageReport?: string
  notes?: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
}

/**
 * Checkout Form Data (Step-by-step)
 */
export interface CheckoutFormData {
  // Step 1: Equipment Selection
  equipmentId: string
  
  // Step 2: QR Scan (auto-filled)
  qrCodeVerified: boolean
  
  // Step 3: Photo
  checkoutPhoto: string | File
  
  // Step 4: Details
  destination: string
  building?: string
  floor?: string
  room?: string
  returnDate: string
  returnTime: string
  purpose: string
  agreeToTerms: boolean
  
  // Step 5: Signature
  signature: string
}

/**
 * Return Form Data
 */
export interface ReturnFormData {
  checkoutId: string
  returnPhoto: string | File
  condition: string
  damageReport?: string
  notes?: string
}

/**
 * Checkout with Extended Info
 */
export interface CheckoutDetails extends Checkout {
  equipmentName: string
  equipmentModel: string
  equipmentCategory: string
  userName: string
  userEmail: string
  userPhone: string
  userResponsibilityScore: number
  daysUntilDue: number
  timeRemaining: string
}

/**
 * Checkout History Item
 */
export interface CheckoutHistoryItem {
  id: string
  equipmentId: string
  equipmentName: string
  equipmentPhoto?: string
  checkoutDate: string
  returnDate: string
  dueDate: string
  status: 'on-time' | 'late' | 'damaged'
  duration: string
  scoreChange: number
  wasOverdue: boolean
  daysOverdue?: number
}

/**
 * Checkout Statistics
 */
export interface CheckoutStatistics {
  totalCheckouts: number
  activeCheckouts: number
  overdueCheckouts: number
  completedCheckouts: number
  onTimeReturns: number
  lateReturns: number
  averageCheckoutDuration: number
  mostCheckedOutEquipment: {
    id: string
    name: string
    count: number
  }[]
}