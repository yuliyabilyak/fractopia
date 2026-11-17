import { useState } from 'react'
import { useLang } from '../i18n/LangContext'
import { useFocusWhen } from '../hooks/useFocusWhen'
import Prompt from './Prompt'
import { arrowNav } from '../utils/arrowNav'
import { isCommonMultiple, lanePositions, lapsToReach, lcm, nextPosition } from '../utils/multiples'

interface Props {
  a: number
  b: number
  mode: 'select' | 'generate'
  choices?: number[]
  onAnswer: (correct: boolean) => void
}

/** Lane chips per runner (meetingPoint.test.ts checks every exercise fits). */
const LANE_CAP = 24
const MAX_DIGITS = 3
/** Runner shapes — Divisor Duel's first two columns (colours in App.css). */
const SHAPES = ['●', '▲']

type T = ReturnType<typeof useLang>['t']
type Pair = [number, number]

/** Why `n` is not the first meeting point. */
function whyNot(n: number, a: number, b: number, t: T): string {
  if (isCommonMultiple(n, a, b)) return t('mpMetEarlier', { n, m: lcm(a, b) })
  return t('mpNotInLane', { lap: n % a !== 0 ? a : b, n })
}

/** Laps each runner needs so the reveal shows the first meeting (and a later one the child named). */
function revealCounts(a: number, b: number, current: Pair, named: number | null): Pair {
  const m = lcm(a, b)
  const target = named !== null && isCommonMultiple(named, a, b) ? Math.max(m, named) : m
  const want = (lap: number, cur: number) => Math.min(LANE_CAP, Math.max(cur, lapsToReach(lap, target)))
  return [want(a, current[0]), want(b, current[1])]
}

/**
 * Meeting Point — least common multiple ("nejmenší společný násobek", n (12; 9)).
 * Two runners with different laps start together at 0; the first number both
 * land on is where they meet again.
 */
export default function MeetingPoint({ a, b, mode, choices, onAnswer }: Props) {
  return (
    <div className="exercise-card mp-card">
      {mode === 'select' && choices
        ? <SelectRace a={a} b={b} choices={choices} onAnswer={onAnswer} />
        : <RunRace a={a} b={b} onAnswer={onAnswer} />}
    </div>
  )
}

function Notation({ a, b }: { a: number; b: number }) {
  const { t } = useLang()
  return (
    <p className="mp-notation" aria-hidden="true">
      <span>🏁</span>
      {t('mpNotation', { a, b })}
    </p>
  )
}

// ── Track ────────────────────────────────────────────────────────────────────

interface TrackProps {
  laps: Pair
  counts: Pair
  showLanes: boolean
  /** lanes appear all at once: chips land one after another */
  reveal?: boolean
  behind?: 0 | 1 | null
  /** run mode: runners become buttons that run one more lap */
  onRun?: (i: 0 | 1) => void
}

function Track({ laps, counts, showLanes, reveal = false, behind = null, onRun }: TrackProps) {
  const { t } = useLang()
  const lanes = laps.map((lap, i) => lanePositions(lap, counts[i]))
  const meets = new Set(lanes[0].filter(p => lanes[1].includes(p)))
  const first = lcm(laps[0], laps[1])

  return (
    <div className={`mp-track${reveal ? ' mp-track--reveal' : ''}`} onKeyDown={onRun ? e => arrowNav(e, '.mp-runner', 'linear') : undefined}>
      {laps.map((lap, i) => {
        const runnerCls = `mp-runner mp-runner--${i}${behind === i ? ' mp-runner--behind' : ''}`
        const runnerBody = (
          <>
            {/* keyed by laps run, so the hop replays on every lap */}
            <span key={counts[i]} className={`mp-runner-shape${counts[i] > 0 ? ' mp-runner-shape--running' : ''}`} aria-hidden="true">
              {SHAPES[i]}
            </span>
            <span className="mp-runner-lap">{t('mpPerLap', { lap })}</span>
            {behind === i && <span className="mp-runner-behind">⬅ {t('mpBehindLabel')}</span>}
          </>
        )
        return (
          <div key={i} className={`mp-lane mp-lane--${i}`}>
            {onRun ? (
              <button
                type="button"
                className={runnerCls}
                aria-label={t('mpRunAria', { lap })}
                disabled={counts[i] >= LANE_CAP}
                onClick={() => onRun(i as 0 | 1)}
              >
                {runnerBody}
              </button>
            ) : (
              <div className={runnerCls}>{runnerBody}</div>
            )}
            {showLanes && (
              <ol className="mp-chips" aria-label={t('mpLaneAria', { lap })}>
                <li className="mp-chip mp-chip--start">
                  <span className="mp-sr-only">{t('mpStart')} </span>0
                </li>
                {lanes[i].map(p => {
                  const meet = meets.has(p)
                  const isFirst = meet && p === first
                  return (
                    <li key={p} className={`mp-chip${meet ? ' mp-chip--meet' : ''}${isFirst ? ' mp-chip--first' : ''}`}>
                      {p}
                      {meet && <span className="mp-flag" aria-hidden="true">🚩</span>}
                      {meet && <span className="mp-sr-only">, {t('mpMeet')}</span>}
                      {isFirst && <span className="mp-chip-first">{t('mpFirst')}</span>}
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Select: tap one answer card ──────────────────────────────────────────────

function SelectRace({ a, b, choices, onAnswer }: { a: number; b: number; choices: number[]; onAnswer: (correct: boolean) => void }) {
  const { t } = useLang()
  const m = lcm(a, b)
  const [showLaps, setShowLaps] = useState(false)
  const [picked, setPicked] = useState<number | null>(null)
  const revealed = picked !== null
  const correct = picked === m
  const continueRef = useFocusWhen(revealed)

  const counts = revealCounts(a, b, [0, 0], revealed && !correct ? picked : null)
  const note = revealed && !correct ? whyNot(picked, a, b, t) : null
  const prompt = !revealed ? t('mpPromptSelect') : correct ? t('mpNice') : t('mpAnswerIs', { m })

  return (
    <>
      <Prompt html={prompt} />
      <Notation a={a} b={b} />
      <Track laps={[a, b]} counts={counts} showLanes={showLaps || revealed} reveal />

      {!revealed && !showLaps && (
        <button type="button" className="mp-secondary-btn" onClick={() => setShowLaps(true)}>
          {t('mpShowLaps')}
        </button>
      )}

      <div className="mp-answers">
        {choices.map(c => {
          const state = !revealed ? '' : c === m ? ' mp-answer--first' : c === picked ? ' mp-answer--picked' : ' mp-answer--idle'
          return (
            <button
              key={c}
              type="button"
              className={`mp-answer${state}`}
              aria-disabled={revealed || undefined}
              onClick={() => { if (!revealed) setPicked(c) }}
            >
              {revealed && c === m && <span className="mp-answer-flag" aria-hidden="true">🚩</span>}
              {c}
            </button>
          )
        })}
      </div>

      {note && <p className="mp-note">{note}</p>}

      {revealed && (
        <button ref={continueRef} type="button" className="btn-check mp-btn" onClick={() => onAnswer(correct)}>
          {t('mpContinue')}
        </button>
      )}
    </>
  )
}

// ── Run: tap runners, then build the answer ──────────────────────────────────

const DIGIT_CARDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]

function RunRace({ a, b, onAnswer }: { a: number; b: number; onAnswer: (correct: boolean) => void }) {
  const { t } = useLang()
  const m = lcm(a, b)
  const laps: Pair = [a, b]
  const [counts, setCounts] = useState<Pair>([0, 0])
  const [showBehind, setShowBehind] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [entry, setEntry] = useState<number[]>([])
  const [answer, setAnswer] = useState<number | null>(null)
  const done = answer !== null
  const continueRef = useFocusWhen(done)

  const pos: Pair = [counts[0] * a, counts[1] * b]
  const behind = !showBehind || pos[0] === pos[1] ? null : pos[0] < pos[1] ? 0 : 1

  const say = (text: string) => setStatus(text)

  const run = (i: 0 | 1) => {
    if (counts[i] >= LANE_CAP) {
      say(t('mpLaneFull'))
      return
    }
    const landed = nextPosition(pos[i], laps[i])
    const other = 1 - i
    setCounts(c => (i === 0 ? [c[0] + 1, c[1]] : [c[0], c[1] + 1]))
    setShowBehind(false)
    // a soft celebration whenever this lap lands on a spot the other runner already reached
    if (landed <= pos[other] && landed % laps[other] === 0) say(t('mpTheyMeet', { n: landed }))
    else setStatus(null)
  }

  const askBehind = () => {
    setShowBehind(true)
    if (pos[0] === pos[1]) say(t('mpBothSame'))
  }

  const submit = () => {
    const n = Number(entry.join(''))
    setAnswer(n)
    setStatus(null)
  }

  const shown = done ? revealCounts(a, b, counts, answer === m ? null : answer) : counts
  const note = done && answer !== m ? whyNot(answer, a, b, t) : null
  const prompt = !done ? t('mpPromptRun') : answer === m ? t('mpNice') : t('mpAnswerIs', { m })

  return (
    <>
      <Prompt html={prompt} />
      <Notation a={a} b={b} />
      <Track laps={laps} counts={shown} showLanes reveal={done} behind={behind} onRun={done ? undefined : run} />

      <p className="mp-note" aria-live="polite">{note ?? status ?? ''}</p>

      {!done && (
        <>
          <button type="button" className="mp-secondary-btn" onClick={askBehind}>
            {t('mpBehind')}
          </button>

          <div className="mp-slot" role="status" aria-label={t('mpYourAnswer', { n: entry.join('') || '–' })}>
            {Array.from({ length: MAX_DIGITS }, (_, i) => (
              <span key={i} className={`mp-slot-cell${entry[i] !== undefined ? ' mp-slot-cell--filled' : ''}`} aria-hidden="true">
                {entry[i] ?? ''}
              </span>
            ))}
          </div>

          <div className="mp-digits" onKeyDown={e => arrowNav(e, '.mp-digit')}>
            {DIGIT_CARDS.map(d => (
              <button
                key={d}
                type="button"
                className="mp-digit"
                disabled={entry.length >= MAX_DIGITS || (d === 0 && entry.length === 0)}
                onClick={() => setEntry(e => (e.length < MAX_DIGITS ? [...e, d] : e))}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="mp-actions">
            <button type="button" className="mp-secondary-btn" disabled={entry.length === 0} onClick={() => setEntry(e => e.slice(0, -1))}>
              {t('mpErase')}
            </button>
            <button type="button" className="btn-check mp-btn" disabled={entry.length === 0} onClick={submit}>
              {t('mpSubmit')}
            </button>
          </div>
        </>
      )}

      {done && (
        <button ref={continueRef} type="button" className="btn-check mp-btn" onClick={() => onAnswer(answer === m)}>
          {t('mpContinue')}
        </button>
      )}
    </>
  )
}
