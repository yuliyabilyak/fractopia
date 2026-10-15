import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLang } from '../i18n/LangContext'
import LangSwitcher from '../components/LangSwitcher'
import ThemeToggle from '../components/ThemeToggle'
import { TOPIC_GAMES, type TopicId } from '../data/topics'

interface Props {
  topic: TopicId
}

/** One topic's games — what the landing page used to list all at once. */
export default function TopicPage({ topic }: Props) {
  const { user, loading, loginAnonymously } = useAuth()
  const navigate = useNavigate()
  const { t } = useLang()

  // the main fractions session saves results, so it needs a (anonymous) user first
  const startFractions = async () => {
    if (!user) await loginAnonymously()
    navigate('/fractions')
  }

  if (loading) return <div className="center-page">Loading…</div>

  return (
    <div className="home-page">
      <button type="button" className="training-back-btn topic-back-btn" onClick={() => navigate('/')}>← {t('trainingBack')}</button>
      <div className="top-bar">
        <LangSwitcher />
        <ThemeToggle />
      </div>
      <h1>{t(topic === 'fractions' ? 'homeTitle' : 'topicDivisibility')}</h1>
      <p>{t(topic === 'fractions' ? 'homeSubtitle' : 'divSubtitle')}</p>
      {topic === 'fractions' && (
        <button className="btn-start" onClick={startFractions}>
          {t('start')}
        </button>
      )}
      {TOPIC_GAMES[topic].map(game => (
        <button key={game.path} className="btn-training" onClick={() => navigate(game.path)}>
          {t(game.labelKey)}
        </button>
      ))}
    </div>
  )
}
