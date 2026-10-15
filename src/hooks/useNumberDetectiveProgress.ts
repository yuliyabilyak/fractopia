import { useEffect, useRef, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { addRuleResults, type LevelId, type RuleResult, type RuleStats } from '../data/numberDetective'

export interface NumberDetectiveProgress {
  completedLevels: LevelId[]
  clues: number
  ruleStats: RuleStats
}

const DEFAULT_PROGRESS: NumberDetectiveProgress = {
  completedLevels: [],
  clues: 0,
  ruleStats: {},
}

// Same storage approach as usePizzaTradeProgress: extra nd* fields merged into
// the existing progress/{uid} doc, which firestore.rules already permits.
export function useNumberDetectiveProgress(uid: string | undefined) {
  const [progress, setProgress] = useState<NumberDetectiveProgress>(DEFAULT_PROGRESS)
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
        const loaded: NumberDetectiveProgress = {
          completedLevels: data?.ndCompletedLevels ?? [],
          clues: data?.ndClues ?? 0,
          ruleStats: data?.ndRuleStats ?? {},
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
  }, [uid, loadedForUid])

  const loading = !!uid && loadedForUid !== uid

  function save(next: NumberDetectiveProgress) {
    progressRef.current = next
    setProgress(next)
    if (!uid) return
    const patch: Record<string, unknown> = {
      uid,
      ndCompletedLevels: next.completedLevels,
      ndClues: next.clues,
      ndRuleStats: next.ruleStats,
    }
    if (!docExistsRef.current) patch.results = []
    setDoc(doc(db, 'progress', uid), patch, { merge: true })
      .then(() => { docExistsRef.current = true })
      .catch(() => { /* keep playing; the next save retries with the full state */ })
  }

  /** One solved case: its first-try result per rule, plus clues earned. */
  function recordCase(results: RuleResult[], cluesEarned: number) {
    const prev = progressRef.current
    save({ ...prev, clues: prev.clues + cluesEarned, ruleStats: addRuleResults(prev.ruleStats, results) })
  }

  function completeLevel(level: LevelId) {
    const prev = progressRef.current
    if (prev.completedLevels.includes(level)) return
    save({ ...prev, completedLevels: [...prev.completedLevels, level].sort() })
  }

  return { ...progress, loading, recordCase, completeLevel }
}
