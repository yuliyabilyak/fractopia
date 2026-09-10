import { useEffect, useRef, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { STARTER_TOPPING_IDS } from '../data/pizzaTrade'

export interface PizzaTradeProgress {
  unlockedToppings: string[]
  highStreak: number
  correctTowardNextTopping: number
}

const DEFAULT_PROGRESS: PizzaTradeProgress = {
  unlockedToppings: STARTER_TOPPING_IDS,
  highStreak: 0,
  correctTowardNextTopping: 0,
}

export function usePizzaTradeProgress(uid: string | undefined) {
  const [progress, setProgress] = useState<PizzaTradeProgress>(DEFAULT_PROGRESS)
  // Tracks which uid the current `progress` was loaded for, so `loading` can be
  // derived instead of stored — avoids setState-in-effect for the "no uid yet" case.
  const [loadedForUid, setLoadedForUid] = useState<string | null>(null)
  // firestore.rules requires a *new* progress/{uid} doc to be created with a
  // `uid` field and a `results: list` field (the shape useProgress.ts writes).
  // A ref (not state) so a save immediately after load always sees the right
  // value, with no risk of racing a pending setState.
  const docExistsRef = useRef(false)

  useEffect(() => {
    if (!uid || loadedForUid === uid) return
    let cancelled = false
    getDoc(doc(db, 'progress', uid)).then(snap => {
      if (cancelled) return
      const data = snap.data()
      docExistsRef.current = snap.exists()
      setProgress({
        unlockedToppings: data?.pizzaTradeUnlockedToppings ?? STARTER_TOPPING_IDS,
        highStreak: data?.pizzaTradeHighStreak ?? 0,
        correctTowardNextTopping: data?.pizzaTradeCorrectTowardNextTopping ?? 0,
      })
      setLoadedForUid(uid)
    })
    return () => { cancelled = true }
  }, [uid, loadedForUid])

  const loading = !!uid && loadedForUid !== uid

  async function saveProgress(patch: Partial<PizzaTradeProgress>) {
    setProgress(prev => ({ ...prev, ...patch }))
    if (!uid) return
    const firestorePatch: Record<string, unknown> = { uid }
    if (!docExistsRef.current) firestorePatch.results = []
    if (patch.unlockedToppings !== undefined) firestorePatch.pizzaTradeUnlockedToppings = patch.unlockedToppings
    if (patch.highStreak !== undefined) firestorePatch.pizzaTradeHighStreak = patch.highStreak
    if (patch.correctTowardNextTopping !== undefined) firestorePatch.pizzaTradeCorrectTowardNextTopping = patch.correctTowardNextTopping
    await setDoc(doc(db, 'progress', uid), firestorePatch, { merge: true })
    docExistsRef.current = true
  }

  return { ...progress, loading, saveProgress }
}
