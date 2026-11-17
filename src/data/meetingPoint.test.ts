import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MEETING_POINT_EXERCISES } from './meetingPoint.ts'
import { lapsToReach, lcm } from '../utils/multiples.ts'

/** Lane chips per runner — the component caps each lane here. */
const LANE_CAP = 24

const label = (a: number, b: number) => `n (${a}; ${b})`

test('every first meeting fits in a lane and in three digits', () => {
  for (const e of MEETING_POINT_EXERCISES) {
    const m = lcm(e.mpA, e.mpB)
    assert.ok(m <= 999, label(e.mpA, e.mpB))
    assert.ok(lapsToReach(Math.min(e.mpA, e.mpB), m) <= LANE_CAP, `${label(e.mpA, e.mpB)} needs too many laps`)
    assert.equal(e.numerator, e.mpA)
    assert.equal(e.denominator, e.mpB)
  }
})

test('select mode: correctIndex points at lcm, exactly one correct of 4 distinct choices', () => {
  const selects = MEETING_POINT_EXERCISES.filter(e => e.mode === 'select')
  assert.ok(selects.length > 0)
  for (const e of selects) {
    const m = lcm(e.mpA, e.mpB)
    const c = e.mpChoices ?? []
    assert.equal(c.length, 4, label(e.mpA, e.mpB))
    assert.equal(new Set(c).size, 4, `${label(e.mpA, e.mpB)} has duplicate choices`)
    assert.equal(c[e.correctIndex ?? -1], m, `${label(e.mpA, e.mpB)} correctIndex`)
    assert.ok(c.every(x => Number.isInteger(x) && x >= 1 && x <= 999))
  }
})

test('run mode carries no stored answer', () => {
  for (const e of MEETING_POINT_EXERCISES.filter(e => e.mode === 'generate')) {
    assert.equal(e.mpChoices, undefined)
    assert.equal(e.correctIndex, undefined)
  }
})
