import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  availableKeys, commonDivisorsAbove1, commonDivisorsMany, digitCount, divisors, divisorsAbove1, gcdMany, fittingKeys, gcd, isSelectionCorrect, isValidKey,
  keyFlaw, keysNeededFor,
} from './divisors.ts'

test('gcd', () => {
  assert.equal(gcd(12, 18), 6)
  assert.equal(gcd(18, 12), 6)
  assert.equal(gcd(37, 74), 37)
  assert.equal(gcd(35, 12), 1)
  assert.equal(gcd(0, 9), 9)
  assert.equal(gcd(-12, 8), 4)
})

test('divisorsAbove1 excludes 1 and includes n', () => {
  assert.deepEqual(divisorsAbove1(12), [2, 3, 4, 6, 12])
  assert.deepEqual(divisorsAbove1(37), [37])
  assert.deepEqual(divisorsAbove1(1), [])
})

test('commonDivisorsAbove1 never contains 1', () => {
  assert.deepEqual(commonDivisorsAbove1(12, 18), [2, 3, 6])
  assert.deepEqual(commonDivisorsAbove1(10, 25), [5])
  assert.deepEqual(commonDivisorsAbove1(12, 35), [])
  for (let a = 2; a < 60; a++) for (let b = 2; b < 60; b++) {
    const c = commonDivisorsAbove1(a, b)
    assert.ok(!c.includes(1))
    assert.ok(c.every(d => a % d === 0 && b % d === 0))
    assert.equal(c.length > 0, gcd(a, b) > 1)
  }
})

test('isValidKey: shared divisor > 1; the lock itself only when prime', () => {
  assert.equal(isValidKey(15, 10), true)
  assert.equal(isValidKey(21, 10), false)
  assert.equal(isValidKey(1, 10), false)
  assert.equal(isValidKey(10, 10), false)
  assert.equal(isValidKey(37, 37), true)
  assert.equal(isValidKey(74, 37), true)
  assert.equal(isValidKey(73, 37), false)
  assert.equal(isValidKey(0, 10), false)
})

test('keyFlaw explains rejections', () => {
  assert.equal(keyFlaw(15, 10, 2), null)
  assert.equal(keyFlaw(5, 10, 2), 'digits')
  assert.equal(keyFlaw(10, 10, 2), 'same-as-lock')
  assert.equal(keyFlaw(21, 10, 2), 'no-tooth')
  assert.equal(keyFlaw(73, 73, 2), null)
  assert.equal(digitCount(7), 1)
})

test('prime locks: only multiples fit, keysNeeded is capped', () => {
  assert.deepEqual(availableKeys(37, 2), [37, 74])
  assert.deepEqual(availableKeys(73, 2), [73])
  assert.deepEqual(availableKeys(47, 2), [47, 94])
  assert.equal(keysNeededFor(73, 2, 3), 1)
  assert.equal(keysNeededFor(37, 2, 3), 2)
  assert.equal(keysNeededFor(10, 2, 3), 3)
})

test('isSelectionCorrect needs exactly the fitting set', () => {
  const candidates = [37, 74, 73, 47, 38, 36, 57, 27, 17]
  assert.deepEqual(fittingKeys(candidates, 37), [37, 74])
  assert.equal(isSelectionCorrect([74, 37], candidates, 37), true)
  assert.equal(isSelectionCorrect([37], candidates, 37), false)
  assert.equal(isSelectionCorrect([37, 74, 38], candidates, 37), false)
  assert.equal(isSelectionCorrect([], candidates, 37), false)
})

test('gcdMany', () => {
  assert.equal(gcdMany([84, 96]), 12)
  assert.equal(gcdMany([60, 96, 144]), 12)
  assert.equal(gcdMany([12, 180, 140]), 4)
  assert.equal(gcdMany([16, 27]), 1)
  assert.equal(gcdMany([42]), 42)
})

test('divisors includes 1 and n', () => {
  assert.deepEqual(divisors(12), [1, 2, 3, 4, 6, 12])
  assert.deepEqual(divisors(1), [1])
  assert.deepEqual(divisors(0), [])
  assert.equal(divisors(252).length, 18)
  assert.deepEqual(divisorsAbove1(12), [2, 3, 4, 6, 12])
})

test('commonDivisorsMany: shared by all, 1 included, gcd is the largest', () => {
  assert.deepEqual(commonDivisorsMany([84, 96]), [1, 2, 3, 4, 6, 12])
  assert.deepEqual(commonDivisorsMany([16, 27]), [1])
  for (const ns of [[12, 32, 44], [36, 54, 60], [108, 252, 324]]) {
    const c = commonDivisorsMany(ns)
    assert.ok(c.every(d => ns.every(n => n % d === 0)))
    assert.equal(c[c.length - 1], gcdMany(ns))
  }
})
