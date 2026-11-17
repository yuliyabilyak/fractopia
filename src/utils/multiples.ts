/**
 * Pure common-multiple helpers for meeting-point. Every grading path goes through
 * these. Runtime imports carry a `.ts` extension so `node --test` can load this file.
 */
import { gcd } from './divisors.ts'

/** Least common multiple: lcm(12, 9) = 36 — the first number both runners land on. */
export const lcm = (a: number, b: number): number => (a / gcd(a, b)) * b

/** Where a runner lands after one more lap. */
export const nextPosition = (position: number, lap: number): number => position + lap

/** Landing spots after each of `laps` laps: (8, 3) → [8, 16, 24]. */
export function lanePositions(lap: number, laps: number): number[] {
  const out: number[] = []
  let p = 0
  for (let i = 0; i < laps; i++) out.push((p = nextPosition(p, lap)))
  return out
}

export const isCommonMultiple = (n: number, a: number, b: number): boolean =>
  Number.isInteger(n) && n > 0 && n % a === 0 && n % b === 0

/** Laps a runner needs to reach `target` (rounded up). */
export const lapsToReach = (lap: number, target: number): number => Math.ceil(target / lap)

/** Multiples of n from n up to `upTo`: (8, 30) → [8, 16, 24]. */
export function firstMultiples(n: number, upTo: number): number[] {
  const out: number[] = []
  if (!Number.isInteger(n) || n < 1) return out
  for (let k = n; k <= upTo; k += n) out.push(k)
  return out
}

/** Chips per rail never exceed this. */
export const RAIL_CHIP_CAP = 24

/** A rail shows n's multiples up to 3 × lcm(a, b) or 24 chips, whichever is smaller. */
export const railEnd = (n: number, a: number, b: number): number => Math.min(3 * lcm(a, b), RAIL_CHIP_CAP * n)

export const railMultiples = (n: number, a: number, b: number): number[] => firstMultiples(n, railEnd(n, a, b))

/** Select mode: exactly `count` picks, each one a common multiple. */
export const isCommonMultipleSelection = (picked: number[], a: number, b: number, count: number): boolean =>
  picked.length === count && new Set(picked).size === count && picked.every(k => isCommonMultiple(k, a, b))
