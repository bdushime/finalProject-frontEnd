import { SCORE_CHANGES, SCORE_LEVELS } from '../types/enums'

type ScoreLevel = 'TRUSTED' | 'GOOD' | 'FAIR' | 'AT_RISK'

/**
 * Calculate score change based on return status
 */
export function calculateScoreChange(
  isOnTime: boolean,
  hoursOverdue?: number,
  hasDamage?: boolean,
  damageLevel?: 'minor' | 'major' | 'lost'
): number {
  let scoreChange = 0

  // On-time return bonus
  if (isOnTime) {
    scoreChange += SCORE_CHANGES.ON_TIME_RETURN
  }

  // Late return penalties
  if (hoursOverdue && hoursOverdue > 0) {
    const daysOverdue = Math.ceil(hoursOverdue / 24)
    
    if (daysOverdue === 1) {
      scoreChange += SCORE_CHANGES.LATE_1_DAY
    } else if (daysOverdue >= 2 && daysOverdue <= 3) {
      scoreChange += SCORE_CHANGES.LATE_2_3_DAYS
    } else if (daysOverdue > 3) {
      scoreChange += SCORE_CHANGES.LATE_MORE_THAN_3_DAYS
    }
  }

  // Damage penalties
  if (hasDamage && damageLevel) {
    switch (damageLevel) {
      case 'minor':
        scoreChange += SCORE_CHANGES.MINOR_DAMAGE
        break
      case 'major':
        scoreChange += SCORE_CHANGES.MAJOR_DAMAGE
        break
      case 'lost':
        scoreChange += SCORE_CHANGES.LOST_EQUIPMENT
        break
    }
  }

  return scoreChange
}

/**
 * Get score level information
 */
export function getScoreLevel(score: number): {
  level: ScoreLevel
  label: string
  color: string
  min: number
  max: number
} {
  if (score >= SCORE_LEVELS.TRUSTED.min) {
    return {
      level: 'TRUSTED',
      ...SCORE_LEVELS.TRUSTED,
    }
  }
  
  if (score >= SCORE_LEVELS.GOOD.min) {
    return {
      level: 'GOOD',
      ...SCORE_LEVELS.GOOD,
    }
  }
  
  if (score >= SCORE_LEVELS.FAIR.min) {
    return {
      level: 'FAIR',
      ...SCORE_LEVELS.FAIR,
    }
  }
  
  return {
    level: 'AT_RISK',
    ...SCORE_LEVELS.AT_RISK,
  }
}

/**
 * Get score color class for Tailwind
 */
export function getScoreColorClass(score: number): string {
  const level = getScoreLevel(score)
  
  const colorMap: Record<string, string> = {
    success: 'text-success-600 bg-success-100',
    info: 'text-primary-600 bg-primary-100',
    warning: 'text-warning-600 bg-warning-100',
    danger: 'text-danger-600 bg-danger-100',
  }
  
  return colorMap[level.color] || colorMap.danger
}

/**
 * Calculate new score with bounds (0-100)
 */
export function calculateNewScore(currentScore: number, change: number): number {
  const newScore = currentScore + change
  return Math.max(0, Math.min(100, newScore)) // Clamp between 0 and 100
}

// Simple reliability score based on usage stats
export function calculateReliabilityScore(stats: { totalCheckouts: number; lateReturns: number; damages: number }): number {
  const { totalCheckouts, lateReturns, damages } = stats
  const base = 100
  const latePenalty = Math.min(lateReturns * 5, 50) // cap
  const damagePenalty = Math.min(damages * 15, 60)
  const experienceBonus = Math.min(Math.max(totalCheckouts - 10, 0) * 0.5, 10)
  const score = base - latePenalty - damagePenalty + experienceBonus
  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * Get maximum checkout days allowed for score
 */
export function getMaxCheckoutDays(score: number): number {
  const level = getScoreLevel(score).level
  
  const dayLimits: Record<ScoreLevel, number> = {
    TRUSTED: 7,
    GOOD: 5,
    FAIR: 3,
    AT_RISK: 1,
  }
  
  return dayLimits[level] || 1
}

/**
 * Check if user can make reservations
 */
export function canMakeReservations(score: number): boolean {
  return score >= SCORE_LEVELS.GOOD.min
}

/**
 * Check if user can check out specific equipment category
 */
export function canCheckoutEquipment(
  score: number,
  equipmentValue?: number
): boolean {
  const level = getScoreLevel(score).level
  
  // High-value equipment restrictions
  if (equipmentValue && equipmentValue > 1000) {
    return level === 'TRUSTED' || level === 'GOOD'
  }
  
  // At-risk users have restricted access
  if (level === 'AT_RISK') {
    return false
  }
  
  return true
}

/**
 * Calculate score breakdown percentages
 */
export function calculateScoreBreakdown(stats: {
  onTimeReturns: number
  totalReturns: number
  damagedItems: number
  totalCheckouts: number
}): {
  onTimePercentage: number
  equipmentCarePercentage: number
  reliabilityPercentage: number
  bonusPercentage: number
} {
  const onTimeRate = stats.totalReturns > 0 
    ? (stats.onTimeReturns / stats.totalReturns) * 100 
    : 100
  
  const damageRate = stats.totalCheckouts > 0
    ? (stats.damagedItems / stats.totalCheckouts) * 100
    : 0
  
  const equipmentCareRate = 100 - damageRate
  
  return {
    onTimePercentage: Math.round(onTimeRate * 0.4), // 40% weight
    equipmentCarePercentage: Math.round(equipmentCareRate * 0.3), // 30% weight
    reliabilityPercentage: Math.round(onTimeRate * 0.2), // 20% weight
    bonusPercentage: Math.round(stats.totalCheckouts > 20 ? 10 : (stats.totalCheckouts / 20) * 10), // 10% weight
  }
}

/**
 * Get privileges based on score
 */
export function getUserPrivileges(score: number): {
  maxCheckoutDays: number
  maxSimultaneousCheckouts: number
  canReserve: boolean
  canCheckoutHighValue: boolean
  requiresApproval: boolean
  trustBadge: string
} {
  const level: ScoreLevel = getScoreLevel(score).level
  
  const privileges: Record<ScoreLevel, {
    maxCheckoutDays: number
    maxSimultaneousCheckouts: number
    canReserve: boolean
    canCheckoutHighValue: boolean
    requiresApproval: boolean
    trustBadge: string
  }> = {
    TRUSTED: {
      maxCheckoutDays: 7,
      maxSimultaneousCheckouts: 3,
      canReserve: true,
      canCheckoutHighValue: true,
      requiresApproval: false,
      trustBadge: '⭐ Trusted User',
    },
    GOOD: {
      maxCheckoutDays: 5,
      maxSimultaneousCheckouts: 2,
      canReserve: true,
      canCheckoutHighValue: true,
      requiresApproval: false,
      trustBadge: '✓ Good Standing',
    },
    FAIR: {
      maxCheckoutDays: 3,
      maxSimultaneousCheckouts: 1,
      canReserve: false,
      canCheckoutHighValue: false,
      requiresApproval: true,
      trustBadge: ' Fair Standing',
    },
    AT_RISK: {
      maxCheckoutDays: 1,
      maxSimultaneousCheckouts: 1,
      canReserve: false,
      canCheckoutHighValue: false,
      requiresApproval: true,
      trustBadge: ' At Risk',
    },
  }
  
  return privileges[level] || privileges.AT_RISK
}