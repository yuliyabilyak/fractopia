import { useState, useEffect } from 'react'
import { type User, onAuthStateChanged, signInAnonymously, signOut } from 'firebase/auth'
import { auth } from '../firebase/config'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const loginAnonymously = () => signInAnonymously(auth)
  const logout = () => signOut(auth)

  return { user, loading, loginAnonymously, logout }
}
