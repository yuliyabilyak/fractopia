// Scribe's Pyramid — Egyptian doubling multiplication + Egyptian unit-fraction
// decomposition, framed as a scribe helping build a pyramid.
//
//   multiply    N x fraction, solved with the ancient doubling method
//   decompose   a fraction rewritten as a sum of distinct unit fractions
//   combined    multiply, then decompose the result (Level 4)
//   grand       the finale: multiply, decompose, then convert into stones needed
//
// No fixed puzzle arrays — every puzzle is generated procedurally, the same
// "construct valid operands, retry on a rare bad draw" style as anubisScales.ts
// and pizzaTrade.ts use.

import { gcd, lcm, randomInt, isEquivalent, fracKey, type Fraction } from '../utils/fractionMath'
import { shuffle } from './exercises'

export type Level = 1 | 2 | 3 | 4
export type StepKind = 'multiply' | 'decompose' | 'combined' | 'grand'

export interface StepDef {
  level: Level
  kind: StepKind
}

export interface DoublingRow {
  multiplier: number
  fraction: Fraction
}

export interface MultiplyPuzzle {
  whole: number
  unit: Fraction
  rows: DoublingRow[]
  correctMultipliers: number[]
  result: Fraction
}

export interface EgyptianPuzzle {
  target: Fraction
  decomposition: Fraction[]
  mode: 'select' | 'generate'
  choices?: Fraction[][]
  correctChoiceIndex?: number
  jarPool?: Fraction[]
}

export interface CombinedPuzzle {
  multiply: MultiplyPuzzle
  egyptian: EgyptianPuzzle
}

export interface GrandChallenge extends CombinedPuzzle {
  cartSize: number
  stonesNeeded: number
}

export const SEQUENCE: StepDef[] = [
  { level: 1, kind: 'multiply' }, { level: 1, kind: 'multiply' }, { level: 1, kind: 'multiply' },
  { level: 2, kind: 'multiply' }, { level: 2, kind: 'multiply' }, { level: 2, kind: 'multiply' },
  { level: 3, kind: 'decompose' }, { level: 3, kind: 'decompose' }, { level: 3, kind: 'decompose' },
  { level: 4, kind: 'combined' }, { level: 4, kind: 'combined' },
  { level: 4, kind: 'grand' },
]

export const TOTAL_STEPS = SEQUENCE.length

// ── fraction helpers ─────────────────────────────────────────────────────────

function reduce(f: Fraction): Fraction {
  const g = gcd(f.numerator, f.denominator)
  return { numerator: f.numerator / g, denominator: f.denominator / g }
}

export function sumFractions(fractions: Fraction[]): Fraction {
  const commonD = fractions.reduce((acc, f) => lcm(acc, f.denominator), 1)
  const numerator = fractions.reduce((acc, f) => acc + f.numerator * (commonD / f.denominator), 0)
  return reduce({ numerator, denominator: commonD })
}

export function formatFraction(f: Fraction): string {
  return `${f.numerator}/${f.denominator}`
}

// ── doubling multiplication ──────────────────────────────────────────────────

const ROW_MULTIPLIERS = [1, 2, 4]

const UNIT_FRACTIONS_L1: Fraction[] = [
  { numerator: 1, denominator: 2 },
  { numerator: 1, denominator: 3 },
  { numerator: 1, denominator: 4 },
]

const FRACTIONS_L2: Fraction[] = [
  { numerator: 2, denominator: 5 },
  { numerator: 1, denominator: 6 },
  { numerator: 3, denominator: 8 },
  { numerator: 1, denominator: 4 },
  { numerator: 2, denominator: 7 },
  { numerator: 3, denominator: 4 },
]

function binaryDecomposition(whole: number): number[] {
  return ROW_MULTIPLIERS.filter(m => (whole & m) !== 0)
}

function buildMultiplyPuzzle(whole: number, unit: Fraction): MultiplyPuzzle {
  const rows: DoublingRow[] = ROW_MULTIPLIERS.map(multiplier => ({
    multiplier,
    fraction: { numerator: multiplier * unit.numerator, denominator: unit.denominator },
  }))
  const correctMultipliers = binaryDecomposition(whole)
  const resultNumerator = correctMultipliers.reduce((acc, m) => acc + m * unit.numerator, 0)
  return {
    whole,
    unit,
    rows,
    correctMultipliers,
    result: { numerator: resultNumerator, denominator: unit.denominator },
  }
}

export function generateMultiplyPuzzle(level: 1 | 2): MultiplyPuzzle {
  if (level === 1) {
    const unit = UNIT_FRACTIONS_L1[randomInt(0, UNIT_FRACTIONS_L1.length - 1)]
    const whole = randomInt(2, 4)
    return buildMultiplyPuzzle(whole, unit)
  }
  const unit = FRACTIONS_L2[randomInt(0, FRACTIONS_L2.length - 1)]
  const whole = randomInt(3, 7)
  return buildMultiplyPuzzle(whole, unit)
}

export function doublingSelectedSum(rows: DoublingRow[], selected: Set<number>): number {
  return rows.reduce((acc, r) => acc + (selected.has(r.multiplier) ? r.multiplier : 0), 0)
}

export type DoublingHint = 'correct' | 'need-more' | 'too-many'

export function doublingHint(selectedSum: number, whole: number): DoublingHint {
  if (selectedSum === whole) return 'correct'
  return selectedSum < whole ? 'need-more' : 'too-many'
}

// ── Egyptian fraction decomposition ──────────────────────────────────────────

const DECOMPOSE_DENOMS = [3, 4, 5, 6, 7, 8, 9, 10, 12]
const MAX_UNIT_DENOM = 100

/** Greedy Fibonacci-Sylvester algorithm. Null if it needs more than maxTerms
 * or produces a denominator too large to render as a shape/tile. */
export function decomposeEgyptian(target: Fraction, maxTerms: number): Fraction[] | null {
  let { numerator: n, denominator: d } = reduce(target)
  if (n <= 0 || n >= d) return null
  const terms: Fraction[] = []
  for (let i = 0; i < maxTerms && n !== 0; i++) {
    const unitD = Math.ceil(d / n)
    if (unitD > MAX_UNIT_DENOM) return null
    terms.push({ numerator: 1, denominator: unitD })
    const newN = n * unitD - d
    const newD = d * unitD
    if (newN === 0) { n = 0; break }
    const g = gcd(newN, newD)
    n = newN / g
    d = newD / g
  }
  return n === 0 ? terms : null
}

function randomProperFraction(): Fraction {
  const d = DECOMPOSE_DENOMS[randomInt(0, DECOMPOSE_DENOMS.length - 1)]
  const n = randomInt(2, d - 1) // >=2 so it isn't already a unit fraction
  return reduce({ numerator: n, denominator: d })
}

function decompositionKey(terms: Fraction[]): string {
  return terms.map(fracKey).join('+')
}

/** A different, plausible-looking decomposition (of a nearby but unequal
 * fraction) to use as a wrong choice — "adds up to something else" rather
 * than random noise. */
function generateDistractorDecomposition(target: Fraction, maxTerms: number, used: Set<string>): Fraction[] | null {
  const nearby: Fraction[] = [
    { numerator: target.numerator + 1, denominator: target.denominator },
    { numerator: Math.max(1, target.numerator - 1), denominator: target.denominator },
    { numerator: target.numerator, denominator: target.denominator + 1 },
    { numerator: target.numerator, denominator: Math.max(target.numerator + 2, target.denominator - 1) },
  ]
  for (const candidate of shuffle(nearby)) {
    const c = reduce(candidate)
    if (c.numerator <= 0 || c.numerator >= c.denominator) continue
    if (isEquivalent(c, target)) continue
    const decomp = decomposeEgyptian(c, maxTerms)
    if (!decomp) continue
    const key = decompositionKey(decomp)
    if (used.has(key)) continue
    used.add(key)
    return decomp
  }
  return null
}

export function generateEgyptianPuzzle(level: 3 | 4): EgyptianPuzzle {
  const maxTerms = level === 3 ? 2 : 3
  let target: Fraction | null = null
  let decomposition: Fraction[] | null = null
  for (let attempt = 0; attempt < 25 && !decomposition; attempt++) {
    const candidate = randomProperFraction()
    const decomp = decomposeEgyptian(candidate, maxTerms)
    if (decomp) { target = candidate; decomposition = decomp }
  }
  if (!target || !decomposition) {
    target = { numerator: 2, denominator: 5 }
    decomposition = [{ numerator: 1, denominator: 3 }, { numerator: 1, denominator: 15 }]
  }

  return buildEgyptianPuzzle(target, decomposition, maxTerms, level === 3 ? 'select' : 'generate')
}

function buildEgyptianPuzzle(target: Fraction, decomposition: Fraction[], maxTerms: number, mode: 'select' | 'generate'): EgyptianPuzzle {
  if (mode === 'select') {
    const used = new Set<string>([decompositionKey(decomposition)])
    const distractors: Fraction[][] = []
    for (let attempt = 0; attempt < 12 && distractors.length < 3; attempt++) {
      const d = generateDistractorDecomposition(target, maxTerms, used)
      if (d) distractors.push(d)
    }
    const choices = shuffle([decomposition, ...distractors])
    const correctChoiceIndex = choices.findIndex(c => decompositionKey(c) === decompositionKey(decomposition))
    return { target, decomposition, mode, choices, correctChoiceIndex }
  }

  const used = new Set<string>([decompositionKey(decomposition)])
  const distractorTerms = new Set<string>(decomposition.map(fracKey))
  const jarExtras: Fraction[] = []
  for (let attempt = 0; attempt < 12 && jarExtras.length < 3; attempt++) {
    const d = generateDistractorDecomposition(target, maxTerms, used)
    if (!d) continue
    for (const term of d) {
      const key = fracKey(term)
      if (!distractorTerms.has(key) && jarExtras.length < 3) {
        distractorTerms.add(key)
        jarExtras.push(term)
      }
    }
  }
  const jarPool = shuffle([...decomposition, ...jarExtras])
  return { target, decomposition, mode, jarPool }
}

export type EgyptianSumHint = 'correct' | 'need-more' | 'too-many'

export function egyptianSumHint(placed: Fraction[], target: Fraction): EgyptianSumHint {
  if (placed.length === 0) return 'need-more'
  const sum = sumFractions(placed)
  if (isEquivalent(sum, target)) return 'correct'
  return sum.numerator / sum.denominator < target.numerator / target.denominator ? 'need-more' : 'too-many'
}

// ── combined & grand challenge ───────────────────────────────────────────────

export function generateCombinedPuzzle(): CombinedPuzzle {
  const multiply = generateMultiplyPuzzle(2)
  const egyptian = generateEgyptianPuzzle(4)
  // the decomposition puzzle is generated independently of the multiply result
  // (it needs its own valid, short decomposition) — the shared thread for the
  // player is "you just multiplied, now let's Egyptian-ize a fraction like it"
  return { multiply, egyptian }
}

const CART_UNIT_DENOMS = [5, 6, 7, 8]
const MAX_TERMS_GRAND = 3

function buildGrandChallenge(whole: number, d: number, decomposition: Fraction[]): GrandChallenge {
  const unit: Fraction = { numerator: 1, denominator: d }
  const multiply = buildMultiplyPuzzle(whole, unit)
  const egyptian = buildEgyptianPuzzle(multiply.result, decomposition, MAX_TERMS_GRAND, 'generate')
  const cartSize = d * 4
  const stonesNeeded = whole * 4
  return { multiply, egyptian, cartSize, stonesNeeded }
}

export function generateGrandChallenge(): GrandChallenge {
  for (let attempt = 0; attempt < 25; attempt++) {
    const d = CART_UNIT_DENOMS[randomInt(0, CART_UNIT_DENOMS.length - 1)]
    const whole = randomInt(2, d - 1)
    const decomposition = decomposeEgyptian({ numerator: whole, denominator: d }, MAX_TERMS_GRAND)
    if (decomposition) return buildGrandChallenge(whole, d, decomposition)
  }
  // 3/8 = 1/3 + 1/24 always decomposes within 3 terms — guaranteed fallback.
  return buildGrandChallenge(3, 8, decomposeEgyptian({ numerator: 3, denominator: 8 }, MAX_TERMS_GRAND)!)
}

// ── scoring ───────────────────────────────────────────────────────────────────

export const SCARABS_PER_MULTIPLY = 1
export const SCARABS_PER_DECOMPOSE = 2
export const SCARABS_PER_COMBINED = 3
export const SCARABS_PER_GRAND = 6

export function scarabsForStep(kind: StepKind): number {
  if (kind === 'multiply') return SCARABS_PER_MULTIPLY
  if (kind === 'decompose') return SCARABS_PER_DECOMPOSE
  if (kind === 'combined') return SCARABS_PER_COMBINED
  return SCARABS_PER_GRAND
}
