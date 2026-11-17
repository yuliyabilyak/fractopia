/**
 * Pure prime-factorization helpers. Every prime-forge grading path goes through
 * these, and Number Workshop re-exports `isPrime` / `primeFactors` from here.
 * No runtime imports, so `node --test` can load this file directly.
 */

export type PrimeConstraint = 'one-prime' | 'two-same' | 'three-different' | 'four-different'

export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false
  for (let k = 2; k * k <= n; k++) if (n % k === 0) return false
  return true
}

/** Prime factors in ascending order: 72 → [2, 2, 2, 3, 3]. Empty for n < 2. */
export function primeFactors(n: number): number[] {
  const out: number[] = []
  if (!Number.isInteger(n) || n < 2) return out
  let m = n
  for (let k = 2; k * k <= m; k++) while (m % k === 0) { out.push(k); m /= k }
  if (m > 1) out.push(m)
  return out
}

export const productOf = (xs: number[]): number => xs.reduce((p, x) => p * x, 1)

/** Ways to strike n into two multipliers, both ≥ 2, smaller first: 24 → [2,12], [3,8], [4,6]. */
export function splitPairs(n: number): [number, number][] {
  const out: [number, number][] = []
  for (let a = 2; a * a <= n; a++) if (n % a === 0) out.push([a, n / a])
  return out
}

/** True when every factor is prime and they multiply to `target`. Order is irrelevant. */
export function isPrimeFactorization(factors: number[], target: number): boolean {
  return factors.length > 0 && factors.every(isPrime) && productOf(factors) === target
}

/** Why a factor list is not the prime factorization of `target`, or null when it is. */
export type FactorFlaw =
  | { kind: 'composite'; value: number }
  | { kind: 'product'; value: number }

export function factorizationFlaw(factors: number[], target: number): FactorFlaw | null {
  const composite = factors.find(f => !isPrime(f))
  if (composite !== undefined) return { kind: 'composite', value: composite }
  const p = productOf(factors)
  if (p !== target) return { kind: 'product', value: p }
  return null
}

export function satisfiesConstraint(n: number, constraint: PrimeConstraint): boolean {
  const f = primeFactors(n)
  const distinct = new Set(f).size
  switch (constraint) {
    case 'one-prime':       return f.length >= 2 && distinct === 1
    case 'two-same':        return f.length === 2 && distinct === 1
    case 'three-different': return f.length === 3 && distinct === 3
    case 'four-different':  return f.length === 4 && distinct === 4
  }
}

export interface FindRule {
  constraint: PrimeConstraint
  min?: number
  max: number
}

export type FindFlaw = 'too-small' | 'too-big' | 'rule'

/** Why `n` fails a find-with-constraint rule, or null when it passes. */
export function findFlaw(n: number, rule: FindRule): FindFlaw | null {
  if (n > rule.max) return 'too-big'
  if (rule.min !== undefined && n < rule.min) return 'too-small'
  return satisfiesConstraint(n, rule.constraint) ? null : 'rule'
}

/** Smallest number that passes the rule, or null if none exists. */
export function findExample(rule: FindRule): number | null {
  for (let n = Math.max(2, rule.min ?? 2); n <= rule.max; n++) if (findFlaw(n, rule) === null) return n
  return null
}

// ── Factor trees ─────────────────────────────────────────────────────────────

export interface TreeNode {
  value: number
  kids?: [TreeNode, TreeNode]
}

/** Nodes are addressed by path: "" is the root, "0"/"1" its children, "01" … */
export function splitAt(node: TreeNode, path: string, pair: [number, number]): TreeNode {
  if (path === '') return { ...node, kids: [{ value: pair[0] }, { value: pair[1] }] }
  if (!node.kids) throw new Error(`no node at path ${path}`)
  const kids: [TreeNode, TreeNode] = [node.kids[0], node.kids[1]]
  const head = Number(path[0])
  kids[head] = splitAt(kids[head], path.slice(1), pair)
  return { ...node, kids }
}

export const treeLeaves = (node: TreeNode): number[] =>
  node.kids ? [...treeLeaves(node.kids[0]), ...treeLeaves(node.kids[1])] : [node.value]

/** One right tree: strike off the smallest prime each time. 60 → 2 × 30 → 2 × 15 → 3 × 5. */
export function defaultTree(n: number): TreeNode {
  const [p] = primeFactors(n)
  if (p === undefined || p === n) return { value: n }
  return { value: n, kids: [{ value: p }, defaultTree(n / p)] }
}

/** Tree for an already-known factor list (e.g. primes the student multiplied together). */
export function treeFromFactors(factors: number[]): TreeNode {
  if (factors.length <= 1) return { value: factors[0] ?? 1 }
  const [first, ...rest] = factors
  return { value: productOf(factors), kids: [{ value: first }, treeFromFactors(rest)] }
}
