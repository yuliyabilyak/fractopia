import type { SortFrac } from '../components/FractionSort'
import type { HitFrac } from '../components/HitTarget'
import type { ItemKey } from '../components/FractionQuantity'
import type { FracPair } from '../components/MatchingFractions'
import type { DetectiveCard } from '../components/FractionDetective'
import type { TimeCard } from '../components/TimeDetective'
import type { Fraction } from '../types'

export type ExerciseType = 'bar' | 'pizza' | 'compare' | 'compare-same' | 'compare-same-num' | 'hexagon' | 'grid' | 'identify' | 'triangle' | 'star' | 'diamond' | 'number-line' | 'equivalent' | 'sort' | 'hit-target' | 'time-fraction' | 'fraction-quantity' | 'time-operation' | 'matching' | 'fraction-tower' | 'ice-cream' | 'train' | 'rocket' | 'monster' | 'detective' | 'balance' | 'time-machine' | 'time-detective'

export interface Exercise {
  type: ExerciseType
  denominator: number
  numerator: number
  cols?: number
  rows?: number
  left?: Fraction
  right?: Fraction
  shape?: 'bar' | 'pizza' | 'grid'
  choices?: Fraction[]
  correctIndex?: number
  leftN?: number
  leftD?: number
  rightD?: number
  fractions?: SortFrac[]
  target?: HitFrac
  tiles?: HitFrac[]
  unit?: 'hour' | 'day' | 'week'
  answer?: number
  quantity?: number
  itemKey?: ItemKey
  emoji?: string
  operation?: 'add' | 'subtract' | 'divide'
  n2?: number
  d2?: number
  divisor?: number
  pairs?: FracPair[]
  towerTiles?: { n: number; d: number }[]
  detectives?: DetectiveCard[]
  timeCards?: TimeCard[]
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const ALL_EXERCISES: Exercise[] = [
  // --- shade the bar ---
  { type: 'bar', denominator: 2,  numerator: 1 },
  { type: 'bar', denominator: 3,  numerator: 1 },
  { type: 'bar', denominator: 3,  numerator: 2 },
  { type: 'bar', denominator: 4,  numerator: 1 },
  { type: 'bar', denominator: 4,  numerator: 3 },
  { type: 'bar', denominator: 5,  numerator: 2 },
  { type: 'bar', denominator: 5,  numerator: 3 },
  { type: 'bar', denominator: 6,  numerator: 5 },
  { type: 'bar', denominator: 8,  numerator: 3 },
  { type: 'bar', denominator: 10, numerator: 7 },
  { type: 'bar', denominator: 12, numerator: 5 },
  { type: 'bar', denominator: 12, numerator: 9 },
  { type: 'bar', denominator: 14, numerator: 9 },
  { type: 'bar', denominator: 15, numerator: 11 },
  { type: 'bar', denominator: 16, numerator: 13 },
  { type: 'bar', denominator: 18, numerator: 7 },
  { type: 'bar', denominator: 20, numerator: 17 },

  // --- shade the pizza ---
  { type: 'pizza', denominator: 4,  numerator: 1 },
  { type: 'pizza', denominator: 4,  numerator: 3 },
  { type: 'pizza', denominator: 6,  numerator: 2 },
  { type: 'pizza', denominator: 6,  numerator: 5 },
  { type: 'pizza', denominator: 8,  numerator: 3 },
  { type: 'pizza', denominator: 8,  numerator: 7 },
  { type: 'pizza', denominator: 12, numerator: 4 },
  { type: 'pizza', denominator: 12, numerator: 7 },
  { type: 'pizza', denominator: 16, numerator: 6 },
  { type: 'pizza', denominator: 14, numerator: 9 },
  { type: 'pizza', denominator: 16, numerator: 11 },
  { type: 'pizza', denominator: 18, numerator: 13 },
  { type: 'pizza', denominator: 20, numerator: 17 },

  // --- shade the hexagon ---
  { type: 'hexagon', denominator: 6, numerator: 1 },
  { type: 'hexagon', denominator: 6, numerator: 2 },
  { type: 'hexagon', denominator: 6, numerator: 3 },
  { type: 'hexagon', denominator: 6, numerator: 4 },
  { type: 'hexagon', denominator: 6, numerator: 5 },

  // --- shade the grid ---
  { type: 'grid', denominator: 4,  numerator: 1,  cols: 2, rows: 2 },
  { type: 'grid', denominator: 4,  numerator: 3,  cols: 2, rows: 2 },
  { type: 'grid', denominator: 6,  numerator: 2,  cols: 3, rows: 2 },
  { type: 'grid', denominator: 6,  numerator: 5,  cols: 3, rows: 2 },
  { type: 'grid', denominator: 9,  numerator: 4,  cols: 3, rows: 3 },
  { type: 'grid', denominator: 9,  numerator: 7,  cols: 3, rows: 3 },
  { type: 'grid', denominator: 12, numerator: 5,  cols: 4, rows: 3 },
  { type: 'grid', denominator: 12, numerator: 9,  cols: 4, rows: 3 },
  { type: 'grid', denominator: 16, numerator: 6,  cols: 4, rows: 4 },
  { type: 'grid', denominator: 15, numerator: 10, cols: 5, rows: 3 },
  { type: 'grid', denominator: 20, numerator: 13, cols: 5, rows: 4 },
  { type: 'grid', denominator: 24, numerator: 17, cols: 6, rows: 4 },
  { type: 'grid', denominator: 25, numerator: 19, cols: 5, rows: 5 },
  { type: 'grid', denominator: 30, numerator: 23, cols: 6, rows: 5 },

  // --- shade the triangle ---
  { type: 'triangle', denominator: 3, numerator: 1 },
  { type: 'triangle', denominator: 3, numerator: 2 },
  { type: 'triangle', denominator: 6, numerator: 1 },
  { type: 'triangle', denominator: 6, numerator: 2 },
  { type: 'triangle', denominator: 6, numerator: 4 },
  { type: 'triangle', denominator: 6, numerator: 5 },
  { type: 'triangle', denominator: 4, numerator: 1 },
  { type: 'triangle', denominator: 4, numerator: 3 },
  { type: 'triangle', denominator: 8,  numerator: 3 },
  { type: 'triangle', denominator: 8,  numerator: 5 },
  { type: 'triangle', denominator: 9,  numerator: 4 },
  { type: 'triangle', denominator: 12, numerator: 5 },
  { type: 'triangle', denominator: 12, numerator: 7 },

  // --- tap the star ---
  { type: 'star', denominator: 5, numerator: 1 },
  { type: 'star', denominator: 5, numerator: 2 },
  { type: 'star', denominator: 5, numerator: 3 },
  { type: 'star', denominator: 5, numerator: 4 },

  // --- shade the diamond ---
  { type: 'diamond', denominator: 4, numerator: 1 },
  { type: 'diamond', denominator: 4, numerator: 2 },
  { type: 'diamond', denominator: 4, numerator: 3 },

  // --- identify the fraction ---
  { type: 'identify', shape: 'bar', denominator: 4, numerator: 1,
    choices: [{numerator:1,denominator:4},{numerator:2,denominator:4},{numerator:3,denominator:4},{numerator:1,denominator:2}], correctIndex: 0 },
  { type: 'identify', shape: 'bar', denominator: 4, numerator: 3,
    choices: [{numerator:1,denominator:4},{numerator:2,denominator:4},{numerator:3,denominator:4},{numerator:4,denominator:4}], correctIndex: 2 },
  { type: 'identify', shape: 'pizza', denominator: 6, numerator: 2,
    choices: [{numerator:1,denominator:6},{numerator:2,denominator:6},{numerator:3,denominator:6},{numerator:4,denominator:6}], correctIndex: 1 },
  { type: 'identify', shape: 'pizza', denominator: 8, numerator: 5,
    choices: [{numerator:3,denominator:8},{numerator:5,denominator:8},{numerator:6,denominator:8},{numerator:7,denominator:8}], correctIndex: 1 },
  { type: 'identify', shape: 'bar', denominator: 5, numerator: 2,
    choices: [{numerator:1,denominator:5},{numerator:2,denominator:5},{numerator:3,denominator:5},{numerator:4,denominator:5}], correctIndex: 1 },
  { type: 'identify', shape: 'grid', denominator: 4, numerator: 3, cols: 2, rows: 2,
    choices: [{numerator:1,denominator:4},{numerator:2,denominator:4},{numerator:3,denominator:4},{numerator:4,denominator:4}], correctIndex: 2 },
  { type: 'identify', shape: 'grid', denominator: 9, numerator: 6, cols: 3, rows: 3,
    choices: [{numerator:5,denominator:9},{numerator:6,denominator:9},{numerator:7,denominator:9},{numerator:3,denominator:9}], correctIndex: 1 },
  { type: 'identify', shape: 'pizza', denominator: 12, numerator: 4,
    choices: [{numerator:3,denominator:12},{numerator:4,denominator:12},{numerator:5,denominator:12},{numerator:6,denominator:12}], correctIndex: 1 },
  { type: 'identify', shape: 'bar', denominator: 8, numerator: 3,
    choices: [{numerator:2,denominator:8},{numerator:3,denominator:8},{numerator:5,denominator:8},{numerator:6,denominator:8}], correctIndex: 1 },
  { type: 'identify', shape: 'grid', denominator: 6, numerator: 4, cols: 3, rows: 2,
    choices: [{numerator:2,denominator:6},{numerator:3,denominator:6},{numerator:4,denominator:6},{numerator:5,denominator:6}], correctIndex: 2 },
  { type: 'identify', shape: 'bar', denominator: 12, numerator: 7,
    choices: [{numerator:5,denominator:12},{numerator:7,denominator:12},{numerator:8,denominator:12},{numerator:6,denominator:12}], correctIndex: 1 },
  { type: 'identify', shape: 'pizza', denominator: 16, numerator: 11,
    choices: [{numerator:9,denominator:16},{numerator:10,denominator:16},{numerator:11,denominator:16},{numerator:12,denominator:16}], correctIndex: 2 },
  { type: 'identify', shape: 'grid', denominator: 20, numerator: 13, cols: 5, rows: 4,
    choices: [{numerator:11,denominator:20},{numerator:12,denominator:20},{numerator:13,denominator:20},{numerator:14,denominator:20}], correctIndex: 2 },
  { type: 'identify', shape: 'bar', denominator: 16, numerator: 9,
    choices: [{numerator:7,denominator:16},{numerator:8,denominator:16},{numerator:9,denominator:16},{numerator:10,denominator:16}], correctIndex: 2 },
  { type: 'identify', shape: 'pizza', denominator: 18, numerator: 13,
    choices: [{numerator:12,denominator:18},{numerator:13,denominator:18},{numerator:14,denominator:18},{numerator:15,denominator:18}], correctIndex: 1 },

  // --- time fractions ---
  { type: 'time-fraction', numerator: 1, denominator: 2,  unit: 'hour', answer: 30 },
  { type: 'time-fraction', numerator: 1, denominator: 4,  unit: 'hour', answer: 15 },
  { type: 'time-fraction', numerator: 3, denominator: 4,  unit: 'hour', answer: 45 },
  { type: 'time-fraction', numerator: 1, denominator: 3,  unit: 'hour', answer: 20 },
  { type: 'time-fraction', numerator: 2, denominator: 3,  unit: 'hour', answer: 40 },
  { type: 'time-fraction', numerator: 1, denominator: 6,  unit: 'hour', answer: 10 },
  { type: 'time-fraction', numerator: 5, denominator: 6,  unit: 'hour', answer: 50 },
  { type: 'time-fraction', numerator: 1, denominator: 12, unit: 'hour', answer: 5  },
  { type: 'time-fraction', numerator: 5, denominator: 12, unit: 'hour', answer: 25 },
  { type: 'time-fraction', numerator: 7, denominator: 12, unit: 'hour', answer: 35 },
  { type: 'time-fraction', numerator: 1, denominator: 2,  unit: 'day', answer: 12 },
  { type: 'time-fraction', numerator: 1, denominator: 4,  unit: 'day', answer: 6  },
  { type: 'time-fraction', numerator: 3, denominator: 4,  unit: 'day', answer: 18 },
  { type: 'time-fraction', numerator: 1, denominator: 3,  unit: 'day', answer: 8  },
  { type: 'time-fraction', numerator: 2, denominator: 3,  unit: 'day', answer: 16 },
  { type: 'time-fraction', numerator: 1, denominator: 6,  unit: 'day', answer: 4  },
  { type: 'time-fraction', numerator: 1, denominator: 8,  unit: 'day', answer: 3  },
  { type: 'time-fraction', numerator: 3, denominator: 8,  unit: 'day', answer: 9  },
  { type: 'time-fraction', numerator: 5, denominator: 8,  unit: 'day', answer: 15 },
  { type: 'time-fraction', numerator: 1, denominator: 7,  unit: 'week', answer: 1 },
  { type: 'time-fraction', numerator: 2, denominator: 7,  unit: 'week', answer: 2 },
  { type: 'time-fraction', numerator: 3, denominator: 7,  unit: 'week', answer: 3 },
  { type: 'time-fraction', numerator: 4, denominator: 7,  unit: 'week', answer: 4 },
  { type: 'time-fraction', numerator: 5, denominator: 7,  unit: 'week', answer: 5 },
  { type: 'time-fraction', numerator: 3,  denominator: 5,  unit: 'hour', answer: 36 },
  { type: 'time-fraction', numerator: 7,  denominator: 10, unit: 'hour', answer: 42 },
  { type: 'time-fraction', numerator: 5,  denominator: 12, unit: 'day',  answer: 10 },
  { type: 'time-fraction', numerator: 11, denominator: 12, unit: 'day',  answer: 22 },
  { type: 'time-fraction', numerator: 6,  denominator: 7,  unit: 'week', answer: 6  },

  // --- hit the target ---
  { type: 'hit-target', numerator: 1, denominator: 2,
    target: {n:1,d:2},
    tiles: [{n:1,d:3},{n:1,d:6},{n:3,d:8},{n:1,d:8},{n:5,d:12},{n:1,d:12},{n:1,d:4},{n:2,d:5}] },
  { type: 'hit-target', numerator: 3, denominator: 4,
    target: {n:3,d:4},
    tiles: [{n:1,d:4},{n:1,d:2},{n:1,d:8},{n:5,d:8},{n:1,d:3},{n:5,d:12},{n:1,d:6},{n:3,d:8}] },
  { type: 'hit-target', numerator: 2, denominator: 3,
    target: {n:2,d:3},
    tiles: [{n:1,d:6},{n:1,d:2},{n:1,d:4},{n:5,d:12},{n:1,d:12},{n:7,d:12},{n:1,d:3},{n:1,d:8}] },
  { type: 'hit-target', numerator: 5, denominator: 6,
    target: {n:5,d:6},
    tiles: [{n:1,d:2},{n:1,d:3},{n:1,d:6},{n:2,d:3},{n:1,d:4},{n:7,d:12},{n:3,d:4},{n:1,d:12}] },
  { type: 'hit-target', numerator: 7, denominator: 8,
    target: {n:7,d:8},
    tiles: [{n:1,d:2},{n:3,d:8},{n:1,d:4},{n:5,d:8},{n:1,d:8},{n:3,d:4},{n:1,d:3},{n:1,d:6}] },
  { type: 'hit-target', numerator: 5, denominator: 12,
    target: {n:5,d:12},
    tiles: [{n:1,d:4},{n:1,d:6},{n:1,d:3},{n:1,d:12},{n:1,d:2},{n:1,d:8},{n:3,d:8},{n:2,d:3}] },
  { type: 'hit-target', numerator: 7, denominator: 12,
    target: {n:7,d:12},
    tiles: [{n:1,d:4},{n:1,d:3},{n:1,d:12},{n:1,d:2},{n:5,d:12},{n:1,d:6},{n:1,d:8},{n:3,d:8}] },
  { type: 'hit-target', numerator: 11, denominator: 16,
    target: {n:11,d:16},
    tiles: [{n:1,d:2},{n:3,d:16},{n:1,d:4},{n:5,d:16},{n:1,d:8},{n:7,d:16},{n:1,d:16},{n:3,d:8}] },
  { type: 'hit-target', numerator: 9, denominator: 10,
    target: {n:9,d:10},
    tiles: [{n:1,d:2},{n:2,d:5},{n:1,d:5},{n:3,d:10},{n:1,d:10},{n:7,d:10},{n:1,d:4},{n:3,d:5}] },
  { type: 'hit-target', numerator: 13, denominator: 20,
    target: {n:13,d:20},
    tiles: [{n:1,d:4},{n:2,d:5},{n:1,d:5},{n:3,d:20},{n:1,d:20},{n:7,d:20},{n:1,d:10},{n:3,d:10}] },
  { type: 'hit-target', numerator: 11, denominator: 12,
    target: {n:11,d:12},
    tiles: [{n:1,d:2},{n:5,d:12},{n:1,d:3},{n:1,d:4},{n:1,d:6},{n:1,d:12},{n:7,d:12},{n:1,d:8}] },

  // --- fraction sort ---
  { type: 'sort', numerator: 0, denominator: 1, fractions: [{n:1,d:4},{n:1,d:3},{n:1,d:2},{n:2,d:3}] },
  { type: 'sort', numerator: 0, denominator: 1, fractions: [{n:1,d:6},{n:1,d:4},{n:1,d:3},{n:1,d:2}] },
  { type: 'sort', numerator: 0, denominator: 1, fractions: [{n:2,d:3},{n:3,d:4},{n:5,d:6},{n:7,d:8}] },
  { type: 'sort', numerator: 0, denominator: 1, fractions: [{n:1,d:4},{n:2,d:5},{n:1,d:2},{n:3,d:4}] },
  { type: 'sort', numerator: 0, denominator: 1, fractions: [{n:1,d:3},{n:2,d:5},{n:1,d:2},{n:3,d:5}] },
  { type: 'sort', numerator: 0, denominator: 1, fractions: [{n:3,d:8},{n:1,d:2},{n:5,d:8},{n:3,d:4}] },
  { type: 'sort', numerator: 0, denominator: 1, fractions: [{n:1,d:3},{n:3,d:8},{n:5,d:12},{n:1,d:2}] },
  { type: 'sort', numerator: 0, denominator: 1, fractions: [{n:1,d:5},{n:1,d:4},{n:1,d:3},{n:2,d:5},{n:1,d:2}] },
  { type: 'sort', numerator: 0, denominator: 1, fractions: [{n:1,d:2},{n:2,d:3},{n:3,d:4},{n:5,d:6},{n:7,d:8}] },
  { type: 'sort', numerator: 0, denominator: 1, fractions: [{n:1,d:8},{n:1,d:6},{n:1,d:4},{n:1,d:3},{n:1,d:2}] },
  { type: 'sort', numerator: 0, denominator: 1, fractions: [{n:1,d:10},{n:3,d:20},{n:1,d:4},{n:2,d:5},{n:1,d:2}] },
  { type: 'sort', numerator: 0, denominator: 1, fractions: [{n:5,d:12},{n:1,d:2},{n:7,d:12},{n:3,d:4},{n:11,d:12}] },
  { type: 'sort', numerator: 0, denominator: 1, fractions: [{n:2,d:9},{n:1,d:3},{n:4,d:9},{n:5,d:9},{n:2,d:3}] },
  { type: 'sort', numerator: 0, denominator: 1, fractions: [{n:3,d:16},{n:1,d:4},{n:5,d:16},{n:3,d:8},{n:9,d:16},{n:5,d:8}] },

  // --- equivalent fractions ---
  { type: 'equivalent', numerator: 1, denominator: 2, leftN: 1, leftD: 2, rightD: 4 },
  { type: 'equivalent', numerator: 1, denominator: 2, leftN: 1, leftD: 2, rightD: 6 },
  { type: 'equivalent', numerator: 1, denominator: 2, leftN: 1, leftD: 2, rightD: 8 },
  { type: 'equivalent', numerator: 1, denominator: 3, leftN: 1, leftD: 3, rightD: 6 },
  { type: 'equivalent', numerator: 2, denominator: 3, leftN: 2, leftD: 3, rightD: 6 },
  { type: 'equivalent', numerator: 1, denominator: 4, leftN: 1, leftD: 4, rightD: 8 },
  { type: 'equivalent', numerator: 3, denominator: 4, leftN: 3, leftD: 4, rightD: 8 },
  { type: 'equivalent', numerator: 1, denominator: 3, leftN: 1, leftD: 3, rightD: 9 },
  { type: 'equivalent', numerator: 2, denominator: 3, leftN: 2, leftD: 3, rightD: 9 },
  { type: 'equivalent', numerator: 2, denominator: 4, leftN: 2, leftD: 4, rightD: 2 },
  { type: 'equivalent', numerator: 4, denominator: 6, leftN: 4, leftD: 6, rightD: 3 },
  { type: 'equivalent', numerator: 6, denominator: 8, leftN: 6, leftD: 8, rightD: 4 },
  { type: 'equivalent', numerator: 2, denominator: 6, leftN: 2, leftD: 6, rightD: 3 },
  { type: 'equivalent', numerator: 4, denominator: 8, leftN: 4, leftD: 8, rightD: 2 },
  { type: 'equivalent', numerator: 3, denominator: 9, leftN: 3, leftD: 9, rightD: 3 },
  { type: 'equivalent', numerator: 6, denominator: 9, leftN: 6, leftD: 9, rightD: 3 },
  { type: 'equivalent', numerator: 5, denominator: 6,  leftN: 5, leftD: 6,  rightD: 12 },
  { type: 'equivalent', numerator: 7, denominator: 8,  leftN: 7, leftD: 8,  rightD: 16 },
  { type: 'equivalent', numerator: 2, denominator: 5,  leftN: 2, leftD: 5,  rightD: 15 },
  { type: 'equivalent', numerator: 3, denominator: 10, leftN: 3, leftD: 10, rightD: 20 },
  { type: 'equivalent', numerator: 4, denominator: 9,  leftN: 4, leftD: 9,  rightD: 18 },

  // --- number line ---
  { type: 'number-line', denominator: 2, numerator: 1 },
  { type: 'number-line', denominator: 4, numerator: 1 },
  { type: 'number-line', denominator: 4, numerator: 3 },
  { type: 'number-line', denominator: 4, numerator: 5 },
  { type: 'number-line', denominator: 4, numerator: 7 },
  { type: 'number-line', denominator: 3, numerator: 1 },
  { type: 'number-line', denominator: 3, numerator: 2 },
  { type: 'number-line', denominator: 3, numerator: 4 },
  { type: 'number-line', denominator: 3, numerator: 5 },
  { type: 'number-line', denominator: 5, numerator: 2 },
  { type: 'number-line', denominator: 5, numerator: 3 },
  { type: 'number-line', denominator: 5, numerator: 7 },
  { type: 'number-line', denominator: 5, numerator: 8 },
  { type: 'number-line', denominator: 8, numerator: 3 },
  { type: 'number-line', denominator: 8, numerator: 5 },
  { type: 'number-line', denominator: 8, numerator: 9 },
  { type: 'number-line', denominator: 8, numerator: 13 },
  { type: 'number-line', denominator: 10, numerator: 7  },
  { type: 'number-line', denominator: 10, numerator: 13 },
  { type: 'number-line', denominator: 10, numerator: 17 },
  { type: 'number-line', denominator: 16, numerator: 11 },
  { type: 'number-line', denominator: 16, numerator: 21 },

  // --- time operations ---
  { type: 'time-operation', operation: 'add', numerator: 1, denominator: 4, n2: 1, d2: 4,  answer: 30 },
  { type: 'time-operation', operation: 'add', numerator: 1, denominator: 3, n2: 1, d2: 6,  answer: 30 },
  { type: 'time-operation', operation: 'add', numerator: 1, denominator: 2, n2: 1, d2: 4,  answer: 45 },
  { type: 'time-operation', operation: 'add', numerator: 1, denominator: 4, n2: 1, d2: 6,  answer: 25 },
  { type: 'time-operation', operation: 'add', numerator: 1, denominator: 3, n2: 1, d2: 3,  answer: 40 },
  { type: 'time-operation', operation: 'add', numerator: 1, denominator: 2, n2: 1, d2: 6,  answer: 40 },
  { type: 'time-operation', operation: 'add', numerator: 1, denominator: 4, n2: 1, d2: 12, answer: 20 },
  { type: 'time-operation', operation: 'subtract', numerator: 1, denominator: 2, n2: 1, d2: 4, answer: 15 },
  { type: 'time-operation', operation: 'subtract', numerator: 3, denominator: 4, n2: 1, d2: 4, answer: 30 },
  { type: 'time-operation', operation: 'subtract', numerator: 2, denominator: 3, n2: 1, d2: 3, answer: 20 },
  { type: 'time-operation', operation: 'subtract', numerator: 1, denominator: 2, n2: 1, d2: 6, answer: 20 },
  { type: 'time-operation', operation: 'subtract', numerator: 3, denominator: 4, n2: 1, d2: 2, answer: 15 },
  { type: 'time-operation', operation: 'subtract', numerator: 2, denominator: 3, n2: 1, d2: 6, answer: 30 },
  { type: 'time-operation', operation: 'subtract', numerator: 5, denominator: 6, n2: 1, d2: 3, answer: 30 },
  { type: 'time-operation', operation: 'divide', numerator: 1, denominator: 2, divisor: 2, answer: 15 },
  { type: 'time-operation', operation: 'divide', numerator: 1, denominator: 2, divisor: 3, answer: 10 },
  { type: 'time-operation', operation: 'divide', numerator: 3, denominator: 4, divisor: 3, answer: 15 },
  { type: 'time-operation', operation: 'divide', numerator: 1, denominator: 3, divisor: 2, answer: 10 },
  { type: 'time-operation', operation: 'divide', numerator: 2, denominator: 3, divisor: 4, answer: 10 },
  { type: 'time-operation', operation: 'divide', numerator: 1, denominator: 4, divisor: 3, answer:  5 },
  { type: 'time-operation', operation: 'divide', numerator: 5, denominator: 6, divisor: 5, answer: 10 },
  { type: 'time-operation', operation: 'add', numerator: 1, denominator: 5,  n2: 3, d2: 10, answer: 30 },
  { type: 'time-operation', operation: 'add', numerator: 3, denominator: 20, n2: 1, d2: 5,  answer: 21 },
  { type: 'time-operation', operation: 'subtract', numerator: 1, denominator: 2,  n2: 1, d2: 5, answer: 18 },
  { type: 'time-operation', operation: 'subtract', numerator: 7, denominator: 10, n2: 1, d2: 4, answer: 27 },
  { type: 'time-operation', operation: 'divide', numerator: 1, denominator: 5, divisor: 3, answer: 4 },

  // --- fraction of quantity ---
  { type: 'fraction-quantity', numerator: 1, denominator: 3,  quantity: 6,  itemKey: 'itemApples',       emoji: '🍎', answer: 2  },
  { type: 'fraction-quantity', numerator: 2, denominator: 3,  quantity: 9,  itemKey: 'itemEggs',         emoji: '🥚', answer: 6  },
  { type: 'fraction-quantity', numerator: 1, denominator: 4,  quantity: 8,  itemKey: 'itemStars',        emoji: '⭐', answer: 2  },
  { type: 'fraction-quantity', numerator: 3, denominator: 4,  quantity: 12, itemKey: 'itemFlowers',      emoji: '🌸', answer: 9  },
  { type: 'fraction-quantity', numerator: 1, denominator: 2,  quantity: 10, itemKey: 'itemPencils',      emoji: '✏️', answer: 5  },
  { type: 'fraction-quantity', numerator: 1, denominator: 5,  quantity: 15, itemKey: 'itemBalloons',     emoji: '🎈', answer: 3  },
  { type: 'fraction-quantity', numerator: 2, denominator: 5,  quantity: 20, itemKey: 'itemLemons',       emoji: '🍋', answer: 8  },
  { type: 'fraction-quantity', numerator: 3, denominator: 5,  quantity: 25, itemKey: 'itemOranges',      emoji: '🍊', answer: 15 },
  { type: 'fraction-quantity', numerator: 1, denominator: 4,  quantity: 20, itemKey: 'itemStrawberries', emoji: '🍓', answer: 5  },
  { type: 'fraction-quantity', numerator: 3, denominator: 4,  quantity: 16, itemKey: 'itemBooks',        emoji: '📚', answer: 12 },
  { type: 'fraction-quantity', numerator: 1, denominator: 3,  quantity: 12, itemKey: 'itemApples',       emoji: '🍎', answer: 4  },
  { type: 'fraction-quantity', numerator: 2, denominator: 3,  quantity: 15, itemKey: 'itemFlowers',      emoji: '🌸', answer: 10 },
  { type: 'fraction-quantity', numerator: 1, denominator: 6,  quantity: 18, itemKey: 'itemPencils',      emoji: '✏️', answer: 3  },
  { type: 'fraction-quantity', numerator: 5, denominator: 6,  quantity: 12, itemKey: 'itemStars',        emoji: '⭐', answer: 10 },
  { type: 'fraction-quantity', numerator: 1, denominator: 4,  quantity: 24, itemKey: 'itemEggs',         emoji: '🥚', answer: 6  },
  { type: 'fraction-quantity', numerator: 3, denominator: 8,  quantity: 24, itemKey: 'itemBalloons',     emoji: '🎈', answer: 9  },
  { type: 'fraction-quantity', numerator: 2, denominator: 5,  quantity: 10, itemKey: 'itemLemons',       emoji: '🍋', answer: 4  },
  { type: 'fraction-quantity', numerator: 4, denominator: 5,  quantity: 20, itemKey: 'itemOranges',      emoji: '🍊', answer: 16 },
  { type: 'fraction-quantity', numerator: 1, denominator: 3,  quantity: 21, itemKey: 'itemStrawberries', emoji: '🍓', answer: 7  },
  { type: 'fraction-quantity', numerator: 3, denominator: 4,  quantity: 20, itemKey: 'itemBooks',        emoji: '📚', answer: 15 },
  { type: 'fraction-quantity', numerator: 5, denominator: 8,  quantity: 40, itemKey: 'itemApples',       emoji: '🍎', answer: 25 },
  { type: 'fraction-quantity', numerator: 7, denominator: 10, quantity: 50, itemKey: 'itemFlowers',      emoji: '🌸', answer: 35 },
  { type: 'fraction-quantity', numerator: 3, denominator: 8,  quantity: 48, itemKey: 'itemBooks',        emoji: '📚', answer: 18 },
  { type: 'fraction-quantity', numerator: 5, denominator: 12, quantity: 36, itemKey: 'itemStars',        emoji: '⭐', answer: 15 },
  { type: 'fraction-quantity', numerator: 7, denominator: 9,  quantity: 45, itemKey: 'itemOranges',      emoji: '🍊', answer: 35 },

  // --- matching equivalent fractions ---
  { type: 'matching', numerator: 0, denominator: 1, pairs: [
    { left: {n:1,d:2}, right: {n:2,d:4} },
    { left: {n:2,d:3}, right: {n:4,d:6} },
    { left: {n:3,d:4}, right: {n:6,d:8} },
  ]},
  { type: 'matching', numerator: 0, denominator: 1, pairs: [
    { left: {n:1,d:3}, right: {n:2,d:6} },
    { left: {n:1,d:2}, right: {n:3,d:6} },
    { left: {n:2,d:3}, right: {n:4,d:6} },
  ]},
  { type: 'matching', numerator: 0, denominator: 1, pairs: [
    { left: {n:1,d:4}, right: {n:2,d:8} },
    { left: {n:3,d:4}, right: {n:6,d:8} },
    { left: {n:1,d:2}, right: {n:4,d:8} },
  ]},
  { type: 'matching', numerator: 0, denominator: 1, pairs: [
    { left: {n:1,d:3}, right: {n:3,d:9} },
    { left: {n:2,d:3}, right: {n:6,d:9} },
    { left: {n:1,d:2}, right: {n:3,d:6} },
  ]},
  { type: 'matching', numerator: 0, denominator: 1, pairs: [
    { left: {n:1,d:2}, right: {n:5,d:10} },
    { left: {n:3,d:5}, right: {n:6,d:10} },
    { left: {n:4,d:5}, right: {n:8,d:10} },
  ]},
  { type: 'matching', numerator: 0, denominator: 1, pairs: [
    { left: {n:1,d:3}, right: {n:4,d:12} },
    { left: {n:1,d:2}, right: {n:6,d:12} },
    { left: {n:3,d:4}, right: {n:9,d:12} },
  ]},
  { type: 'matching', numerator: 0, denominator: 1, pairs: [
    { left: {n:1,d:4}, right: {n:3,d:12} },
    { left: {n:2,d:3}, right: {n:8,d:12} },
    { left: {n:5,d:6}, right: {n:10,d:12} },
  ]},
  { type: 'matching', numerator: 0, denominator: 1, pairs: [
    { left: {n:2,d:5}, right: {n:4,d:10} },
    { left: {n:3,d:5}, right: {n:6,d:10} },
    { left: {n:1,d:2}, right: {n:5,d:10} },
  ]},
  { type: 'matching', numerator: 0, denominator: 1, pairs: [
    { left: {n:1,d:2}, right: {n:2,d:4} },
    { left: {n:1,d:3}, right: {n:2,d:6} },
    { left: {n:1,d:4}, right: {n:2,d:8} },
  ]},
  { type: 'matching', numerator: 0, denominator: 1, pairs: [
    { left: {n:2,d:3}, right: {n:6,d:9} },
    { left: {n:1,d:4}, right: {n:3,d:12} },
    { left: {n:3,d:5}, right: {n:6,d:10} },
  ]},
  { type: 'matching', numerator: 0, denominator: 1, pairs: [
    { left: {n:1,d:6}, right: {n:2,d:12} },
    { left: {n:5,d:6}, right: {n:10,d:12} },
    { left: {n:1,d:2}, right: {n:6,d:12} },
  ]},
  { type: 'matching', numerator: 0, denominator: 1, pairs: [
    { left: {n:3,d:8}, right: {n:6,d:16} },
    { left: {n:5,d:8}, right: {n:10,d:16} },
    { left: {n:1,d:4}, right: {n:4,d:16} },
  ]},
  { type: 'matching', numerator: 0, denominator: 1, pairs: [
    { left: {n:2,d:5}, right: {n:8,d:20} },
    { left: {n:3,d:5}, right: {n:12,d:20} },
    { left: {n:1,d:4}, right: {n:5,d:20} },
  ]},
  { type: 'matching', numerator: 0, denominator: 1, pairs: [
    { left: {n:5,d:9}, right: {n:10,d:18} },
    { left: {n:2,d:9}, right: {n:4,d:18} },
    { left: {n:1,d:3}, right: {n:6,d:18} },
  ]},

  // --- fraction tower ---
  { type: 'fraction-tower', numerator: 0, denominator: 1, towerTiles: [
    {n:1,d:3},{n:1,d:3},{n:1,d:3},{n:2,d:3},
  ]},
  { type: 'fraction-tower', numerator: 0, denominator: 1, towerTiles: [
    {n:1,d:3},{n:1,d:3},{n:2,d:3},{n:2,d:3},
  ]},
  { type: 'fraction-tower', numerator: 0, denominator: 1, towerTiles: [
    {n:1,d:3},{n:1,d:3},{n:1,d:3},{n:1,d:3},{n:2,d:3},
  ]},
  { type: 'fraction-tower', numerator: 0, denominator: 1, towerTiles: [
    {n:1,d:4},{n:1,d:4},{n:1,d:4},{n:1,d:4},{n:3,d:4},{n:1,d:2},
  ]},
  { type: 'fraction-tower', numerator: 0, denominator: 1, towerTiles: [
    {n:1,d:4},{n:1,d:4},{n:1,d:2},{n:3,d:4},
  ]},
  { type: 'fraction-tower', numerator: 0, denominator: 1, towerTiles: [
    {n:1,d:4},{n:1,d:4},{n:1,d:4},{n:1,d:4},{n:1,d:2},
  ]},
  { type: 'fraction-tower', numerator: 0, denominator: 1, towerTiles: [
    {n:1,d:2},{n:1,d:4},{n:1,d:4},{n:1,d:3},{n:1,d:6},
  ]},
  { type: 'fraction-tower', numerator: 0, denominator: 1, towerTiles: [
    {n:1,d:2},{n:1,d:3},{n:1,d:6},{n:1,d:4},{n:3,d:4},
  ]},
  { type: 'fraction-tower', numerator: 0, denominator: 1, towerTiles: [
    {n:1,d:6},{n:1,d:6},{n:1,d:6},{n:1,d:2},{n:1,d:3},
  ]},
  { type: 'fraction-tower', numerator: 0, denominator: 1, towerTiles: [
    {n:1,d:2},{n:1,d:4},{n:1,d:4},{n:1,d:3},{n:2,d:3},
  ]},
  { type: 'fraction-tower', numerator: 0, denominator: 1, towerTiles: [
    {n:1,d:8},{n:1,d:8},{n:1,d:8},{n:1,d:8},{n:1,d:4},{n:1,d:4},{n:1,d:2},
  ]},
  { type: 'fraction-tower', numerator: 0, denominator: 1, towerTiles: [
    {n:7,d:10},{n:3,d:10},{n:1,d:5},{n:1,d:2},{n:1,d:10},
  ]},
  { type: 'fraction-tower', numerator: 0, denominator: 1, towerTiles: [
    {n:5,d:12},{n:7,d:12},{n:1,d:6},{n:1,d:3},{n:1,d:4},
  ]},
  { type: 'fraction-tower', numerator: 0, denominator: 1, towerTiles: [
    {n:3,d:8},{n:3,d:8},{n:1,d:4},{n:1,d:8},{n:1,d:2},
  ]},

  // --- ice cream shop ---
  { type: 'ice-cream', denominator: 2, numerator: 4  },
  { type: 'ice-cream', denominator: 3, numerator: 6  },
  { type: 'ice-cream', denominator: 4, numerator: 8  },
  { type: 'ice-cream', denominator: 2, numerator: 6  },
  { type: 'ice-cream', denominator: 3, numerator: 9  },
  { type: 'ice-cream', denominator: 4, numerator: 12 },
  { type: 'ice-cream', denominator: 2, numerator: 8  },
  { type: 'ice-cream', denominator: 3, numerator: 12 },
  { type: 'ice-cream', denominator: 4, numerator: 16 },
  { type: 'ice-cream', denominator: 2, numerator: 10 },
  { type: 'ice-cream', denominator: 3, numerator: 15 },
  { type: 'ice-cream', denominator: 4, numerator: 20 },
  { type: 'ice-cream', denominator: 5, numerator: 25 },
  { type: 'ice-cream', denominator: 6, numerator: 24 },
  { type: 'ice-cream', denominator: 7, numerator: 28 },
  { type: 'ice-cream', denominator: 8, numerator: 40 },
  { type: 'ice-cream', denominator: 9, numerator: 45 },

  // --- train builder ---
  { type: 'train', numerator: 3,  denominator: 2 },
  { type: 'train', numerator: 5,  denominator: 2 },
  { type: 'train', numerator: 7,  denominator: 2 },
  { type: 'train', numerator: 4,  denominator: 3 },
  { type: 'train', numerator: 7,  denominator: 3 },
  { type: 'train', numerator: 10, denominator: 3 },
  { type: 'train', numerator: 5,  denominator: 4 },
  { type: 'train', numerator: 9,  denominator: 4 },
  { type: 'train', numerator: 13, denominator: 4 },
  { type: 'train', numerator: 6,  denominator: 5 },
  { type: 'train', numerator: 11, denominator: 5 },
  { type: 'train', numerator: 13, denominator: 5 },
  { type: 'train', numerator: 8,  denominator: 6  },
  { type: 'train', numerator: 15, denominator: 7  },
  { type: 'train', numerator: 17, denominator: 8  },
  { type: 'train', numerator: 21, denominator: 9  },
  { type: 'train', numerator: 23, denominator: 10 },

  // --- rocket launch ---
  { type: 'rocket', numerator: 5,  denominator: 2 },
  { type: 'rocket', numerator: 7,  denominator: 2 },
  { type: 'rocket', numerator: 9,  denominator: 2 },
  { type: 'rocket', numerator: 7,  denominator: 3 },
  { type: 'rocket', numerator: 8,  denominator: 3 },
  { type: 'rocket', numerator: 10, denominator: 3 },
  { type: 'rocket', numerator: 7,  denominator: 4 },
  { type: 'rocket', numerator: 9,  denominator: 4 },
  { type: 'rocket', numerator: 11, denominator: 4 },
  { type: 'rocket', numerator: 13, denominator: 4 },
  { type: 'rocket', numerator: 6,  denominator: 5 },
  { type: 'rocket', numerator: 9,  denominator: 5 },
  { type: 'rocket', numerator: 11, denominator: 5 },
  { type: 'rocket', numerator: 13, denominator: 6 },
  { type: 'rocket', numerator: 17, denominator: 6 },
  { type: 'rocket', numerator: 11, denominator: 8 },
  { type: 'rocket', numerator: 15, denominator: 8 },
  { type: 'rocket', numerator: 19, denominator: 8 },
  { type: 'rocket', numerator: 20, denominator: 9  },
  { type: 'rocket', numerator: 23, denominator: 10 },
  { type: 'rocket', numerator: 25, denominator: 11 },
  { type: 'rocket', numerator: 29, denominator: 12 },

  // --- monster battle ---
  { type: 'monster', numerator: 0, denominator: 1, left: { numerator: 3, denominator: 4 }, right: { numerator: 2, denominator: 4 } },
  { type: 'monster', numerator: 0, denominator: 1, left: { numerator: 2, denominator: 5 }, right: { numerator: 4, denominator: 5 } },
  { type: 'monster', numerator: 0, denominator: 1, left: { numerator: 5, denominator: 6 }, right: { numerator: 3, denominator: 6 } },
  { type: 'monster', numerator: 0, denominator: 1, left: { numerator: 7, denominator: 8 }, right: { numerator: 5, denominator: 8 } },
  { type: 'monster', numerator: 0, denominator: 1, left: { numerator: 1, denominator: 3 }, right: { numerator: 2, denominator: 3 } },
  { type: 'monster', numerator: 0, denominator: 1, left: { numerator: 3, denominator: 4 }, right: { numerator: 2, denominator: 3 } },
  { type: 'monster', numerator: 0, denominator: 1, left: { numerator: 5, denominator: 6 }, right: { numerator: 4, denominator: 5 } },
  { type: 'monster', numerator: 0, denominator: 1, left: { numerator: 7, denominator: 10 }, right: { numerator: 3, denominator: 4 } },
  { type: 'monster', numerator: 0, denominator: 1, left: { numerator: 2, denominator: 3 }, right: { numerator: 3, denominator: 5 } },
  { type: 'monster', numerator: 0, denominator: 1, left: { numerator: 1, denominator: 2 }, right: { numerator: 3, denominator: 8 } },
  { type: 'monster', numerator: 0, denominator: 1, left: { numerator: 7, denominator: 4 }, right: { numerator: 6, denominator: 4 } },
  { type: 'monster', numerator: 0, denominator: 1, left: { numerator: 9, denominator: 5 }, right: { numerator: 11, denominator: 5 } },
  { type: 'monster', numerator: 0, denominator: 1, left: { numerator: 13, denominator: 6 }, right: { numerator: 11, denominator: 6 } },
  { type: 'monster', numerator: 0, denominator: 1, left: { numerator: 5, denominator: 3 }, right: { numerator: 4, denominator: 3 } },
  { type: 'monster', numerator: 0, denominator: 1, left: { numerator: 8, denominator: 4 }, right: { numerator: 9, denominator: 4 } },
  { type: 'monster', numerator: 0, denominator: 1, left: { numerator: 7, denominator: 9 },  right: { numerator: 5, denominator: 6 } },
  { type: 'monster', numerator: 0, denominator: 1, left: { numerator: 9, denominator: 10 }, right: { numerator: 11, denominator: 12 } },
  { type: 'monster', numerator: 0, denominator: 1, left: { numerator: 5, denominator: 7 },  right: { numerator: 4, denominator: 5 } },
  { type: 'monster', numerator: 0, denominator: 1, left: { numerator: 13, denominator: 12 }, right: { numerator: 7, denominator: 6 } },
  { type: 'monster', numerator: 0, denominator: 1, left: { numerator: 11, denominator: 12 }, right: { numerator: 5, denominator: 6 } },

  // --- fraction detective ---
  { type: 'detective', numerator: 0, denominator: 1, detectives: [
    { leftN: 5, leftD: 6, op: '>', rightN: 3, rightD: 6, isWrong: false },
    { leftN: 3, leftD: 5, op: '>', rightN: 4, rightD: 5, isWrong: true  },
    { leftN: 7, leftD: 8, op: '>', rightN: 5, rightD: 8, isWrong: false },
  ] },
  { type: 'detective', numerator: 0, denominator: 1, detectives: [
    { leftN: 4, leftD: 7, op: '<', rightN: 6, rightD: 7, isWrong: false },
    { leftN: 2, leftD: 4, op: '<', rightN: 1, rightD: 4, isWrong: true  },
    { leftN: 1, leftD: 3, op: '<', rightN: 2, rightD: 3, isWrong: false },
  ] },
  { type: 'detective', numerator: 0, denominator: 1, detectives: [
    { leftN: 5, leftD: 8, op: '>', rightN: 3, rightD: 8, isWrong: false },
    { leftN: 4, leftD: 6, op: '<', rightN: 5, rightD: 6, isWrong: false },
    { leftN: 3, leftD: 4, op: '<', rightN: 2, rightD: 4, isWrong: true  },
  ] },
  { type: 'detective', numerator: 0, denominator: 1, detectives: [
    { leftN: 3, leftD: 4, op: '>', rightN: 2, rightD: 3, isWrong: false },
    { leftN: 5, leftD: 6, op: '<', rightN: 4, rightD: 5, isWrong: true  },
    { leftN: 1, leftD: 2, op: '<', rightN: 3, rightD: 5, isWrong: false },
  ] },
  { type: 'detective', numerator: 0, denominator: 1, detectives: [
    { leftN: 7, leftD: 10, op: '<', rightN: 3, rightD: 4, isWrong: false },
    { leftN: 2, leftD: 3,  op: '<', rightN: 3, rightD: 5, isWrong: true  },
    { leftN: 1, leftD: 4,  op: '<', rightN: 1, rightD: 3, isWrong: false },
  ] },
  { type: 'detective', numerator: 0, denominator: 1, detectives: [
    { leftN: 3, leftD: 5, op: '<', rightN: 2, rightD: 3, isWrong: false },
    { leftN: 7, leftD: 8, op: '<', rightN: 5, rightD: 6, isWrong: true  },
    { leftN: 1, leftD: 3, op: '<', rightN: 1, rightD: 2, isWrong: false },
  ] },
  { type: 'detective', numerator: 0, denominator: 1, detectives: [
    { leftN: 7,  leftD: 4, op: '>', rightN: 5,  rightD: 4, isWrong: false },
    { leftN: 8,  leftD: 5, op: '<', rightN: 7,  rightD: 5, isWrong: true  },
    { leftN: 11, leftD: 6, op: '>', rightN: 9,  rightD: 6, isWrong: false },
  ] },
  { type: 'detective', numerator: 0, denominator: 1, detectives: [
    { leftN: 9,  leftD: 4, op: '>', rightN: 7,  rightD: 4, isWrong: false },
    { leftN: 11, leftD: 5, op: '<', rightN: 13, rightD: 5, isWrong: false },
    { leftN: 13, leftD: 6, op: '<', rightN: 11, rightD: 6, isWrong: true  },
  ] },
  { type: 'detective', numerator: 0, denominator: 1, detectives: [
    { leftN: 7, leftD: 3, op: '>', rightN: 5, rightD: 3, isWrong: false },
    { leftN: 9, leftD: 4, op: '<', rightN: 7, rightD: 4, isWrong: true  },
    { leftN: 11, leftD: 5, op: '>', rightN: 9, rightD: 5, isWrong: false },
  ] },
  { type: 'detective', numerator: 0, denominator: 1, detectives: [
    { leftN: 5, leftD: 2, op: '>', rightN: 3, rightD: 2, isWrong: false },
    { leftN: 9, leftD: 4, op: '<', rightN: 2, rightD: 1, isWrong: true  },
    { leftN: 7, leftD: 3, op: '>', rightN: 2, rightD: 1, isWrong: false },
  ] },
  { type: 'detective', numerator: 0, denominator: 1, detectives: [
    { leftN: 8, leftD: 3, op: '<', rightN: 2, rightD: 1, isWrong: true  },
    { leftN: 7, leftD: 4, op: '>', rightN: 1, rightD: 1, isWrong: false },
    { leftN: 11, leftD: 5, op: '>', rightN: 2, rightD: 1, isWrong: false },
  ] },
  { type: 'detective', numerator: 0, denominator: 1, detectives: [
    { leftN: 5,  leftD: 3, op: '>', rightN: 1, rightD: 1, isWrong: false },
    { leftN: 7,  leftD: 4, op: '<', rightN: 3, rightD: 1, isWrong: false },
    { leftN: 11, leftD: 4, op: '<', rightN: 2, rightD: 1, isWrong: true  },
  ] },
  { type: 'detective', numerator: 0, denominator: 1, detectives: [
    { leftN: 9, leftD: 2, op: '>', rightN: 4, rightD: 1, isWrong: false },
    { leftN: 7, leftD: 3, op: '>', rightN: 3, rightD: 1, isWrong: true  },
    { leftN: 5, leftD: 2, op: '>', rightN: 2, rightD: 1, isWrong: false },
  ] },
  { type: 'detective', numerator: 0, denominator: 1, detectives: [
    { leftN: 5, leftD: 4, op: '>', rightN: 1, rightD: 1, isWrong: false },
    { leftN: 7, leftD: 5, op: '<', rightN: 2, rightD: 1, isWrong: false },
    { leftN: 9, leftD: 8, op: '<', rightN: 1, rightD: 1, isWrong: true  },
  ] },
  { type: 'detective', numerator: 0, denominator: 1, detectives: [
    { leftN: 11, leftD: 4, op: '>', rightN: 2, rightD: 1, isWrong: false },
    { leftN: 13, leftD: 5, op: '<', rightN: 3, rightD: 1, isWrong: false },
    { leftN: 9,  leftD: 3, op: '<', rightN: 3, rightD: 1, isWrong: true  },
  ] },
  { type: 'detective', numerator: 0, denominator: 1, detectives: [
    { leftN: 9, leftD: 11, op: '>', rightN: 7, rightD: 11, isWrong: false },
    { leftN: 5, leftD: 9,  op: '>', rightN: 6, rightD: 9,  isWrong: true  },
    { leftN: 8, leftD: 13, op: '<', rightN: 9, rightD: 13, isWrong: false },
  ] },
  { type: 'detective', numerator: 0, denominator: 1, detectives: [
    { leftN: 7,  leftD: 12, op: '<', rightN: 8,  rightD: 12, isWrong: false },
    { leftN: 11, leftD: 16, op: '>', rightN: 9,  rightD: 16, isWrong: false },
    { leftN: 5,  leftD: 14, op: '>', rightN: 9,  rightD: 14, isWrong: true  },
  ] },
  { type: 'detective', numerator: 0, denominator: 1, detectives: [
    { leftN: 7, leftD: 9,  op: '<', rightN: 11, rightD: 14, isWrong: false },
    { leftN: 5, leftD: 6,  op: '>', rightN: 13, rightD: 16, isWrong: false },
    { leftN: 9, leftD: 11, op: '>', rightN: 14, rightD: 17, isWrong: true  },
  ] },
  { type: 'detective', numerator: 0, denominator: 1, detectives: [
    { leftN: 19, leftD: 12, op: '<', rightN: 11, rightD: 7, isWrong: true  },
    { leftN: 17, leftD: 11, op: '<', rightN: 14, rightD: 9, isWrong: false },
    { leftN: 23, leftD: 10, op: '<', rightN: 19, rightD: 8, isWrong: false },
  ] },

  // --- balance scale ---
  { type: 'balance', denominator: 2, numerator: 4,  answer: 2 },
  { type: 'balance', denominator: 2, numerator: 6,  answer: 3 },
  { type: 'balance', denominator: 2, numerator: 8,  answer: 4 },
  { type: 'balance', denominator: 2, numerator: 10, answer: 5 },
  { type: 'balance', denominator: 3, numerator: 6,  answer: 2 },
  { type: 'balance', denominator: 3, numerator: 9,  answer: 3 },
  { type: 'balance', denominator: 3, numerator: 12, answer: 4 },
  { type: 'balance', denominator: 3, numerator: 15, answer: 5 },
  { type: 'balance', denominator: 4, numerator: 8,  answer: 2 },
  { type: 'balance', denominator: 4, numerator: 12, answer: 3 },
  { type: 'balance', denominator: 4, numerator: 16, answer: 4 },
  { type: 'balance', denominator: 5, numerator: 10, answer: 2 },
  { type: 'balance', denominator: 5, numerator: 15, answer: 3 },
  { type: 'balance', denominator: 5, numerator: 20, answer: 4 },
  { type: 'balance', denominator: 6, numerator: 18, answer: 3 },
  { type: 'balance', denominator: 7, numerator: 14, answer: 2 },
  { type: 'balance', denominator: 8,  numerator: 32, answer: 4 },
  { type: 'balance', denominator: 8,  numerator: 64, answer: 8 },
  { type: 'balance', denominator: 9,  numerator: 63, answer: 7 },
  { type: 'balance', denominator: 10, numerator: 70, answer: 7 },
  { type: 'balance', denominator: 10, numerator: 80, answer: 8 },

  // --- compare same numerator ---
  // same numerator: smaller denominator → bigger fraction (e.g. 2/3 > 2/5)
  { type: 'compare-same-num', denominator: 1, numerator: 1, left: { numerator: 1, denominator: 2  }, right: { numerator: 1, denominator: 4  } },
  { type: 'compare-same-num', denominator: 1, numerator: 1, left: { numerator: 1, denominator: 3  }, right: { numerator: 1, denominator: 6  } },
  { type: 'compare-same-num', denominator: 1, numerator: 1, left: { numerator: 1, denominator: 6  }, right: { numerator: 1, denominator: 3  } },
  { type: 'compare-same-num', denominator: 1, numerator: 1, left: { numerator: 1, denominator: 4  }, right: { numerator: 1, denominator: 4  } },
  { type: 'compare-same-num', denominator: 1, numerator: 1, left: { numerator: 1, denominator: 5  }, right: { numerator: 1, denominator: 2  } },
  { type: 'compare-same-num', denominator: 1, numerator: 1, left: { numerator: 2, denominator: 3  }, right: { numerator: 2, denominator: 5  } },
  { type: 'compare-same-num', denominator: 1, numerator: 1, left: { numerator: 2, denominator: 7  }, right: { numerator: 2, denominator: 4  } },
  { type: 'compare-same-num', denominator: 1, numerator: 1, left: { numerator: 2, denominator: 6  }, right: { numerator: 2, denominator: 6  } },
  { type: 'compare-same-num', denominator: 1, numerator: 1, left: { numerator: 2, denominator: 9  }, right: { numerator: 2, denominator: 3  } },
  { type: 'compare-same-num', denominator: 1, numerator: 1, left: { numerator: 3, denominator: 4  }, right: { numerator: 3, denominator: 8  } },
  { type: 'compare-same-num', denominator: 1, numerator: 1, left: { numerator: 3, denominator: 10 }, right: { numerator: 3, denominator: 5  } },
  { type: 'compare-same-num', denominator: 1, numerator: 1, left: { numerator: 3, denominator: 7  }, right: { numerator: 3, denominator: 7  } },
  { type: 'compare-same-num', denominator: 1, numerator: 1, left: { numerator: 4, denominator: 5  }, right: { numerator: 4, denominator: 9  } },
  { type: 'compare-same-num', denominator: 1, numerator: 1, left: { numerator: 4, denominator: 8  }, right: { numerator: 4, denominator: 5  } },
  { type: 'compare-same-num', denominator: 1, numerator: 1, left: { numerator: 4, denominator: 12 }, right: { numerator: 4, denominator: 6  } },
  { type: 'compare-same-num', denominator: 1, numerator: 1, left: { numerator: 5,  denominator: 11 }, right: { numerator: 5,  denominator: 9  } },
  { type: 'compare-same-num', denominator: 1, numerator: 1, left: { numerator: 7,  denominator: 15 }, right: { numerator: 7,  denominator: 13 } },
  { type: 'compare-same-num', denominator: 1, numerator: 1, left: { numerator: 9,  denominator: 20 }, right: { numerator: 9,  denominator: 16 } },
  { type: 'compare-same-num', denominator: 1, numerator: 1, left: { numerator: 11, denominator: 18 }, right: { numerator: 11, denominator: 12 } },

  // --- compare same denominator ---
  { type: 'compare-same', denominator: 4,  numerator: 1, left: { numerator: 1, denominator: 4  }, right: { numerator: 3, denominator: 4  } },
  { type: 'compare-same', denominator: 4,  numerator: 1, left: { numerator: 3, denominator: 4  }, right: { numerator: 1, denominator: 4  } },
  { type: 'compare-same', denominator: 4,  numerator: 1, left: { numerator: 2, denominator: 4  }, right: { numerator: 2, denominator: 4  } },
  { type: 'compare-same', denominator: 5,  numerator: 1, left: { numerator: 2, denominator: 5  }, right: { numerator: 4, denominator: 5  } },
  { type: 'compare-same', denominator: 5,  numerator: 1, left: { numerator: 3, denominator: 5  }, right: { numerator: 1, denominator: 5  } },
  { type: 'compare-same', denominator: 6,  numerator: 1, left: { numerator: 1, denominator: 6  }, right: { numerator: 5, denominator: 6  } },
  { type: 'compare-same', denominator: 6,  numerator: 1, left: { numerator: 4, denominator: 6  }, right: { numerator: 2, denominator: 6  } },
  { type: 'compare-same', denominator: 8,  numerator: 1, left: { numerator: 3, denominator: 8  }, right: { numerator: 5, denominator: 8  } },
  { type: 'compare-same', denominator: 8,  numerator: 1, left: { numerator: 7, denominator: 8  }, right: { numerator: 3, denominator: 8  } },
  { type: 'compare-same', denominator: 8,  numerator: 1, left: { numerator: 4, denominator: 8  }, right: { numerator: 4, denominator: 8  } },
  { type: 'compare-same', denominator: 10, numerator: 1, left: { numerator: 3, denominator: 10 }, right: { numerator: 7, denominator: 10 } },
  { type: 'compare-same', denominator: 10, numerator: 1, left: { numerator: 9, denominator: 10 }, right: { numerator: 5, denominator: 10 } },
  { type: 'compare-same', denominator: 12, numerator: 1, left: { numerator: 5, denominator: 12 }, right: { numerator: 9, denominator: 12 } },
  { type: 'compare-same', denominator: 12, numerator: 1, left: { numerator: 7, denominator: 12 }, right: { numerator: 4, denominator: 12 } },
  { type: 'compare-same', denominator: 12, numerator: 1, left: { numerator: 6, denominator: 12 }, right: { numerator: 6, denominator: 12 } },
  { type: 'compare-same', denominator: 14, numerator: 1, left: { numerator: 5,  denominator: 14 }, right: { numerator: 9,  denominator: 14 } },
  { type: 'compare-same', denominator: 15, numerator: 1, left: { numerator: 11, denominator: 15 }, right: { numerator: 7,  denominator: 15 } },
  { type: 'compare-same', denominator: 16, numerator: 1, left: { numerator: 7,  denominator: 16 }, right: { numerator: 13, denominator: 16 } },
  { type: 'compare-same', denominator: 18, numerator: 1, left: { numerator: 11, denominator: 18 }, right: { numerator: 11, denominator: 18 } },
  { type: 'compare-same', denominator: 20, numerator: 1, left: { numerator: 17, denominator: 20 }, right: { numerator: 9,  denominator: 20 } },

  // --- compare ---
  { type: 'compare', denominator: 4, numerator: 1, left: { numerator: 1, denominator: 2 }, right: { numerator: 1, denominator: 4 } },
  { type: 'compare', denominator: 4, numerator: 1, left: { numerator: 2, denominator: 6 }, right: { numerator: 1, denominator: 3 } },
  { type: 'compare', denominator: 4, numerator: 1, left: { numerator: 3, denominator: 4 }, right: { numerator: 2, denominator: 3 } },
  { type: 'compare', denominator: 4, numerator: 1, left: { numerator: 1, denominator: 3 }, right: { numerator: 2, denominator: 5 } },
  { type: 'compare', denominator: 4, numerator: 1, left: { numerator: 3, denominator: 12 }, right: { numerator: 1, denominator: 4 } },
  { type: 'compare', denominator: 4, numerator: 1, left: { numerator: 5, denominator: 8 }, right: { numerator: 3, denominator: 4 } },
  { type: 'compare', denominator: 4, numerator: 1, left: { numerator: 2, denominator: 5 }, right: { numerator: 3, denominator: 10 } },
  { type: 'compare', denominator: 4, numerator: 1, left: { numerator: 7,  denominator: 9  }, right: { numerator: 11, denominator: 14 } },
  { type: 'compare', denominator: 4, numerator: 1, left: { numerator: 9,  denominator: 16 }, right: { numerator: 5,  denominator: 9  } },
  { type: 'compare', denominator: 4, numerator: 1, left: { numerator: 13, denominator: 20 }, right: { numerator: 8,  denominator: 12 } },
  { type: 'compare', denominator: 4, numerator: 1, left: { numerator: 17, denominator: 12 }, right: { numerator: 19, denominator: 14 } },
  { type: 'compare', denominator: 4, numerator: 1, left: { numerator: 11, denominator: 15 }, right: { numerator: 11, denominator: 15 } },

  // --- time detective ---
  // Level 1 — years → months (×12)
  { type: 'time-detective', numerator: 1, denominator: 1, timeCards: [
    { n: 2,  fromUnit: 'year', toUnit: 'month', stated: 24,  correct: 24,  isWrong: false },
    { n: 3,  fromUnit: 'year', toUnit: 'month', stated: 30,  correct: 36,  isWrong: true  },
    { n: 5,  fromUnit: 'year', toUnit: 'month', stated: 60,  correct: 60,  isWrong: false },
  ] },
  { type: 'time-detective', numerator: 1, denominator: 1, timeCards: [
    { n: 4,  fromUnit: 'year', toUnit: 'month', stated: 48,  correct: 48,  isWrong: false },
    { n: 6,  fromUnit: 'year', toUnit: 'month', stated: 72,  correct: 72,  isWrong: false },
    { n: 7,  fromUnit: 'year', toUnit: 'month', stated: 80,  correct: 84,  isWrong: true  },
  ] },
  { type: 'time-detective', numerator: 1, denominator: 1, timeCards: [
    { n: 1,  fromUnit: 'year', toUnit: 'month', stated: 12,  correct: 12,  isWrong: false },
    { n: 8,  fromUnit: 'year', toUnit: 'month', stated: 96,  correct: 96,  isWrong: false },
    { n: 10, fromUnit: 'year', toUnit: 'month', stated: 110, correct: 120, isWrong: true  },
  ] },
  { type: 'time-detective', numerator: 1, denominator: 1, timeCards: [
    { n: 9,  fromUnit: 'year', toUnit: 'month', stated: 108, correct: 108, isWrong: false },
    { n: 3,  fromUnit: 'year', toUnit: 'month', stated: 36,  correct: 36,  isWrong: false },
    { n: 6,  fromUnit: 'year', toUnit: 'month', stated: 78,  correct: 72,  isWrong: true  },
  ] },
  // Level 2 — weeks → days (×7)
  { type: 'time-detective', numerator: 1, denominator: 1, timeCards: [
    { n: 2,  fromUnit: 'week', toUnit: 'day', stated: 14, correct: 14, isWrong: false },
    { n: 5,  fromUnit: 'week', toUnit: 'day', stated: 35, correct: 35, isWrong: false },
    { n: 4,  fromUnit: 'week', toUnit: 'day', stated: 30, correct: 28, isWrong: true  },
  ] },
  { type: 'time-detective', numerator: 1, denominator: 1, timeCards: [
    { n: 8,  fromUnit: 'week', toUnit: 'day', stated: 56, correct: 56, isWrong: false },
    { n: 10, fromUnit: 'week', toUnit: 'day', stated: 70, correct: 70, isWrong: false },
    { n: 6,  fromUnit: 'week', toUnit: 'day', stated: 48, correct: 42, isWrong: true  },
  ] },
  { type: 'time-detective', numerator: 1, denominator: 1, timeCards: [
    { n: 3,  fromUnit: 'week', toUnit: 'day', stated: 21, correct: 21, isWrong: false },
    { n: 7,  fromUnit: 'week', toUnit: 'day', stated: 49, correct: 49, isWrong: false },
    { n: 9,  fromUnit: 'week', toUnit: 'day', stated: 65, correct: 63, isWrong: true  },
  ] },
  // Level 3 — years → days (×365)
  { type: 'time-detective', numerator: 1, denominator: 1, timeCards: [
    { n: 2, fromUnit: 'year', toUnit: 'day', stated: 730,  correct: 730,  isWrong: false },
    { n: 3, fromUnit: 'year', toUnit: 'day', stated: 1095, correct: 1095, isWrong: false },
    { n: 4, fromUnit: 'year', toUnit: 'day', stated: 1400, correct: 1460, isWrong: true  },
  ] },
  { type: 'time-detective', numerator: 1, denominator: 1, timeCards: [
    { n: 1, fromUnit: 'year', toUnit: 'day', stated: 365,  correct: 365,  isWrong: false },
    { n: 5, fromUnit: 'year', toUnit: 'day', stated: 1825, correct: 1825, isWrong: false },
    { n: 6, fromUnit: 'year', toUnit: 'day', stated: 2100, correct: 2190, isWrong: true  },
  ] },
  // Level 4 — mixed / reverse
  { type: 'time-detective', numerator: 1, denominator: 1, timeCards: [
    { n: 12, fromUnit: 'month', toUnit: 'year', stated: 1, correct: 1, isWrong: false },
    { n: 7,  fromUnit: 'day',   toUnit: 'week', stated: 1, correct: 1, isWrong: false },
    { n: 24, fromUnit: 'month', toUnit: 'year', stated: 3, correct: 2, isWrong: true  },
  ] },
  { type: 'time-detective', numerator: 1, denominator: 1, timeCards: [
    { n: 7,  fromUnit: 'day', toUnit: 'week', stated: 1, correct: 1, isWrong: false },
    { n: 14, fromUnit: 'day', toUnit: 'week', stated: 2, correct: 2, isWrong: false },
    { n: 21, fromUnit: 'day', toUnit: 'week', stated: 4, correct: 3, isWrong: true  },
  ] },
  { type: 'time-detective', numerator: 1, denominator: 1, timeCards: [
    { n: 2,  fromUnit: 'year',  toUnit: 'month', stated: 24, correct: 24, isWrong: false },
    { n: 12, fromUnit: 'month', toUnit: 'year',  stated: 1,  correct: 1,  isWrong: false },
    { n: 3,  fromUnit: 'year',  toUnit: 'month', stated: 30, correct: 36, isWrong: true  },
  ] },
  // Level 5 — bigger numbers
  { type: 'time-detective', numerator: 1, denominator: 1, timeCards: [
    { n: 11, fromUnit: 'year', toUnit: 'month', stated: 132, correct: 132, isWrong: false },
    { n: 15, fromUnit: 'year', toUnit: 'month', stated: 180, correct: 180, isWrong: false },
    { n: 13, fromUnit: 'year', toUnit: 'month', stated: 150, correct: 156, isWrong: true  },
  ] },
  { type: 'time-detective', numerator: 1, denominator: 1, timeCards: [
    { n: 12, fromUnit: 'week', toUnit: 'day', stated: 84,  correct: 84,  isWrong: false },
    { n: 15, fromUnit: 'week', toUnit: 'day', stated: 105, correct: 105, isWrong: false },
    { n: 11, fromUnit: 'week', toUnit: 'day', stated: 80,  correct: 77,  isWrong: true  },
  ] },
  { type: 'time-detective', numerator: 1, denominator: 1, timeCards: [
    { n: 7,  fromUnit: 'year', toUnit: 'day', stated: 2555, correct: 2555, isWrong: false },
    { n: 8,  fromUnit: 'year', toUnit: 'day', stated: 2920, correct: 2920, isWrong: false },
    { n: 10, fromUnit: 'year', toUnit: 'day', stated: 3600, correct: 3650, isWrong: true  },
  ] },
  { type: 'time-detective', numerator: 1, denominator: 1, timeCards: [
    { n: 36, fromUnit: 'month', toUnit: 'year', stated: 3, correct: 3, isWrong: false },
    { n: 28, fromUnit: 'day',   toUnit: 'week', stated: 4, correct: 4, isWrong: false },
    { n: 60, fromUnit: 'month', toUnit: 'year', stated: 6, correct: 5, isWrong: true  },
  ] },

  // --- time-machine energy quest ---
  // numerator = years of travel; answer = years × 365 crystals; emoji = destination
  { type: 'time-machine', denominator: 1, numerator: 1,  answer: 365,  emoji: '🔺' },
  { type: 'time-machine', denominator: 1, numerator: 2,  answer: 730,  emoji: '🦕' },
  { type: 'time-machine', denominator: 1, numerator: 3,  answer: 1095, emoji: '🏰' },
  { type: 'time-machine', denominator: 1, numerator: 4,  answer: 1460, emoji: '🚀' },
  { type: 'time-machine', denominator: 1, numerator: 5,  answer: 1825, emoji: '⚓' },
  { type: 'time-machine', denominator: 1, numerator: 6,  answer: 2190, emoji: '🌙' },
  { type: 'time-machine', denominator: 1, numerator: 7,  answer: 2555, emoji: '🗿' },
  { type: 'time-machine', denominator: 1, numerator: 8,  answer: 2920, emoji: '🏛️' },
  { type: 'time-machine', denominator: 1, numerator: 9,  answer: 3285, emoji: '🌋' },
  { type: 'time-machine', denominator: 1, numerator: 10, answer: 3650, emoji: '🤖' },
  { type: 'time-machine', denominator: 1, numerator: 12, answer: 4380, emoji: '🦄' },
  { type: 'time-machine', denominator: 1, numerator: 15, answer: 5475, emoji: '🐉' },
  { type: 'time-machine', denominator: 1, numerator: 18, answer: 6570,  emoji: '🛸' },
  { type: 'time-machine', denominator: 1, numerator: 20, answer: 7300,  emoji: '🏯' },
  { type: 'time-machine', denominator: 1, numerator: 25, answer: 9125,  emoji: '🎪' },
  { type: 'time-machine', denominator: 1, numerator: 30, answer: 10950, emoji: '👽' },
]
