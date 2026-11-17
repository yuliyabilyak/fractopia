import { Fragment, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useLang } from '../i18n/LangContext'
import type { Keys } from '../i18n/translations'
import Prompt from './Prompt'
import {
  defaultTree, factorizationFlaw, findExample, findFlaw, isPrime, productOf, splitAt, splitPairs,
  treeFromFactors, treeLeaves, type FactorFlaw, type FindFlaw, type FindRule, type PrimeConstraint, type TreeNode,
} from '../utils/primes'
import { EMBER_MAX, getEmberStreak, recordEmberResult } from '../utils/emberStreak'

/** Prime cards offered when building a number for a find-with-constraint rule. */
const PRIME_CARDS = [2, 3, 5, 7, 11, 13]
const MAX_BUILD = 6
/** How long the gold tree stays on screen before the parent's feedback banner. */
const CORRECT_HOLD_MS = 1400

const FIND_PROMPT: Record<PrimeConstraint, Keys> = {
  'one-prime': 'pfFindOnePrime',
  'two-same': 'pfFindTwoSame',
  'three-different': 'pfFindThreeDifferent',
  'four-different': 'pfFindFourDifferent',
}

interface Props {
  task: 'factorize' | 'find-with-constraint'
  mode: 'select' | 'generate'
  target?: number
  constraint?: PrimeConstraint
  minValue?: number
  maxValue?: number
  choices?: number[][]
  hints?: number[]
  onAnswer: (correct: boolean) => void
}

type Outcome =
  | { correct: true; tree: TreeNode }
  | { correct: false; kind: 'factorize'; given: number[]; flaw: FactorFlaw; target: number }
  | { correct: false; kind: 'find'; given: number[]; flaw: FindFlaw; rule: FindRule }

/**
 * Prime Forge — break a number into prime multipliers on a factor tree
 * ("Rozklad na součin prvočísel"). Products only; no sums anywhere.
 */
export default function PrimeForge({ task, mode, target, constraint, minValue, maxValue, choices, hints, onAnswer }: Props) {
  const { t } = useLang()
  const [streakBefore] = useState(getEmberStreak)
  const [outcome, setOutcome] = useState<Outcome | null>(null)

  useEffect(() => {
    if (!outcome?.correct) return
    const id = window.setTimeout(() => onAnswer(true), CORRECT_HOLD_MS)
    return () => window.clearTimeout(id)
  }, [outcome, onAnswer])

  const finish = (o: Outcome) => {
    recordEmberResult(o.correct)
    setOutcome(o)
  }

  const gradeFactors = (given: number[], tree: TreeNode, n: number) => {
    const flaw = factorizationFlaw(given, n)
    finish(flaw === null ? { correct: true, tree } : { correct: false, kind: 'factorize', given, flaw, target: n })
  }

  const gradeFind = (given: number[], rule: FindRule) => {
    const flaw = findFlaw(productOf(given), rule)
    finish(flaw === null ? { correct: true, tree: treeFromFactors(given) } : { correct: false, kind: 'find', given, flaw, rule })
  }

  const rule: FindRule | null = task === 'find-with-constraint' && constraint && maxValue !== undefined
    ? { constraint, min: minValue, max: maxValue }
    : null

  const prompt = outcome
    ? outcome.correct ? t('pfNice') : reasonText(outcome, t)
    : task === 'factorize'
    ? t(mode === 'select' ? 'pfPromptSelect' : 'pfPromptFactorize', { n: target ?? '' })
    : t(FIND_PROMPT[constraint ?? 'one-prime'], { max: maxValue ?? '' })

  const streak = outcome ? (outcome.correct ? streakBefore + 1 : 0) : streakBefore

  let body = null
  if (outcome) {
    body = <Reveal outcome={outcome} onContinue={() => onAnswer(false)} />
  } else if (task === 'factorize' && target !== undefined) {
    body = mode === 'select' && choices
      ? <SelectCards choices={choices} onPick={c => gradeFactors(c, defaultTree(target), target)} />
      : <ForgeBuilder target={target} hints={hints} onSubmit={tree => gradeFactors(treeLeaves(tree), tree, target)} />
  } else if (rule) {
    body = <FindBuilder rule={rule} onSubmit={given => gradeFind(given, rule)} />
  }

  return (
    <div className="exercise-card pf-card">
      <EmberBar streak={streak} />
      <Prompt html={prompt} />
      {body}
    </div>
  )
}

function reasonText(o: Exclude<Outcome, { correct: true }>, t: ReturnType<typeof useLang>['t']): string {
  if (o.kind === 'factorize') {
    return o.flaw.kind === 'composite'
      ? t('pfReasonComposite', { x: o.flaw.value })
      : t('pfReasonProduct', { x: o.flaw.value, n: o.target })
  }
  const x = productOf(o.given)
  if (o.flaw === 'too-big') return t('pfReasonTooBig', { x, max: o.rule.max })
  if (o.flaw === 'too-small') return t('pfReasonTooSmall', { x, min: o.rule.min ?? '' })
  return t('pfReasonRule', { x })
}

// ── Pieces ───────────────────────────────────────────────────────────────────

function Star() {
  return <span className="pf-star" aria-hidden="true">★</span>
}

function EmberBar({ streak }: { streak: number }) {
  const { t } = useLang()
  const lit = Math.min(streak, EMBER_MAX)
  return (
    <div className="pf-ember" role="img" aria-label={t('pfEmberAria', { n: streak })}>
      <span className="pf-ember-icon" aria-hidden="true">🔥</span>
      <span className="pf-ember-track" aria-hidden="true">
        {Array.from({ length: EMBER_MAX }, (_, i) => (
          <span key={i} className={`pf-ember-seg${i < lit ? ' pf-ember-seg--lit' : ''}`} />
        ))}
      </span>
      <span className="pf-ember-count" aria-hidden="true">{streak}</span>
    </div>
  )
}

/**
 * Factors joined by a large, spaced ×. `plain` hides prime marking (answer cards
 * must not give the answer away); otherwise primes are gold + ★ and composites grey.
 */
function FactorRow({ factors, plain = false, splitHints = false }: { factors: number[]; plain?: boolean; splitHints?: boolean }) {
  const { t } = useLang()
  return (
    <span className="pf-row">
      <span className="pf-sr-only">{factors.join(` ${t('pfTimesWord')} `)}</span>
      {factors.map((f, i) => {
        const prime = isPrime(f)
        const cls = plain ? '' : prime ? ' pf-chip--prime' : ' pf-chip--grey'
        return (
          // × travels with the factor after it, so a wrapped row never ends on ×
          <span key={i} className="pf-pair" aria-hidden="true">
            {i > 0 && <span className="pf-times">×</span>}
            <span className="pf-chip-wrap">
              <span className={`pf-chip${cls}`}>{f}{!plain && prime && <Star />}</span>
              {splitHints && !prime && <span className="pf-split-hint">{t('pfCanStillSplit')}</span>}
            </span>
          </span>
        )
      })}
    </span>
  )
}

interface TreeViewProps {
  node: TreeNode
  selectedPath?: string | null
  /** When given, leaves become buttons and arrow keys move between them. */
  onTap?: (path: string, value: number) => void
}

/** Factor tree, the target as a glowing ingot on top. Read-only unless `onTap` is given. */
function FactorTree({ node, selectedPath = null, onTap }: TreeViewProps) {
  const { t } = useLang()
  const ref = useRef<HTMLDivElement>(null)
  const dense = treeLeaves(node).length >= 5 || node.value >= 1000

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (dir === 0 || !ref.current) return
    const nodes = Array.from(ref.current.querySelectorAll<HTMLButtonElement>('button.pf-node'))
    if (nodes.length === 0) return
    e.preventDefault()
    const i = nodes.indexOf(document.activeElement as HTMLButtonElement)
    const next = i < 0 ? 0 : (i + dir + nodes.length) % nodes.length
    nodes[next].focus()
  }

  const render = (n: TreeNode, path: string) => {
    const leaf = !n.kids
    const prime = leaf && isPrime(n.value)
    const selected = selectedPath === path
    const cls = [
      'pf-node',
      path === '' && 'pf-node--ingot',
      !leaf && 'pf-node--split',
      prime && 'pf-node--prime',
      leaf && !prime && onTap && 'pf-node--open',
      selected && 'pf-node--selected',
    ].filter(Boolean).join(' ')

    const label = prime ? `${n.value}, ${t('pfPrime')}` : t('pfStrikeAria', { n: n.value })
    const el = leaf && onTap ? (
      <button type="button" data-path={path} className={cls} aria-pressed={selected} aria-label={label} onClick={() => onTap(path, n.value)}>
        {n.value}{prime && <Star />}
      </button>
    ) : (
      <span className={cls}>
        {n.value}{prime && <Star />}
        {prime && <span className="pf-sr-only">, {t('pfPrime')}</span>}
      </span>
    )

    return (
      <div key={path} className="pf-branch">
        {el}
        {n.kids && <div className="pf-kids">{n.kids.map((k, i) => render(k, path + i))}</div>}
      </div>
    )
  }

  return (
    <div ref={ref} className={`pf-tree${dense ? ' pf-tree--dense' : ''}`} onKeyDown={onTap ? onKeyDown : undefined}>
      {render(node, '')}
    </div>
  )
}

// ── factorize · generate ─────────────────────────────────────────────────────

function ForgeBuilder({ target, hints, onSubmit }: { target: number; hints?: number[]; onSubmit: (tree: TreeNode) => void }) {
  const { t } = useLang()
  const [history, setHistory] = useState<TreeNode[]>([{ value: target }])
  const [selected, setSelected] = useState<{ path: string; value: number } | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [shakeP, setShakeP] = useState<number | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const focusPath = useRef<string | null>(null)

  const tree = history[history.length - 1]
  const leaves = treeLeaves(tree)
  const done = leaves.every(isPrime)
  const strikes = history.length - 1
  const rack = leaves.filter(isPrime).sort((a, b) => a - b)

  // keep keyboard users on the tree: after a strike, focus the new left part
  useEffect(() => {
    if (focusPath.current === null) return
    stageRef.current?.querySelector<HTMLElement>(`[data-path="${focusPath.current}"]`)?.focus()
    focusPath.current = null
  }, [tree])

  const tap = (path: string, value: number) => {
    if (isPrime(value)) {
      setSelected(null)
      setNote(t('pfAlreadySimple', { n: value }))
      return
    }
    setNote(null)
    setSelected(s => (s?.path === path ? null : { path, value }))
  }

  const strike = (pair: [number, number]) => {
    if (!selected) return
    focusPath.current = selected.path + '0'
    setHistory(h => [...h, splitAt(tree, selected.path, pair)])
    setSelected(null)
    setNote(null)
  }

  const applyHint = (p: number) => {
    if (!selected) {
      setNote(t('pfPickNodeFirst'))
      return
    }
    if (selected.value % p !== 0) {
      setNote(t('pfNotDivisor', { p, n: selected.value }))
      setShakeP(p)
      return
    }
    strike([p, selected.value / p])
  }

  const undo = () => {
    setHistory(h => (h.length > 1 ? h.slice(0, -1) : h))
    setSelected(null)
    setNote(null)
  }

  const status = note ?? (done ? t('pfAllPrime') : selected ? t('pfSplitInto', { n: selected.value }) : t('pfTapNode'))

  return (
    <>
      <div ref={stageRef} className="pf-forge">
        {strikes > 0 && <span key={strikes} className="pf-hammer" aria-hidden="true">🔨</span>}
        <FactorTree node={tree} selectedPath={selected?.path} onTap={tap} />
        <div className="pf-anvil" aria-hidden="true" />
      </div>

      <p className="pf-status" aria-live="polite">{status}</p>

      {selected && (
        <div className="pf-cards" role="group" aria-label={t('pfSplitInto', { n: selected.value })}>
          {splitPairs(selected.value).map(([a, b]) => (
            <button
              key={a}
              type="button"
              className="pf-card-btn"
              aria-label={`${a} ${t('pfTimesWord')} ${b}`}
              onClick={() => strike([a, b])}
            >
              <span className="pf-card-num">{a}</span>
              <span className="pf-times" aria-hidden="true">×</span>
              <span className="pf-card-num">{b}</span>
            </button>
          ))}
        </div>
      )}

      {hints && hints.length > 0 && !done && (
        <div className="pf-tray" role="group" aria-label={t('pfHints')}>
          <span className="pf-tray-label">{t('pfHints')}</span>
          {hints.map(p => (
            <button
              key={p}
              type="button"
              className={`pf-chip pf-chip--prime pf-chip--btn${shakeP === p ? ' pf-chip--shake' : ''}`}
              onClick={() => applyHint(p)}
              onAnimationEnd={() => setShakeP(null)}
            >
              {p}<Star />
            </button>
          ))}
        </div>
      )}

      {rack.length > 0 && (
        <div className="pf-rack">
          <span className="pf-tray-label">{t('pfRack')}</span>
          <FactorRow factors={rack} />
        </div>
      )}

      <div className="pf-actions">
        <button type="button" className="pf-secondary-btn" disabled={strikes === 0} onClick={undo}>
          {t('pfUndo')}
        </button>
        {done && (
          <button type="button" className="btn-check pf-submit" onClick={() => onSubmit(tree)}>
            {t('pfSubmit')}
          </button>
        )}
      </div>
    </>
  )
}

// ── factorize · select ───────────────────────────────────────────────────────

function SelectCards({ choices, onPick }: { choices: number[][]; onPick: (factors: number[]) => void }) {
  const { t } = useLang()
  return (
    <div className="pf-choices">
      {choices.map((c, i) => (
        <button
          key={i}
          type="button"
          className="pf-choice"
          aria-label={c.join(` ${t('pfTimesWord')} `)}
          onClick={() => onPick(c)}
        >
          <FactorRow factors={c} plain />
        </button>
      ))}
    </div>
  )
}

// ── find-with-constraint ─────────────────────────────────────────────────────

const RULE_GEMS: Record<PrimeConstraint, number[]> = {
  'one-prime': [0, 0, 0],
  'two-same': [0, 0],
  'three-different': [0, 1, 2],
  'four-different': [0, 1, 2, 3],
}
const GEM_SHAPES = ['●', '▲', '■', '◆']

/** Picture of the rule: same shape = same prime, different shapes = different primes. */
function RuleBadge({ rule }: { rule: FindRule }) {
  const { t } = useLang()
  const limit = rule.constraint === 'four-different'
    ? t('pfSmallest')
    : rule.min !== undefined ? `${rule.min} – ${rule.max}` : t('pfUpTo', { max: rule.max })
  return (
    <div className="pf-rule" aria-hidden="true">
      <span className="pf-row">
        {RULE_GEMS[rule.constraint].map((g, i) => (
          <Fragment key={i}>
            {i > 0 && <span className="pf-times">×</span>}
            <span className={`pf-gem pf-gem--${g}`}>{GEM_SHAPES[g]}</span>
          </Fragment>
        ))}
        {rule.constraint === 'one-prime' && <span className="pf-gem-more">…</span>}
      </span>
      <span className="pf-limit">{limit}</span>
    </div>
  )
}

function FindBuilder({ rule, onSubmit }: { rule: FindRule; onSubmit: (given: number[]) => void }) {
  const { t } = useLang()
  const [built, setBuilt] = useState<number[]>([])
  const full = built.length >= MAX_BUILD

  return (
    <>
      <RuleBadge rule={rule} />
      <p className="pf-status">{t('pfBuildHint')}</p>

      <div className="pf-cards">
        {PRIME_CARDS.map(p => (
          <button
            key={p}
            type="button"
            className="pf-chip pf-chip--prime pf-chip--btn"
            disabled={full}
            onClick={() => setBuilt(b => [...b, p])}
          >
            {p}<Star />
          </button>
        ))}
      </div>

      <div className="pf-build" aria-live="polite">
        <span className="pf-tray-label">{t('pfYourNumber')}</span>
        {built.length > 0 ? (
          <span className="pf-row">
            <FactorRow factors={built} />
            <span className="pf-equals" aria-hidden="true">=</span>
            <span className="pf-build-value">{productOf(built)}</span>
          </span>
        ) : (
          <span className="pf-build-empty" aria-hidden="true">?</span>
        )}
      </div>

      <div className="pf-actions">
        <button type="button" className="pf-secondary-btn" disabled={built.length === 0} onClick={() => setBuilt(b => b.slice(0, -1))}>
          {t('pfUndo')}
        </button>
        <button type="button" className="pf-secondary-btn" disabled={built.length === 0} onClick={() => setBuilt([])}>
          {t('pfClear')}
        </button>
        <button
          type="button"
          className="btn-check pf-submit"
          disabled={built.length === 0}
          onClick={() => onSubmit([...built].sort((a, b) => a - b))}
        >
          {t('pfSubmit')}
        </button>
      </div>
    </>
  )
}

// ── Result ───────────────────────────────────────────────────────────────────

function Reveal({ outcome, onContinue }: { outcome: Outcome; onContinue: () => void }) {
  const { t } = useLang()
  const btnRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { btnRef.current?.focus() }, [])

  if (outcome.correct) {
    return (
      <div className="pf-reveal pf-reveal--win">
        <span className="pf-burst" aria-hidden="true" />
        <FactorTree node={outcome.tree} />
      </div>
    )
  }

  const example = outcome.kind === 'factorize'
    ? defaultTree(outcome.target)
    : (() => { const n = findExample(outcome.rule); return n === null ? null : defaultTree(n) })()

  return (
    <div className="pf-reveal">
      {outcome.kind === 'factorize'
        ? <FactorRow factors={outcome.given} splitHints />
        : <FactorTree node={treeFromFactors(outcome.given)} />}
      {example && (
        <>
          <p className="pf-status">{t('pfOneWay')}</p>
          <FactorTree node={example} />
        </>
      )}
      <button ref={btnRef} type="button" className="btn-check pf-submit" onClick={onContinue}>
        {t('pfContinue')}
      </button>
    </div>
  )
}
