// Multiple Magnet entries — common multiples, textbook "Najdi tři společné násobky".
// Spread into ALL_EXERCISES; kept in their own module so `node --test` can check
// them (exercises.ts pulls in component types). Pure — no runtime imports.
//
// No answer list is stored: many answers are valid, and grading always calls
// isCommonMultiple. Select grids hold exactly 3 common multiples (lcm, 2·lcm, 3·lcm),
// the three meeting points the rails show (rails stop at 3·lcm), plus decoys:
// the sum · neighbours of a valid multiple · multiples of only one number ·
// a common divisor mistaken for a multiple. Order is a frozen seeded shuffle.

export interface MultipleMagnetEntry {
  type: 'multiple-magnet'
  /** numerator / denominator mirror mmA / mmB — the base fields mean nothing here */
  numerator: number
  denominator: number
  mode: 'select' | 'generate'
  mmA: number
  mmB: number
  mmCount: 3
  mmCandidates?: number[]
}

const select = (mmA: number, mmB: number, mmCandidates: number[]): MultipleMagnetEntry =>
  ({ type: 'multiple-magnet', numerator: mmA, denominator: mmB, mode: 'select', mmA, mmB, mmCount: 3, mmCandidates })

const build = (mmA: number, mmB: number): MultipleMagnetEntry =>
  ({ type: 'multiple-magnet', numerator: mmA, denominator: mmB, mode: 'generate', mmA, mmB, mmCount: 3 })

export const MULTIPLE_MAGNET_EXERCISES: MultipleMagnetEntry[] = [
  // Level 1: one number divides the other — the answers are just the bigger one's multiples
  select(1, 6, [10, 18, 6, 7, 13, 11, 12, 5]),
  select(21, 7, [20, 49, 21, 22, 63, 35, 42, 7, 28]),
  select(12, 3, [15, 13, 21, 36, 27, 12, 24, 11]),
  build(8, 2),

  // Level 2: no shared divisor, so lcm = the product
  select(5, 7, [65, 70, 105, 34, 63, 36, 12, 75, 35]),
  select(7, 6, [42, 90, 13, 77, 41, 78, 43, 126, 84]),
  select(8, 3, [11, 25, 23, 24, 48, 72, 33, 40]),
  // the rails' 24-chip cap shows only 2 meeting points here, so these are build-only:
  // the third common multiple has to come from the digit cards
  build(10, 9),
  build(12, 5),
  build(4, 9),

  // Level 3: a shared divisor makes lcm smaller than the product
  select(8, 12, [24, 20, 48, 72, 40, 25, 56, 36, 23]),
  build(15, 20),
  select(9, 24, [71, 73, 135, 153, 72, 144, 216, 33]),
  build(18, 45),
  build(6, 10),
  build(14, 21),

  // Level 4 (stretch): larger pairs
  select(24, 36, [168, 144, 72, 71, 216, 60, 120, 108, 73]),
  build(28, 42),
  build(35, 49),
]
