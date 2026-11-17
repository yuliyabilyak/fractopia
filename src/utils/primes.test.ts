import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  defaultTree, factorizationFlaw, findExample, findFlaw, isPrime, isPrimeFactorization, primeFactors, productOf,
  satisfiesConstraint, splitAt, splitPairs, treeFromFactors, treeLeaves, type PrimeConstraint,
} from './primes.ts'

test('isPrime', () => {
  const primesTo50 = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]
  for (let n = -3; n <= 50; n++) assert.equal(isPrime(n), primesTo50.includes(n), `isPrime(${n})`)
  assert.equal(isPrime(2.5), false)
  assert.equal(isPrime(5313), false) // 3 · 7 · 11 · 23
  assert.equal(isPrime(2903), true)
})

test('primeFactors: textbook numbers', () => {
  const cases: [number, number[]][] = [
    [12, [2, 2, 3]], [60, [2, 2, 3, 5]], [96, [2, 2, 2, 2, 2, 3]],
    [286, [2, 11, 13]], [910, [2, 5, 7, 13]], [1870, [2, 5, 11, 17]],
    [2907, [3, 3, 17, 19]], [5313, [3, 7, 11, 23]], [210, [2, 3, 5, 7]],
    [97, [97]], [1, []], [0, []],
  ]
  for (const [n, f] of cases) assert.deepEqual(primeFactors(n), f, `primeFactors(${n})`)
})

test('primeFactors round-trips for 2..2000', () => {
  for (let n = 2; n <= 2000; n++) {
    const f = primeFactors(n)
    assert.equal(productOf(f), n)
    assert.ok(f.every(isPrime))
    assert.deepEqual(f, [...f].sort((a, b) => a - b))
  }
})

test('splitPairs offers each divisor pair once, smaller first', () => {
  assert.deepEqual(splitPairs(24), [[2, 12], [3, 8], [4, 6]])
  assert.deepEqual(splitPairs(36), [[2, 18], [3, 12], [4, 9], [6, 6]])
  assert.deepEqual(splitPairs(13), [])
})

test('isPrimeFactorization ignores order and rejects composites, wrong products, empties', () => {
  assert.equal(isPrimeFactorization([5, 2, 3, 2], 60), true)
  assert.equal(isPrimeFactorization([4, 3, 5], 60), false)
  assert.equal(isPrimeFactorization([2, 2, 3, 7], 60), false)
  assert.equal(isPrimeFactorization([2, 3, 5], 60), false)
  assert.equal(isPrimeFactorization([], 1), false)
})

test('factorizationFlaw names the first problem', () => {
  assert.deepEqual(factorizationFlaw([4, 3, 5], 60), { kind: 'composite', value: 4 })
  assert.deepEqual(factorizationFlaw([2, 3, 5], 60), { kind: 'product', value: 30 })
  assert.equal(factorizationFlaw([2, 2, 3, 5], 60), null)
})

test('satisfiesConstraint matches the textbook examples', () => {
  const yes: Record<PrimeConstraint, number[]> = {
    'one-prime': [4, 8, 9, 25, 27, 32, 81],
    'two-same': [25, 49, 4, 9],
    'three-different': [30, 42, 66, 70, 78],
    'four-different': [210, 330, 462],
  }
  const no: Record<PrimeConstraint, number[]> = {
    'one-prime': [1, 2, 7, 12, 36],
    'two-same': [8, 27, 35, 7, 1],
    'three-different': [60, 8, 15, 210],
    'four-different': [420, 30, 2310],
  }
  for (const c of Object.keys(yes) as PrimeConstraint[]) {
    for (const n of yes[c]) assert.equal(satisfiesConstraint(n, c), true, `${n} ${c}`)
    for (const n of no[c]) assert.equal(satisfiesConstraint(n, c), false, `${n} ${c}`)
  }
})

test('findFlaw / findExample respect bounds', () => {
  assert.equal(findFlaw(210, { constraint: 'four-different', max: 210 }), null)
  assert.equal(findFlaw(330, { constraint: 'four-different', max: 210 }), 'too-big')
  assert.equal(findFlaw(9, { constraint: 'two-same', min: 10, max: 99 }), 'too-small')
  assert.equal(findFlaw(35, { constraint: 'two-same', min: 10, max: 99 }), 'rule')
  assert.equal(findExample({ constraint: 'four-different', max: 210 }), 210)
  assert.equal(findExample({ constraint: 'four-different', max: 209 }), null)
  assert.equal(findExample({ constraint: 'two-same', min: 10, max: 99 }), 25)
  assert.equal(findExample({ constraint: 'three-different', max: 99 }), 30)
  assert.equal(findExample({ constraint: 'one-prime', max: 99 }), 4)
})

test('factor trees: split, leaves, default and from-factors', () => {
  let t = splitAt({ value: 60 }, '', [6, 10])
  t = splitAt(t, '0', [2, 3])
  t = splitAt(t, '1', [2, 5])
  assert.deepEqual(treeLeaves(t), [2, 3, 2, 5])
  assert.throws(() => splitAt({ value: 7 }, '0', [1, 7]))

  for (const n of [12, 96, 286, 5313]) {
    const leaves = treeLeaves(defaultTree(n))
    assert.ok(isPrimeFactorization(leaves, n), `defaultTree(${n})`)
  }
  assert.deepEqual(defaultTree(7), { value: 7 })

  const built = treeFromFactors([2, 3, 5])
  assert.equal(built.value, 30)
  assert.deepEqual(treeLeaves(built), [2, 3, 5])
})
