/**
 * Main types export file
 * Import types from here: import { User, Equipment } from '@types'
 */

// Enums and Constants
export * from './enums'

// User Types
export * from './user.types'

// Equipment Types
export * from './equipment.types'

// Checkout Types
export * from './checkout.type'

// Notification Types
export * from './notification.types'

/**
 * API Response Types
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T = any> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: any
}

/**
 * Common Utility Types
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncState<T = any> {
  data: T | null
  loading: boolean
  error: string | null
}

export type SortOrder = 'asc' | 'desc'

export interface SortConfig {
  field: string
  order: SortOrder
}

export interface FilterConfig {
  [key: string]: any
}

/**
 * Form Validation Types
 */
export interface ValidationError {
  field: string
  message: string
}

export interface FormErrors {
  [key: string]: string
}

/**
 * Modal/Dialog Types
 */
export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
}

/**
 * Route Types
 */
export interface RouteConfig {
  path: string
  element: React.ComponentType
  protected?: boolean
  roles?: string[]
  title?: string
}