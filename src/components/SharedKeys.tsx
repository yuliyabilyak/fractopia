import { useState } from 'react'
import { useLang } from '../i18n/LangContext'
import { useFocusWhen } from '../hooks/useFocusWhen'
import Prompt from './Prompt'
import { arrowNav } from '../utils/arrowNav'
import {
  commonDivisorsAbove1, divisorsAbove1, fittingKeys, isSelectionCorrect, keyFlaw, keysNeededFor, type KeyFlaw,
} from '../utils/divisors'
import { isPrime } from '../utils/primes'

interface Props {
  base: number
  mode: 'select' | 'generate'
  digits: 1 | 2
  candidates?: number[]
  keysNeeded?: number
  onAnswer: (correct: boolean, wrongTries?: number) => void
}

/**
 * Shared Keys — common divisors as a lock and keys ("společný dělitel").
 * A key fits when it shares a tooth (a divisor greater than 1) with the lock.
 */
export default function SharedKeys({ base, mode, digits, candidates, keysNeeded, onAnswer }: Props) {
  return (
    <div className="exercise-card sk-card">
      {mode === 'select' && candidates
        ? <SelectKeys base={base} candidates={candidates} onAnswer={onAnswer} />
        : <BuildKeys base={base} digits={digits} keysNeeded={keysNeeded ?? 1} onAnswer={onAnswer} />}
    </div>
  )
}

// ── Pieces ───────────────────────────────────────────────────────────────────

/** Teeth are coloured by their smallest prime (2, 3, 5, 7, other) — the same
 *  palette Prime Forge uses for different primes — and always labelled. */
const FAMILY_PRIMES = [2, 3, 5, 7]
const toothFamily = (d: number) => {
  const i = FAMILY_PRIMES.findIndex(p => d % p === 0)
  return i < 0 ? 4 : i
}

function Teeth({ n, shared, reveal = false }: { n: number; shared?: number[]; reveal?: boolean }) {
  const teeth = divisorsAbove1(n)
  const glow = new Set(shared ?? [])
  if (teeth.length === 0) return <span className="sk-teeth sk-teeth--none" aria-hidden="true">–</span>
  return (
    <span className="sk-teeth" aria-hidden="true">
      {teeth.map(d => {
        const lit = glow.has(d)
        const state = lit ? ' sk-tooth--glow' : reveal ? ' sk-tooth--dim' : ''
        return (
          <span key={d} className={`sk-tooth sk-tooth--f${toothFamily(d)}${state}`}>
            {d}{lit && <span className="sk-tooth-star">★</span>}
          </span>
        )
      })}
    </span>
  )
}

function Lock({ base, shared, reveal, open }: { base: number; shared?: number[]; reveal?: boolean; open?: boolean }) {
  const { t } = useLang()
  return (
    <div className="sk-lock-wrap">
      <div
        className={`sk-lock${open ? ' sk-lock--open' : ''}`}
        role="img"
        aria-label={t('skLockAria', { b: base, t: divisorsAbove1(base).join(', ') })}
      >
        <span className="sk-shackle" aria-hidden="true" />
        <span className="sk-lock-body" aria-hidden="true">
          <span className="sk-lock-number">{base}</span>
          <Teeth n={base} shared={shared} reveal={reveal} />
        </span>
      </div>
      <p className="sk-legend">{t('skToothLegend')}</p>
    </div>
  )
}

function KeyFace({ k, shared, reveal }: { k: number; shared?: number[]; reveal?: boolean }) {
  return (
    <>
      <span className="sk-key-bow">{k}</span>
      <span className="sk-key-blade" aria-hidden="true" />
      <Teeth n={k} shared={shared} reveal={reveal} />
    </>
  )
}

// ── Select: tap every key that fits ──────────────────────────────────────────

function SelectKeys({ base, candidates, onAnswer }: { base: number; candidates: number[]; onAnswer: (correct: boolean) => void }) {
  const { t } = useLang()
  const [picked, setPicked] = useState<number[]>([])
  const [result, setResult] = useState<boolean | null>(null)
  const revealed = result !== null
  const continueRef = useFocusWhen(revealed)

  const fits = new Set(fittingKeys(candidates, base))
  const prime = isPrime(base)
  const lockShared = revealed ? [...new Set([...fits].flatMap(k => commonDivisorsAbove1(k, base)))] : undefined

  const toggle = (k: number) => setPicked(p => (p.includes(k) ? p.filter(x => x !== k) : [...p, k]))

  const prompt = !revealed ? t('skPromptSelect') : result ? t('skNice') : t('skSelectWrong')

  return (
    <>
      <Prompt html={prompt} />
      <Lock base={base} shared={lockShared} reveal={revealed} open={result === true} />

      <div className="sk-grid" onKeyDown={e => arrowNav(e, '.sk-key-card')}>
        {candidates.map(k => {
          const sel = picked.includes(k)
          const fit = fits.has(k)
          const state = !revealed
            ? sel ? 'selected' : ''
            : sel && fit ? 'fit' : fit ? 'missed' : sel ? 'bounce' : 'idle'
          const label = state === 'fit' ? t('skSharesTooth')
            : state === 'missed' ? t('skMissed')
            : state === 'bounce' ? t('skNoTooth')
            : null
          const aria = t('skKeyAria', { k, t: divisorsAbove1(k).join(', ') || '–' })
          return (
            <button
              key={k}
              type="button"
              className={`sk-key-card${state ? ` sk-key-card--${state}` : ''}`}
              aria-pressed={revealed ? undefined : sel}
              aria-disabled={revealed || undefined}
              aria-label={label ? `${aria} ${label}` : aria}
              onClick={() => { if (!revealed) toggle(k) }}
            >
              {state === 'selected' && <span className="sk-badge" aria-hidden="true">✓</span>}
              {state === 'fit' && <span className="sk-badge sk-badge--gold" aria-hidden="true">★</span>}
              <KeyFace k={k} shared={revealed ? commonDivisorsAbove1(k, base) : undefined} reveal={revealed} />
              {label && <span className="sk-key-label">{label}</span>}
            </button>
          )
        })}
      </div>

      {revealed && prime && <p className="sk-hint">{t('skPrimeHint')}</p>}

      <div className="sk-actions">
        {!revealed && picked.length > 0 && (
          <button type="button" className="btn-check sk-btn" onClick={() => setResult(isSelectionCorrect(picked, candidates, base))}>
            {t('skSubmit')}
          </button>
        )}
        {revealed && (
          <button ref={continueRef} type="button" className="btn-check sk-btn" onClick={() => onAnswer(result)}>
            {t('skContinue')}
          </button>
        )}
      </div>
    </>
  )
}

// ── Build: make keys from digit cards ────────────────────────────────────────

const DIGIT_CARDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]

interface Attempt {
  k: number
  outcome: 'fit' | 'duplicate' | KeyFlaw
  /** bumps on every test so the slide / bounce animation replays */
  n: number
}

function BuildKeys({ base, digits, keysNeeded, onAnswer }: {
  base: number
  digits: 1 | 2
  keysNeeded: number
  onAnswer: (correct: boolean, wrongTries: number) => void
}) {
  const { t } = useLang()
  const needed = keysNeededFor(base, digits, keysNeeded)
  const [entry, setEntry] = useState<number[]>([])
  const [ring, setRing] = useState<number[]>([])
  const [wrongTries, setWrongTries] = useState(0)
  const [last, setLast] = useState<Attempt | null>(null)
  const done = ring.length >= needed
  const prime = isPrime(base)
  const continueRef = useFocusWhen(done)

  const attemptText = (a: Attempt) => {
    switch (a.outcome) {
      case 'fit':          return t('skFits', { k: a.k, t: commonDivisorsAbove1(a.k, base).join(', ') })
      case 'duplicate':    return t('skDuplicate', { k: a.k })
      case 'same-as-lock': return t('skSameAsLock', { k: a.k })
      default:             return t('skNoFit', { k: a.k, b: base })
    }
  }

  const testKey = () => {
    const k = Number(entry.join(''))
    const n = (last?.n ?? 0) + 1
    let a: Attempt
    if (ring.includes(k)) {
      a = { k, outcome: 'duplicate', n } // a gentle hint, not a wrong try
    } else {
      const flaw = keyFlaw(k, base, digits)
      a = { k, outcome: flaw ?? 'fit', n }
      if (flaw === null) setRing(r => [...r, k])
      else setWrongTries(w => w + 1)
    }
    setEntry([])
    setLast(a)
  }

  const fitsShown = last && (last.outcome === 'fit' || last.outcome === 'duplicate')
  const shared = last ? (fitsShown ? commonDivisorsAbove1(last.k, base) : []) : undefined

  const prompt = done ? (wrongTries === 0 ? t('skNice') : t('skAllFound')) : t('skPromptBuild', { b: base })

  return (
    <>
      <Prompt html={prompt} />
      <Lock base={base} shared={shared} reveal={last !== null} open={done} />

      {last && (
        <div key={last.n} className={`sk-test sk-test--${fitsShown ? 'fit' : 'bounce'}`}>
          <span className="sk-key-card sk-key-card--static">
            <KeyFace k={last.k} shared={shared} reveal />
          </span>
          <p className="sk-status" aria-live="polite">{attemptText(last)}</p>
        </div>
      )}

      <div className="sk-ring">
        <span className="sk-ring-label">🔑 {t('skKeyring')}: {t('skKeyCount', { n: ring.length, total: needed })}</span>
        <span className="sk-ring-slots">
          {Array.from({ length: needed }, (_, i) => (
            <span key={i} className={`sk-ring-slot${ring[i] !== undefined ? ' sk-ring-slot--filled' : ''}`}>
              {ring[i] !== undefined ? <>🔑 {ring[i]}</> : ''}
            </span>
          ))}
        </span>
      </div>

      {!done && (
        <>
          <div className="sk-slot" role="status" aria-label={t('skBuildSlot', { k: entry.join('') || '–' })}>
            {Array.from({ length: digits }, (_, i) => (
              <span key={i} className={`sk-slot-cell${entry[i] !== undefined ? ' sk-slot-cell--filled' : ''}`} aria-hidden="true">
                {entry[i] ?? ''}
              </span>
            ))}
          </div>

          <div className="sk-digits" onKeyDown={e => arrowNav(e, '.sk-digit')}>
            {DIGIT_CARDS.map(d => (
              <button
                key={d}
                type="button"
                className="sk-digit"
                disabled={entry.length >= digits || (d === 0 && entry.length === 0)}
                onClick={() => setEntry(e => (e.length < digits ? [...e, d] : e))}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="sk-actions">
            <button type="button" className="sk-secondary-btn" disabled={entry.length === 0} onClick={() => setEntry(e => e.slice(0, -1))}>
              {t('skErase')}
            </button>
            <button type="button" className="btn-check sk-btn" disabled={entry.length < digits} onClick={testKey}>
              {t('skTestKey')}
            </button>
          </div>
        </>
      )}

      {done && (
        <>
          {prime && <p className="sk-hint">{t('skPrimeHint')}</p>}
          <div className="sk-actions">
            <button ref={continueRef} type="button" className="btn-check sk-btn" onClick={() => onAnswer(wrongTries === 0, wrongTries)}>
              {t('skContinue')}
            </button>
          </div>
        </>
      )}
    </>
  )
}
