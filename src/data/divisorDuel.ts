// Divisor Duel entries — greatest common divisor, textbook "D (84; 96)".
// Spread into ALL_EXERCISES; kept in their own module because exercises.ts pulls
// in component types, which `node --test` cannot load. Pure — no runtime imports.
//
// The answer is never stored: it is always gcdMany(ddNumbers). Select-mode
// `correctIndex` is the one exception, and divisorDuel.test.ts checks it against
// the helper for every entry. Distractors (frozen after a seeded shuffle):
//   a smaller common divisor · the smallest number · the LCM (small pairs only)
//   or the gcd of just two numbers (triples) · a number dividing only one of them.

export interface DivisorDuelEntry {
  type: 'divisor-duel'
  /** mirrors ddNumbers[0] as n/1, like time-machine */
  numerator: number
  denominator: 1
  mode: 'select' | 'generate'
  ddNumbers: number[]
  ddChoices?: number[]
  correctIndex?: number
}

const select = (ddNumbers: number[], ddChoices: number[], correctIndex: number): DivisorDuelEntry =>
  ({ type: 'divisor-duel', numerator: ddNumbers[0], denominator: 1, mode: 'select', ddNumbers, ddChoices, correctIndex })

const duel = (...ddNumbers: number[]): DivisorDuelEntry =>
  ({ type: 'divisor-duel', numerator: ddNumbers[0], denominator: 1, mode: 'generate', ddNumbers })

export const DIVISOR_DUEL_EXERCISES: DivisorDuelEntry[] = [
  // Level 1: pairs up to 40, mostly select
  select([6, 8], [24, 1, 2, 6], 2),
  select([12, 28], [4, 2, 12, 84], 0),
  select([8, 40], [4, 8, 40, 10], 1),
  duel(18, 36),
  select([14, 42], [7, 42, 14, 21], 2),
  duel(9, 12),
  select([12, 16], [2, 12, 4, 48], 2),
  select([16, 27], [3, 16, 1, 2], 2), // answer 1: only 1 is shared
  select([24, 28], [4, 2, 24, 168], 0),
  duel(32, 40),

  // Level 2: larger pairs up to ~250, mostly duel
  select([84, 96], [84, 24, 6, 12], 3),
  duel(120, 128),
  duel(78, 90),
  duel(108, 135),
  duel(147, 224),
  select([8, 64], [4, 16, 64, 8], 3),
  select([54, 60], [3, 54, 6, 18], 2),
  duel(96, 168),
  duel(84, 196),
  duel(155, 248),

  // Level 3: small triples
  select([12, 32, 44], [4, 2, 3, 12], 0),
  duel(36, 54, 60),
  duel(28, 42, 70),
  duel(18, 54, 72),
  duel(28, 35, 84),
  select([24, 36, 60], [12, 6, 24, 10], 0),

  // Level 4: large triples
  select([60, 96, 144], [60, 10, 6, 12], 3),
  duel(48, 96, 112),
  duel(72, 120, 144),
  duel(12, 180, 140),
  duel(108, 252, 324),
]
