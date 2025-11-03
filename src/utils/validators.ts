import { isValidEmail, isValidPhone } from './helpers'

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validate required field
 */
export function validateRequired(value: any, fieldName: string = 'This field'): ValidationResult {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    }
  }
  return { isValid: true }
}

/**
 * Validate email
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email is required' }
  }
  
  if (!isValidEmail(email)) {
    return { isValid: false, error: 'Invalid email format' }
  }
  
  return { isValid: true }
}

/**
 * Validate phone number
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' }
  }
  
  if (!isValidPhone(phone)) {
    return { isValid: false, error: 'Invalid phone number format' }
  }
  
  return { isValid: true }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' }
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' }
  }
  
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' }
  }
  
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' }
  }
  
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' }
  }
  
  return { isValid: true }
}

/**
 * Validate password confirmation
 */
export function validatePasswordConfirm(password: string, confirmPassword: string): ValidationResult {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' }
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' }
  }
  
  return { isValid: true }
}

/**
 * Validate username
 */
export function validateUsername(username: string): ValidationResult {
  if (!username) {
    return { isValid: false, error: 'Username is required' }
  }
  
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters' }
  }
  
  if (username.length > 20) {
    return { isValid: false, error: 'Username must be less than 20 characters' }
  }
  
  if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, dots, underscores, and hyphens' }
  }
  
  return { isValid: true }
}

/**
 * Validate student/employee ID
 */
export function validateID(id: string, type: 'student' | 'employee' = 'student'): ValidationResult {
  if (!id) {
    return { isValid: false, error: `${type === 'student' ? 'Student' : 'Employee'} ID is required` }
  }
  
  if (!/^[A-Z0-9-]+$/i.test(id)) {
    return { isValid: false, error: 'ID can only contain letters, numbers, and hyphens' }
  }
  
  return { isValid: true }
}

/**
 * Validate serial number
 */
export function validateSerialNumber(serialNumber: string): ValidationResult {
  if (!serialNumber) {
    return { isValid: false, error: 'Serial number is required' }
  }
  
  if (serialNumber.length < 5) {
    return { isValid: false, error: 'Serial number must be at least 5 characters' }
  }
  
  return { isValid: true }
}

/**
 * Validate price
 */
export function validatePrice(price: number | string): ValidationResult {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  
  if (isNaN(numPrice)) {
    return { isValid: false, error: 'Invalid price format' }
  }
  
  if (numPrice < 0) {
    return { isValid: false, error: 'Price cannot be negative' }
  }
  
  if (numPrice > 999999) {
    return { isValid: false, error: 'Price is too high' }
  }
  
  return { isValid: true }
}

/**
 * Validate date (must be in the future for due dates)
 */
export function validateFutureDate(date: string | Date, fieldName: string = 'Date'): ValidationResult {
  if (!date) {
    return { isValid: false, error: `${fieldName} is required` }
  }
  
  const selectedDate = new Date(date)
  const now = new Date()
  
  if (isNaN(selectedDate.getTime())) {
    return { isValid: false, error: 'Invalid date format' }
  }
  
  if (selectedDate < now) {
    return { isValid: false, error: `${fieldName} must be in the future` }
  }
  
  return { isValid: true }
}

/**
 * Validate date range
 */
export function validateDateRange(startDate: string | Date, endDate: string | Date): ValidationResult {
  if (!startDate || !endDate) {
    return { isValid: false, error: 'Both dates are required' }
  }
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: false, error: 'Invalid date format' }
  }
  
  if (end < start) {
    return { isValid: false, error: 'End date must be after start date' }
  }
  
  return { isValid: true }
}

/**
 * Validate file upload
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number // in MB
    allowedTypes?: string[]
  } = {}
): ValidationResult {
  const { maxSize = 10, allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] } = options
  
  if (!file) {
    return { isValid: false, error: 'File is required' }
  }
  
  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type must be one of: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`,
    }
  }
  
  // Check file size
  const maxBytes = maxSize * 1024 * 1024
  if (file.size > maxBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSize}MB`,
    }
  }
  
  return { isValid: true }
}

/**
 * Validate text length
 */
export function validateLength(
  text: string,
  min: number,
  max: number,
  fieldName: string = 'This field'
): ValidationResult {
  if (!text) {
    return { isValid: false, error: `${fieldName} is required` }
  }
  
  if (text.length < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min} characters` }
  }
  
  if (text.length > max) {
    return { isValid: false, error: `${fieldName} must be less than ${max} characters` }
  }
  
  return { isValid: true }
}

/**
 * Validate checkbox (terms and conditions)
 */
export function validateCheckbox(checked: boolean, message: string = 'You must agree to continue'): ValidationResult {
  if (!checked) {
    return { isValid: false, error: message }
  }
  return { isValid: true }
}

/**
 * Validate QR code format
 */
export function validateQRCode(qrCode: string): ValidationResult {
  if (!qrCode) {
    return { isValid: false, error: 'QR code is required' }
  }
  
  // QR code should match equipment ID format (e.g., EQ-001)
  if (!/^EQ-\d{3,}$/.test(qrCode)) {
    return { isValid: false, error: 'Invalid QR code format' }
  }
  
  return { isValid: true }
}

/**
 * Batch validate multiple fields
 */
export function validateForm(validations: Record<string, ValidationResult>): {
  isValid: boolean
  errors: Record<string, string>
} {
  const errors: Record<string, string> = {}
  let isValid = true
  
  for (const [field, result] of Object.entries(validations)) {
    if (!result.isValid && result.error) {
      errors[field] = result.error
      isValid = false
    }
  }
  
  return { isValid, errors }
}