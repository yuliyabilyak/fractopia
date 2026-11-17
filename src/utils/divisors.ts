/**
 * Pure common-divisor helpers for the shared-keys exercise. Every grading path
 * goes through these. "Common divisor" always means one greater than 1 — 1
 * divides everything, so it never counts as a shared tooth.
 * Runtime imports carry a `.ts` extension so `node --test` can load this file.
 */
import { isPrime } from './primes.ts'

export function gcd(a: number, b: number): number {
  let x = Math.abs(a)
  let y = Math.abs(b)
  while (y !== 0) [x, y] = [y, x % y]
  return x
}

/** Divisors greater than 1, ascending, including n itself: 12 → [2, 3, 4, 6, 12]. */
export function divisorsOf(n: number): number[] {
  const out: number[] = []
  if (!Number.isInteger(n) || n < 2) return out
  for (let d = 2; d <= n; d++) if (n % d === 0) out.push(d)
  return out
}

/** Divisors of both a and b, excluding 1: (12, 18) → [2, 3, 6]. */
export function commonDivisors(a: number, b: number): number[] {
  return divisorsOf(gcd(a, b))
}

/**
 * k fits the lock when they share a divisor greater than 1. The lock number
 * itself only counts when the lock is prime — then its multiples are the only keys.
 */
export function isValidKey(k: number, base: number): boolean {
  if (!Number.isInteger(k) || k < 1) return false
  if (k === base && !isPrime(base)) return false
  return gcd(k, base) > 1
}

export const digitCount = (k: number): number => String(Math.abs(Math.trunc(k))).length

export type KeyFlaw = 'digits' | 'same-as-lock' | 'no-tooth'

/** Why k is not a valid `digits`-digit key for base, or null when it is. */
export function keyFlaw(k: number, base: number, digits: number): KeyFlaw | null {
  if (!Number.isInteger(k) || k < 1 || digitCount(k) !== digits) return 'digits'
  if (isValidKey(k, base)) return null
  return k === base ? 'same-as-lock' : 'no-tooth'
}

/** Every valid key with exactly `digits` digits: (73, 2) → [73]. */
export function availableKeys(base: number, digits: number): number[] {
  const lo = digits === 1 ? 1 : 10 ** (digits - 1)
  const out: number[] = []
  for (let k = lo; k < 10 ** digits; k++) if (isValidKey(k, base)) out.push(k)
  return out
}

/** Keys to collect in build mode: never more than actually exist. */
export function keysNeededFor(base: number, digits: number, requested: number): number {
  return Math.max(1, Math.min(requested, availableKeys(base, digits).length))
}

export const fittingKeys = (candidates: number[], base: number): number[] =>
  candidates.filter(c => isValidKey(c, base))

/** Correct iff the selection is exactly the set of fitting candidates. */
export function isSelectionCorrect(selected: number[], candidates: number[], base: number): boolean {
  const want = new Set(fittingKeys(candidates, base))
  const got = new Set(selected)
  return want.size === got.size && [...want].every(k => got.has(k))
}
