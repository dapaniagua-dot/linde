export type MaterialStatus = 'locked' | 'available' | 'done'

export interface UnitProgress {
  unitId: number
  guiaDone: boolean
  videoDone: boolean
  claseDone: boolean
  evaluationPassed: boolean
  evaluationScore: number | null
  evaluationAttempts: number
}

export interface UserProgress {
  userId: string
  units: Record<number, UnitProgress>
}

const PROGRESS_KEY = 'linde_progress'

function getDefaultUnitProgress(unitId: number): UnitProgress {
  return {
    unitId,
    guiaDone: false,
    videoDone: false,
    claseDone: true, // Sync class marked done by admin; default true for demo
    evaluationPassed: false,
    evaluationScore: null,
    evaluationAttempts: 0,
  }
}

function loadAllProgress(): Record<string, UserProgress> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveAllProgress(all: Record<string, UserProgress>): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(all))
}

export function getUserProgress(userId: string): UserProgress {
  const all = loadAllProgress()
  if (!all[userId]) {
    all[userId] = {
      userId,
      units: {},
    }
    saveAllProgress(all)
  }
  return all[userId]
}

export function getUnitProgress(userId: string, unitId: number): UnitProgress {
  const userProgress = getUserProgress(userId)
  if (!userProgress.units[unitId]) {
    userProgress.units[unitId] = getDefaultUnitProgress(unitId)
  }
  return userProgress.units[unitId]
}

export function markMaterialDone(
  userId: string,
  unitId: number,
  material: 'guia' | 'video' | 'clase'
): void {
  const all = loadAllProgress()
  if (!all[userId]) {
    all[userId] = { userId, units: {} }
  }
  if (!all[userId].units[unitId]) {
    all[userId].units[unitId] = getDefaultUnitProgress(unitId)
  }
  const unit = all[userId].units[unitId]
  if (material === 'guia') unit.guiaDone = true
  if (material === 'video') unit.videoDone = true
  if (material === 'clase') unit.claseDone = true
  saveAllProgress(all)
}

export function saveEvaluationResult(
  userId: string,
  unitId: number,
  score: number,
  passed: boolean
): void {
  const all = loadAllProgress()
  if (!all[userId]) {
    all[userId] = { userId, units: {} }
  }
  if (!all[userId].units[unitId]) {
    all[userId].units[unitId] = getDefaultUnitProgress(unitId)
  }
  const unit = all[userId].units[unitId]
  unit.evaluationScore = score
  unit.evaluationPassed = passed
  unit.evaluationAttempts += 1
  saveAllProgress(all)
}

export function canTakeEvaluation(
  userId: string,
  unitId: number
): boolean {
  const unit = getUnitProgress(userId, unitId)
  return unit.guiaDone
}

export function getOverallProgress(userId: string, totalUnits: number): number {
  const progress = getUserProgress(userId)
  const passedCount = Object.values(progress.units).filter(
    (u) => u.evaluationPassed
  ).length
  return Math.round((passedCount / totalUnits) * 100)
}

export function isUnitLocked(userId: string, unitId: number): boolean {
  if (unitId === 1) return false
  const prevUnit = getUnitProgress(userId, unitId - 1)
  return !prevUnit.evaluationPassed
}

export function getUnitStatus(
  userId: string,
  unitId: number
): 'locked' | 'available' | 'in_progress' | 'completed' {
  if (isUnitLocked(userId, unitId)) return 'locked'
  const unit = getUnitProgress(userId, unitId)
  if (unit.evaluationPassed) return 'completed'
  if (unit.guiaDone || unit.videoDone) return 'in_progress'
  return 'available'
}
