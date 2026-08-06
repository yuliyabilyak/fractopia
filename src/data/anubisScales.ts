import { gcd, lcm, randomInt } from '../utils/fractionMath'

export type Difficulty = 'easy' | 'medium' | 'hard'
export type NumeratorInputMode = 'choice' | 'tiles' | 'keypad'

// A fraction as used on the scale. `rawNumerator`/`rawDenominator` are only set
// when the fraction must be simplified before it can be used to find the
// common denominator (hard mode) — `numerator`/`denominator` are always the
// already-reduced values gameplay math runs on.
export interface ScaleFraction {
  numerator: number
  denominator: number
  rawNumerator?: number
  rawDenominator?: number
}

export interface AnubisPuzzle {
  difficulty: Difficulty
  fractions: ScaleFraction[]
  needsSimplify: boolean
  denominatorChoices: number[]
  correctDenominator: number
  correctNumerators: number[]
  inputMode: NumeratorInputMode
  choiceOptions?: number[][]
  tilePool?: { id: number; value: number }[]
}

export interface RoundReward {
  xp: number
  coins: number
  perfect: boolean
}

export const STARTING_HEARTS = 3
export const MAX_COMBO_BONUS_STREAK = 5

export const LEVELS: Difficulty[] = [
  'easy', 'easy', 'easy',
  'medium', 'medium', 'medium', 'medium',
  'hard', 'hard', 'hard', 'hard', 'hard',
]

export const TOTAL_LEVELS = LEVELS.length

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function lcmAll(nums: number[]): number {
  return nums.reduce((acc, n) => lcm(acc, n))
}

interface DiffConfig {
  fractionCount: number
  denominatorPool: number[]
  lcmBound: number
  denominatorChoiceCount: number
  inputMode: NumeratorInputMode
  simplifyChance: number
}

const CONFIG: Record<Difficulty, DiffConfig> = {
  easy: {
    fractionCount: 2,
    denominatorPool: [2, 3, 4, 5, 6, 8, 10],
    lcmBound: 24,
    denominatorChoiceCount: 3,
    inputMode: 'choice',
    simplifyChance: 0,
  },
  medium: {
    fractionCount: 2,
    denominatorPool: [3, 4, 5, 6, 7, 8, 9, 10, 12, 15],
    lcmBound: 60,
    denominatorChoiceCount: 4,
    inputMode: 'tiles',
    simplifyChance: 0,
  },
  hard: {
    fractionCount: 3,
    denominatorPool: [4, 6, 8, 9, 10, 12, 15, 16, 18, 20, 24],
    lcmBound: 144,
    denominatorChoiceCount: 5,
    inputMode: 'keypad',
    simplifyChance: 1,
  },
}

function pickDenominators(difficulty: Difficulty): number[] {
  const cfg = CONFIG[difficulty]
  for (let attempt = 0; attempt < 40; attempt++) {
    const picks = shuffle(cfg.denominatorPool).slice(0, cfg.fractionCount)
    if (lcmAll(picks) <= cfg.lcmBound) return picks
  }
  return cfg.denominatorPool.slice(0, cfg.fractionCount)
}

function randomReducedFraction(denominator: number): ScaleFraction {
  let numerator: number
  do {
    numerator = randomInt(1, denominator - 1)
  } while (gcd(numerator, denominator) !== 1)
  return { numerator, denominator }
}

// Rewrites a reduced fraction as an unsimplified one (e.g. 2/3 -> 4/6) so the
// puzzle can present it as needing simplification before it's usable.
function withRawForm(f: ScaleFraction): ScaleFraction {
  const factor = randomInt(2, 3)
  return { ...f, rawNumerator: f.numerator * factor, rawDenominator: f.denominator * factor }
}

function buildDenominatorChoices(correct: number, denominators: number[], count: number): number[] {
  const candidates = new Set<number>()
  candidates.add(denominators.reduce((a, b) => a * b, 1))
  denominators.forEach(d => candidates.add(d))
  candidates.add(correct * 2)
  candidates.add(denominators.reduce((a, b) => a + b, 0))
  for (let i = 0; i < denominators.length; i++) {
    for (let j = i + 1; j < denominators.length; j++) {
      candidates.add(lcm(denominators[i], denominators[j]))
    }
  }
  candidates.delete(correct)

  const chosen: number[] = []
  for (const c of shuffle([...candidates])) {
    if (chosen.length >= count - 1) break
    if (c > 1 && !chosen.includes(c)) chosen.push(c)
  }
  let step = 1
  while (chosen.length < count - 1) {
    const filler = correct + step * 2
    step++
    if (filler !== correct && !chosen.includes(filler)) chosen.push(filler)
  }
  return shuffle([correct, ...chosen])
}

function buildChoiceOptions(correct: number, originalNumerator: number): number[] {
  const candidates = new Set<number>([correct])
  if (originalNumerator !== correct) candidates.add(originalNumerator)
  if (correct > 1) candidates.add(correct - 1)
  candidates.add(correct + 1)
  let offset = 2
  while (candidates.size < 3) {
    candidates.add(correct + offset)
    offset++
  }
  const arr = shuffle([...candidates]).slice(0, 3)
  if (!arr.includes(correct)) arr[0] = correct
  return shuffle(arr)
}

function buildTilePool(correctNumerators: number[]): { id: number; value: number }[] {
  const values = new Set<number>(correctNumerators)
  const targetSize = correctNumerators.length + 2
  const extras = [correctNumerators[0] + 1, Math.max(1, correctNumerators[1] - 1), correctNumerators[1] + 2]
  for (const e of extras) {
    if (values.size >= targetSize) break
    values.add(e)
  }
  let offset = 3
  while (values.size < targetSize) {
    values.add(correctNumerators[0] + offset)
    offset++
  }
  return shuffle([...values]).map((value, id) => ({ id, value }))
}

function buildPuzzle(difficulty: Difficulty): AnubisPuzzle {
  const cfg = CONFIG[difficulty]
  const denominators = pickDenominators(difficulty)
  let fractions = denominators.map(d => randomReducedFraction(d))

  let needsSimplify = false
  if (Math.random() < cfg.simplifyChance) {
    const idx = randomInt(0, fractions.length - 1)
    fractions = fractions.map((f, i) => (i === idx ? withRawForm(f) : f))
    needsSimplify = true
  }

  const correctDenominator = lcmAll(fractions.map(f => f.denominator))
  const correctNumerators = fractions.map(f => f.numerator * (correctDenominator / f.denominator))
  const denominatorChoices = buildDenominatorChoices(
    correctDenominator,
    fractions.map(f => f.denominator),
    cfg.denominatorChoiceCount,
  )

  const puzzle: AnubisPuzzle = {
    difficulty,
    fractions,
    needsSimplify,
    denominatorChoices,
    correctDenominator,
    correctNumerators,
    inputMode: cfg.inputMode,
  }

  if (cfg.inputMode === 'choice') {
    puzzle.choiceOptions = fractions.map((f, i) => buildChoiceOptions(correctNumerators[i], f.numerator))
  } else if (cfg.inputMode === 'tiles') {
    puzzle.tilePool = buildTilePool(correctNumerators)
  }

  return puzzle
}

function puzzleSignature(p: AnubisPuzzle): string {
  return `${p.difficulty}|${p.fractions.map(f => `${f.numerator}/${f.denominator}`).join(',')}|${p.correctDenominator}`
}

export function generatePuzzle(difficulty: Difficulty, usedSignatures: Set<string>): AnubisPuzzle {
  for (let attempt = 0; attempt < 25; attempt++) {
    const puzzle = buildPuzzle(difficulty)
    const sig = puzzleSignature(puzzle)
    if (usedSignatures.has(sig)) continue
    usedSignatures.add(sig)
    return puzzle
  }
  return buildPuzzle(difficulty)
}

const BASE_XP: Record<Difficulty, number> = { easy: 12, medium: 20, hard: 32 }
const BASE_COINS: Record<Difficulty, number> = { easy: 8, medium: 14, hard: 20 }
const MISTAKE_PENALTY_XP = 3
const PERFECT_BONUS_XP = 10
const PERFECT_BONUS_COINS = 8
const COMBO_BONUS_COINS_PER_STREAK = 3

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
