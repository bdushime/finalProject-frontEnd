import { EquipmentStatus, EquipmentCategory, EquipmentCondition } from './enums'

// what identifies an equipment (Equipment Status)
export interface Equipment {
  id: string
  name: string
  model: string
  brand: string
  category: EquipmentCategory
  serialNumber: string
  qrCode: string
  status: EquipmentStatus
  condition: EquipmentCondition
  location: string
  building?: string
  floor?: string
  room?: string
  department: string
  purchaseDate: string
  purchasePrice: number
  currentValue?: number
  warrantyExpiry?: string
  photos: string[]
  specifications: string[]
  description: string
  currentCheckoutId?: string
  lastCheckoutDate?: string
  totalCheckouts: number
  createdAt: string
  updatedAt: string
}

/**
 * Equipment Form Data (for create/edit)
 */
export interface EquipmentFormData {
  name: string
  model: string
  brand: string
  category: EquipmentCategory
  serialNumber: string
  condition: EquipmentCondition
  location: string
  building?: string
  floor?: string
  room?: string
  department: string
  purchaseDate: string
  purchasePrice: number
  warrantyExpiry?: string
  description: string
  specifications: string[]
}

/**
 * Equipment Search Filters
 */
export interface EquipmentFilters {
  searchTerm?: string
  category?: EquipmentCategory
  status?: EquipmentStatus
  condition?: EquipmentCondition
  department?: string
  availability?: 'available' | 'unavailable' | 'all'
  minPrice?: number
  maxPrice?: number
  sortBy?: 'name' | 'category' | 'status' | 'purchaseDate'
  sortOrder?: 'asc' | 'desc'
}

/**
 * Equipment with Availability Info
 */
export interface EquipmentWithAvailability extends Equipment {
  isAvailable: boolean
  availableFrom?: string
  expectedReturnDate?: string
  currentHolder?: {
    id: string
    name: string
  }
}

/**
 * Equipment History Record
 */
export interface EquipmentHistory {
  id: string
  equipmentId: string
  // why not use the enum checkout status
  action: 'checkout' | 'return' | 'maintenance' | 'damage_report' | 'status_change'
  userId: string
  userName: string
  details: string
  timestamp: string
}