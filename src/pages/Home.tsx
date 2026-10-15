import { useNavigate } from 'react-router-dom'
import { useLang } from '../i18n/LangContext'
import LangSwitcher from '../components/LangSwitcher'
import ThemeToggle from '../components/ThemeToggle'
import { TOPIC_PATH } from '../data/topics'

export default function Home() {
  const navigate = useNavigate()
  const { t } = useLang()

  return (
    <div className="home-page">
      <div className="top-bar">
        <LangSwitcher />
        <ThemeToggle />
      </div>
      <h1>{t('landingTitle')}</h1>
      <p>{t('landingSubtitle')}</p>
      <div className="landing-topics">
        <button type="button" className="landing-topic-card" onClick={() => navigate(TOPIC_PATH.fractions)}>
          <span className="landing-topic-icon" aria-hidden="true">🍕</span>
          <span className="landing-topic-title">{t('topicFractions')}</span>
          <span className="landing-topic-desc">{t('topicFractionsDesc')}</span>
        </button>
        <button type="button" className="landing-topic-card" onClick={() => navigate(TOPIC_PATH.divisibility)}>
          <span className="landing-topic-icon" aria-hidden="true">🔢</span>
          <span className="landing-topic-title">{t('topicDivisibility')}</span>
          <span className="landing-topic-desc">{t('topicDivisibilityDesc')}</span>
        </button>
      </div>
    </div>
  )
}
