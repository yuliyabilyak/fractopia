import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLang } from '../i18n/LangContext'
import LangSwitcher from '../components/LangSwitcher'
import ThemeToggle from '../components/ThemeToggle'

export default function Home() {
  const { user, loading, loginAnonymously } = useAuth()
  const navigate = useNavigate()
  const { t } = useLang()

  const start = async () => {
    if (!user) await loginAnonymously()
    navigate('/fractions')
  }

  if (loading) return <div className="center-page">Loading…</div>

  return (
    <div className="home-page">
      <div className="top-bar">
        <LangSwitcher />
        <ThemeToggle />
      </div>
      <h1>{t('homeTitle')}</h1>
      <p>{t('homeSubtitle')}</p>
      <button className="btn-start" onClick={start}>
        {t('start')}
      </button>
      <button className="btn-training" onClick={() => navigate('/training')}>
        {t('trainingCentre')}
      </button>
    </div>
  )
}
