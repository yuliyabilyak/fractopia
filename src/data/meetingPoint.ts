// Meeting Point entries — least common multiple, textbook "n (12; 9)".
// Spread into ALL_EXERCISES; kept in their own module so `node --test` can check
// them (exercises.ts pulls in component types). Pure — no runtime imports.
//
// The answer is never stored: it is always lcm(mpA, mpB). Select-mode
// `correctIndex` is the one exception, and meetingPoint.test.ts checks it against
// the helper. Distractors (seeded shuffle, then frozen):
//   the product a·b (when it isn't the lcm and fits 3 digits) · a later common
//   multiple (2·lcm) · the larger number or the sum · a multiple of only one ·
//   the gcd when it is a plausible slip.

export interface MeetingPointEntry {
  type: 'meeting-point'
  /** numerator / denominator mirror mpA / mpB — the base fields mean nothing here */
  numerator: number
  denominator: number
  mode: 'select' | 'generate'
  mpA: number
  mpB: number
  mpChoices?: number[]
  correctIndex?: number
}

const select = (mpA: number, mpB: number, mpChoices: number[], correctIndex: number): MeetingPointEntry =>
  ({ type: 'meeting-point', numerator: mpA, denominator: mpB, mode: 'select', mpA, mpB, mpChoices, correctIndex })

const run = (mpA: number, mpB: number): MeetingPointEntry =>
  ({ type: 'meeting-point', numerator: mpA, denominator: mpB, mode: 'generate', mpA, mpB })

export const MEETING_POINT_EXERCISES: MeetingPointEntry[] = [
  // Level 1: lcm is the product. (1; 8) teaches that a lap-1 runner lands everywhere.
  select(2, 3, [6, 4, 12, 3], 0),
  select(1, 8, [9, 7, 16, 8], 3),
  select(2, 7, [28, 14, 7, 12], 1),
  run(3, 5),
  select(3, 8, [48, 24, 21, 8], 1),

  // Level 2: shared divisors make the lcm smaller than the product (except 4; 5)
  select(4, 5, [5, 40, 20, 16], 2),
  select(6, 9, [9, 54, 18, 36], 2),
  select(8, 12, [12, 48, 96, 24], 3),
  run(18, 24),
  select(32, 48, [64, 192, 96, 48], 2),

  // Level 3: mostly run
  select(12, 9, [36, 12, 108, 72], 0),
  run(27, 18),
  run(21, 9),
  run(42, 12),
  run(30, 18),

  // Level 4: bigger laps, mostly run
  select(12, 15, [120, 15, 60, 180], 2),
  run(20, 25),
  run(24, 36),
  run(48, 72),
  run(36, 96),
]
