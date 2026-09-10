import { gcd, lcm, randomInt } from '../utils/fractionMath'
import { shuffle } from './exercises'
import type { Keys } from '../i18n/translations'

export interface MixedNumber {
  whole: number
  numerator: number
  denominator: number
}

export type Level = 1 | 2 | 3 | 4
export type Operation = 'add' | 'subtract'
export type Mode = 'select' | 'generate'

export interface PizzaOrder {
  level: Level
  operation: Operation
  left: MixedNumber
  right: MixedNumber
  result: MixedNumber
  regroup: boolean
  mode: Mode
  choices?: MixedNumber[]
  correctIndex?: number
}

export interface ToppingDef {
  id: string
  emoji: string
  labelKey: Keys
}

export const TOPPINGS: ToppingDef[] = [
  { id: 'cheese',    emoji: '🧀', labelKey: 'ptToppingCheese' },
  { id: 'mushroom',  emoji: '🍄', labelKey: 'ptToppingMushroom' },
  { id: 'olives',    emoji: '🫒', labelKey: 'ptToppingOlives' },
  { id: 'pineapple', emoji: '🍍', labelKey: 'ptToppingPineapple' },
  { id: 'sausage',   emoji: '🌭', labelKey: 'ptToppingSausage' },
  { id: 'pepper',    emoji: '🫑', labelKey: 'ptToppingPepper' },
  { id: 'onion',     emoji: '🧅', labelKey: 'ptToppingOnion' },
  { id: 'basil',     emoji: '🌿', labelKey: 'ptToppingBasil' },
  { id: 'tomato',    emoji: '🍅', labelKey: 'ptToppingTomato' },
]

export const STARTER_TOPPING_IDS: string[] = [TOPPINGS[0].id, TOPPINGS[1].id]

export const SESSION_LENGTH = 15
export const CORRECT_PER_TOPPING_UNLOCK = 5
export const LEVEL_UP_STREAK = 3
export const MAX_LEVEL: Level = 4

const FRIENDLY_DENOMS = [2, 3, 4, 6, 8]
const L4_DENOM_PAIRS: [number, number][] = [
  [2, 3], [2, 4], [2, 6], [2, 8], [3, 4], [3, 6], [4, 6], [4, 8],
]
const MAX_WHOLE = 4

function pickDenom(excludeTwo = false): number {
  const pool = excludeTwo ? FRIENDLY_DENOMS.filter(d => d !== 2) : FRIENDLY_DENOMS
  return pool[randomInt(0, pool.length - 1)]
}

function randomOperation(): Operation {
  return Math.random() < 0.5 ? 'add' : 'subtract'
}

// ── Unified arithmetic core ─────────────────────────────────────────────────
// Every operand is converted to "total slices at a common denominator," combined
// as a plain integer, then split back into whole/remainder. One formula for every
// level — no per-level branching, no risk of a negative or malformed result as
// long as the operand ranges (drawn per level below) are constructed correctly.

function scaledNumerator(m: MixedNumber, commonD: number): number {
  return m.numerator * (commonD / m.denominator)
}

function totalAt(m: MixedNumber, commonD: number): number {
  return m.whole * commonD + scaledNumerator(m, commonD)
}

export function totalSlices(m: MixedNumber): number {
  return m.whole * m.denominator + m.numerator
}

function toMixed(totalAtD: number, commonD: number): MixedNumber {
  const whole = Math.floor(totalAtD / commonD)
  const rawNumerator = totalAtD % commonD
  if (rawNumerator === 0) return { whole, numerator: 0, denominator: commonD }
  const g = gcd(rawNumerator, commonD)
  return { whole, numerator: rawNumerator / g, denominator: commonD / g }
}

function computeResult(left: MixedNumber, right: MixedNumber, operation: Operation, commonD: number): MixedNumber {
  const leftTotal = totalAt(left, commonD)
  const rightTotal = totalAt(right, commonD)
  const resultTotal = operation === 'add' ? leftTotal + rightTotal : leftTotal - rightTotal
  return toMixed(resultTotal, commonD)
}

function computeRegroup(left: MixedNumber, right: MixedNumber, operation: Operation, commonD: number): boolean {
  const leftNum = scaledNumerator(left, commonD)
  const rightNum = scaledNumerator(right, commonD)
  return operation === 'add' ? leftNum + rightNum >= commonD : leftNum < rightNum
}

// ── Per-level operand generators ────────────────────────────────────────────
// Each returns operands already guaranteed (by construction, not retry) to produce
// a non-negative result with the level's intended regroup behaviour.

interface Operands { left: MixedNumber; right: MixedNumber; operation: Operation }

// L1: whole + proper fraction only (e.g. "2 + 3/4"). Addition-only by construction —
// there is no regroup-free, non-negative way to subtract a whole number from/by a
// pure fraction, so L1 stays a pure "count the pizzas, then a few more slices" intro.
function generateLevel1(): Operands {
  const d = pickDenom()
  const right: MixedNumber = { whole: randomInt(1, MAX_WHOLE), numerator: 0, denominator: d }
  const left: MixedNumber = { whole: 0, numerator: randomInt(1, d - 1), denominator: d }
  return { left, right, operation: 'add' }
}

// L2: both mixed, same denominator, no regroup.
function generateLevel2(): Operands {
  const operation = randomOperation()
  const d = pickDenom(operation === 'add')
  const rightWhole = randomInt(1, MAX_WHOLE - 1)
  let rightNum: number, leftNum: number, leftWhole: number
  if (operation === 'add') {
    rightNum = randomInt(1, d - 2)
    leftNum = randomInt(1, d - 1 - rightNum)
    leftWhole = randomInt(1, MAX_WHOLE - rightWhole)
  } else {
    rightNum = randomInt(1, d - 1)
    leftNum = randomInt(rightNum, d - 1)
    leftWhole = randomInt(rightWhole, MAX_WHOLE - 1)
    // Both ranges can collapse to a single value equal to right's (e.g. rightWhole
    // and rightNum both at their max) — bump left so it's never exactly equal to
    // right, which would otherwise produce a degenerate "order for 0 pizzas".
    if (leftWhole === rightWhole && leftNum === rightNum) {
      if (leftNum < d - 1) leftNum += 1
      else leftWhole += 1
    }
  }
  const right: MixedNumber = { whole: rightWhole, numerator: rightNum, denominator: d }
  const left: MixedNumber = { whole: leftWhole, numerator: leftNum, denominator: d }
  return { left, right, operation }
}

// L3: same denominator, forced regroup (carry on add, borrow on subtract).
function generateLevel3(): Operands {
  const operation = randomOperation()
  const d = pickDenom()
  const rightWhole = randomInt(1, MAX_WHOLE - 1)
  let rightNum: number, leftNum: number, leftWhole: number
  if (operation === 'add') {
    rightNum = randomInt(1, d - 1)
    leftNum = randomInt(Math.max(1, d - rightNum), d - 1)
    leftWhole = randomInt(1, MAX_WHOLE - rightWhole)
  } else {
    rightNum = randomInt(1, d - 1)
    leftNum = randomInt(0, rightNum - 1)
    leftWhole = randomInt(rightWhole + 1, MAX_WHOLE)
  }
  const right: MixedNumber = { whole: rightWhole, numerator: rightNum, denominator: d }
  const left: MixedNumber = { whole: leftWhole, numerator: leftNum, denominator: d }
  return { left, right, operation }
}

// L4: different denominators (lcm <= 12). Whether the round regroups falls out
// naturally from the random fractional parts rather than being forced — for
// subtraction, requiring left.whole >= right.whole + 1 is what guarantees a
// non-negative result, regardless of how the fractional parts compare.
function generateLevel4(): Operands {
  const operation = randomOperation()
  const [dA, dB] = L4_DENOM_PAIRS[randomInt(0, L4_DENOM_PAIRS.length - 1)]
  const [leftD, rightD] = Math.random() < 0.5 ? [dA, dB] : [dB, dA]
  const rightWhole = randomInt(1, MAX_WHOLE - 1)
  const rightNum = randomInt(1, rightD - 1)
  const leftNum = randomInt(1, leftD - 1)
  const leftWhole = operation === 'add'
    ? randomInt(1, Math.max(1, MAX_WHOLE - rightWhole))
    : randomInt(rightWhole + 1, MAX_WHOLE)
  const right: MixedNumber = { whole: rightWhole, numerator: rightNum, denominator: rightD }
  const left: MixedNumber = { whole: leftWhole, numerator: leftNum, denominator: leftD }
  return { left, right, operation }
}

// ── Distractors (Mode A / 'select') ─────────────────────────────────────────

export function mixedKey(m: MixedNumber): string {
  if (m.numerator === 0) return `${m.whole}_0/1`
  const g = gcd(m.numerator, m.denominator)
  return `${m.whole}_${m.numerator / g}/${m.denominator / g}`
}

// Correct numerator sum/difference, but the whole part isn't carried/borrowed —
// the classic "forgot to regroup" mistake. Only meaningful when order.regroup is true.
function forgotRegroupDistractor(left: MixedNumber, right: MixedNumber, operation: Operation, commonD: number): MixedNumber | null {
  const leftNum = scaledNumerator(left, commonD)
  const rightNum = scaledNumerator(right, commonD)
  if (operation === 'add') {
    return { whole: left.whole + right.whole, numerator: leftNum + rightNum, denominator: commonD }
  }
  return { whole: Math.abs(left.whole - right.whole), numerator: Math.abs(leftNum - rightNum), denominator: commonD }
}

// Combined the numerators directly against one original (unconverted) denominator —
// the "forgot to convert to a common denominator" mistake. L4 only.
function wrongDenominatorDistractor(left: MixedNumber, right: MixedNumber, operation: Operation): MixedNumber | null {
  if (left.denominator === right.denominator) return null
  const rawNumerator = operation === 'add' ? left.numerator + right.numerator : left.numerator - right.numerator
  const whole = operation === 'add' ? left.whole + right.whole : left.whole - right.whole
  if (rawNumerator < 0 || whole < 0) return null
  return { whole, numerator: rawNumerator, denominator: left.denominator }
}

function generateChoices(
  result: MixedNumber,
  left: MixedNumber,
  right: MixedNumber,
  operation: Operation,
  commonD: number,
  regroup: boolean,
  level: Level,
): { choices: MixedNumber[]; correctIndex: number } {
  const used = new Set<string>([mixedKey(result)])
  const candidates: MixedNumber[] = []

  const tryAdd = (m: MixedNumber | null) => {
    if (!m || m.whole < 0 || m.numerator < 0) return
    const key = mixedKey(m)
    if (used.has(key)) return
    used.add(key)
    candidates.push(m)
  }

  if (regroup) tryAdd(forgotRegroupDistractor(left, right, operation, commonD))
  if (level === 4) tryAdd(wrongDenominatorDistractor(left, right, operation))
  tryAdd({ ...result, whole: result.whole + 1 })
  if (result.whole > 0) tryAdd({ ...result, whole: result.whole - 1 })
  if (result.numerator > 0) {
    const bump = result.numerator === result.denominator - 1 ? result.numerator - 1 : result.numerator + 1
    tryAdd({ ...result, numerator: bump })
  } else {
    tryAdd({ ...result, numerator: 1 })
  }
  tryAdd({ ...result, whole: result.whole + 2 })

  const picked = shuffle(candidates).slice(0, 3)
  const all = shuffle([result, ...picked])
  return { choices: all, correctIndex: all.findIndex(m => mixedKey(m) === mixedKey(result)) }
}

// ── Public API ───────────────────────────────────────────────────────────────

export function generateOrder(level: Level): PizzaOrder {
  const { left, right, operation } =
    level === 1 ? generateLevel1() :
    level === 2 ? generateLevel2() :
    level === 3 ? generateLevel3() :
    generateLevel4()

  const commonD = lcm(left.denominator, right.denominator)
  const result = computeResult(left, right, operation, commonD)
  const regroup = computeRegroup(left, right, operation, commonD)
  const mode: Mode = level === 1 || level === 4 ? 'select' : 'generate'

  const order: PizzaOrder = { level, operation, left, right, result, regroup, mode }
  if (mode === 'select') {
    const { choices, correctIndex } = generateChoices(result, left, right, operation, commonD, regroup, level)
    order.choices = choices
    order.correctIndex = correctIndex
  }
  return order
}

export function formatMixed(m: MixedNumber): string {
  if (m.numerator === 0) return `${m.whole}`
  if (m.whole === 0) return `${m.numerator}/${m.denominator}`
  return `${m.whole} ${m.numerator}/${m.denominator}`
}
