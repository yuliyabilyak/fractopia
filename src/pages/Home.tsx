import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Home() {
  const { user, loading, loginAnonymously } = useAuth()
  const navigate = useNavigate()

  const start = async () => {
    if (!user) await loginAnonymously()
    navigate('/fractions')
  }

  if (loading) return <div className="center-page">Loading…</div>

  return (
    <div className="home-page">
      <h1>🍕 Math with Fractions</h1>
      <p>Learn fractions with pizzas and bars!</p>
      <button className="btn-start" onClick={start}>
        Start Learning
      </button>
    </div>
  )
}
