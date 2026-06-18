import { useState, useCallback, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useLang } from '../i18n/LangContext'
import { useProgress } from '../hooks/useProgress'
import FractionBar from '../components/FractionBar'
import PizzaFraction from '../components/PizzaFraction'
import CompareFractions from '../components/CompareFractions'
import HexagonFraction from '../components/HexagonFraction'
import SquareGridFraction from '../components/SquareGridFraction'
import IdentifyFraction from '../components/IdentifyFraction'
import TriangleFraction from '../components/TriangleFraction'
import StarFraction from '../components/StarFraction'
import DiamondFraction from '../components/DiamondFraction'
import NumberLineFraction from '../components/NumberLineFraction'
import EquivalentFractions from '../components/EquivalentFractions'
import FractionSort from '../components/FractionSort'
import type { SortFrac } from '../components/FractionSort'
import HitTarget from '../components/HitTarget'
import type { HitFrac } from '../components/HitTarget'
import TimeFraction from '../components/TimeFraction'
import TimeOperation from '../components/TimeOperation'
import FractionQuantity from '../components/FractionQuantity'
import type { ItemKey } from '../components/FractionQuantity'
import MatchingFractions from '../components/MatchingFractions'
import type { FracPair } from '../components/MatchingFractions'
import FractionTower from '../components/FractionTower'
import IceCreamShop from '../components/IceCreamShop'
import FeedbackBanner from '../components/FeedbackBanner'
import PerfectScoreAnimation from '../components/PerfectScoreAnimation'
import ThemeToggle from '../components/ThemeToggle'
import type { ExerciseResult, Fraction } from '../types'

type ExerciseType = 'bar' | 'pizza' | 'compare' | 'hexagon' | 'grid' | 'identify' | 'triangle' | 'star' | 'diamond' | 'number-line' | 'equivalent' | 'sort' | 'hit-target' | 'time-fraction' | 'fraction-quantity' | 'time-operation' | 'matching' | 'fraction-tower' | 'ice-cream'

interface Exercise {
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
}

const SESSION_SIZE = 12

const ALL_EXERCISES: Exercise[] = [
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

  // --- shade the triangle ---
  { type: 'triangle', denominator: 3, numerator: 1 },
  { type: 'triangle', denominator: 3, numerator: 2 },
  { type: 'triangle', denominator: 6, numerator: 1 },
  { type: 'triangle', denominator: 6, numerator: 2 },
  { type: 'triangle', denominator: 6, numerator: 4 },
  { type: 'triangle', denominator: 6, numerator: 5 },
  { type: 'triangle', denominator: 4, numerator: 1 },
  { type: 'triangle', denominator: 4, numerator: 3 },

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

  // --- time fractions ---
  // hour: answer in minutes (×60)
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
  // day: answer in hours (×24)
  { type: 'time-fraction', numerator: 1, denominator: 2,  unit: 'day', answer: 12 },
  { type: 'time-fraction', numerator: 1, denominator: 4,  unit: 'day', answer: 6  },
  { type: 'time-fraction', numerator: 3, denominator: 4,  unit: 'day', answer: 18 },
  { type: 'time-fraction', numerator: 1, denominator: 3,  unit: 'day', answer: 8  },
  { type: 'time-fraction', numerator: 2, denominator: 3,  unit: 'day', answer: 16 },
  { type: 'time-fraction', numerator: 1, denominator: 6,  unit: 'day', answer: 4  },
  { type: 'time-fraction', numerator: 1, denominator: 8,  unit: 'day', answer: 3  },
  { type: 'time-fraction', numerator: 3, denominator: 8,  unit: 'day', answer: 9  },
  { type: 'time-fraction', numerator: 5, denominator: 8,  unit: 'day', answer: 15 },
  // week: answer in days (×7)
  { type: 'time-fraction', numerator: 1, denominator: 7,  unit: 'week', answer: 1 },
  { type: 'time-fraction', numerator: 2, denominator: 7,  unit: 'week', answer: 2 },
  { type: 'time-fraction', numerator: 3, denominator: 7,  unit: 'week', answer: 3 },
  { type: 'time-fraction', numerator: 4, denominator: 7,  unit: 'week', answer: 4 },
  { type: 'time-fraction', numerator: 5, denominator: 7,  unit: 'week', answer: 5 },

  // --- hit the target ---
  // target 1/2: valid pairs → 1/3+1/6, 3/8+1/8, 5/12+1/12
  { type: 'hit-target', numerator: 1, denominator: 2,
    target: {n:1,d:2},
    tiles: [{n:1,d:3},{n:1,d:6},{n:3,d:8},{n:1,d:8},{n:5,d:12},{n:1,d:12},{n:1,d:4},{n:2,d:5}] },
  // target 3/4: valid pairs → 1/4+1/2, 1/8+5/8, 1/3+5/12
  { type: 'hit-target', numerator: 3, denominator: 4,
    target: {n:3,d:4},
    tiles: [{n:1,d:4},{n:1,d:2},{n:1,d:8},{n:5,d:8},{n:1,d:3},{n:5,d:12},{n:1,d:6},{n:3,d:8}] },
  // target 2/3: valid pairs → 1/6+1/2, 1/4+5/12, 1/12+7/12
  { type: 'hit-target', numerator: 2, denominator: 3,
    target: {n:2,d:3},
    tiles: [{n:1,d:6},{n:1,d:2},{n:1,d:4},{n:5,d:12},{n:1,d:12},{n:7,d:12},{n:1,d:3},{n:1,d:8}] },
  // target 5/6: valid pairs → 1/2+1/3, 1/6+2/3, 1/4+7/12, 3/4+1/12
  { type: 'hit-target', numerator: 5, denominator: 6,
    target: {n:5,d:6},
    tiles: [{n:1,d:2},{n:1,d:3},{n:1,d:6},{n:2,d:3},{n:1,d:4},{n:7,d:12},{n:3,d:4},{n:1,d:12}] },
  // target 7/8: valid pairs → 1/2+3/8, 1/4+5/8, 1/8+3/4
  { type: 'hit-target', numerator: 7, denominator: 8,
    target: {n:7,d:8},
    tiles: [{n:1,d:2},{n:3,d:8},{n:1,d:4},{n:5,d:8},{n:1,d:8},{n:3,d:4},{n:1,d:3},{n:1,d:6}] },
  // target 5/12: valid pairs → 1/4+1/6, 1/3+1/12, 2/12+3/12 (=1/6+1/4 already)
  { type: 'hit-target', numerator: 5, denominator: 12,
    target: {n:5,d:12},
    tiles: [{n:1,d:4},{n:1,d:6},{n:1,d:3},{n:1,d:12},{n:1,d:2},{n:1,d:8},{n:3,d:8},{n:2,d:3}] },
  // target 7/12: valid pairs → 1/4+1/3, 1/12+1/2, 5/12+1/6
  { type: 'hit-target', numerator: 7, denominator: 12,
    target: {n:7,d:12},
    tiles: [{n:1,d:4},{n:1,d:3},{n:1,d:12},{n:1,d:2},{n:5,d:12},{n:1,d:6},{n:1,d:8},{n:3,d:8}] },

  // --- fraction sort ---
  { type: 'sort', numerator: 0, denominator: 1, fractions: [{n:1,d:4},{n:1,d:3},{n:1,d:2},{n:2,d:3}] },
  { type: 'sort', numerator: 0, denominator: 1, fractions: [{n:1,d:6},{n:1,d:4},{n:1,d:3},{n:1,d:2}] },
  { type: 'sort', numerator: 0, denominator: 1, fractions: [{n:2,d:3},{n:3,d:4},{n:5,d:6},{n:7,d:8}] },
  { type: 'sort', numerator: 0, denominator: 1, fractions: [{n:1,d:4},{n:2,d:5},{n:1,d:2},{n:3,d:4}] },
  { type: 'sort', numerator: 0, denominator: 1, fractions: [{n:1,d:3},{n:2,d:5},{n:1,d:2},{n:3,d:5}] },
  { type: 'sort', numerator: 0, denominator: 1, fractions: [{n:3,d:8},{n:1,d:2},{n:5,d:8},{n:3,d:4}] },
  { type: 'sort', numerator: 0, denominator: 1, fractions: [{n:1,d:3},{n:3,d:8},{n:5,d:12},{n:1,d:2}] },
  // 5-fraction sets
  { type: 'sort', numerator: 0, denominator: 1, fractions: [{n:1,d:5},{n:1,d:4},{n:1,d:3},{n:2,d:5},{n:1,d:2}] },
  { type: 'sort', numerator: 0, denominator: 1, fractions: [{n:1,d:2},{n:2,d:3},{n:3,d:4},{n:5,d:6},{n:7,d:8}] },
  // unit fractions: bigger denominator = smaller value (counterintuitive!)
  { type: 'sort', numerator: 0, denominator: 1, fractions: [{n:1,d:8},{n:1,d:6},{n:1,d:4},{n:1,d:3},{n:1,d:2}] },

  // --- equivalent fractions ---
  // expand: simple → more slices
  { type: 'equivalent', numerator: 1, denominator: 2, leftN: 1, leftD: 2, rightD: 4 },
  { type: 'equivalent', numerator: 1, denominator: 2, leftN: 1, leftD: 2, rightD: 6 },
  { type: 'equivalent', numerator: 1, denominator: 2, leftN: 1, leftD: 2, rightD: 8 },
  { type: 'equivalent', numerator: 1, denominator: 3, leftN: 1, leftD: 3, rightD: 6 },
  { type: 'equivalent', numerator: 2, denominator: 3, leftN: 2, leftD: 3, rightD: 6 },
  { type: 'equivalent', numerator: 1, denominator: 4, leftN: 1, leftD: 4, rightD: 8 },
  { type: 'equivalent', numerator: 3, denominator: 4, leftN: 3, leftD: 4, rightD: 8 },
  { type: 'equivalent', numerator: 1, denominator: 3, leftN: 1, leftD: 3, rightD: 9 },
  { type: 'equivalent', numerator: 2, denominator: 3, leftN: 2, leftD: 3, rightD: 9 },
  // simplify: more slices → fewer
  { type: 'equivalent', numerator: 2, denominator: 4, leftN: 2, leftD: 4, rightD: 2 },
  { type: 'equivalent', numerator: 4, denominator: 6, leftN: 4, leftD: 6, rightD: 3 },
  { type: 'equivalent', numerator: 6, denominator: 8, leftN: 6, leftD: 8, rightD: 4 },
  { type: 'equivalent', numerator: 2, denominator: 6, leftN: 2, leftD: 6, rightD: 3 },
  { type: 'equivalent', numerator: 4, denominator: 8, leftN: 4, leftD: 8, rightD: 2 },
  { type: 'equivalent', numerator: 3, denominator: 9, leftN: 3, leftD: 9, rightD: 3 },
  { type: 'equivalent', numerator: 6, denominator: 9, leftN: 6, leftD: 9, rightD: 3 },

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

  // --- time operations ---
  // add: n1/d1 + n2/d2 of an hour → minutes
  { type: 'time-operation', operation: 'add', numerator: 1, denominator: 4, n2: 1, d2: 4,  answer: 30 },
  { type: 'time-operation', operation: 'add', numerator: 1, denominator: 3, n2: 1, d2: 6,  answer: 30 },
  { type: 'time-operation', operation: 'add', numerator: 1, denominator: 2, n2: 1, d2: 4,  answer: 45 },
  { type: 'time-operation', operation: 'add', numerator: 1, denominator: 4, n2: 1, d2: 6,  answer: 25 },
  { type: 'time-operation', operation: 'add', numerator: 1, denominator: 3, n2: 1, d2: 3,  answer: 40 },
  { type: 'time-operation', operation: 'add', numerator: 1, denominator: 2, n2: 1, d2: 6,  answer: 40 },
  { type: 'time-operation', operation: 'add', numerator: 1, denominator: 4, n2: 1, d2: 12, answer: 20 },
  // subtract: n1/d1 - n2/d2 of an hour → minutes
  { type: 'time-operation', operation: 'subtract', numerator: 1, denominator: 2, n2: 1, d2: 4, answer: 15 },
  { type: 'time-operation', operation: 'subtract', numerator: 3, denominator: 4, n2: 1, d2: 4, answer: 30 },
  { type: 'time-operation', operation: 'subtract', numerator: 2, denominator: 3, n2: 1, d2: 3, answer: 20 },
  { type: 'time-operation', operation: 'subtract', numerator: 1, denominator: 2, n2: 1, d2: 6, answer: 20 },
  { type: 'time-operation', operation: 'subtract', numerator: 3, denominator: 4, n2: 1, d2: 2, answer: 15 },
  { type: 'time-operation', operation: 'subtract', numerator: 2, denominator: 3, n2: 1, d2: 6, answer: 30 },
  { type: 'time-operation', operation: 'subtract', numerator: 5, denominator: 6, n2: 1, d2: 3, answer: 30 },
  // divide: (n/d of an hour) ÷ divisor → minutes each
  { type: 'time-operation', operation: 'divide', numerator: 1, denominator: 2, divisor: 2, answer: 15 },
  { type: 'time-operation', operation: 'divide', numerator: 1, denominator: 2, divisor: 3, answer: 10 },
  { type: 'time-operation', operation: 'divide', numerator: 3, denominator: 4, divisor: 3, answer: 15 },
  { type: 'time-operation', operation: 'divide', numerator: 1, denominator: 3, divisor: 2, answer: 10 },
  { type: 'time-operation', operation: 'divide', numerator: 2, denominator: 3, divisor: 4, answer: 10 },
  { type: 'time-operation', operation: 'divide', numerator: 1, denominator: 4, divisor: 3, answer:  5 },
  { type: 'time-operation', operation: 'divide', numerator: 5, denominator: 6, divisor: 5, answer: 10 },

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

  // --- fraction tower ---
  // thirds level
  { type: 'fraction-tower', numerator: 0, denominator: 1, towerTiles: [
    {n:1,d:3},{n:1,d:3},{n:1,d:3},{n:2,d:3},
  ]},
  { type: 'fraction-tower', numerator: 0, denominator: 1, towerTiles: [
    {n:1,d:3},{n:1,d:3},{n:2,d:3},{n:2,d:3},
  ]},
  { type: 'fraction-tower', numerator: 0, denominator: 1, towerTiles: [
    {n:1,d:3},{n:1,d:3},{n:1,d:3},{n:1,d:3},{n:2,d:3},
  ]},
  // quarters level
  { type: 'fraction-tower', numerator: 0, denominator: 1, towerTiles: [
    {n:1,d:4},{n:1,d:4},{n:1,d:4},{n:1,d:4},{n:3,d:4},{n:1,d:2},
  ]},
  { type: 'fraction-tower', numerator: 0, denominator: 1, towerTiles: [
    {n:1,d:4},{n:1,d:4},{n:1,d:2},{n:3,d:4},
  ]},
  { type: 'fraction-tower', numerator: 0, denominator: 1, towerTiles: [
    {n:1,d:4},{n:1,d:4},{n:1,d:4},{n:1,d:4},{n:1,d:2},
  ]},
  // mixed level
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

  // --- ice cream shop (improper fractions → whole numbers) ---
  { type: 'ice-cream', denominator: 2, numerator: 4  },   // 4/2  = 2
  { type: 'ice-cream', denominator: 3, numerator: 6  },   // 6/3  = 2
  { type: 'ice-cream', denominator: 4, numerator: 8  },   // 8/4  = 2
  { type: 'ice-cream', denominator: 2, numerator: 6  },   // 6/2  = 3
  { type: 'ice-cream', denominator: 3, numerator: 9  },   // 9/3  = 3
  { type: 'ice-cream', denominator: 4, numerator: 12 },   // 12/4 = 3
  { type: 'ice-cream', denominator: 2, numerator: 8  },   // 8/2  = 4
  { type: 'ice-cream', denominator: 3, numerator: 12 },   // 12/3 = 4
  { type: 'ice-cream', denominator: 4, numerator: 16 },   // 16/4 = 4
  { type: 'ice-cream', denominator: 2, numerator: 10 },   // 10/2 = 5
  { type: 'ice-cream', denominator: 3, numerator: 15 },   // 15/3 = 5
  { type: 'ice-cream', denominator: 4, numerator: 20 },   // 20/4 = 5

  // --- compare ---
  { type: 'compare', denominator: 4, numerator: 1, left: { numerator: 1, denominator: 2 }, right: { numerator: 1, denominator: 4 } },
  { type: 'compare', denominator: 4, numerator: 1, left: { numerator: 2, denominator: 6 }, right: { numerator: 1, denominator: 3 } },
  { type: 'compare', denominator: 4, numerator: 1, left: { numerator: 3, denominator: 4 }, right: { numerator: 2, denominator: 3 } },
  { type: 'compare', denominator: 4, numerator: 1, left: { numerator: 1, denominator: 3 }, right: { numerator: 2, denominator: 5 } },
  { type: 'compare', denominator: 4, numerator: 1, left: { numerator: 3, denominator: 12 }, right: { numerator: 1, denominator: 4 } },
  { type: 'compare', denominator: 4, numerator: 1, left: { numerator: 5, denominator: 8 }, right: { numerator: 3, denominator: 4 } },
  { type: 'compare', denominator: 4, numerator: 1, left: { numerator: 2, denominator: 5 }, right: { numerator: 3, denominator: 10 } },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function compareAnswer(ex: Exercise, answer: 'left' | 'right' | 'equal'): boolean {
  if (!ex.left || !ex.right) return false
  const lv = ex.left.numerator / ex.left.denominator
  const rv = ex.right.numerator / ex.right.denominator
  if (lv > rv) return answer === 'left'
  if (rv > lv) return answer === 'right'
  return answer === 'equal'
}

function toExerciseType(type: ExerciseType): ExerciseResult['exerciseType'] {
  if (type === 'bar')      return 'fraction-bar'
  if (type === 'grid')     return 'grid'
  if (type === 'hexagon')  return 'hexagon'
  if (type === 'identify') return 'identify'
  if (type === 'compare')  return 'compare'
  if (type === 'triangle')    return 'triangle'
  if (type === 'star')        return 'star'
  if (type === 'diamond')     return 'diamond'
  if (type === 'number-line') return 'number-line'
  if (type === 'equivalent')  return 'equivalent'
  if (type === 'sort')        return 'sort'
  if (type === 'hit-target')   return 'hit-target'
  if (type === 'time-fraction')     return 'time-fraction'
  if (type === 'fraction-quantity') return 'fraction-quantity'
  if (type === 'time-operation')    return 'time-operation'
  if (type === 'matching')          return 'matching'
  if (type === 'fraction-tower')    return 'fraction-tower'
  if (type === 'ice-cream')         return 'ice-cream'
  return 'pizza'
}

export default function Fractions() {
  const [sessionKey, setSessionKey] = useState(0)
  const session = useMemo(() => shuffle(ALL_EXERCISES).slice(0, SESSION_SIZE), [sessionKey])
  const [index, setIndex] = useState(0)
  const [feedback, setFeedback] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const { user } = useAuth()
  const { saveResult } = useProgress(user?.uid)
  const { t } = useLang()

  const current = session[index]

  const handleAnswer = useCallback((correct: boolean) => {
    setFeedback(correct)
    if (correct) setScore((s) => s + 1)
    const result: ExerciseResult = {
      exerciseType: toExerciseType(current.type),
      correct,
      timestamp: Date.now(),
      question: current.type === 'time-fraction' && current.unit
        ? `time-fraction ${current.numerator}/${current.denominator} of ${current.unit}`
        : current.type === 'hit-target' && current.target
        ? `hit-target ${current.target.n}/${current.target.d}`
        : current.type === 'sort' && current.fractions
        ? `sort ${current.fractions.map(f => `${f.n}/${f.d}`).join(' ')}`
        : current.type === 'fraction-quantity' && current.quantity !== undefined
        ? `fraction-quantity ${current.numerator}/${current.denominator} of ${current.quantity}`
        : current.type === 'time-operation' && current.operation
        ? current.operation === 'divide'
          ? `time-op-divide ${current.numerator}/${current.denominator} / ${current.divisor}`
          : `time-op-${current.operation} ${current.numerator}/${current.denominator} ${current.n2}/${current.d2}`
        : current.type === 'matching' && current.pairs
        ? `matching ${current.pairs.map(p => `${p.left.n}/${p.left.d}`).join(' ')}`
        : current.type === 'fraction-tower' && current.towerTiles
        ? `fraction-tower ${current.towerTiles.map(t => `${t.n}/${t.d}`).join(' ')}`
        : `${current.type} ${current.numerator}/${current.denominator}`,
    }
    saveResult(result)
  }, [current, saveResult])

  const handleCompareAnswer = useCallback((answer: 'left' | 'right' | 'equal') => {
    handleAnswer(compareAnswer(current, answer))
  }, [current, handleAnswer])

  const next = () => {
    setFeedback(null)
    setIndex((i) => i + 1)
  }

  if (index >= session.length) {
    const perfect = score === session.length
    return (
      <div className="center-page">
        {perfect ? (
          <PerfectScoreAnimation />
        ) : (
          <>
            <h2>{t('doneTitle')}</h2>
            <p dangerouslySetInnerHTML={{ __html: t('doneScore', { score, total: session.length }).replace(/(\d+\/\d+)/, '<strong>$1</strong>') }} />
          </>
        )}
        <button className="btn-start" onClick={() => { setSessionKey(k => k + 1); setIndex(0); setScore(0); setFeedback(null) }}>
          {t('playAgain')}
        </button>
      </div>
    )
  }

  return (
    <div className="fractions-page">
      <div className="progress-bar-wrapper">
        <div className="progress-bar-fill" style={{ width: `${(index / session.length) * 100}%` }} />
      </div>
      <div className="fractions-header">
        <p className="exercise-counter">{t('counter', { i: index + 1, total: session.length, score })}</p>
        <ThemeToggle />
      </div>

      {current.type === 'bar' && feedback === null && (
        <FractionBar key={index} denominator={current.denominator} targetNumerator={current.numerator} onAnswer={handleAnswer} />
      )}
      {current.type === 'pizza' && feedback === null && (
        <PizzaFraction key={index} denominator={current.denominator} targetNumerator={current.numerator} onAnswer={handleAnswer} />
      )}
      {current.type === 'hexagon' && feedback === null && (
        <HexagonFraction key={index} targetNumerator={current.numerator} onAnswer={handleAnswer} />
      )}
      {current.type === 'grid' && feedback === null && current.cols && current.rows && (
        <SquareGridFraction key={index} cols={current.cols} rows={current.rows} targetNumerator={current.numerator} onAnswer={handleAnswer} />
      )}
      {current.type === 'triangle' && feedback === null && (
        <TriangleFraction key={index} denominator={current.denominator} targetNumerator={current.numerator} onAnswer={handleAnswer} />
      )}
      {current.type === 'star' && feedback === null && (
        <StarFraction key={index} targetNumerator={current.numerator} onAnswer={handleAnswer} />
      )}
      {current.type === 'diamond' && feedback === null && (
        <DiamondFraction key={index} targetNumerator={current.numerator} onAnswer={handleAnswer} />
      )}
      {current.type === 'identify' && feedback === null && current.shape && current.choices && current.correctIndex !== undefined && (
        <IdentifyFraction
          key={index}
          shape={current.shape}
          denominator={current.denominator}
          numerator={current.numerator}
          cols={current.cols}
          rows={current.rows}
          choices={current.choices}
          correctIndex={current.correctIndex}
          onAnswer={handleAnswer}
        />
      )}
      {current.type === 'time-fraction' && feedback === null && current.unit && current.answer !== undefined && (
        <TimeFraction key={index} numerator={current.numerator} denominator={current.denominator} unit={current.unit} answer={current.answer} onAnswer={handleAnswer} />
      )}
      {current.type === 'hit-target' && feedback === null && current.target && current.tiles && (
        <HitTarget key={index} target={current.target} tiles={current.tiles} onAnswer={handleAnswer} />
      )}
      {current.type === 'sort' && feedback === null && current.fractions && (
        <FractionSort key={index} fractions={current.fractions} onAnswer={handleAnswer} />
      )}
      {current.type === 'equivalent' && feedback === null && current.leftN !== undefined && current.leftD !== undefined && current.rightD !== undefined && (
        <EquivalentFractions key={index} leftNumerator={current.leftN} leftDenominator={current.leftD} rightDenominator={current.rightD} onAnswer={handleAnswer} />
      )}
      {current.type === 'number-line' && feedback === null && (
        <NumberLineFraction key={index} numerator={current.numerator} denominator={current.denominator} onAnswer={handleAnswer} />
      )}
      {current.type === 'time-operation' && feedback === null && current.operation && current.answer !== undefined && (
        <TimeOperation key={index} numerator={current.numerator} denominator={current.denominator} operation={current.operation} n2={current.n2} d2={current.d2} divisor={current.divisor} answer={current.answer} onAnswer={handleAnswer} />
      )}
      {current.type === 'fraction-quantity' && feedback === null && current.quantity !== undefined && current.itemKey && current.emoji && current.answer !== undefined && (
        <FractionQuantity key={index} numerator={current.numerator} denominator={current.denominator} quantity={current.quantity} itemKey={current.itemKey} emoji={current.emoji} answer={current.answer} onAnswer={handleAnswer} />
      )}
      {current.type === 'matching' && feedback === null && current.pairs && (
        <MatchingFractions key={index} pairs={current.pairs} onAnswer={handleAnswer} />
      )}
      {current.type === 'fraction-tower' && feedback === null && current.towerTiles && (
        <FractionTower key={index} tiles={current.towerTiles} onAnswer={handleAnswer} />
      )}
      {current.type === 'ice-cream' && feedback === null && (
        <IceCreamShop key={index} numerator={current.numerator} denominator={current.denominator} onAnswer={handleAnswer} />
      )}
      {current.type === 'compare' && feedback === null && current.left && current.right && (
        <CompareFractions key={index} left={current.left} right={current.right} onAnswer={handleCompareAnswer} />
      )}

      <FeedbackBanner correct={feedback} onNext={next} />
    </div>
  )
}
