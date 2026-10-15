// Number Detective — divisibility rules for 3+ digit numbers, built for
// dyslexic learners: one question per screen, the relevant digits highlighted,
// step-by-step clues generated from the same rule definitions that check the
// answer.
//
//   yes-no         "Is 12,348 divisible by 4?"
//   two-rules      "Is 1,236 divisible by 3 and by 4?"
//   all-divisors   "Which of these numbers divide 7,200 without a remainder?"
//
// Every challenge is generated procedurally from an injectable random source
// (so the unit tests can be deterministic). This module deliberately has no
// runtime imports so `node --test` can load it directly.

export type Divisor = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 25
export type LevelId = 1 | 2 | 3 | 4 | 5
export type Rng = () => number

export const DIVISORS: Divisor[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 25]
export const LEVELS: LevelId[] = [1, 2, 3, 4, 5]

// ── rule definitions ─────────────────────────────────────────────────────────
// Adding a divisor means a new Divisor literal, a RULES entry (a new RuleDef
// kind if none of these fit) and its ndRule* translation key.

export type RuleDef =
  | { kind: 'last-digit'; allowed: number[] }      // 2, 5, 10
  | { kind: 'last-part'; count: 2 | 3 }            // 4, 8, 25
  | { kind: 'digit-sum' }                          // 3, 9
  | { kind: 'all-of'; parts: Divisor[] }           // 6
  | { kind: 'double-last' }                        // 7
  | { kind: 'alternating-sum' }                    // 11

export const RULES: Record<Divisor, RuleDef> = {
  2:  { kind: 'last-digit', allowed: [0, 2, 4, 6, 8] },
  3:  { kind: 'digit-sum' },
  4:  { kind: 'last-part', count: 2 },
  5:  { kind: 'last-digit', allowed: [0, 5] },
  6:  { kind: 'all-of', parts: [2, 3] },
  7:  { kind: 'double-last' },
  8:  { kind: 'last-part', count: 3 },
  9:  { kind: 'digit-sum' },
  10: { kind: 'last-digit', allowed: [0] },
  11: { kind: 'alternating-sum' },
  25: { kind: 'last-part', count: 2 },
}

/** Longest numbers a rule is asked about. The 7 rule needs one round of
 * working per extra digit, so it stays on short numbers. */
const MAX_DIGITS: Partial<Record<Divisor, number>> = { 7: 4 }

export function maxDigitsFor(divisor: Divisor): number {
  return MAX_DIGITS[divisor] ?? Infinity
}

export function digitsOf(n: number): number[] {
  return String(n).split('').map(Number)
}

export function digitSum(n: number): number {
  return digitsOf(n).reduce((a, b) => a + b, 0)
}

/** The digit string formed by the last `count` digits, leading zeros kept ("08"). */
export function lastDigits(n: number, count: number): string {
  return String(n).slice(-count)
}

/** Sum of every other digit counting from the last one ('odd' places from the
 * right), and of the remaining digits ('even' places) — each listed left to right. */
export function alternatingDigits(n: number): { odd: number[]; even: number[] } {
  const digits = digitsOf(n)
  const odd: number[] = []
  const even: number[] = []
  digits.forEach((d, i) => ((digits.length - i) % 2 === 1 ? odd : even).push(d))
  return { odd, even }
}

const sumOf = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

export interface SevenRound {
  from: number
  rest: number
  last: number
  doubled: number
  result: number
}

/** The 7 rule: split off the last digit, double it, take the smaller number
 * from the bigger (so a child never meets a negative), repeat until fewer than
 * three digits remain. Works because 10a + b = 10(a − 2b) + 21b. */
export function sevenRounds(n: number): SevenRound[] {
  const rounds: SevenRound[] = []
  let m = n
  while (m >= 100) {
    const rest = Math.floor(m / 10)
    const last = m % 10
    const doubled = last * 2
    const result = Math.abs(rest - doubled)
    rounds.push({ from: m, rest, last, doubled, result })
    m = result
  }
  return rounds
}

/** Decide divisibility *using the rule*, never `n % divisor` on the whole
 * number — the tests check this agrees with plain arithmetic. */
export function ruleSays(n: number, divisor: Divisor): boolean {
  const rule = RULES[divisor]
  switch (rule.kind) {
    case 'last-digit': return rule.allowed.includes(n % 10)
    case 'last-part':  return Number(lastDigits(n, rule.count)) % divisor === 0
    case 'digit-sum':  return digitSum(n) % divisor === 0
    case 'all-of':     return rule.parts.every(p => ruleSays(n, p))
    case 'double-last': {
      const rounds = sevenRounds(n)
      return (rounds.length ? rounds[rounds.length - 1].result : n) % 7 === 0
    }
    case 'alternating-sum': {
      const { odd, even } = alternatingDigits(n)
      return Math.abs(sumOf(odd) - sumOf(even)) % 11 === 0
    }
  }
}

export function isDivisible(n: number, divisor: number): boolean {
  return n % divisor === 0
}

/** Digits a rule looks at: how many from the right, 'all', every other digit
 * from the last ('odd') or the ones in between ('even'); 0 for rules with no
 * single focus (6 = two separate checks). */
export type Highlight = number | 'all' | 'odd' | 'even'

export function ruleFocus(divisor: Divisor): Highlight {
  const rule = RULES[divisor]
  switch (rule.kind) {
    case 'last-digit':      return 1
    case 'last-part':       return rule.count
    case 'digit-sum':       return 'all'
    case 'double-last':     return 1
    case 'alternating-sum': return 'odd'
    case 'all-of':          return 0
  }
}

// ── explanations ─────────────────────────────────────────────────────────────
// A flat list of small steps so hints can be revealed one at a time. `group`
// tags steps that belong to one part of a combined check (the 2 and 3 checks
// inside the rule for 6, or each rule of a two-rules challenge).

interface StepBase {
  highlight: Highlight
  group?: Divisor
}

export type Step =
  | StepBase & { kind: 'rule'; divisor: Divisor }
  | StepBase & { kind: 'last-digit'; digit: number; allowed: number[]; ok: boolean }
  | StepBase & { kind: 'last-part'; count: 2 | 3; part: string }
  | StepBase & { kind: 'digit-sum'; digits: number[]; sum: number }
  | StepBase & { kind: 'divide'; dividend: number; divisor: number; quotient: number; remainder: number; ok: boolean }
  | StepBase & { kind: 'seven-round'; from: number; rest: number; last: number; doubled: number; big: number; small: number; result: number }
  | StepBase & { kind: 'alt-sum'; which: 'odd' | 'even'; digits: number[]; sum: number }
  | StepBase & { kind: 'difference'; big: number; small: number; result: number }

export interface ConclusionPart {
  divisor: Divisor
  ok: boolean
}

export interface Conclusion {
  n: number
  /** what the question asked about — one divisor, or two for a two-rules challenge */
  asked: Divisor[]
  /** per-part verdicts, shown when the answer depends on more than one check */
  parts: ConclusionPart[]
  ok: boolean
}

export interface Explanation {
  steps: Step[]
  conclusion: Conclusion
}

function divideStep(dividend: number, divisor: number, highlight: Highlight, group?: Divisor): Step {
  const remainder = dividend % divisor
  return {
    kind: 'divide', dividend, divisor,
    quotient: Math.floor(dividend / divisor), remainder,
    ok: remainder === 0, highlight, group,
  }
}

/** The working-out steps for one rule (no rule statement). */
function ruleSteps(n: number, divisor: Divisor, group?: Divisor): Step[] {
  const rule = RULES[divisor]
  switch (rule.kind) {
    case 'last-digit': {
      const digit = n % 10
      return [{ kind: 'last-digit', digit, allowed: rule.allowed, ok: rule.allowed.includes(digit), highlight: 1, group }]
    }
    case 'last-part': {
      const part = lastDigits(n, rule.count)
      return [
        { kind: 'last-part', count: rule.count, part, highlight: rule.count, group },
        divideStep(Number(part), divisor, rule.count, group),
      ]
    }
    case 'digit-sum': {
      const digits = digitsOf(n)
      const sum = digits.reduce((a, b) => a + b, 0)
      return [
        { kind: 'digit-sum', digits, sum, highlight: 'all', group },
        divideStep(sum, divisor, 'all', group),
      ]
    }
    case 'all-of':
      return rule.parts.flatMap(p => ruleSteps(n, p, p))
    case 'double-last': {
      const rounds = sevenRounds(n)
      const final = rounds.length ? rounds[rounds.length - 1].result : n
      return [
        ...rounds.map((r, i): Step => ({
          kind: 'seven-round', ...r,
          big: Math.max(r.rest, r.doubled), small: Math.min(r.rest, r.doubled),
          // only the first round works on the digits on screen
          highlight: i === 0 ? 1 : 0, group,
        })),
        divideStep(final, divisor, 0, group),
      ]
    }
    case 'alternating-sum': {
      const { odd, even } = alternatingDigits(n)
      const [a, b] = [sumOf(odd), sumOf(even)]
      const big = Math.max(a, b), small = Math.min(a, b)
      return [
        { kind: 'alt-sum', which: 'odd', digits: odd, sum: a, highlight: 'odd', group },
        { kind: 'alt-sum', which: 'even', digits: even, sum: b, highlight: 'even', group },
        { kind: 'difference', big, small, result: big - small, highlight: 'all', group },
        divideStep(big - small, divisor, 'all', group),
      ]
    }
  }
}

export function explain(n: number, divisor: Divisor): Explanation {
  const rule = RULES[divisor]
  const steps: Step[] = [{ kind: 'rule', divisor, highlight: ruleFocus(divisor) }, ...ruleSteps(n, divisor)]
  const parts = rule.kind === 'all-of'
    ? rule.parts.map(p => ({ divisor: p, ok: ruleSays(n, p) }))
    : []
  return { steps, conclusion: { n, asked: [divisor], parts, ok: ruleSays(n, divisor) } }
}

/** Explanation for "is n divisible by a and by b?" — each rule in its own group. */
export function explainBoth(n: number, divisors: [Divisor, Divisor]): Explanation {
  const steps = divisors.flatMap((d): Step[] => [
    { kind: 'rule', divisor: d, highlight: ruleFocus(d), group: d },
    ...ruleSteps(n, d, d),
  ])
  const parts = divisors.map(d => ({ divisor: d, ok: ruleSays(n, d) }))
  return { steps, conclusion: { n, asked: [...divisors], parts, ok: parts.every(p => p.ok) } }
}

// ── formatting ───────────────────────────────────────────────────────────────

/** Locale-aware, with thousands always grouped (Czech CLDR data otherwise
 * leaves 4-digit numbers ungrouped, which makes 7200 vs 12 348 inconsistent). */
export function formatNumber(n: number, locale: string): string {
  return new Intl.NumberFormat(locale, { useGrouping: 'always' }).format(n)
}

export type NumberToken =
  | { type: 'digit'; char: string; fromRight: number }  // fromRight: 1 = last digit
  | { type: 'sep'; char: string }

/** Split a formatted number into digits (with their position from the right)
 * and group separators, so each digit can be drawn and highlighted on its own. */
export function tokenizeNumber(formatted: string): NumberToken[] {
  const chars = [...formatted]
  let remaining = chars.filter(c => c >= '0' && c <= '9').length
  return chars.map(char => {
    if (char >= '0' && char <= '9') return { type: 'digit', char, fromRight: remaining-- }
    return { type: 'sep', char }
  })
}

export function isHighlighted(fromRight: number, highlight: Highlight): boolean {
  if (highlight === 'all') return true
  if (highlight === 'odd') return fromRight % 2 === 1
  if (highlight === 'even') return fromRight % 2 === 0
  return fromRight <= highlight
}

// ── number generation ────────────────────────────────────────────────────────

export function randInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1))
}

function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]
}

export function shuffled<T>(rng: Rng, items: readonly T[]): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function digitRange(digits: number): [number, number] {
  return [10 ** (digits - 1), 10 ** digits - 1]
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b)
}

/**
 * A random `digits`-long multiple of `step` that satisfies `accept` and isn't
 * in `avoid`. Random draws first; if those all miss, a scan from a random
 * start guarantees an answer whenever one exists in range.
 */
export function generateNumber(
  rng: Rng, digits: number, step: number, accept: (n: number) => boolean, avoid: ReadonlySet<number> = new Set(),
): number {
  const [min, max] = digitRange(digits)
  const lo = Math.ceil(min / step)
  const hi = Math.floor(max / step)
  const ok = (n: number) => accept(n) && !avoid.has(n)

  for (let attempt = 0; attempt < 200; attempt++) {
    const n = randInt(rng, lo, hi) * step
    if (ok(n)) return n
  }
  const span = hi - lo + 1
  const start = randInt(rng, 0, span - 1)
  for (let i = 0; i < span; i++) {
    const n = (lo + ((start + i) % span)) * step
    if (ok(n)) return n
  }
  throw new Error(`no ${digits}-digit multiple of ${step} matches`)
}

/**
 * "Not divisible" examples that are worth thinking about: an even number that
 * fails the 4 rule, a multiple of 3 that fails the 9 rule, and so on — so the
 * player has to use the rule, not a shortcut.
 */
const NEAR_MISS: Partial<Record<Divisor, (n: number) => boolean>> = {
  4:  n => n % 2 === 0,
  8:  n => n % 4 === 0,
  9:  n => n % 3 === 0,
  6:  n => (n % 2 === 0) !== (n % 3 === 0),
  10: n => n % 5 === 0 || n % 2 === 0,
  25: n => n % 5 === 0, // ends in 0 or 5, but not 00, 25, 50 or 75
}

const NEAR_MISS_CHANCE = 0.6

function numberFor(rng: Rng, digits: number, divisor: Divisor, answer: boolean, avoid: ReadonlySet<number>): number {
  if (answer) return generateNumber(rng, digits, divisor, () => true, avoid)
  const nearMiss = NEAR_MISS[divisor]
  const useNearMiss = nearMiss && rng() < NEAR_MISS_CHANCE
  return generateNumber(rng, digits, 1, n => n % divisor !== 0 && (!useNearMiss || nearMiss(n)), avoid)
}

// ── challenges ───────────────────────────────────────────────────────────────

export type Challenge =
  | { kind: 'yes-no'; n: number; divisor: Divisor; answer: boolean; focus: Highlight }
  | { kind: 'two-rules'; n: number; divisors: [Divisor, Divisor]; answer: boolean }
  | { kind: 'all-divisors'; n: number; options: Divisor[]; correct: Divisor[] }

export function yesNoChallenge(
  rng: Rng, divisor: Divisor, digits: number, answer: boolean, showFocus: boolean, avoid: ReadonlySet<number> = new Set(),
): Challenge {
  const n = numberFor(rng, Math.min(digits, maxDigitsFor(divisor)), divisor, answer, avoid)
  return { kind: 'yes-no', n, divisor, answer: isDivisible(n, divisor), focus: showFocus ? ruleFocus(divisor) : 0 }
}

/** Pairs where neither rule implies the other (no 2 & 4, 3 & 9, 5 & 25 …), so
 * both checks genuinely matter. 6 is left out — it's already a combined rule. */
export const RULE_PAIRS: [Divisor, Divisor][] = [
  [2, 3], [2, 5], [2, 9], [3, 4], [3, 5], [3, 8], [3, 10], [4, 5], [4, 9], [5, 9], [8, 9], [9, 10],
  [2, 7], [3, 7], [5, 7], [2, 11], [3, 11], [5, 11], [7, 11], [3, 25], [4, 25], [9, 25],
]

export type PairOutcome = 'both' | 'first' | 'second' | 'neither'

export function twoRulesChallenge(
  rng: Rng, pair: [Divisor, Divisor], digits: number, outcome: PairOutcome, avoid: ReadonlySet<number> = new Set(),
): Challenge {
  const [a, b] = pair
  digits = Math.min(digits, maxDigitsFor(a), maxDigitsFor(b))
  let n: number
  if (outcome === 'both') n = generateNumber(rng, digits, lcm(a, b), () => true, avoid)
  else if (outcome === 'first') n = generateNumber(rng, digits, a, x => x % b !== 0, avoid)
  else if (outcome === 'second') n = generateNumber(rng, digits, b, x => x % a !== 0, avoid)
  else n = generateNumber(rng, digits, 1, x => x % a !== 0 && x % b !== 0, avoid)
  return { kind: 'two-rules', n, divisors: pair, answer: isDivisible(n, a) && isDivisible(n, b) }
}

/** Multiples of these make richer "find all divisors" numbers than plain
 * random ones (which are mostly divisible by nothing on the list). */
const ALL_DIVISORS_STEPS = [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 14, 18, 20, 22, 25, 36, 50]

export function divisorsOf(n: number, candidates: readonly Divisor[] = DIVISORS): Divisor[] {
  return candidates.filter(d => isDivisible(n, d))
}

export function allDivisorsChallenge(
  rng: Rng, digits: number, optionCount: number, avoid: ReadonlySet<number> = new Set(),
): Challenge {
  // rules capped below this length (7) aren't offered as options
  const pool = DIVISORS.filter(d => digits <= maxDigitsFor(d))
  const n = generateNumber(rng, digits, pick(rng, ALL_DIVISORS_STEPS), x => {
    const count = divisorsOf(x, pool).length
    return count >= 2 && count <= pool.length - 2
  }, avoid)

  const yes = shuffled(rng, divisorsOf(n, pool))
  const no = shuffled(rng, pool.filter(d => !isDivisible(n, d)))
  // roughly half right, half wrong — but always at least one of each, and
  // never more wrong options than exist
  const target = randInt(rng, Math.floor(optionCount / 2), Math.ceil(optionCount / 2))
  const minYes = Math.max(1, optionCount - no.length)
  const maxYes = Math.min(yes.length, optionCount - 1)
  const yesCount = Math.min(maxYes, Math.max(minYes, target))
  const options = [...yes.slice(0, yesCount), ...no.slice(0, optionCount - yesCount)].sort((x, y) => x - y)
  return { kind: 'all-divisors', n, options, correct: divisorsOf(n, options) }
}

/** True/false answers in equal measure, in random order. */
function balancedAnswers(rng: Rng, count: number): boolean[] {
  return shuffled(rng, Array.from({ length: count }, (_, i) => i % 2 === 0))
}

// Each rule introduced once, easiest first, on 3-digit numbers. 8 waits for
// level 2 — on a 3-digit number its "last three digits" is the whole number.
export const LEVEL1_INTRO: Divisor[] = [10, 2, 5, 3, 9, 4, 25, 6, 11, 7]
const PRACTICE_LENGTH = 6

export const LEVEL_LENGTH: Record<LevelId, number> = { 1: LEVEL1_INTRO.length, 2: 8, 3: 6, 4: 5, 5: 8 }

/**
 * The challenges for one play-through of a level. Single rules come first
 * (levels 1–2), then pairs of rules (3), then whole divisor sets (4), then a
 * mix (5) — combined challenges only ever use rules practised earlier.
 */
export function generateLevel(level: LevelId, rng: Rng = Math.random): Challenge[] {
  const used = new Set<number>()
  const track = (c: Challenge) => { used.add(c.n); return c }

  if (level === 1) {
    const divisors = LEVEL1_INTRO
    const answers = balancedAnswers(rng, divisors.length)
    return divisors.map((d, i) => track(yesNoChallenge(rng, d, 3, answers[i], true, used)))
  }

  if (level === 2) {
    // 8 meets its first real numbers here; the rest is a random review
    const review = shuffled(rng, DIVISORS.filter(d => d !== 8)).slice(0, LEVEL_LENGTH[2] - 1)
    const divisors = shuffled(rng, [8, ...review] as Divisor[])
    const answers = balancedAnswers(rng, divisors.length)
    return divisors.map((d, i) => track(yesNoChallenge(rng, d, randInt(rng, 4, 6), answers[i], true, used)))
  }

  if (level === 3) {
    const pairs = shuffled(rng, RULE_PAIRS).slice(0, LEVEL_LENGTH[3])
    const half = Math.ceil(pairs.length / 2)
    const misses: PairOutcome[] = ['first', 'second', 'neither']
    const outcomes = shuffled(rng, pairs.map((_, i): PairOutcome => i < half ? 'both' : misses[i % misses.length]))
    return pairs.map((p, i) => track(twoRulesChallenge(rng, p, randInt(rng, 3, 5), outcomes[i], used)))
  }

  if (level === 4) {
    return Array.from({ length: LEVEL_LENGTH[4] }, () => track(allDivisorsChallenge(rng, randInt(rng, 3, 4), 5, used)))
  }

  // level 5: a shuffled mix, without the same divisor twice in a row
  const kinds = shuffled(rng, ['yes-no', 'yes-no', 'yes-no', 'yes-no', 'two-rules', 'two-rules', 'all-divisors', 'all-divisors'] as const)
  const answers = balancedAnswers(rng, kinds.length)
  let lastDivisor: Divisor | null = null
  return kinds.map((kind, i) => {
    const digits = randInt(rng, 3, 6)
    if (kind === 'yes-no') {
      const d = pick(rng, DIVISORS.filter(x => x !== lastDivisor))
      lastDivisor = d
      return track(yesNoChallenge(rng, d, digits, answers[i], false, used))
    }
    lastDivisor = null
    if (kind === 'two-rules') {
      return track(twoRulesChallenge(rng, pick(rng, RULE_PAIRS), digits, answers[i] ? 'both' : pick(rng, ['first', 'second', 'neither'] as const), used))
    }
    return track(allDivisorsChallenge(rng, digits, 6, used))
  })
}

/** A short yes/no round on the rules that need the most work. */
export function generatePractice(rules: Divisor[], rng: Rng = Math.random): Challenge[] {
  const used = new Set<number>()
  const answers = balancedAnswers(rng, PRACTICE_LENGTH)
  return answers.map((answer, i) => {
    const c = yesNoChallenge(rng, rules[i % rules.length], randInt(rng, 3, 5), answer, true, used)
    used.add(c.n)
    return c
  })
}

/** Is the player's answer right? For all-divisors, `picked` must match exactly. */
export function checkAnswer(challenge: Challenge, answer: boolean | readonly Divisor[]): boolean {
  if (challenge.kind === 'all-divisors') {
    if (typeof answer === 'boolean') return false
    const picked = new Set(answer)
    return picked.size === challenge.correct.length && challenge.correct.every(d => picked.has(d))
  }
  return answer === challenge.answer
}

/** Which rules a challenge exercises — used for per-rule accuracy. */
export function challengeRules(challenge: Challenge): Divisor[] {
  if (challenge.kind === 'yes-no') return [challenge.divisor]
  if (challenge.kind === 'two-rules') return [...challenge.divisors]
  return [...challenge.options]
}

// ── progress ─────────────────────────────────────────────────────────────────

export interface RuleStat {
  correct: number
  total: number
}

export type RuleStats = Partial<Record<Divisor, RuleStat>>

export interface RuleResult {
  divisor: Divisor
  correct: boolean
}

export function addRuleResults(stats: RuleStats, results: readonly RuleResult[]): RuleStats {
  const next: RuleStats = { ...stats }
  for (const { divisor, correct } of results) {
    const prev = next[divisor] ?? { correct: 0, total: 0 }
    next[divisor] = { correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 }
  }
  return next
}

export const PRACTICE_MIN_ATTEMPTS = 2
export const PRACTICE_ACCURACY = 0.75

export type RuleStanding = 'new' | 'practise' | 'good'

export function ruleStanding(stat: RuleStat | undefined): RuleStanding {
  if (!stat || stat.total === 0) return 'new'
  if (stat.total >= PRACTICE_MIN_ATTEMPTS && stat.correct / stat.total < PRACTICE_ACCURACY) return 'practise'
  return 'good'
}

/** Up to `max` rules with the weakest first-try accuracy. */
export function rulesNeedingPractice(stats: RuleStats, max = 3): Divisor[] {
  return DIVISORS
    .filter(d => ruleStanding(stats[d]) === 'practise')
    .sort((a, b) => {
      const sa = stats[a]!, sb = stats[b]!
      return sa.correct / sa.total - sb.correct / sb.total
    })
    .slice(0, max)
}

/** Highest level that can be played: one past the furthest completed level. */
export function unlockedLevel(completed: readonly number[]): LevelId {
  let unlocked = 1
  while (unlocked < LEVELS.length && completed.includes(unlocked)) unlocked++
  return unlocked as LevelId
}
