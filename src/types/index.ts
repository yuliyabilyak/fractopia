export interface Fraction {
  numerator: number
  denominator: number
}

export interface ExerciseResult {
  exerciseType: 'fraction-bar' | 'pizza' | 'compare' | 'hexagon' | 'grid' | 'identify' | 'triangle' | 'star' | 'diamond' | 'number-line' | 'equivalent' | 'sort' | 'hit-target' | 'time-fraction' | 'fraction-quantity' | 'time-operation' | 'matching' | 'fraction-tower' | 'ice-cream' | 'train' | 'rocket' | 'monster' | 'detective'
  correct: boolean
  timestamp: number
  question: string
}

export interface ChildProgress {
  uid: string
  name: string
  results: ExerciseResult[]
}
