export interface Fraction {
  numerator: number
  denominator: number
}

export interface ExerciseResult {
  exerciseType: 'fraction-bar' | 'pizza' | 'compare' | 'compare-same' | 'compare-same-num' | 'hexagon' | 'grid' | 'identify' | 'triangle' | 'star' | 'diamond' | 'number-line' | 'equivalent' | 'sort' | 'hit-target' | 'time-fraction' | 'fraction-quantity' | 'time-operation' | 'matching' | 'fraction-tower' | 'ice-cream' | 'train' | 'rocket' | 'monster' | 'detective' | 'balance' | 'time-machine' | 'time-detective'
  correct: boolean
  timestamp: number
  question: string
}

export interface LeaderboardEntry {
  nickname: string
  score: number
  correctCount: number
  totalCount: number
  date: { toDate(): Date }
}

export interface ChildProgress {
  uid: string
  name: string
  results: ExerciseResult[]
}
