import { useState } from 'react'
import { useLang } from '../i18n/LangContext'
import { useFocusWhen } from '../hooks/useFocusWhen'
import Prompt from './Prompt'
import { arrowNav } from '../utils/arrowNav'
import { commonDivisorsMany, divisors, gcdMany } from '../utils/divisors'

interface Props {
  numbers: number[]
  mode: 'select' | 'generate'
  choices?: number[]
  onAnswer: (correct: boolean) => void
}

/** Column shapes — the same ● ▲ ■ (and colours, see App.css) Prime Forge uses. */
const SHAPES = ['●', '▲', '■']

type T = ReturnType<typeof useLang>['t']

/** Why `p` is not the greatest common divisor. */
function whyNot(p: number, numbers: number[], t: T): string {
  const misses = numbers.find(n => n % p !== 0)
  return misses === undefined
    ? t('ddWhySmaller', { p, g: gcdMany(numbers) })
    : t('ddWhyNotDivide', { p, n: misses })
}

/**
 * Divisor Duel — greatest common divisor ("největší společný dělitel", D (84; 96)).
 * Each number fights with its stack of divisor cards; the cards in every column
 * clash, and the biggest of them wins the crown.
 */
export default function DivisorDuel({ numbers, mode, choices, onAnswer }: Props) {
  return (
    <div className="exercise-card dd-card">
      {mode === 'select' && choices
        ? <SelectDuel numbers={numbers} choices={choices} onAnswer={onAnswer} />
        : <CardDuel numbers={numbers} onAnswer={onAnswer} />}
    </div>
  )
}

function Notation({ numbers }: { numbers: number[] }) {
  const { t } = useLang()
  return (
    <p className="dd-notation" aria-hidden="true">
      <span className="dd-notation-icon">👑</span>
      {t('ddNotation', { list: numbers.join('; ') })}
    </p>
  )
}

// ── Arena ────────────────────────────────────────────────────────────────────

interface ArenaProps {
  numbers: number[]
  expanded: boolean
  /** mark the cards that are in every column (Match hint, or the reveal) */
  showShared: boolean
  crown: number | null
  clash: boolean
  selected?: number | null
  wobble?: { col: number; d: number } | null
  onWobbleEnd?: () => void
  /** duel mode: cards become buttons */
  onTap?: (col: number, d: number) => void
}

function Arena({ numbers, expanded, showShared, crown, clash, selected = null, wobble = null, onWobbleEnd, onTap }: ArenaProps) {
  const { t } = useLang()
  const shared = new Set(commonDivisorsMany(numbers))

  return (
    <div
      className={`dd-arena dd-arena--${numbers.length}`}
      onKeyDown={onTap ? e => arrowNav(e, '.dd-chip', 'linear') : undefined}
    >
      {numbers.map((n, col) => (
        <section key={col} className={`dd-col dd-col--${col}`} aria-label={t('ddColumnAria', { n })}>
          <div className="dd-fighter">
            <span className="dd-shape" aria-hidden="true">{SHAPES[col]}</span>
            <span className="dd-number">{n}</span>
          </div>
          {expanded && (
            <div className="dd-stack">
              {divisors(n).map(d => {
                const isShared = shared.has(d)
                const crowned = crown === d
                const marked = showShared && isShared
                const cls = [
                  'dd-chip',
                  marked && 'dd-chip--shared',
                  crowned && 'dd-chip--crowned',
                  selected === d && 'dd-chip--selected',
                  wobble?.col === col && wobble.d === d && 'dd-chip--wobble',
                  clash && isShared && 'dd-chip--clash',
                ].filter(Boolean).join(' ')
                const mark = crowned ? '👑' : marked ? '⚔️' : null
                const label = [d, marked && t('ddShared'), crowned && t('ddCrowned')].filter(Boolean).join(', ')
                const body = (
                  <>
                    {selected === d && <span className="dd-chip-pick" aria-hidden="true">✓</span>}
                    {d}
                    {mark && <span className="dd-chip-mark" aria-hidden="true">{mark}</span>}
                  </>
                )
                return onTap ? (
                  <button
                    key={d}
                    type="button"
                    className={cls}
                    aria-label={label}
                    aria-pressed={selected === d}
                    onClick={() => onTap(col, d)}
                    onAnimationEnd={e => { if (e.animationName === 'dd-wobble') onWobbleEnd?.() }}
                  >
                    {body}
                  </button>
                ) : (
                  <span key={d} className={cls} aria-label={label} role="img">{body}</span>
                )
              })}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}

// ── Select: tap one answer card ──────────────────────────────────────────────

function SelectDuel({ numbers, choices, onAnswer }: { numbers: number[]; choices: number[]; onAnswer: (correct: boolean) => void }) {
  const { t } = useLang()
  const g = gcdMany(numbers)
  const [expanded, setExpanded] = useState(false)
  const [picked, setPicked] = useState<number | null>(null)
  const revealed = picked !== null
  const correct = picked === g
  const continueRef = useFocusWhen(revealed)

  const note = revealed && !correct ? whyNot(picked, numbers, t) : null
  const onlyOne = revealed && g === 1 ? t('ddOnlyOne') : null
  const prompt = !revealed ? t('ddPromptSelect') : correct ? t('ddNice') : t('ddAnswerIs', { g })

  return (
    <>
      <Prompt html={prompt} />
      <Notation numbers={numbers} />
      <Arena numbers={numbers} expanded={expanded || revealed} showShared={revealed} crown={revealed ? g : null} clash={revealed} />

      {!revealed && !expanded && (
        <button type="button" className="dd-secondary-btn" onClick={() => setExpanded(true)}>
          {t('ddShowDivisors')}
        </button>
      )}

      <div className="dd-answers">
        {choices.map(c => {
          const state = !revealed ? '' : c === g ? ' dd-answer--crowned' : c === picked ? ' dd-answer--picked' : ' dd-answer--idle'
          return (
            <button
              key={c}
              type="button"
              className={`dd-answer${state}`}
              aria-disabled={revealed || undefined}
              onClick={() => { if (!revealed) setPicked(c) }}
            >
              {revealed && c === g && <span className="dd-answer-crown" aria-hidden="true">👑</span>}
              {c}
            </button>
          )
        })}
      </div>

      {note && <p className="dd-note">{note}</p>}
      {onlyOne && <p className="dd-note dd-note--teach">{onlyOne}</p>}

      {revealed && (
        <button ref={continueRef} type="button" className="btn-check dd-btn" onClick={() => onAnswer(correct)}>
          {t('ddContinue')}
        </button>
      )}
    </>
  )
}

// ── Duel: nominate the biggest shared card ───────────────────────────────────

function CardDuel({ numbers, onAnswer }: { numbers: number[]; onAnswer: (correct: boolean) => void }) {
  const { t } = useLang()
  const g = gcdMany(numbers)
  const shared = new Set(commonDivisorsMany(numbers))
  const [selected, setSelected] = useState<number | null>(null)
  const [matchOn, setMatchOn] = useState(false)
  const [wobble, setWobble] = useState<{ col: number; d: number } | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [retried, setRetried] = useState(false)
  const [done, setDone] = useState<{ pick: number; verdict: boolean } | null>(null)
  const continueRef = useFocusWhen(done !== null)

  const say = (text: string) => setNote(text)

  const tap = (col: number, d: number) => {
    if (done) return
    if (!shared.has(d)) {
      const missing = numbers.find(n => n % d !== 0)
      setWobble({ col, d })
      say(t('ddNotIn', { d, n: missing ?? '' }))
      return
    }
    setNote(null)
    setSelected(s => (s === d ? null : d))
  }

  // the first try is the verdict; a smaller shared card earns exactly one retry
  const submit = () => {
    if (selected === null) return
    const ok = selected === g
    if (ok || retried) {
      setDone({ pick: selected, verdict: ok && !retried })
      setNote(null)
      return
    }
    setRetried(true)
    setSelected(null)
    say(t('ddBiggerExists', { d: selected }))
  }

  const finalNote = done && done.pick !== g ? whyNot(done.pick, numbers, t) : null
  const onlyOne = done && g === 1 ? t('ddOnlyOne') : null
  const prompt = !done
    ? t('ddPromptDuel')
    : done.verdict ? t('ddNice') : done.pick === g ? t('ddFoundIt') : t('ddAnswerIs', { g })

  return (
    <>
      <Prompt html={prompt} />
      <Notation numbers={numbers} />
      <Arena
        numbers={numbers}
        expanded
        showShared={matchOn || done !== null}
        crown={done ? g : null}
        clash={done !== null}
        selected={done ? done.pick : selected}
        wobble={wobble}
        onWobbleEnd={() => setWobble(null)}
        onTap={done ? undefined : tap}
      />

      <p className="dd-note" aria-live="polite">{finalNote ?? note ?? ''}</p>
      {onlyOne && <p className="dd-note dd-note--teach">{onlyOne}</p>}

      <div className="dd-actions">
        {!done && (
          <>
            <button type="button" className="dd-secondary-btn" aria-pressed={matchOn} onClick={() => setMatchOn(m => !m)}>
              ⚔️ {t('ddMatch')}
            </button>
            {selected !== null && (
              <button type="button" className="btn-check dd-btn" onClick={submit}>
                {t('ddSubmit')}
              </button>
            )}
          </>
        )}
        {done && (
          <button ref={continueRef} type="button" className="btn-check dd-btn" onClick={() => onAnswer(done.verdict)}>
            {t('ddContinue')}
          </button>
        )}
      </div>
    </>
  )
}
