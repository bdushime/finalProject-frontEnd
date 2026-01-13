import { UserRole } from './enums'

/**
 * User Interface
 */
export interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  studentId?: string
  employeeId?: string
  department: string
  year?: string // For students
  phone: string
  profilePhoto?: string
  responsibilityScore: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastLogin?: string
  memberSince: string
}

/**
 * User Statistics
 */
export interface UserStats {
  totalCheckouts: number
  onTimeReturns: number
  onTimeReturnPercentage: number
  lateReturns: number
  damagedItems: number
  lostItems: number
  currentActive: number
  trustLevel: string
}

/**
 * User Profile
 */
export interface UserProfile extends User {
  stats: UserStats
}

/**
 * Login Credentials
 */
export interface LoginCredentials {
  username: string
  password: string
  rememberMe?: boolean
}

/**
 * Registration Data
 */
export interface RegisterData {
  username: string
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  studentId?: string
  department: string
  phone: string
}

/**
 * Auth Response
 */
export interface AuthResponse {
  user: User
  token: string
  refreshToken?: string
}

/**
 * Password Reset
 */
export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  newPassword: string
  confirmPassword: string
}