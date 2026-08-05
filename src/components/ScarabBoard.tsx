import { useMemo, useRef, useState } from 'react'
import { useLang } from '../i18n/LangContext'
import { playFeedbackSound } from '../utils/sounds'
import type { Fraction, ScarabOption } from '../data/scarabMatch'

interface Props {
  target: Fraction
  options: ScarabOption[]
  onMistake: () => void
  onComplete: (mistakes: number) => void
}

const FLY_DELAY_MS = 700
const SHAKE_MS = 480

export default function ScarabBoard({ target, options, onMistake, onComplete }: Props) {
  const { t } = useLang()
  const totalEquivalents = useMemo(() => options.filter(o => o.equivalent).length, [options])

  const [found, setFound] = useState<Set<string>>(new Set())
  const [shakingId, setShakingId] = useState<string | null>(null)
  const [showWrongHint, setShowWrongHint] = useState(false)
  const [flying, setFlying] = useState(false)
  const mistakesRef = useRef(0)
  const doneRef = useRef(false)

  function handleTap(opt: ScarabOption) {
    if (doneRef.current || flying || found.has(opt.id) || shakingId === opt.id) return

    if (opt.equivalent) {
      playFeedbackSound(true)
      const next = new Set(found)
      next.add(opt.id)
      setFound(next)
      if (next.size === totalEquivalents) {
        doneRef.current = true
        setFlying(true)
        setTimeout(() => onComplete(mistakesRef.current), FLY_DELAY_MS)
      }
    } else {
      playFeedbackSound(false)
      mistakesRef.current += 1
      onMistake()
      setShakingId(opt.id)
      setShowWrongHint(true)
      setTimeout(() => {
        setShakingId(null)
        setShowWrongHint(false)
      }, SHAKE_MS)
    }
  }

  function scarabClass(opt: ScarabOption): string {
    const isFound = found.has(opt.id)
    const cls = ['sm-scarab']
    if (isFound) cls.push('sm-scarab--found')
    if (shakingId === opt.id) cls.push('sm-scarab--wrong')
    if (flying && isFound) cls.push('sm-scarab--flying')
    if (flying && !isFound) cls.push('sm-scarab--disabled')
    return cls.join(' ')
  }

  return (
    <div className="exercise-card sm-board">
      <p className="exercise-prompt">{t('scarabPrompt')}</p>

      <div className="sm-target-frame">
        <span className="sm-target-label">{t('scarabTargetLabel')}</span>
        <span className="frac-display frac-display--large">
          <span className="frac-n">{target.numerator}</span>
          <span className="frac-bar-line" />
          <span className="frac-d">{target.denominator}</span>
        </span>
      </div>

      <p className="sm-progress-label">{t('scarabFoundLabel', { n: found.size, total: totalEquivalents })}</p>

      <div className="sm-scarabs-grid">
        {options.map(opt => (
          <button
            key={opt.id}
            type="button"
            className={scarabClass(opt)}
            onClick={() => handleTap(opt)}
            disabled={found.has(opt.id) || flying}
            aria-pressed={found.has(opt.id)}
          >
            <span className="sm-scarab-emoji" aria-hidden="true">🪲</span>
            <span className="frac-display">
              <span className="frac-n">{opt.fraction.numerator}</span>
              <span className="frac-bar-line" />
              <span className="frac-d">{opt.fraction.denominator}</span>
            </span>
          </button>
        ))}
      </div>

      {showWrongHint && <p className="sm-wrong-hint">{t('scarabWrongHint')}</p>}
      {flying && <p className="sm-round-clear-banner">{t('scarabRoundClear')}</p>}
    </div>
  )
}
