import { useEffect, useRef, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { DEFAULT_SAVE, normalizeSave, type WorkshopSave } from '../data/numberWorkshop'

// Number Workshop progress lives in one `workshop` map on the user's existing
// progress/{uid} doc (the same doc the other games merge their fields into, and
// the only one firestore.rules allows). Users who never played have no
// `workshop` field; normalizeSave turns that — or any partial map — into defaults.
export function useWorkshopProgress(uid: string | undefined) {
  const [save, setSave] = useState<WorkshopSave>(DEFAULT_SAVE)
  const [loadedForUid, setLoadedForUid] = useState<string | null>(null)
  // firestore.rules requires a brand-new doc to carry `uid` and a `results` list.
  const docExistsRef = useRef(false)
  // Mirrors `save` so back-to-back writes build on each other, not on a stale render.
  const saveRef = useRef(save)

  useEffect(() => {
    if (!uid || loadedForUid === uid) return
    let cancelled = false
    getDoc(doc(db, 'progress', uid))
      .then(snap => {
        if (cancelled) return
        docExistsRef.current = snap.exists()
        const loaded = normalizeSave(snap.data()?.workshop)
        saveRef.current = loaded
        setSave(loaded)
        setLoadedForUid(uid)
      })
      .catch(() => {
        // offline or blocked — play on with local-only progress
        if (!cancelled) setLoadedForUid(uid)
      })
    return () => { cancelled = true }
  }, [uid, loadedForUid])

  const loading = !!uid && loadedForUid !== uid

  /** Replace the whole save. Writes only when something actually changed. */
  function persist(next: WorkshopSave) {
    if (next === saveRef.current) return
    saveRef.current = next
    setSave(next)
    if (!uid) return
    const patch: Record<string, unknown> = { uid, workshop: next }
    if (!docExistsRef.current) patch.results = []
    setDoc(doc(db, 'progress', uid), patch, { merge: true })
      .then(() => { docExistsRef.current = true })
      .catch(() => { /* keep playing; the next write sends the full state again */ })
  }

  return { save, loading, persist }
}
