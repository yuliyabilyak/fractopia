import { useEffect } from 'react'
import { useLang } from '../i18n/LangContext'
import { playFeedbackSound } from '../utils/sounds'
import ConfettiBurst from './ConfettiBurst'

interface Props {
  correct: boolean | null
  onNext: () => void
}

export default function FeedbackBanner({ correct, onNext }: Props) {
  const { t } = useLang()

  useEffect(() => {
    if (correct !== null) playFeedbackSound(correct)
  // correct is stable for the banner's lifetime; play once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (correct === null) return null

  return (
    <>
      {correct && <ConfettiBurst />}
      <div className={`feedback-banner ${correct ? 'correct' : 'wrong'}`}>
        <span>{correct ? t('correct') : t('wrong')}</span>
        <button onClick={onNext}>{t('next')}</button>
      </div>
    </>
  )
}
