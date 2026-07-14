export type DecimalPair = [number, number]

export const STEPS_PER_CHAMBER = 5

export interface ChamberConfig {
  key: 'entrance' | 'columns' | 'hieroglyphs' | 'anubisGate' | 'treasureRoom'
  emoji: string
}

export const CHAMBERS: ChamberConfig[] = [
  { key: 'entrance',     emoji: '🚪' },
  { key: 'columns',      emoji: '🏛️' },
  { key: 'hieroglyphs',  emoji: '📜' },
  { key: 'anubisGate',   emoji: '🐺' },
  { key: 'treasureRoom', emoji: '👑' },
]

export const TOTAL_STEPS = STEPS_PER_CHAMBER * CHAMBERS.length

// pairs never equal; distractor is always plausible (close in magnitude or place-value trap)
export const DECIMAL_PAIRS_BY_TIER = {
  easy: [
    [0.3, 0.7], [0.5, 0.2], [0.9, 0.1], [0.4, 0.8], [0.6, 0.3],
    [0.2, 0.9], [0.7, 0.4], [0.1, 0.6], [0.8, 0.5], [0.3, 0.6],
  ] as DecimalPair[],

  medium: [
    [0.45, 0.5], [0.62, 0.26], [0.38, 0.83], [0.71, 0.17], [0.29, 0.92],
    [0.56, 0.65], [0.14, 0.41], [0.83, 0.38], [0.47, 0.74], [0.6, 0.59],
  ] as DecimalPair[],

  hard: [
    [0.7, 0.65], [0.08, 0.8], [0.125, 0.25], [0.375, 0.4], [0.9, 0.89],
    [0.05, 0.5], [0.333, 0.33], [0.6, 0.599], [0.204, 0.24], [0.7, 0.699],
  ] as DecimalPair[],
}

export type Tier = keyof typeof DECIMAL_PAIRS_BY_TIER

export function tierForChamber(chamberIndex: number): Tier {
  if (chamberIndex <= 1) return 'easy'
  if (chamberIndex === 2) return 'medium'
  return 'hard'
}

export function randomPair(tier: Tier): DecimalPair {
  const pool = DECIMAL_PAIRS_BY_TIER[tier]
  const pair = pool[Math.floor(Math.random() * pool.length)]
  return Math.random() < 0.5 ? pair : [pair[1], pair[0]]
}
