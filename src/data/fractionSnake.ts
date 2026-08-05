import { shuffle } from './exercises'
import { gcd, randomInt, fracKey, isEquivalent, scaleFraction, type Fraction } from '../utils/fractionMath'

export type { Fraction }
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface SnakeLevelConfig {
  difficulty: Difficulty
  numJunctions: number
  numChoices: number
}

export interface SnakeChoice {
  id: string
  fraction: Fraction
  correct: boolean
}

export interface SnakeLevel {
  target: Fraction
  junctions: SnakeChoice[][]
}

export interface RoundReward {
  xp: number
  coins: number
  perfect: boolean
}

export const STARTING_HEARTS = 3
export const MAX_COMBO_BONUS_STREAK = 5

export const LEVELS: SnakeLevelConfig[] = [
  { difficulty: 'easy',   numJunctions: 6,  numChoices: 2 },
  { difficulty: 'easy',   numJunctions: 8,  numChoices: 2 },
  { difficulty: 'medium', numJunctions: 9,  numChoices: 3 },
  { difficulty: 'medium', numJunctions: 11, numChoices: 3 },
  { difficulty: 'hard',   numJunctions: 13, numChoices: 4 },
  { difficulty: 'hard',   numJunctions: 15, numChoices: 4 },
]

export const TOTAL_LEVELS = LEVELS.length

// The starting point for a level: a fraction in lowest terms. The target and every
// junction's correct tile are just this fraction scaled by a (per-junction) factor.
function randomBaseFraction(difficulty: Difficulty): Fraction {
  const maxD = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 9
  const allowImproper = difficulty === 'hard' && Math.random() < 0.35
  let n: number, d: number
  do {
    d = randomInt(2, maxD)
    n = allowImproper ? randomInt(d + 1, d + 3) : randomInt(1, d - 1)
  } while (gcd(n, d) !== 1)
  return { numerator: n, denominator: d }
}

// A distractor with no relation to the junction's fractions — for "obvious" easy-mode wrong tiles.
function randomDistinctFraction(base: Fraction, existingKeys: Set<string>, maxD: number): Fraction {
  for (let attempt = 0; attempt < 30; attempt++) {
    const d = randomInt(2, maxD)
    const n = randomInt(1, Math.max(1, d - 1))
    if (gcd(n, d) !== 1) continue
    const cand = { numerator: n, denominator: d }
    if (isEquivalent(cand, base) || existingKeys.has(fracKey(cand))) continue
    return cand
  }
  return { numerator: base.numerator + 1, denominator: base.denominator + 2 }
}

// A distractor one step away from the real correct tile (e.g. 9/12 next to a correct 8/12) —
// for the "plausible, close" wrong tiles medium/hard levels need.
function perturbedDistractor(anchor: Fraction, base: Fraction, existingKeys: Set<string>): Fraction | null {
  for (let attempt = 0; attempt < 20; attempt++) {
    const delta = Math.random() < 0.5 ? 1 : -1
    const cand = Math.random() < 0.5
      ? { numerator: anchor.numerator + delta, denominator: anchor.denominator }
      : { numerator: anchor.numerator, denominator: anchor.denominator + delta }
    if (cand.numerator < 1 || cand.denominator < 2) continue
    if (isEquivalent(cand, base) || existingKeys.has(fracKey(cand))) continue
    return cand
  }
  return null
}

function generateDistractors(
  base: Fraction,
  anchor: Fraction,
  count: number,
  difficulty: Difficulty,
  existingKeys: Set<string>,
): Fraction[] {
  const maxD = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 12 : 20
  const result: Fraction[] = []
  for (let i = 0; i < count; i++) {
    const cand = (difficulty !== 'easy' ? perturbedDistractor(anchor, base, existingKeys) : null)
      ?? randomDistinctFraction(base, existingKeys, maxD)
    existingKeys.add(fracKey(cand))
    result.push(cand)
  }
  return result
}

// One junction's tiles: exactly one correct fraction (equivalent to the target) plus distractors,
// generated fresh per junction so numbers stay small even on long hard-mode levels.
function generateJunction(base: Fraction, factor: number, config: SnakeLevelConfig): SnakeChoice[] {
  const correctFraction = scaleFraction(base, factor)
  const existingKeys = new Set<string>([fracKey(correctFraction)])
  const distractors = generateDistractors(base, correctFraction, config.numChoices - 1, config.difficulty, existingKeys)

  return shuffle([
    { fraction: correctFraction, correct: true },
    ...distractors.map(fraction => ({ fraction, correct: false })),
  ]).map((tile, i) => ({ id: `${factor}-${tile.fraction.numerator}-${tile.fraction.denominator}-${i}`, ...tile }))
}

export function generateLevel(config: SnakeLevelConfig): SnakeLevel {
  const base = randomBaseFraction(config.difficulty)
  const maxFactor = config.difficulty === 'easy' ? 6 : config.difficulty === 'medium' ? 8 : 10

  const targetFactor = randomInt(1, maxFactor)
  const target = scaleFraction(base, targetFactor)

  const junctions: SnakeChoice[][] = []
  let lastFactor = targetFactor
  for (let i = 0; i < config.numJunctions; i++) {
    let factor = randomInt(1, maxFactor)
    while (factor === lastFactor && maxFactor > 1) {
      factor = randomInt(1, maxFactor)
    }
    lastFactor = factor
    junctions.push(generateJunction(base, factor, config))
  }

  return { target, junctions }
}

const BASE_XP: Record<Difficulty, number> = { easy: 30, medium: 55, hard: 85 }
const BASE_COINS: Record<Difficulty, number> = { easy: 15, medium: 28, hard: 45 }
const MISTAKE_PENALTY_XP = 3
const PERFECT_BONUS_XP = 20
const PERFECT_BONUS_COINS = 15
const COMBO_BONUS_COINS_PER_STREAK = 6

export function computeReward(difficulty: Difficulty, mistakes: number, comboStreakAfter: number): RoundReward {
  const perfect = mistakes === 0
  let xp = Math.max(8, BASE_XP[difficulty] - mistakes * MISTAKE_PENALTY_XP)
  let coins = BASE_COINS[difficulty]
  if (perfect) {
    xp += PERFECT_BONUS_XP
    coins += PERFECT_BONUS_COINS
  }
  coins += Math.min(comboStreakAfter, MAX_COMBO_BONUS_STREAK) * COMBO_BONUS_COINS_PER_STREAK
  return { xp, coins, perfect }
}
