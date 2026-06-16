import { useLang } from '../i18n/LangContext'

interface Props {
  correct: boolean | null
  onNext: () => void
}

export default function FeedbackBanner({ correct, onNext }: Props) {
  const { t } = useLang()
  if (correct === null) return null
  return (
    <div className={`feedback-banner ${correct ? 'correct' : 'wrong'}`}>
      <span>{correct ? t('correct') : t('wrong')}</span>
      <button onClick={onNext}>{t('next')}</button>
    </div>
  )
}
