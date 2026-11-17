import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  firstMultiples, isCommonMultiple, isCommonMultipleSelection, lanePositions, lapsToReach, lcm, nextPosition, railMultiples,
} from './multiples.ts'
import { gcd } from './divisors.ts'

test('lcm', () => {
  assert.equal(lcm(12, 9), 36)
  assert.equal(lcm(2, 3), 6)
  assert.equal(lcm(1, 8), 8)
  assert.equal(lcm(36, 96), 288)
  assert.equal(lcm(8, 12), 24)
  for (let a = 1; a < 40; a++) for (let b = 1; b < 40; b++) {
    const m = lcm(a, b)
    assert.ok(isCommonMultiple(m, a, b))
    assert.equal(m * gcd(a, b), a * b)
    for (let k = 1; k < m; k++) assert.ok(!isCommonMultiple(k, a, b), `${k} < lcm(${a}, ${b})`)
  }
})

test('nextPosition and lanePositions', () => {
  assert.equal(nextPosition(0, 8), 8)
  assert.equal(nextPosition(16, 8), 24)
  assert.deepEqual(lanePositions(8, 3), [8, 16, 24])
  assert.deepEqual(lanePositions(5, 0), [])
})

test('isCommonMultiple / lapsToReach', () => {
  assert.equal(isCommonMultiple(72, 12, 9), true)
  assert.equal(isCommonMultiple(108, 12, 9), true)
  assert.equal(isCommonMultiple(24, 12, 9), false)
  assert.equal(isCommonMultiple(0, 12, 9), false)
  assert.equal(lapsToReach(9, 36), 4)
  assert.equal(lapsToReach(8, 30), 4)
})

test('firstMultiples', () => {
  assert.deepEqual(firstMultiples(8, 30), [8, 16, 24])
  assert.deepEqual(firstMultiples(8, 7), [])
  assert.deepEqual(firstMultiples(0, 30), [])
})

test('rails stop at 3 × lcm or 24 chips', () => {
  assert.deepEqual(railMultiples(12, 8, 12), [12, 24, 36, 48, 60, 72])
  assert.equal(railMultiples(1, 1, 6).length, 18)
  assert.equal(railMultiples(5, 5, 7).length, 21)
  assert.equal(railMultiples(35, 35, 49).length, 21)
  for (const [a, b] of [[1, 6], [5, 7], [8, 12], [35, 49]]) {
    const both = railMultiples(a, a, b).filter(k => railMultiples(b, a, b).includes(k))
    assert.deepEqual(both, [1, 2, 3].map(i => i * lcm(a, b)), `${a}; ${b}`)
  }
})

test('isCommonMultipleSelection', () => {
  assert.equal(isCommonMultipleSelection([24, 48, 72], 8, 12, 3), true)
  assert.equal(isCommonMultipleSelection([72, 24, 144], 8, 12, 3), true)
  assert.equal(isCommonMultipleSelection([24, 48], 8, 12, 3), false)
  assert.equal(isCommonMultipleSelection([24, 48, 36], 8, 12, 3), false)
  assert.equal(isCommonMultipleSelection([24, 24, 48], 8, 12, 3), false)
})
