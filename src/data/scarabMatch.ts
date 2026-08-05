import { shuffle } from './exercises'
import { gcd, randomInt, fracKey, isEquivalent, scaleFraction, type Fraction } from '../utils/fractionMath'

export type { Fraction }
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface ScarabLevelConfig {
  difficulty: Difficulty
  numChoices: number
  numEquivalents: number
}

export interface ScarabOption {
  id: string
  fraction: Fraction
  equivalent: boolean
}

export interface ScarabRound {
  target: Fraction
  options: ScarabOption[]
}

export interface RoundReward {
  xp: number
  coins: number
  perfect: boolean
}

export const STARTING_HEARTS = 3
export const MAX_COMBO_BONUS_STREAK = 5

export const LEVELS: ScarabLevelConfig[] = [
  { difficulty: 'easy',   numChoices: 4,  numEquivalents: 2 },
  { difficulty: 'easy',   numChoices: 4,  numEquivalents: 2 },
  { difficulty: 'easy',   numChoices: 4,  numEquivalents: 2 },
  { difficulty: 'medium', numChoices: 6,  numEquivalents: 3 },
  { difficulty: 'medium', numChoices: 6,  numEquivalents: 3 },
  { difficulty: 'medium', numChoices: 6,  numEquivalents: 3 },
  { difficulty: 'hard',   numChoices: 8,  numEquivalents: 4 },
  { difficulty: 'hard',   numChoices: 9,  numEquivalents: 4 },
  { difficulty: 'hard',   numChoices: 10, numEquivalents: 5 },
]

export const TOTAL_LEVELS = LEVELS.length

// The starting point for a round: a fraction in lowest terms. Every equivalent
// option and the target itself are just this fraction scaled by a factor.
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

// A distractor with no relation to the round's fractions — for "obvious" easy-mode wrong answers.
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

// A distractor one step away from a real equivalent (e.g. 9/12 next to a correct 8/12) —
// for the "plausible, close" wrong answers medium/hard levels need.
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
  anchors: Fraction[],
  count: number,
  difficulty: Difficulty,
  existingKeys: Set<string>,
): Fraction[] {
  const maxD = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 12 : 20
  const result: Fraction[] = []
  for (let i = 0; i < count; i++) {
    const anchor = anchors[randomInt(0, anchors.length - 1)]
    const cand = (difficulty !== 'easy' ? perturbedDistractor(anchor, base, existingKeys) : null)
      ?? randomDistinctFraction(base, existingKeys, maxD)
    existingKeys.add(fracKey(cand))
    result.push(cand)
  }
  return result
}

export function generateRound(config: ScarabLevelConfig): ScarabRound {
  const base = randomBaseFraction(config.difficulty)
  const maxFactor = config.difficulty === 'easy' ? 5 : config.difficulty === 'medium' ? 6 : 8
  const factorPool = shuffle(Array.from({ length: maxFactor }, (_, i) => i + 1))

  const target = scaleFraction(base, factorPool[0])
  const equivalents = factorPool.slice(1, 1 + config.numEquivalents).map(f => scaleFraction(base, f))

  const usedKeys = new Set<string>([fracKey(target), ...equivalents.map(fracKey)])
  const distractors = generateDistractors(
    base,
    [target, ...equivalents],
    config.numChoices - config.numEquivalents,
    config.difficulty,
    usedKeys,
  )

  const options: ScarabOption[] = shuffle([
    ...equivalents.map(fraction => ({ fraction, equivalent: true })),
    ...distractors.map(fraction => ({ fraction, equivalent: false })),
  ]).map((opt, i) => ({ id: `${opt.fraction.numerator}-${opt.fraction.denominator}-${i}`, ...opt }))

  return { target, options }
}

const BASE_XP: Record<Difficulty, number> = { easy: 20, medium: 35, hard: 50 }
const BASE_COINS: Record<Difficulty, number> = { easy: 10, medium: 18, hard: 28 }
const MISTAKE_PENALTY_XP = 4
const PERFECT_BONUS_XP = 15
const PERFECT_BONUS_COINS = 10
const COMBO_BONUS_COINS_PER_STREAK = 5

export function computeReward(difficulty: Difficulty, mistakes: number, comboStreakAfter: number): RoundReward {
  const perfect = mistakes === 0
  let xp = Math.max(5, BASE_XP[difficulty] - mistakes * MISTAKE_PENALTY_XP)
  let coins = BASE_COINS[difficulty]
  if (perfect) {
    xp += PERFECT_BONUS_XP
    coins += PERFECT_BONUS_COINS
  }
  coins += Math.min(comboStreakAfter, MAX_COMBO_BONUS_STREAK) * COMBO_BONUS_COINS_PER_STREAK
  return { xp, coins, perfect }
}
