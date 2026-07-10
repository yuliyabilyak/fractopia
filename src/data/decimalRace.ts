export interface DecimalQuestion {
  numerator: number
  denominator: number
  answer: number
  repeating?: boolean
}

export const DECIMAL_POOL: DecimalQuestion[] = [
  // --- Foothills: halves, quarters, fifths, tenths ---
  { numerator: 1,  denominator: 2,  answer: 0.5 },
  { numerator: 1,  denominator: 4,  answer: 0.25 },
  { numerator: 3,  denominator: 4,  answer: 0.75 },
  { numerator: 1,  denominator: 5,  answer: 0.2 },
  { numerator: 2,  denominator: 5,  answer: 0.4 },
  { numerator: 3,  denominator: 5,  answer: 0.6 },
  { numerator: 1,  denominator: 10, answer: 0.1 },
  { numerator: 3,  denominator: 10, answer: 0.3 },
  { numerator: 4,  denominator: 5,  answer: 0.8 },
  { numerator: 7,  denominator: 10, answer: 0.7 },
  { numerator: 9,  denominator: 10, answer: 0.9 },

  // --- Ridgeline: eighths & twentieths ---
  { numerator: 1,  denominator: 8,  answer: 0.125 },
  { numerator: 3,  denominator: 8,  answer: 0.375 },
  { numerator: 5,  denominator: 8,  answer: 0.625 },
  { numerator: 7,  denominator: 8,  answer: 0.875 },
  { numerator: 1,  denominator: 20, answer: 0.05 },
  { numerator: 3,  denominator: 20, answer: 0.15 },
  { numerator: 7,  denominator: 20, answer: 0.35 },
  { numerator: 9,  denominator: 20, answer: 0.45 },
  { numerator: 11, denominator: 20, answer: 0.55 },
  { numerator: 13, denominator: 20, answer: 0.65 },

  // --- Summit: greater than one whole ---
  { numerator: 5,  denominator: 4,  answer: 1.25 },
  { numerator: 7,  denominator: 4,  answer: 1.75 },
  { numerator: 9,  denominator: 4,  answer: 2.25 },
  { numerator: 11, denominator: 4,  answer: 2.75 },
  { numerator: 9,  denominator: 8,  answer: 1.125 },
  { numerator: 13, denominator: 8,  answer: 1.625 },
  { numerator: 7,  denominator: 5,  answer: 1.4 },
  { numerator: 11, denominator: 5,  answer: 2.2 },
  { numerator: 13, denominator: 5,  answer: 2.6 },
  { numerator: 17, denominator: 10, answer: 1.7 },

  // --- Whirlpool: repeating decimals (rounded to 3 places) ---
  { numerator: 1, denominator: 3, answer: 0.333, repeating: true },
  { numerator: 2, denominator: 3, answer: 0.667, repeating: true },
  { numerator: 1, denominator: 6, answer: 0.167, repeating: true },
  { numerator: 5, denominator: 6, answer: 0.833, repeating: true },
  { numerator: 1, denominator: 9, answer: 0.111, repeating: true },
  { numerator: 2, denominator: 9, answer: 0.222, repeating: true },
  { numerator: 4, denominator: 9, answer: 0.444, repeating: true },
]
