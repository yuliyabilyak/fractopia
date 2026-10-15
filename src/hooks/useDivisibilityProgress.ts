import { useEffect, useRef, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { addRuleResults, type LevelId, type RuleResult, type RuleStats } from '../data/numberDetective'

export interface DivisibilityProgress {
  completedLevels: LevelId[]
  points: number
  ruleStats: RuleStats
}

/** Firestore field names one game stores its progress under. */
export interface ProgressFields {
  completedLevels: string
  points: string
  ruleStats: string
}

const DEFAULT_PROGRESS: DivisibilityProgress = {
  completedLevels: [],
  points: 0,
  ruleStats: {},
}

// Same storage approach as usePizzaTradeProgress: a game's fields merged into
// the existing progress/{uid} doc, which firestore.rules already permits.
// Shared by Number Detective and Number Bridges; each passes its own fields.
export function useDivisibilityProgress(uid: string | undefined, fields: ProgressFields) {
  const [progress, setProgress] = useState<DivisibilityProgress>(DEFAULT_PROGRESS)
  const [loadedForUid, setLoadedForUid] = useState<string | null>(null)
  const docExistsRef = useRef(false)
  // Mirrors `progress` so back-to-back saves build on each other rather than
  // on a value captured by a stale render.
  const progressRef = useRef(progress)

  useEffect(() => {
    if (!uid || loadedForUid === uid) return
    let cancelled = false
    getDoc(doc(db, 'progress', uid))
      .then(snap => {
        if (cancelled) return
        const data = snap.data()
        docExistsRef.current = snap.exists()
        const loaded: DivisibilityProgress = {
          completedLevels: data?.[fields.completedLevels] ?? [],
          points: data?.[fields.points] ?? 0,
          ruleStats: data?.[fields.ruleStats] ?? {},
        }
        progressRef.current = loaded
        setProgress(loaded)
        setLoadedForUid(uid)
      })
      .catch(() => {
        // offline or blocked — play on with local-only progress
        if (!cancelled) setLoadedForUid(uid)
      })
    return () => { cancelled = true }
  }, [uid, loadedForUid, fields])

  const loading = !!uid && loadedForUid !== uid

  function save(next: DivisibilityProgress) {
    progressRef.current = next
    setProgress(next)
    if (!uid) return
    const patch: Record<string, unknown> = {
      uid,
      [fields.completedLevels]: next.completedLevels,
      [fields.points]: next.points,
      [fields.ruleStats]: next.ruleStats,
    }
    if (!docExistsRef.current) patch.results = []
    setDoc(doc(db, 'progress', uid), patch, { merge: true })
      .then(() => { docExistsRef.current = true })
      .catch(() => { /* keep playing; the next save retries with the full state */ })
  }

  /** One finished challenge: its first-try result per rule, plus points earned. */
  function recordChallenge(results: RuleResult[], pointsEarned: number) {
    const prev = progressRef.current
    save({ ...prev, points: prev.points + pointsEarned, ruleStats: addRuleResults(prev.ruleStats, results) })
  }

  function completeLevel(level: LevelId) {
    const prev = progressRef.current
    if (prev.completedLevels.includes(level)) return
    save({ ...prev, completedLevels: [...prev.completedLevels, level].sort() })
  }

  return { ...progress, loading, recordChallenge, completeLevel }
}
