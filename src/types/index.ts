export interface Fraction {
  numerator: number
  denominator: number
}

export interface ExerciseResult {
  exerciseType: 'fraction-bar' | 'pizza' | 'compare' | 'hexagon' | 'grid' | 'identify'
  correct: boolean
  timestamp: number
  question: string
}

export interface ChildProgress {
  uid: string
  name: string
  results: ExerciseResult[]
}
