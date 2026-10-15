// Number Bridges — cross a river by choosing every stepping stone whose number
// fits a divisibility rule. The rules themselves (definitions, validation,
// explanations, near-miss number generation) are shared with Number Detective;
// this module adds bridge challenges, level plans and the game state.
//
// Imports carry the .ts extension so `node --test` can load this module directly.

import {
  RULE_PAIRS, explain, explainBoth, isDivisible, randInt, ruleFocus, shuffled,
  twoRulesChallenge, yesNoChallenge,
  type Divisor, type Explanation, type Highlight, type LevelId, type Rng, type RuleResult, type Step,
} from './numberDetective.ts'

/** The rules this game teaches — any rule from the shared rule system can be
 * added here, as long as NEW_RULES introduces it in some level. */
export const BRIDGE_DIVISORS: Divisor[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 25]

export type BridgeRule =
  | { kind: 'single'; divisor: Divisor }
  | { kind: 'both'; divisors: [Divisor, Divisor] }

export interface BridgeChallenge {
  rule: BridgeRule
  tiles: number[]
  /** indices into `tiles` that fit the rule, ascending */
  correct: number[]
}

export function ruleDivisors(rule: BridgeRule): Divisor[] {
  return rule.kind === 'single' ? [rule.divisor] : [...rule.divisors]
}

export function fitsRule(n: number, rule: BridgeRule): boolean {
  return ruleDivisors(rule).every(d => isDivisible(n, d))
}

export function explainTile(n: number, rule: BridgeRule): Explanation {
  return rule.kind === 'single' ? explain(n, rule.divisor) : explainBoth(n, rule.divisors)
}

/** The step that shows why a number doesn't fit — the first check that fails. */
export function failingStep(explanation: Explanation): Step | null {
  return explanation.steps.find(s => 'ok' in s && s.ok === false) ?? null
}

/** A short "why not" for a stone: the failing step, and — when that step
 * divides a number worked out just before (a digit sum, the last digits, the
 * 11 difference, the last 7 round) — that step too, so the number isn't a
 * mystery. */
export function failingReason(explanation: Explanation): Step[] {
  const { steps } = explanation
  const i = steps.findIndex(s => 'ok' in s && s.ok === false)
  if (i === -1) return []
  const step = steps[i]
  const before = steps[i - 1]
  if (step.kind === 'divide' && before && before.kind !== 'rule' && before.group === step.group) return [before, step]
  return [step]
}

/** Digits to highlight on every stone when the "look here" hint is on. Two-rule
 * crossings look at different digits per rule, so they rely on the text hint. */
export function tileFocus(rule: BridgeRule): Highlight {
  return rule.kind === 'single' ? ruleFocus(rule.divisor) : 0
}

/** Highlight for a stone flagged as wrong: the digits of the rule it fails. */
export function failingFocus(n: number, rule: BridgeRule): Highlight {
  const failed = ruleDivisors(rule).find(d => !isDivisible(n, d))
  return failed !== undefined ? ruleFocus(failed) : 0
}

// ── challenge generation ─────────────────────────────────────────────────────

export interface CrossingPlan {
  rule: BridgeRule
  tiles: number
  digits: [number, number]
}

/**
 * Stones for one crossing: roughly a third to two thirds fit the rule — always
 * at least one that does and one that doesn't, all different. Wrong stones lean
 * on Number Detective's near misses (an even number for the 4 rule, a multiple
 * of 3 for the 9 rule …) so the rule has to be used, not guessed.
 */
export function generateChallenge(plan: CrossingPlan, rng: Rng = Math.random): BridgeChallenge {
  const { rule, tiles: count, digits: [minDigits, maxDigits] } = plan
  const correctCount = randInt(rng, Math.max(1, Math.ceil(count / 3)), Math.min(count - 1, Math.floor((count * 2) / 3)))
  const used = new Set<number>()
  const tiles: number[] = []

  for (let i = 0; i < count; i++) {
    const fits = i < correctCount
    const digits = randInt(rng, minDigits, maxDigits)
    let n: number
    if (rule.kind === 'single') {
      n = yesNoChallenge(rng, rule.divisor, digits, fits, false, used).n
    } else {
      const outcome = fits ? 'both' : (['first', 'second', 'neither'] as const)[randInt(rng, 0, 2)]
      n = twoRulesChallenge(rng, rule.divisors, digits, outcome, used).n
    }
    used.add(n)
    tiles.push(n)
  }

  const order = shuffled(rng, tiles)
  return {
    rule,
    tiles: order,
    correct: order.flatMap((n, i) => fitsRule(n, rule) ? [i] : []),
  }
}

// ── levels ───────────────────────────────────────────────────────────────────

const single = (divisor: Divisor): BridgeRule => ({ kind: 'single', divisor })

/** Rules each level brings in; a level only uses its own and earlier ones. */
export const NEW_RULES: Record<LevelId, Divisor[]> = {
  1: [2, 5, 10],      // the last digit
  2: [3, 9, 4, 25],   // digit sums, then the last two digits
  3: [6, 8, 11, 7],   // combined and multi-step rules
  4: [],
  5: [],
}

export function rulesUpTo(level: LevelId): Divisor[] {
  return ([1, 2, 3, 4, 5] as LevelId[]).filter(l => l <= level).flatMap(l => NEW_RULES[l])
}

export const LEVEL_CROSSINGS: Record<LevelId, number> = { 1: 6, 2: 6, 3: 6, 4: 6, 5: 6 }

const BRIDGE_PAIRS = RULE_PAIRS.filter(([a, b]) => BRIDGE_DIVISORS.includes(a) && BRIDGE_DIVISORS.includes(b))

/**
 * The crossings for one play of a level. New rules are always met on their
 * own first, in a fixed order, before any review or mixing.
 */
export function planLevel(level: LevelId, rng: Rng = Math.random): CrossingPlan[] {
  const length = LEVEL_CROSSINGS[level]
  const introduce = NEW_RULES[level]

  if (level <= 3) {
    const review = Array.from({ length: length - introduce.length }, () => {
      // level 3 mostly practises its own new rules — they're the tricky ones
      const pool = level === 3 && rng() < 0.7 ? introduce : rulesUpTo(level)
      return pool[randInt(rng, 0, pool.length - 1)]
    })
    const digits: [number, number] = level === 1 ? [3, 3] : level === 2 ? [4, 6] : [3, 5]
    const tilesFor = (i: number) => level === 1 ? 4 + (i % 3) : 6
    return [...introduce, ...review].map((d, i) => ({ rule: single(d), tiles: tilesFor(i), digits }))
  }

  if (level === 4) {
    return shuffled(rng, BRIDGE_DIVISORS).slice(0, length)
      .map(d => ({ rule: single(d), tiles: 8, digits: [3, 6] as [number, number] }))
  }

  // level 5: big numbers, single rules alternating with two-rule crossings
  const singles = shuffled(rng, BRIDGE_DIVISORS).slice(0, Math.ceil(length / 2))
  const pairs = shuffled(rng, BRIDGE_PAIRS).slice(0, Math.floor(length / 2))
  return Array.from({ length }, (_, i): CrossingPlan => i % 2 === 0
    ? { rule: single(singles[i / 2]), tiles: 8, digits: [5, 6] }
    : { rule: { kind: 'both', divisors: pairs[(i - 1) / 2] }, tiles: 8, digits: [4, 6] })
}

/** A short round on the rules that need the most work. */
export function planPractice(rules: Divisor[]): CrossingPlan[] {
  return Array.from({ length: 4 }, (_, i) => ({ rule: single(rules[i % rules.length]), tiles: 6, digits: [3, 5] as [number, number] }))
}

// ── game state ───────────────────────────────────────────────────────────────

export const MAX_HINT = 3 // 1: the rule · 2: highlight the digits that matter · 3: one stone worked out

export interface BridgeState {
  /** chosen but not yet confirmed (includes stones flagged wrong) */
  selected: number[]
  /** confirmed correct by a check — part of the bridge, locked in */
  placed: number[]
  /** selected stones the last check found don't fit */
  wrong: number[]
  status: 'choosing' | 'retry' | 'complete'
  hintLevel: number
  /** whether the first check got everything right — used for per-rule accuracy */
  firstCheckCorrect: boolean | null
}

export type BridgeAction =
  | { type: 'toggle'; index: number }
  | { type: 'check'; challenge: BridgeChallenge }
  | { type: 'hint' }
  | { type: 'reset' }

/** Check is possible once anything is chosen or already on the path — the
 * latter so that removing the last wrong stone still lets the player finish. */
export function canCheck(state: BridgeState): boolean {
  return state.status !== 'complete' && (state.selected.length > 0 || state.placed.length > 0)
}

export const INITIAL_BRIDGE_STATE: BridgeState = {
  selected: [], placed: [], wrong: [], status: 'choosing', hintLevel: 0, firstCheckCorrect: null,
}

const sorted = (xs: number[]) => [...xs].sort((a, b) => a - b)

export function bridgeReducer(state: BridgeState, action: BridgeAction): BridgeState {
  switch (action.type) {
    case 'toggle': {
      const i = action.index
      if (state.status === 'complete' || state.placed.includes(i)) return state
      const isOn = state.selected.includes(i)
      return {
        ...state,
        selected: isOn ? state.selected.filter(x => x !== i) : sorted([...state.selected, i]),
        wrong: state.wrong.filter(x => x !== i),
      }
    }
    case 'check': {
      if (!canCheck(state)) return state
      const { correct } = action.challenge
      const right = state.selected.filter(i => correct.includes(i))
      const wrong = state.selected.filter(i => !correct.includes(i))
      const placed = sorted([...state.placed, ...right])
      const done = wrong.length === 0 && placed.length === correct.length
      return {
        ...state,
        selected: wrong,
        placed,
        wrong,
        status: done ? 'complete' : 'retry',
        // a miss always brings at least the rule into view
        hintLevel: done ? state.hintLevel : Math.max(state.hintLevel, 1),
        firstCheckCorrect: state.firstCheckCorrect ?? done,
      }
    }
    case 'hint':
      return { ...state, hintLevel: Math.min(MAX_HINT, state.hintLevel + 1) }
    case 'reset':
      // start the crossing over — hints and the first-check record stay
      return { ...INITIAL_BRIDGE_STATE, hintLevel: state.hintLevel, firstCheckCorrect: state.firstCheckCorrect }
  }
}

export function stonesStillNeeded(state: BridgeState, challenge: BridgeChallenge): number {
  return challenge.correct.length - state.placed.length
}

/** The stone the strongest hint works through: one flagged wrong if there is
 * one, otherwise the first stone not yet on the bridge. */
export function workedExampleTile(state: BridgeState, challenge: BridgeChallenge): number {
  if (state.wrong.length > 0) return state.wrong[0]
  return challenge.tiles.findIndex((_, i) => !state.placed.includes(i))
}

/** One accuracy result per rule per crossing: right on the first check or not. */
export function crossingResults(rule: BridgeRule, firstCheckCorrect: boolean): RuleResult[] {
  return ruleDivisors(rule).map(divisor => ({ divisor, correct: firstCheckCorrect }))
}
