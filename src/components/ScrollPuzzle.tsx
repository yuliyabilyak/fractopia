import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n/LangContext'
import { playFeedbackSound } from '../utils/sounds'
import { HINT_AFTER_MISTAKES, type ScrollPuzzle as ScrollPuzzleData } from '../data/lostScroll'

type Phase = 'playing' | 'correct' | 'wrong'

interface Props {
  puzzle: ScrollPuzzleData
  onMistake: () => void
  onSolved: () => void
}

const MAX_DIGITS = 3
const WRONG_RESET_MS = 650
const SOLVED_MS = 900
const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

export default function ScrollPuzzle({ puzzle, onMistake, onSolved }: Props) {
  const { t } = useLang()
  const [phase, setPhase] = useState<Phase>('playing')
  const [typed, setTyped] = useState('')
  const mistakeCountRef = useRef(0)
  const [mistakeCount, setMistakeCount] = useState(0)

  // wrong → auto-reset after a beat so the child can try again. Scheduled in an
  // effect (not the click handler) so an unmount before it fires cancels it —
  // otherwise a stale timer could fire onSolved-equivalent state on a dead puzzle.
  useEffect(() => {
    if (phase !== 'wrong') return
    const id = setTimeout(() => { setPhase('playing'); setTyped('') }, WRONG_RESET_MS)
    return () => clearTimeout(id)
  }, [phase])

  // correct → brief pulse before the parent advances to the next puzzle
  useEffect(() => {
    if (phase !== 'correct') return
    const id = setTimeout(onSolved, SOLVED_MS)
    return () => clearTimeout(id)
  // onSolved is stable (defined fresh per puzzle in the parent); only phase should retrigger this
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function pressDigit(d: string) {
    if (phase !== 'playing' || typed.length >= MAX_DIGITS) return
    setTyped(prev => prev + d)
  }

  function pressBackspace() {
    if (phase !== 'playing') return
    setTyped(prev => prev.slice(0, -1))
  }

  function pressClear() {
    if (phase !== 'playing') return
    setTyped('')
  }

  function submit() {
    if (phase !== 'playing' || typed === '') return
    const value = parseInt(typed, 10)
    if (value === puzzle.answer) {
      playFeedbackSound(true)
      setPhase('correct')
    } else {
      playFeedbackSound(false)
      setPhase('wrong')
      onMistake()
      mistakeCountRef.current += 1
      setMistakeCount(mistakeCountRef.current)
    }
  }

  const leftDisplay = phase === 'correct' ? String(puzzle.answer) : (typed || '?')

  function slotClass(isBlank: boolean): string {
    if (!isBlank) return ''
    return phase === 'correct' ? 'scr-blank scr-blank--revealed' : 'scr-blank'
  }

  return (
    <div className="exercise-card scr-board">
      <p className="exercise-prompt">{t('scrollPrompt')}</p>

      <div className={`scr-scroll${phase === 'wrong' ? ' scr-scroll--shake' : ''}${phase === 'correct' ? ' scr-scroll--restored' : ''}`}>
        <div className="scr-equation">
          <span className="frac-display frac-display--large">
            <span className={`frac-n ${slotClass(puzzle.leftBlankIsNumerator)}`}>
              {puzzle.leftBlankIsNumerator ? leftDisplay : puzzle.leftKnown}
            </span>
            <span className="frac-bar-line" />
            <span className={`frac-d ${slotClass(!puzzle.leftBlankIsNumerator)}`}>
              {!puzzle.leftBlankIsNumerator ? leftDisplay : puzzle.leftKnown}
            </span>
          </span>

          <span className="scr-equals" aria-hidden="true">=</span>

          <span className="frac-display frac-display--large">
            <span className="frac-n">{puzzle.right.numerator}</span>
            <span className="frac-bar-line" />
            <span className="frac-d">{puzzle.right.denominator}</span>
          </span>
        </div>
      </div>

      {phase === 'wrong' && <p className="scr-wrong-hint">{t('scrollWrongHint')}</p>}
      {phase === 'playing' && mistakeCount >= HINT_AFTER_MISTAKES && (
        <p className="scr-hint">{t('scrollHint', { p: puzzle.base.numerator, q: puzzle.base.denominator })}</p>
      )}
      {phase === 'correct' && (
        <p className="scr-explain">{t('scrollExplain', { p: puzzle.base.numerator, q: puzzle.base.denominator })}</p>
      )}

      {phase !== 'correct' && (
        <>
          <div className="scr-keypad">
            {DIGITS.map(d => (
              <button key={d} type="button" className="scr-key" onClick={() => pressDigit(d)} disabled={phase !== 'playing'}>
                {d}
              </button>
            ))}
            <button type="button" className="scr-key scr-key--clear" onClick={pressClear} disabled={phase !== 'playing'}>
              {t('scrollClear')}
            </button>
            <button type="button" className="scr-key" onClick={() => pressDigit('0')} disabled={phase !== 'playing'}>
              0
            </button>
            <button type="button" className="scr-key scr-key--back" onClick={pressBackspace} disabled={phase !== 'playing'} aria-label={t('scrollClear')}>
              ⌫
            </button>
          </div>

          <button className="btn-check" onClick={submit} disabled={phase !== 'playing' || typed === ''}>
            {t('check')}
          </button>
        </>
      )}
    </div>
  )
}
