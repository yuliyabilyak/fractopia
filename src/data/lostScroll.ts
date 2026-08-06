import { gcd, randomInt, type Fraction } from '../utils/fractionMath'

export type { Fraction }
export type Difficulty = 'easy' | 'medium' | 'hard'

// One side of the equation always shows both numbers; the other side shows one
// known number plus a blank. Both sides are the same base fraction scaled by
// their own factor, so the blank always has exactly one integer solution.
export interface ScrollPuzzle {
  leftKnown: number
  leftBlankIsNumerator: boolean
  right: Fraction
  answer: number
  base: Fraction
}

export interface RoundReward {
  xp: number
  coins: number
  perfect: boolean
}

export const STARTING_HEARTS = 3
export const MAX_COMBO_BONUS_STREAK = 5
export const HINT_AFTER_MISTAKES = 2

export const LEVELS: Difficulty[] = [
  'easy', 'easy', 'easy', 'easy',
  'medium', 'medium', 'medium', 'medium',
  'hard', 'hard', 'hard', 'hard',
]

export const TOTAL_LEVELS = LEVELS.length

function randomBaseFraction(difficulty: Difficulty): Fraction {
  const maxD = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 8 : 9
  const allowImproper = difficulty === 'hard' && Math.random() < 0.3
  let n: number, d: number
  do {
    d = randomInt(2, maxD)
    n = allowImproper ? randomInt(d + 1, d + 3) : randomInt(1, d - 1)
  } while (gcd(n, d) !== 1)
  return { numerator: n, denominator: d }
}

// Easy/medium sometimes leave one side at ×1 (the plain reduced fraction); hard
// never does, so the player must cross-multiply instead of reading off a value.
function factorRangeFor(difficulty: Difficulty): [number, number] {
  if (difficulty === 'easy') return [1, 5]
  if (difficulty === 'medium') return [1, 10]
  return [2, 10]
}

function puzzleSignature(p: ScrollPuzzle): string {
  return `${p.base.numerator}/${p.base.denominator}|${p.leftKnown}|${p.leftBlankIsNumerator}|${p.right.numerator}/${p.right.denominator}`
}

function buildPuzzle(difficulty: Difficulty): ScrollPuzzle {
  const [minF, maxF] = factorRangeFor(difficulty)
  const base = randomBaseFraction(difficulty)
  const factorLeft = randomInt(minF, maxF)
  const factorRight = randomInt(minF, maxF)
  const leftBlankIsNumerator = Math.random() < 0.5

  const leftKnown = leftBlankIsNumerator ? base.denominator * factorLeft : base.numerator * factorLeft
  const answer    = leftBlankIsNumerator ? base.numerator   * factorLeft : base.denominator * factorLeft
  const right: Fraction = { numerator: base.numerator * factorRight, denominator: base.denominator * factorRight }

  return { leftKnown, leftBlankIsNumerator, right, answer, base }
}

export function generatePuzzle(difficulty: Difficulty, usedSignatures: Set<string>): ScrollPuzzle {
  for (let attempt = 0; attempt < 25; attempt++) {
    const puzzle = buildPuzzle(difficulty)
    const sig = puzzleSignature(puzzle)
    if (usedSignatures.has(sig)) continue
    usedSignatures.add(sig)
    return puzzle
  }
  return buildPuzzle(difficulty)
}

const BASE_XP: Record<Difficulty, number> = { easy: 10, medium: 18, hard: 28 }
const BASE_COINS: Record<Difficulty, number> = { easy: 6, medium: 10, hard: 16 }
const MISTAKE_PENALTY_XP = 2
const PERFECT_BONUS_XP = 8
const PERFECT_BONUS_COINS = 6
const COMBO_BONUS_COINS_PER_STREAK = 3

export function computeReward(difficulty: Difficulty, mistakes: number, comboStreakAfter: number): RoundReward {
  const perfect = mistakes === 0
  let xp = Math.max(4, BASE_XP[difficulty] - mistakes * MISTAKE_PENALTY_XP)
  let coins = BASE_COINS[difficulty]
  if (perfect) {
    xp += PERFECT_BONUS_XP
    coins += PERFECT_BONUS_COINS
  }
  coins += Math.min(comboStreakAfter, MAX_COMBO_BONUS_STREAK) * COMBO_BONUS_COINS_PER_STREAK
  return { xp, coins, perfect }
}
