// Number Workshop — decompose numbers into simple multipliers (factors) at
// robot-shop stations: 24 = 4 × 6 = 2 × 2 × 2 × 3, 0.24 = 24 × 0.01, 12/18 = 2/3.
// Products only — no sums anywhere. Every correct answer earns a star; three
// stars build a robot part.
//
// All grading is exact: values are parsed into integer fractions (never floats),
// and an answer is checked by multiplying its factors, never by comparing it to
// one stored arrangement.
//
// Pure module — no runtime imports — so `node --test` can load it directly.

import type { Keys } from '../i18n/translations'

export type StationId = 'tile-press' | 'factor-tree' | 'missing-multiplier' | 'decimal-scaler' | 'fraction-cancel'
export type Level = 1 | 2 | 3
/** 'select' = Mode A (tap one of 3–4 cards), 'build' = Mode B (make it, then Check) */
export type AnswerMode = 'select' | 'build'
export type Scale = '0.1' | '0.01' | '0.001'
export type Rng = () => number

/** Fraction Cancel is optional, so it's opt-in. */
export const ENABLE_FRACTION_CANCEL = false

export const ALL_STATIONS: StationId[] = ['tile-press', 'factor-tree', 'missing-multiplier', 'decimal-scaler', 'fraction-cancel']
export const STATIONS: StationId[] = ALL_STATIONS.filter(s => s !== 'fraction-cancel' || ENABLE_FRACTION_CANCEL)

export const MAX_LEVEL: Level = 3
export const STARS_PER_PART = 3
export const LEVEL_UP_STREAK = 3
export const BATTERY_SIZE = 5
/** Tile Press steppers stop here, so the grid fits a phone. */
export const MAX_TILE_SIDE = 12
/** Fraction Cancel keeps denominators in the shape engine's safe range. */
export const MAX_DENOMINATOR = 20

/** Chance a problem uses Mode B, by level — level 1 mostly cards, level 3 mostly building. */
export const BUILD_CHANCE: Record<Level, number> = { 1: 0.25, 2: 0.5, 3: 0.75 }

/** The multiplication sign used in every choice string and on screen. */
export const TIMES = '×'

// ── problems ─────────────────────────────────────────────────────────────────

interface ProblemBase {
  level: Level
  answerMode: AnswerMode
  /** Mode A only: products like "4 × 6", a single missing number, or a fraction */
  choices?: string[]
  correctIndex?: number
}

export interface TileProblem extends ProblemBase {
  station: 'tile-press'
  target: number
}

export interface TreeProblem extends ProblemBase {
  station: 'factor-tree'
  /** may be prime — then it's the "already simple!" teaching problem */
  target: number
}

export interface MissingProblem extends ProblemBase {
  station: 'missing-multiplier'
  target: number
  /** the factors shown, in order, with the gap at `missingIndex` */
  knownFactors: number[]
  missingIndex: number
  answer: number
  /** Mode B: the number cards to drag into the gap */
  cards?: string[]
}

export interface ScalerProblem extends ProblemBase {
  station: 'decimal-scaler'
  /** a string so zeros survive: "0.06" */
  value: string
  scaleFactor: Scale
  whole: number
  /** Mode B: whole-number blocks for the gap in "__ × 0.01" */
  cards?: string[]
}

export interface CancelProblem extends ProblemBase {
  station: 'fraction-cancel'
  numerator: number
  denominator: number
  commonFactor: number
  /** numerator and denominator written as a product, shared factor in a random spot */
  topFactors: [number, number]
  bottomFactors: [number, number]
}

export type WorkshopProblem = TileProblem | TreeProblem | MissingProblem | ScalerProblem | CancelProblem

// ── exact values ─────────────────────────────────────────────────────────────

/** A reduced fraction n/d with d > 0. */
export interface Rat { n: number; d: number }

export function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b)
}

function rat(n: number, d: number): Rat {
  const g = gcd(n, d) || 1
  return { n: n / g, d: d / g }
}

const ratMul = (a: Rat, b: Rat): Rat => rat(a.n * b.n, a.d * b.d)
const ratEq = (a: Rat, b: Rat) => a.n === b.n && a.d === b.d
const ONE: Rat = { n: 1, d: 1 }

/** Parses "7", "0.06", "3/8" exactly. Anything else (negative, malformed, x/0) is null. */
export function parseValue(s: string): Rat | null {
  const t = s.trim()
  if (/^\d+$/.test(t)) return rat(Number(t), 1)
  const dec = /^(\d+)\.(\d+)$/.exec(t)
  if (dec) return rat(Number(dec[1] + dec[2]), 10 ** dec[2].length)
  const frac = /^(\d+)\/(\d+)$/.exec(t)
  if (frac && Number(frac[2]) > 0) return rat(Number(frac[1]), Number(frac[2]))
  return null
}

/** The product of the factors, or null if any factor isn't a number. */
export function productOf(factors: string[]): Rat | null {
  let p = ONE
  for (const f of factors) {
    const v = parseValue(f)
    if (!v) return null
    p = ratMul(p, v)
  }
  return p
}

export const splitFactors = (s: string) => s.split(TIMES).map(x => x.trim()).filter(x => x !== '')
export const joinFactors = (factors: (string | number)[]) => factors.join(` ${TIMES} `)

/** Exact decimal string with a fixed number of places — "0.06", never "0.6". */
export function formatDecimal(v: Rat, places: number): string {
  const scaled = (v.n * 10 ** places) / v.d
  if (!Number.isInteger(scaled) || scaled < 0) throw new Error(`${v.n}/${v.d} has no ${places}-place decimal`)
  if (places === 0) return String(scaled)
  const digits = String(scaled).padStart(places + 1, '0')
  return `${digits.slice(0, -places)}.${digits.slice(-places)}`
}

const isWhole = (s: string) => /^\d+$/.test(s.trim())

export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false
  for (let k = 2; k * k <= n; k++) if (n % k === 0) return false
  return true
}

/** Prime factors in ascending order: 72 → [2, 2, 2, 3, 3]. */
export function primeFactors(n: number): number[] {
  const out: number[] = []
  let m = n
  for (let k = 2; k * k <= m; k++) while (m % k === 0) { out.push(k); m /= k }
  if (m > 1) out.push(m)
  return out
}

/** Ways to split n into two multipliers, both ≥ 2: 24 → [2,12], [3,8], [4,6]. */
export function factorPairs(n: number, maxSide = Infinity): [number, number][] {
  const out: [number, number][] = []
  for (let a = 2; a * a <= n; a++) {
    if (n % a === 0 && n / a <= maxSide) out.push([a, n / a])
  }
  return out
}

// ── grading ──────────────────────────────────────────────────────────────────

/**
 * Whether the student's factors are right — the single grading rule for both
 * modes, always by multiplying:
 *
 *  - tile:    two sides, both ≥ 2, rows × columns = target
 *  - tree:    every factor prime, product = target (a prime target is just itself)
 *  - missing: the shown factors plus the student's one, product = target
 *  - scaler:  a whole number × 0.1 / 0.01 / 0.001, product = value
 *  - cancel:  the same multiplier picked top and bottom, and it's the whole shared
 *             part (top ÷ it and bottom ÷ it share nothing more); or, in Mode A,
 *             the fraction that's left: equal in value and fully cancelled
 */
export function isCorrectAnswer(p: WorkshopProblem, parts: string[]): boolean {
  if (parts.length === 0) return false
  switch (p.station) {
    case 'tile-press':
      return parts.length === 2 && parts.every(f => isWhole(f) && Number(f) >= 2) && productIs(parts, rat(p.target, 1))
    case 'factor-tree':
      return parts.every(f => isWhole(f) && isPrime(Number(f))) && productIs(parts, rat(p.target, 1))
    case 'missing-multiplier': {
      if (!parts.every(isWhole) || parts.length !== p.knownFactors.length + 1) return false
      // the shown factors must all still be there — the student only fills the gap
      const rest = parts.map(Number)
      for (const k of p.knownFactors) {
        const i = rest.indexOf(k)
        if (i === -1) return false
        rest.splice(i, 1)
      }
      return productIs(parts, rat(p.target, 1))
    }
    case 'decimal-scaler':
      return parts.length === 2 && isWhole(parts[0]) && Number(parts[0]) >= 1
        && (SCALES as string[]).includes(parts[1].trim())
        && productIs(parts, parseValue(p.value)!)
    case 'fraction-cancel': {
      const { numerator: n, denominator: d } = p
      if (parts.length === 1) {
        const v = /^(\d+)\/(\d+)$/.exec(parts[0].trim())
        if (!v) return false
        const [a, b] = [Number(v[1]), Number(v[2])]
        return b > 0 && a * d === b * n && gcd(a, b) === 1
      }
      if (parts.length !== 2 || !parts.every(isWhole)) return false
      const [top, bottom] = parts.map(Number)
      return top === bottom && top > 1 && n % top === 0 && d % top === 0 && gcd(n / top, d / top) === 1
    }
  }
}

function productIs(parts: string[], target: Rat): boolean {
  const p = productOf(parts)
  return p !== null && ratEq(p, target)
}

/** A Mode A choice as the factors to grade. */
export function choiceParts(p: WorkshopProblem, choice: string): string[] {
  switch (p.station) {
    case 'missing-multiplier': return [...p.knownFactors.map(String), choice.trim()]
    case 'fraction-cancel': return [choice.trim()]
    default: return splitFactors(choice)
  }
}

/** Mode A answer check. */
export function isCorrectChoice(p: WorkshopProblem, index: number): boolean {
  const choice = p.choices?.[index]
  return choice !== undefined && isCorrectAnswer(p, choiceParts(p, choice))
}

/** One correct answer, shown after a wrong one (and accepted by isCorrectAnswer). */
export function solutionParts(p: WorkshopProblem): string[] {
  switch (p.station) {
    case 'tile-press': {
      if (p.choices && p.correctIndex !== undefined) return splitFactors(p.choices[p.correctIndex])
      const pairs = factorPairs(p.target)
      return pairs[pairs.length - 1].map(String) // the squarest rectangle
    }
    case 'factor-tree': return primeFactors(p.target).map(String)
    case 'missing-multiplier': return [...p.knownFactors, p.answer].map(String)
    case 'decimal-scaler': return [String(p.whole), p.scaleFactor]
    case 'fraction-cancel': return [String(p.commonFactor), String(p.commonFactor)]
  }
}

/** The factors in order with the gap (null) in its place: 48 = 6 × ?. */
export function missingSlots(p: MissingProblem): (number | null)[] {
  const slots: (number | null)[] = [...p.knownFactors]
  slots.splice(p.missingIndex, 0, null)
  return slots
}

// ── generation ───────────────────────────────────────────────────────────────

const randInt = (rng: Rng, lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1))
const pick = <T>(rng: Rng, xs: readonly T[]): T => xs[randInt(rng, 0, xs.length - 1)]

function shuffled<T>(rng: Rng, xs: readonly T[]): T[] {
  const out = [...xs]
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(rng, 0, i)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function range(lo: number, hi: number): number[] {
  return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i)
}

const sortedProduct = (factors: number[]) => joinFactors([...factors].sort((a, b) => a - b))

type Fields<P> = Omit<P, 'level' | 'answerMode' | 'choices' | 'correctIndex' | 'cards'>

/** Up to three candidates that are distinct, well-formed and really wrong. */
function pickWrong(correct: string, candidates: (string | null)[], isRight: (c: string) => boolean): string[] {
  const out: string[] = []
  for (const c of candidates) {
    if (out.length === 3) break
    if (c === null || c === correct || out.includes(c) || isRight(c)) continue
    out.push(c)
  }
  return out
}

function withChoices<P extends WorkshopProblem>(rng: Rng, problem: P, correct: string, candidates: (string | null)[]): P {
  const wrong = pickWrong(correct, candidates, c => {
    const parts = choiceParts(problem, c)
    return parts.some(x => parseValue(x) === null) || isCorrectAnswer(problem, parts)
  })
  const choices = shuffled(rng, [correct, ...wrong])
  return { ...problem, choices, correctIndex: choices.indexOf(correct) }
}

/** Times-table range: an "adds up instead" slip only looks tempting with small numbers. */
const ADDITIVE_MAX_PART = 12

/** Two numbers that *add* to n but don't multiply to it: 12 → 5 and 7. */
function additivePair(rng: Rng, n: number, primesOnly = false): [number, number] | null {
  const options: [number, number][] = []
  for (let a = 2; a <= n / 2; a++) {
    const b = n - a
    if (a * b === n || b > ADDITIVE_MAX_PART) continue
    if (primesOnly && !(isPrime(a) && isPrime(b))) continue
    options.push([a, b])
  }
  return options.length > 0 ? pick(rng, options) : null
}

/** Weighted toward numbers with many factor pairs (12, 24, 36, 48, 60, 72). */
function pickTarget(rng: Rng, pool: number[]): number {
  const weighted = pool.flatMap(n => Array.from({ length: Math.max(1, factorPairs(n).length) }, () => n))
  return pick(rng, weighted)
}

const MAX_TARGET: Record<Level, number> = { 1: 30, 2: 60, 3: 100 }

// Tile Press ──────────────────────────────────────────────────────────────────

export const TILE_MAX_SIDE: Record<Level, number> = { 1: 6, 2: 10, 3: MAX_TILE_SIDE }

function tileFields(level: Level, rng: Rng): Fields<TileProblem> {
  const pool = range(6, MAX_TARGET[level]).filter(n => factorPairs(n, TILE_MAX_SIDE[level]).length > 0 && (level === 1 || n > 12))
  return { station: 'tile-press', target: pickTarget(rng, pool) }
}

function tileChoices(rng: Rng, p: TileProblem): TileProblem {
  const [r, c] = pick(rng, factorPairs(p.target, TILE_MAX_SIDE[p.level]))
  const pair = (a: number, b: number) => (a >= 2 && b >= 2 && Math.max(a, b) <= MAX_TILE_SIDE ? sortedProduct([a, b]) : null)
  const root = Math.round(Math.sqrt(p.target))
  return withChoices(rng, p, sortedProduct([r, c]), shuffled(rng, [
    pair(r + 1, c),            // wrong product
    pair(r, c - 1),
    pair(root, root),          // a side that doesn't divide the target
    pair(r - 1, c + 1),
    pair(r + 1, c - 1),
  ]))
}

// Factor Tree ─────────────────────────────────────────────────────────────────

/** Prime-factor count (with repeats) per level — keeps level 1 trees two splits deep. */
const TREE_OMEGA: Record<Level, [number, number]> = { 1: [2, 3], 2: [3, 4], 3: [4, 5] }
/** How often a prime turns up as the "already simple!" teaching problem. */
export const PRIME_TEACHING_CHANCE = 0.12

function treeFields(level: Level, rng: Rng): Fields<TreeProblem> {
  if (level < 3 && rng() < PRIME_TEACHING_CHANCE) {
    return { station: 'factor-tree', target: pick(rng, range(7, MAX_TARGET[level]).filter(isPrime)) }
  }
  const [lo, hi] = TREE_OMEGA[level]
  const pool = range(4, MAX_TARGET[level]).filter(n => {
    const k = primeFactors(n).length
    return k >= lo && k <= hi
  })
  return { station: 'factor-tree', target: pickTarget(rng, pool) }
}

function nextPrime(p: number): number {
  let q = p + 1
  while (!isPrime(q)) q++
  return q
}

function treeChoices(rng: Rng, p: TreeProblem): TreeProblem {
  const n = p.target
  if (isPrime(n)) {
    const near = factorPairs(n - 1)
    const add = additivePair(rng, n)
    return withChoices(rng, p, String(n), shuffled(rng, [
      joinFactors([1, n]),                                     // 1 isn't prime
      add ? sortedProduct(add) : null,                         // adds to n, doesn't multiply
      near.length > 0 ? sortedProduct(pick(rng, near)) : null, // the number next door
      sortedProduct([2, Math.ceil(n / 2)]),
    ]))
  }
  const pf = primeFactors(n)
  const notPrime = factorPairs(n).filter(([a, b]) => !isPrime(a) || !isPrime(b))
  const i = randInt(rng, 0, pf.length - 1)
  const add = additivePair(rng, n, true)
  return withChoices(rng, p, sortedProduct(pf), shuffled(rng, [
    notPrime.length > 0 ? sortedProduct(pick(rng, notPrime)) : null, // stopped too early
    sortedProduct(pf.map((x, j) => (j === i ? nextPrime(x) : x))),    // one prime wrong
    pf.length > 1 ? sortedProduct(pf.filter((_, j) => j !== i)) : null, // one prime missing
    add ? sortedProduct(add) : null,                                  // primes that add to n
  ]))
}

/**
 * The pairs offered when a student splits `n` in the tree: up to three real
 * factor pairs and one that only *adds* to n (or is one off) — so the split
 * has to be thought about, and grading by product catches the slip.
 */
export function splitOptions(n: number, rng: Rng = Math.random): [number, number][] {
  const real = shuffled(rng, factorPairs(n)).slice(0, 3)
  if (real.length === 0) return []
  const wrong: [number, number] = additivePair(rng, n) ?? [real[0][0], real[0][1] + 1]
  return shuffled(rng, [...real, wrong])
}

// Missing Multiplier ──────────────────────────────────────────────────────────

function missingFields(level: Level, rng: Rng): Fields<MissingProblem> {
  const threeSlots = level === 2 ? rng() < 0.5 : level === 3 ? rng() < 0.7 : false
  const maxFactor = level === 1 ? 6 : threeSlots ? 6 : 10
  for (;;) {
    const factors = Array.from({ length: threeSlots ? 3 : 2 }, () => randInt(rng, 2, maxFactor))
    const target = factors.reduce((a, b) => a * b, 1)
    if (target > MAX_TARGET[level]) continue
    const missingIndex = randInt(rng, 0, factors.length - 1)
    return {
      station: 'missing-multiplier',
      target,
      knownFactors: factors.filter((_, i) => i !== missingIndex),
      missingIndex,
      answer: factors[missingIndex],
    }
  }
}

function missingOptions(rng: Rng, p: MissingProblem): string[] {
  const m = p.answer
  const known = p.knownFactors.reduce((a, b) => a * b, 1)
  const wrong = pickWrong(String(m), shuffled(rng, [
    p.target - known > 1 ? String(p.target - known) : null,  // added instead of multiplied: 48 = 6 + 42
    String(m + 1),                                           // one off
    m > 2 ? String(m - 1) : null,
    String(m * 2),                                           // doubled
    m % 2 === 0 && m > 2 ? String(m / 2) : null,             // halved
  ]), c => isCorrectAnswer(p, choiceParts(p, c)))
  return shuffled(rng, [String(m), ...wrong])
}

// Decimal Scaler ──────────────────────────────────────────────────────────────

const SCALES: Scale[] = ['0.1', '0.01', '0.001']
const SCALE_PLACES: Record<Scale, number> = { '0.1': 1, '0.01': 2, '0.001': 3 }
const LEVEL_SCALE: Record<Level, Scale> = { 1: '0.1', 2: '0.01', 3: '0.001' }

function scalerFields(level: Level, rng: Rng): Fields<ScalerProblem> {
  const scaleFactor = LEVEL_SCALE[level]
  const places = SCALE_PLACES[scaleFactor]
  // whole numbers of 1 up to places+1 digits, never ending in 0 — so the value
  // always has exactly `places` decimal places (0.06, 0.24, 3.75)
  const digits = randInt(rng, 1, places + 1)
  let whole: number
  do whole = randInt(rng, 10 ** (digits - 1), 10 ** digits - 1)
  while (whole % 10 === 0)
  return { station: 'decimal-scaler', scaleFactor, whole, value: formatDecimal(rat(whole, 10 ** places), places) }
}

function swapDigits(n: number): number | null {
  const s = String(n)
  if (s.length < 2 || s[s.length - 1] === s[s.length - 2]) return null
  return Number(s.slice(0, -2) + s[s.length - 1] + s[s.length - 2])
}

function scalerChoices(rng: Rng, p: ScalerProblem): ScalerProblem {
  const { whole: w, scaleFactor: s } = p
  const i = SCALES.indexOf(s)
  const swapped = swapDigits(w)
  return withChoices(rng, p, joinFactors([w, s]), shuffled(rng, [
    joinFactors([w, SCALES[i === 0 ? 1 : i - 1]]),        // decimal in the wrong place: 24 × 0.1
    i < 2 ? joinFactors([w, SCALES[i + 1]]) : null,
    joinFactors([w * 10, s]),                             // an extra zero
    swapped !== null ? joinFactors([swapped, s]) : null,  // digits swapped
  ]))
}

function scalerCards(rng: Rng, p: ScalerProblem): string[] {
  const w = p.whole
  const swapped = swapDigits(w)
  const wrong = pickWrong(String(w), [
    ...shuffled(rng, [
      String(w * 10),                              // an extra zero
      swapped !== null ? String(swapped) : null,   // digits swapped
      w >= 10 ? String(Math.floor(w / 10)) : null, // a digit dropped
    ]),
    String(w * 100),                               // only if fewer than three above
  ], c => isCorrectAnswer(p, [c, p.scaleFactor]))
  return shuffled(rng, [String(w), ...wrong])
}

// Fraction Cancel ─────────────────────────────────────────────────────────────

const CANCEL_MAX_COMMON: Record<Level, number> = { 1: 3, 2: 5, 3: 6 }

function cancelFields(level: Level, rng: Rng): Fields<CancelProblem> {
  const options: [number, number, number][] = []
  for (let c = 2; c <= CANCEL_MAX_COMMON[level]; c++) {
    for (let b = 3; b * c <= MAX_DENOMINATOR; b++) {
      for (let a = 2; a < b; a++) if (gcd(a, b) === 1) options.push([a, b, c])
    }
  }
  const [a, b, c] = pick(rng, options)
  const order = (x: number, y: number): [number, number] => (rng() < 0.5 ? [x, y] : [y, x])
  return {
    station: 'fraction-cancel',
    numerator: a * c,
    denominator: b * c,
    commonFactor: c,
    topFactors: order(a, c),
    bottomFactors: order(b, c),
  }
}

function cancelChoices(rng: Rng, p: CancelProblem): CancelProblem {
  const { numerator: n, denominator: d, commonFactor: c } = p
  const a = n / c
  const b = d / c
  const part = factorPairs(c)[0]?.[0] // c = 4 or 6: cancelling only 2 of it
  return withChoices(rng, p, `${a}/${b}`, shuffled(rng, [
    part ? `${n / part}/${d / part}` : null,
    `${b}/${a}`,                    // upside down
    `${a}/${d}`,                    // cancelled the top only
    `${n - c}/${d - c}`,            // took away instead of dividing
  ]))
}

// ─────────────────────────────────────────────────────────────────────────────

/** Identity of a problem, for "don't repeat the one just played". */
export function problemKey(p: WorkshopProblem): string {
  switch (p.station) {
    case 'tile-press':
    case 'factor-tree': return `${p.station}:${p.target}`
    case 'missing-multiplier': return `${p.station}:${p.target}=${missingSlots(p).join(',')}`
    case 'decimal-scaler': return `${p.station}:${p.value}`
    case 'fraction-cancel': return `${p.station}:${p.numerator}/${p.denominator}`
  }
}

function generateOnce(station: StationId, level: Level, rng: Rng): WorkshopProblem {
  const answerMode: AnswerMode = rng() < BUILD_CHANCE[level] ? 'build' : 'select'
  const base = { level, answerMode }
  const select = answerMode === 'select'
  switch (station) {
    case 'tile-press': {
      const p: TileProblem = { ...base, ...tileFields(level, rng) }
      return select ? tileChoices(rng, p) : p
    }
    case 'factor-tree': {
      const p: TreeProblem = { ...base, ...treeFields(level, rng) }
      return select ? treeChoices(rng, p) : p
    }
    case 'missing-multiplier': {
      const p: MissingProblem = { ...base, ...missingFields(level, rng) }
      const options = missingOptions(rng, p)
      return select ? { ...p, choices: options, correctIndex: options.indexOf(String(p.answer)) } : { ...p, cards: options }
    }
    case 'decimal-scaler': {
      const p: ScalerProblem = { ...base, ...scalerFields(level, rng) }
      return select ? scalerChoices(rng, p) : { ...p, cards: scalerCards(rng, p) }
    }
    case 'fraction-cancel': {
      const p: CancelProblem = { ...base, ...cancelFields(level, rng) }
      return select ? cancelChoices(rng, p) : p
    }
  }
}

/** A fresh problem for a station and level — never the same one as `previous`. */
export function generateProblem(
  station: StationId, level: Level, rng: Rng = Math.random, previous?: WorkshopProblem | null,
): WorkshopProblem {
  const prevKey = previous ? problemKey(previous) : null
  let p = generateOnce(station, level, rng)
  for (let i = 0; i < 20 && problemKey(p) === prevKey; i++) p = generateOnce(station, level, rng)
  return p
}

// ── robot parts & progress ───────────────────────────────────────────────────

export interface RobotPart {
  id: string
  icon: string
  nameKey: Keys
}

/** In unlock order — the robot builds up from its body. */
export const PARTS: RobotPart[] = [
  { id: 'body',        icon: '🛢️', nameKey: 'wsPartBody' },
  { id: 'head',        icon: '📦', nameKey: 'wsPartHead' },
  { id: 'eyes',        icon: '👀', nameKey: 'wsPartEyes' },
  { id: 'smile',       icon: '😁', nameKey: 'wsPartSmile' },
  { id: 'left-wheel',  icon: '⚙️', nameKey: 'wsPartLeftWheel' },
  { id: 'right-wheel', icon: '⚙️', nameKey: 'wsPartRightWheel' },
  { id: 'left-arm',    icon: '🦾', nameKey: 'wsPartLeftArm' },
  { id: 'right-arm',   icon: '🦾', nameKey: 'wsPartRightArm' },
  { id: 'antenna',     icon: '📡', nameKey: 'wsPartAntenna' },
  { id: 'chest-light', icon: '💡', nameKey: 'wsPartChestLight' },
  { id: 'ear-bolts',   icon: '🔩', nameKey: 'wsPartEarBolts' },
  { id: 'jetpack',     icon: '🚀', nameKey: 'wsPartJetpack' },
]

/** What's stored under `workshop` on the user's progress/{uid} document. */
export interface WorkshopSave {
  unlockedParts: string[]
  stationLevels: Record<StationId, Level>
  highStreak: number
  /** stars toward the next part (0–2), so a half-built part survives a reload */
  stars: number
  /** parts a full streak battery turned gold */
  goldenParts: string[]
}

const perStation = <T>(value: T) => Object.fromEntries(ALL_STATIONS.map(s => [s, value])) as Record<StationId, T>

export const DEFAULT_SAVE: WorkshopSave = {
  unlockedParts: [],
  stationLevels: perStation<Level>(1),
  highStreak: 0,
  stars: 0,
  goldenParts: [],
}

const KNOWN_PART_IDS = new Set(PARTS.map(p => p.id))
const toCount = (x: unknown, max = Infinity) =>
  typeof x === 'number' && Number.isFinite(x) ? Math.min(max, Math.max(0, Math.floor(x))) : 0
const toLevel = (x: unknown): Level => (x === 2 || x === 3 ? x : 1)
function toPartList(x: unknown): string[] {
  if (!Array.isArray(x)) return []
  return [...new Set(x.filter((id): id is string => typeof id === 'string' && KNOWN_PART_IDS.has(id)))]
}

/** Whatever is (or isn't) on the document → a valid save. Existing users have no
 * `workshop` field at all; others may have a partial map or unknown stations. */
export function normalizeSave(raw: unknown): WorkshopSave {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const levels = (r.stationLevels && typeof r.stationLevels === 'object' ? r.stationLevels : {}) as Record<string, unknown>
  const unlockedParts = toPartList(r.unlockedParts)
  return {
    unlockedParts,
    stationLevels: Object.fromEntries(ALL_STATIONS.map(s => [s, toLevel(levels[s])])) as Record<StationId, Level>,
    highStreak: toCount(r.highStreak),
    stars: toCount(r.stars, STARS_PER_PART - 1),
    goldenParts: toPartList(r.goldenParts).filter(id => unlockedParts.includes(id)),
  }
}

/** In-session only: the streaks that drive the battery and leveling. */
export interface SessionState {
  streak: number
  stationStreaks: Record<StationId, number>
}

export const NEW_SESSION: SessionState = { streak: 0, stationStreaks: perStation(0) }

export interface AnswerEvents {
  starEarned: boolean
  partUnlocked: string | null
  levelUp: Level | null
  /** the battery filled and turned this part gold */
  goldenPart: string | null
  batteryFull: boolean
  newHighStreak: boolean
}

/** Battery segments lit for a streak: 1–5, and full (5) at every multiple of 5. */
export function batteryCharge(streak: number): number {
  if (streak === 0) return 0
  return streak % BATTERY_SIZE === 0 ? BATTERY_SIZE : streak % BATTERY_SIZE
}

/**
 * One answered problem. Correct: a star (three build the next part), the streaks
 * grow, the station levels up after LEVEL_UP_STREAK in a row, and every full
 * battery gilds the oldest plain part. Wrong: the streaks quietly reset — stars,
 * parts and levels are never taken away.
 */
export function applyAnswer(
  save: WorkshopSave, session: SessionState, station: StationId, correct: boolean,
): { save: WorkshopSave; session: SessionState; events: AnswerEvents } {
  const events: AnswerEvents = {
    starEarned: false, partUnlocked: null, levelUp: null, goldenPart: null, batteryFull: false, newHighStreak: false,
  }
  if (!correct) {
    return {
      save,
      session: { streak: 0, stationStreaks: { ...session.stationStreaks, [station]: 0 } },
      events,
    }
  }

  const next: WorkshopSave = { ...save, stationLevels: { ...save.stationLevels } }
  const streak = session.streak + 1
  let stationStreak = session.stationStreaks[station] + 1
  events.starEarned = true

  next.stars = save.stars + 1
  if (next.stars >= STARS_PER_PART) {
    next.stars = 0
    const part = PARTS.find(x => !save.unlockedParts.includes(x.id))
    if (part) {
      next.unlockedParts = [...save.unlockedParts, part.id]
      events.partUnlocked = part.id
    }
  }

  const level = save.stationLevels[station]
  if (stationStreak >= LEVEL_UP_STREAK && level < MAX_LEVEL) {
    next.stationLevels[station] = (level + 1) as Level
    events.levelUp = next.stationLevels[station]
    stationStreak = 0
  }

  if (streak % BATTERY_SIZE === 0) {
    events.batteryFull = true
    const plain = next.unlockedParts.find(id => !next.goldenParts.includes(id))
    if (plain) {
      next.goldenParts = [...next.goldenParts, plain]
      events.goldenPart = plain
    }
  }

  if (streak > save.highStreak) {
    next.highStreak = streak
    events.newHighStreak = true
  }

  return {
    save: next,
    session: { streak, stationStreaks: { ...session.stationStreaks, [station]: stationStreak } },
    events,
  }
}
