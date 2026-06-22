import { useState } from 'react'
import {
  collection, addDoc, getDocs, query, orderBy, limit, Timestamp,
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { LeaderboardEntry } from '../types'

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)

  async function submitScore(
    nickname: string,
    score: number,
    correctCount: number,
    totalCount: number,
  ): Promise<boolean> {
    setLoading(true)
    try {
      await addDoc(collection(db, 'leaderboard'), {
        nickname: nickname.trim().slice(0, 20),
        score,
        correctCount,
        totalCount,
        date: Timestamp.now(),
      })
      const snap = await getDocs(
        query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(5))
      )
      setEntries(snap.docs.map(d => d.data() as LeaderboardEntry))
      return true
    } catch {
      return false
    } finally {
      setLoading(false)
    }
  }

  return { entries, loading, submitScore }
}
