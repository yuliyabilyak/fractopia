import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n/LangContext'
import { useFocusWhen } from '../hooks/useFocusWhen'
import Prompt from './Prompt'
import { arrowNav } from '../utils/arrowNav'
import { isCommonMultiple, isCommonMultipleSelection, railMultiples } from '../utils/multiples'

interface Props {
  a: number
  b: number
  count: number
  mode: 'select' | 'generate'
  candidates?: number[]
  onAnswer: (correct: boolean) => void
}

/** Rail a has circle chips, rail b square chips — shape as well as colour. */
const SHAPES = ['●', '■']
const MAX_DIGITS = 3
const DIGIT_CARDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]

type T = ReturnType<typeof useLang>['t']

const timesText = (k: number, n: number) => `${k / n} × ${n}`

/** Why k is not a common multiple, as rail language. */
function whyNot(k: number, a: number, b: number, t: T): string {
  const on = k % a === 0 ? a : k % b === 0 ? b : null
  return on === null ? t('mmWhyNeither', { k }) : t('mmWhyOnly', { k, n: on, x: timesText(k, on) })
}

/** Short chip label for a wrong pick. */
function railLabel(k: number, a: number, b: number, t: T): string {
  const on = k % a === 0 ? a : k % b === 0 ? b : null
  return on === null ? t('mmOnNeither') : t('mmOnlyOn', { n: on })
}

/** OpenDyslexic draws × like a small x — give it its own span (system font, see .mm-times). */
function WithTimes({ text }: { text: string }) {
  const parts = text.split('×')
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 && <span className="mm-times">×</span>}
          {p}
        </span>
      ))}
    </>
  )
}

/**
 * Multiple Magnet — common multiples ("společné násobky").
 * Two rails list the multiples of a and b; the numbers on both rails are the
 * common multiples, and the magnet carries three of them to the cart.
 */
export default function MultipleMagnet({ a, b, count, mode, candidates, onAnswer }: Props) {
  return (
    <div className="exercise-card mm-card">
      {mode === 'select' && candidates
        ? <SelectMagnet a={a} b={b} count={count} candidates={candidates} onAnswer={onAnswer} />
        : <BuildMagnet a={a} b={b} count={count} onAnswer={onAnswer} />}
    </div>
  )
}

// ── Rails ────────────────────────────────────────────────────────────────────

interface Line { x1: number; y1: number; x2: number; y2: number }

interface RailsProps {
  a: number
  b: number
  /** select scaffold: ring the candidates that sit on a rail */
  highlight?: Set<number>
  inCart?: Set<number>
  wobble?: { rail: number; k: number } | null
  onWobbleEnd?: () => void
  /** build mode: rail chips become buttons */
  onTap?: (rail: number, k: number) => void
}

function Rails({ a, b, highlight, inCart, wobble = null, onWobbleEnd, onTap }: RailsProps) {
  const { t } = useLang()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [lines, setLines] = useState<Line[]>([])

  // thin connectors between the same number on both rails; re-measured whenever the rails re-wrap
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const measure = () => {
      const box = wrap.getBoundingClientRect()
      const next: Line[] = []
      for (const top of wrap.querySelectorAll<HTMLElement>('[data-rail="0"][data-meet]')) {
        const bottom = wrap.querySelector<HTMLElement>(`[data-rail="1"][data-k="${top.dataset.k}"]`)
        if (!bottom) continue
        const r1 = top.getBoundingClientRect()
        const r2 = bottom.getBoundingClientRect()
        next.push({
          x1: r1.left + r1.width / 2 - box.left, y1: r1.bottom - box.top,
          x2: r2.left + r2.width / 2 - box.left, y2: r2.top - box.top,
        })
      }
      setLines(next)
    }
    const ro = new ResizeObserver(measure)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [a, b])

  return (
    <div ref={wrapRef} className="mm-rails" onKeyDown={onTap ? e => arrowNav(e, '.mm-chip', 'linear') : undefined}>
      <svg className="mm-links" aria-hidden="true">
        {lines.map((l, i) => <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />)}
      </svg>
      <span className="mm-magnet" aria-hidden="true">🧲</span>
      {[a, b].map((n, rail) => (
        <div key={rail} className={`mm-rail mm-rail--${rail}`}>
          <div className="mm-rail-head">
            <span className="mm-rail-shape" aria-hidden="true">{SHAPES[rail]}</span>
            <span className="mm-rail-number">{n}</span>
          </div>
          <ol className="mm-chips" aria-label={t('mmRailAria', { n })}>
            {railMultiples(n, a, b).map(k => {
              const meet = isCommonMultiple(k, a, b)
              const cls = [
                'mm-chip',
                meet && 'mm-chip--meet',
                highlight?.has(k) && 'mm-chip--candidate',
                inCart?.has(k) && 'mm-chip--in-cart',
                wobble?.rail === rail && wobble.k === k && 'mm-chip--wobble',
              ].filter(Boolean).join(' ')
              const label = `${timesText(k, n)} = ${k}${meet ? `, ${t('mmOnBoth')}` : ''}`
              const body = (
                <>
                  {k}
                  {meet && <span className="mm-chip-magnet" aria-hidden="true">🧲</span>}
                </>
              )
              const data = { 'data-rail': rail, 'data-k': k, 'data-meet': meet ? '' : undefined }
              return (
                <li key={k} className="mm-chip-slot">
                  {onTap ? (
                    <button
                      type="button"
                      className={cls}
                      aria-label={label}
                      {...data}
                      onClick={() => onTap(rail, k)}
                      onAnimationEnd={e => { if (e.animationName === 'mm-wobble') onWobbleEnd?.() }}
                    >
                      {body}
                    </button>
                  ) : (
                    <span className={cls} aria-label={label} role="img" {...data}>{body}</span>
                  )}
                </li>
              )
            })}
          </ol>
        </div>
      ))}
    </div>
  )
}

function Cart({ items, count, full }: { items: number[]; count: number; full: boolean }) {
  const { t } = useLang()
  return (
    <div className={`mm-cart${full ? ' mm-cart--full' : ''}`}>
      <span className="mm-cart-label">🛒 {t('mmCart')}: {t('mmCartCount', { n: items.length, total: count })}</span>
      <span className="mm-cart-slots">
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className={`mm-cart-slot${items[i] !== undefined ? ' mm-cart-slot--filled' : ''}`}>
            {items[i] ?? ''}
          </span>
        ))}
      </span>
    </div>
  )
}

// ── Select: pick 3 candidates ────────────────────────────────────────────────

function SelectMagnet({ a, b, count, candidates, onAnswer }: {
  a: number; b: number; count: number; candidates: number[]; onAnswer: (correct: boolean) => void
}) {
  const { t } = useLang()
  const [picked, setPicked] = useState<number[]>([])
  const [showRails, setShowRails] = useState(false)
  const [result, setResult] = useState<boolean | null>(null)
  const revealed = result !== null
  const continueRef = useFocusWhen(revealed)

  const validPicks = picked.filter(k => isCommonMultiple(k, a, b))

  const toggle = (k: number) =>
    setPicked(p => (p.includes(k) ? p.filter(x => x !== k) : p.length < count ? [...p, k] : p))

  const prompt = !revealed ? t('mmPromptSelect') : result ? t('mmNice') : t('mmSelectWrong')

  return (
    <>
      <Prompt html={prompt} />

      {(showRails || revealed) && (
        <Rails a={a} b={b} highlight={new Set(candidates)} inCart={revealed ? new Set(validPicks) : undefined} />
      )}
      {!showRails && !revealed && (
        <button type="button" className="mm-secondary-btn" onClick={() => setShowRails(true)}>
          {t('mmShowRails')}
        </button>
      )}

      <div className="mm-grid" onKeyDown={e => arrowNav(e, '.mm-cand')}>
        {candidates.map(k => {
          const sel = picked.includes(k)
          const valid = isCommonMultiple(k, a, b)
          const state = !revealed
            ? sel ? 'selected' : ''
            : sel && valid ? 'in-cart' : sel ? 'bounce' : valid && !result ? 'missed' : 'idle'
          const label = state === 'bounce' ? railLabel(k, a, b, t) : state === 'missed' ? t('mmMissed') : state === 'in-cart' ? t('mmOnBoth') : null
          return (
            <button
              key={k}
              type="button"
              className={`mm-cand${state ? ` mm-cand--${state}` : ''}`}
              aria-pressed={revealed ? undefined : sel}
              aria-disabled={revealed || undefined}
              onClick={() => { if (!revealed) toggle(k) }}
            >
              {state === 'selected' && <span className="mm-badge" aria-hidden="true">✓</span>}
              {state === 'in-cart' && <span className="mm-badge mm-badge--gold" aria-hidden="true">🧲</span>}
              <span className="mm-cand-number">{k}</span>
              {label && <span className="mm-cand-label">{label}</span>}
            </button>
          )
        })}
      </div>

      {!revealed && <p className="mm-note" aria-live="polite">{t('mmPicked', { n: picked.length, total: count })}</p>}
      {revealed && <Cart items={validPicks} count={count} full={result === true} />}

      <div className="mm-actions">
        {!revealed && (
          <button
            type="button"
            className="btn-check mm-btn"
            disabled={picked.length !== count}
            onClick={() => setResult(isCommonMultipleSelection(picked, a, b, count))}
          >
            {t('mmSubmit')}
          </button>
        )}
        {revealed && (
          <button ref={continueRef} type="button" className="btn-check mm-btn" onClick={() => onAnswer(result)}>
            {t('mmContinue')}
          </button>
        )}
      </div>
    </>
  )
}

// ── Build: fill the cart from the rails or digit cards ───────────────────────

function BuildMagnet({ a, b, count, onAnswer }: { a: number; b: number; count: number; onAnswer: (correct: boolean) => void }) {
  const { t } = useLang()
  const [cart, setCart] = useState<number[]>([])
  const [wrongTries, setWrongTries] = useState(0)
  const [status, setStatus] = useState<string | null>(null)
  const [wobble, setWobble] = useState<{ rail: number; k: number } | null>(null)
  const [entry, setEntry] = useState<number[]>([])
  const full = cart.length >= count
  const submitRef = useFocusWhen(full)

  const say = (text: string) => setStatus(text)

  /** One attempt, from a rail chip or the digit cards. Duplicates are a hint, not a wrong try. */
  const tryNumber = (k: number, rail: number | null) => {
    if (full) return
    if (cart.includes(k)) {
      say(t('mmDuplicate', { k }))
      return
    }
    if (isCommonMultiple(k, a, b)) {
      setCart(c => [...c, k])
      say(t('mmFits', { k, x: timesText(k, a), y: timesText(k, b) }))
      return
    }
    setWrongTries(w => w + 1)
    if (rail !== null) setWobble({ rail, k })
    say(whyNot(k, a, b, t))
  }

  const testEntry = () => {
    tryNumber(Number(entry.join('')), null)
    setEntry([])
  }

  const prompt = !full ? t('mmPromptBuild') : wrongTries === 0 ? t('mmNice') : t('mmCartFull')

  return (
    <>
      <Prompt html={prompt} />
      <div className="mm-stage">
        <Rails
          a={a}
          b={b}
          inCart={new Set(cart)}
          wobble={wobble}
          onWobbleEnd={() => setWobble(null)}
          onTap={full ? undefined : (rail, k) => tryNumber(k, rail)}
        />
        <Cart items={cart} count={count} full={full} />
      </div>

      <p className="mm-note" aria-live="polite">{status ? <WithTimes text={status} /> : ''}</p>

      {!full && (
        <>
          <div className="mm-slot" role="status" aria-label={t('mmYourNumber', { k: entry.join('') || '–' })}>
            {Array.from({ length: MAX_DIGITS }, (_, i) => (
              <span key={i} className={`mm-slot-cell${entry[i] !== undefined ? ' mm-slot-cell--filled' : ''}`} aria-hidden="true">
                {entry[i] ?? ''}
              </span>
            ))}
          </div>
          <div className="mm-digits" onKeyDown={e => arrowNav(e, '.mm-digit')}>
            {DIGIT_CARDS.map(d => (
              <button
                key={d}
                type="button"
                className="mm-digit"
                disabled={entry.length >= MAX_DIGITS || (d === 0 && entry.length === 0)}
                onClick={() => setEntry(e => (e.length < MAX_DIGITS ? [...e, d] : e))}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="mm-actions">
            <button type="button" className="mm-secondary-btn" disabled={entry.length === 0} onClick={() => setEntry(e => e.slice(0, -1))}>
              {t('mmErase')}
            </button>
            <button type="button" className="btn-check mm-btn" disabled={entry.length === 0} onClick={testEntry}>
              {t('mmTestNumber')}
            </button>
          </div>
        </>
      )}

      {full && (
        <button ref={submitRef} type="button" className="btn-check mm-btn" onClick={() => onAnswer(wrongTries === 0)}>
          {t('mmSubmit')}
        </button>
      )}
    </>
  )
}
