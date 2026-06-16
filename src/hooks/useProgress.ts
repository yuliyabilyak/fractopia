import { doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../firebase/config'
import type { ExerciseResult } from '../types'

export function useProgress(uid: string | undefined) {
  const saveResult = async (result: ExerciseResult) => {
    if (!uid) return
    const ref = doc(db, 'progress', uid)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      await updateDoc(ref, { results: arrayUnion(result) })
    } else {
      await setDoc(ref, { uid, results: [result] })
    }
  }

  return { saveResult }
}
