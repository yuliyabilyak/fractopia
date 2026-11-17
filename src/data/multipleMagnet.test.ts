import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MULTIPLE_MAGNET_EXERCISES } from './multipleMagnet.ts'
import { isCommonMultiple, lcm, railMultiples, RAIL_CHIP_CAP } from '../utils/multiples.ts'

const label = (a: number, b: number) => `${a} and ${b}`

test('rails stay within the cap and show at least 2 meeting points', () => {
  for (const e of MULTIPLE_MAGNET_EXERCISES) {
    const [ra, rb] = [railMultiples(e.mmA, e.mmA, e.mmB), railMultiples(e.mmB, e.mmA, e.mmB)]
    assert.ok(ra.length <= RAIL_CHIP_CAP && rb.length <= RAIL_CHIP_CAP, label(e.mmA, e.mmB))
    // 24-chip rails can cut the third meeting point; build mode reaches it with digit cards
    assert.ok(ra.filter(k => rb.includes(k)).length >= 2, label(e.mmA, e.mmB))
    assert.ok(3 * lcm(e.mmA, e.mmB) <= 999, `${label(e.mmA, e.mmB)} goes past three digits`)
    assert.equal(e.numerator, e.mmA)
    assert.equal(e.denominator, e.mmB)
  }
})

test('select grids: 8–9 distinct numbers, 3–4 common multiples, all on both rails', () => {
  const selects = MULTIPLE_MAGNET_EXERCISES.filter(e => e.mode === 'select')
  assert.ok(selects.length > 0)
  for (const e of selects) {
    const c = e.mmCandidates ?? []
    const valid = c.filter(k => isCommonMultiple(k, e.mmA, e.mmB))
    assert.ok(c.length === 8 || c.length === 9, label(e.mmA, e.mmB))
    assert.equal(new Set(c).size, c.length, `${label(e.mmA, e.mmB)} has duplicates`)
    assert.ok(valid.length >= e.mmCount && valid.length <= e.mmCount + 1, `${label(e.mmA, e.mmB)}: ${valid.length} valid`)
    assert.ok(c.every(k => Number.isInteger(k) && k >= 1 && k <= 999))
    const onBoth = railMultiples(e.mmA, e.mmA, e.mmB).filter(k => railMultiples(e.mmB, e.mmA, e.mmB).includes(k))
    assert.ok(valid.every(k => onBoth.includes(k)), `${label(e.mmA, e.mmB)}: a valid candidate is off the rails`)
  }
})

test('build mode carries no candidates', () => {
  for (const e of MULTIPLE_MAGNET_EXERCISES.filter(e => e.mode === 'generate')) assert.equal(e.mmCandidates, undefined)
})
