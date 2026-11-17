import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DIVISOR_DUEL_EXERCISES } from './divisorDuel.ts'
import { divisors, gcdMany } from '../utils/divisors.ts'

/** Divisor chips per column — more than this no longer fits a phone column. */
const CHIP_CAP = 20

const label = (ns: number[]) => `D (${ns.join('; ')})`

test('every entry has 2 or 3 numbers that fit the chip cap', () => {
  for (const e of DIVISOR_DUEL_EXERCISES) {
    assert.ok(e.ddNumbers.length === 2 || e.ddNumbers.length === 3, label(e.ddNumbers))
    for (const n of e.ddNumbers) {
      assert.ok(divisors(n).length <= CHIP_CAP, `${n} has ${divisors(n).length} divisors`)
    }
    assert.equal(e.numerator, e.ddNumbers[0])
  }
})

test('select mode: correctIndex points at gcdMany, exactly one correct of 4 distinct choices', () => {
  const selects = DIVISOR_DUEL_EXERCISES.filter(e => e.mode === 'select')
  assert.ok(selects.length > 0)
  for (const e of selects) {
    const g = gcdMany(e.ddNumbers)
    const c = e.ddChoices ?? []
    assert.equal(c.length, 4, label(e.ddNumbers))
    assert.equal(new Set(c).size, 4, `${label(e.ddNumbers)} has duplicate choices`)
    assert.equal(c[e.correctIndex ?? -1], g, `${label(e.ddNumbers)} correctIndex`)
    assert.equal(c.filter(x => x === g).length, 1)
    assert.ok(c.every(x => Number.isInteger(x) && x >= 1 && x <= 999))
  }
})

test('generate mode carries no stored answer', () => {
  for (const e of DIVISOR_DUEL_EXERCISES.filter(e => e.mode === 'generate')) {
    assert.equal(e.ddChoices, undefined)
    assert.equal(e.correctIndex, undefined)
  }
})

test('the textbook coprime pair is in the pool', () => {
  assert.ok(DIVISOR_DUEL_EXERCISES.some(e => gcdMany(e.ddNumbers) === 1))
})
