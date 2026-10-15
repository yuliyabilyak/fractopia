import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isDivisible, ruleSays, type Divisor, type LevelId, type Rng } from './numberDetective.ts'
import {
  BRIDGE_DIVISORS, INITIAL_BRIDGE_STATE, LEVEL_CROSSINGS, MAX_HINT, NEW_RULES,
  bridgeReducer, canCheck, crossingResults, explainTile, failingFocus, failingReason, failingStep, fitsRule, generateChallenge,
  planLevel, planPractice, ruleDivisors, rulesUpTo, stonesStillNeeded, tileFocus, workedExampleTile,
  type BridgeChallenge, type BridgeRule, type BridgeState,
} from './numberBridges.ts'

function seeded(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const LEVELS: LevelId[] = [1, 2, 3, 4, 5]
const digitCount = (n: number) => String(n).length

// the spec's own example: select all numbers divisible by 4
const EXAMPLE: BridgeChallenge = {
  rule: { kind: 'single', divisor: 4 },
  tiles: [1_248, 1_357, 2_316, 4_822, 7_500, 6_125],
  correct: [0, 2, 4],
}

// ── rules ────────────────────────────────────────────────────────────────────

test('every bridge rule matches arithmetic for all 3–5 digit numbers', () => {
  for (let n = 100; n <= 99_999; n++) {
    for (const d of BRIDGE_DIVISORS) {
      if (ruleSays(n, d) !== isDivisible(n, d)) assert.fail(`rule for ${d} is wrong on ${n}`)
    }
  }
})

test('the spec example: 1,248, 2,316 and 7,500 are divisible by 4', () => {
  assert.deepEqual(EXAMPLE.tiles.map(n => fitsRule(n, EXAMPLE.rule)), [true, false, true, false, true, false])
})

test('hints explain the applicable rule with the digits that matter', () => {
  // 4,822: 22 ÷ 4 leaves 2
  const ex = explainTile(4_822, EXAMPLE.rule)
  const step = failingStep(ex)
  assert.ok(step?.kind === 'divide')
  assert.deepEqual([step.dividend, step.divisor, step.quotient, step.remainder], [22, 4, 5, 2])
  assert.equal(failingFocus(4_822, EXAMPLE.rule), 2)
  assert.equal(failingStep(explainTile(7_500, EXAMPLE.rule)), null, 'a fitting stone has no failing step')

  // 2 → last digit, 3 → all digits, 6 → two separate checks
  assert.equal(tileFocus({ kind: 'single', divisor: 2 }), 1)
  assert.equal(tileFocus({ kind: 'single', divisor: 3 }), 'all')
  assert.equal(tileFocus({ kind: 'single', divisor: 8 }), 3)
  const six = explainTile(1_238, { kind: 'single', divisor: 6 })
  assert.deepEqual(six.conclusion.parts, [{ divisor: 2, ok: true }, { divisor: 3, ok: false }])
  const sixFail = failingStep(six)
  assert.ok(sixFail?.kind === 'divide' && sixFail.group === 3, 'the 3 check is the one that fails')
  assert.equal(failingFocus(1_238, { kind: 'single', divisor: 6 }), 0)

  // two rules: the failing rule's digits are highlighted
  const both: BridgeRule = { kind: 'both', divisors: [4, 9] }
  assert.equal(failingFocus(1_236, both), 'all', '1,236 passes 4 but fails 9')
  assert.equal(explainTile(1_236, both).conclusion.ok, false)
})

test('7, 11 and 25: stones are judged and explained by their own rules', () => {
  assert.ok(BRIDGE_DIVISORS.includes(7) && BRIDGE_DIVISORS.includes(11) && BRIDGE_DIVISORS.includes(25))
  const seven = { kind: 'single', divisor: 7 } as const
  const eleven = { kind: 'single', divisor: 11 } as const
  const quarter = { kind: 'single', divisor: 25 } as const

  assert.equal(tileFocus(seven), 1)
  assert.equal(tileFocus(eleven), 'odd')
  assert.equal(tileFocus(quarter), 2)

  // 533 → 53 − 6 = 47, and 47 isn't a multiple of 7: the reason shows both steps
  const why7 = failingReason(explainTile(533, seven))
  assert.deepEqual(why7.map(s => s.kind), ['seven-round', 'divide'])
  assert.ok(why7[0].kind === 'seven-round' && why7[0].result === 47)
  assert.ok(why7[1].kind === 'divide' && why7[1].dividend === 47 && why7[1].remainder === 5)

  // 1,234 → (4 + 2) − (3 + 1) = 2: the difference, then the division
  const why11 = failingReason(explainTile(1_234, eleven))
  assert.deepEqual(why11.map(s => s.kind), ['difference', 'divide'])
  assert.ok(why11[0].kind === 'difference' && why11[0].result === 2)

  // 1,260 → only 60 matters, 60 ÷ 25 leaves 10
  const why25 = failingReason(explainTile(1_260, quarter))
  assert.deepEqual(why25.map(s => s.kind), ['last-part', 'divide'])
  assert.equal(failingFocus(1_260, quarter), 2)

  assert.deepEqual(failingReason(explainTile(1_275, quarter)), [], 'a fitting stone has no reason')
})

test('the reason for a digit-sum rule includes the sum it divides', () => {
  const why = failingReason(explainTile(4_822, { kind: 'single', divisor: 3 }))
  assert.deepEqual(why.map(s => s.kind), ['digit-sum', 'divide'])
  // a last-digit rule needs nothing before its one step
  assert.deepEqual(failingReason(explainTile(587, { kind: 'single', divisor: 2 })).map(s => s.kind), ['last-digit'])
  // the 6 rule: the failing 3 check brings its own digit sum, not the 2 check
  const why6 = failingReason(explainTile(1_238, { kind: 'single', divisor: 6 }))
  assert.deepEqual(why6.map(s => [s.kind, s.group]), [['digit-sum', 3], ['divide', 3]])
})

// ── generation ───────────────────────────────────────────────────────────────

function assertValidChallenge(c: BridgeChallenge, digits: [number, number]) {
  assert.equal(new Set(c.tiles).size, c.tiles.length, 'stones are all different')
  assert.deepEqual(c.correct, c.tiles.flatMap((n, i) => ruleDivisors(c.rule).every(d => n % d === 0) ? [i] : []))
  assert.ok(c.correct.length >= 1, 'at least one stone fits')
  assert.ok(c.correct.length < c.tiles.length, 'at least one stone does not fit')
  for (const n of c.tiles) {
    assert.ok(digitCount(n) >= Math.min(3, digits[0]) && digitCount(n) <= digits[1], `${n} outside ${digits}`)
    assert.ok(digitCount(n) >= 3, 'three digits or more')
  }
}

test('generated crossings always have right and wrong stones, answers derived', () => {
  const rng = seeded(1)
  for (let i = 0; i < 2_000; i++) {
    const d = BRIDGE_DIVISORS[i % BRIDGE_DIVISORS.length]
    const tiles = 4 + (i % 5)
    const digits: [number, number] = [3 + (i % 2), 4 + (i % 3)]
    assertValidChallenge(generateChallenge({ rule: { kind: 'single', divisor: d }, tiles, digits }, rng), digits)
  }
  for (let i = 0; i < 500; i++) {
    const rule: BridgeRule = { kind: 'both', divisors: [[2, 9], [3, 4], [4, 5], [8, 9]][i % 4] as [Divisor, Divisor] }
    assertValidChallenge(generateChallenge({ rule, tiles: 8, digits: [4, 6] }, rng), [4, 6])
  }
})

test('levels introduce each rule on its own before mixing it in', () => {
  assert.deepEqual(new Set(rulesUpTo(5)), new Set(BRIDGE_DIVISORS))
  for (let seed = 0; seed < 300; seed++) {
    for (const level of LEVELS) {
      const plans = planLevel(level, seeded(seed * 7 + level))
      assert.equal(plans.length, LEVEL_CROSSINGS[level])

      // no rule from a later level
      for (const p of plans) assert.ok(ruleDivisors(p.rule).every(d => rulesUpTo(level).includes(d)))
      // the level's new rules come first, alone, in order
      assert.deepEqual(plans.slice(0, NEW_RULES[level].length).map(p => p.rule), NEW_RULES[level].map(d => ({ kind: 'single', divisor: d })))
      // two-rule crossings only in the last level
      if (level < 5) assert.ok(plans.every(p => p.rule.kind === 'single'))
      else assert.ok(plans.some(p => p.rule.kind === 'both'))

      if (level === 1) {
        assert.ok(plans.every(p => p.digits[0] === 3 && p.digits[1] === 3 && p.tiles >= 4 && p.tiles <= 6))
        assert.ok(plans.every(p => p.rule.kind === 'single' && [2, 5, 10].includes(p.rule.divisor)))
      }
      if (level === 2) assert.ok(plans.every(p => p.digits[0] === 4 && p.digits[1] === 6))
      if (level === 4) {
        assert.ok(plans.every(p => p.tiles === 8), 'more stones')
        assert.ok(new Set(plans.map(p => p.rule.kind === 'single' && p.rule.divisor)).size >= 5, 'rules are mixed')
      }
      if (level === 5) assert.ok(plans.every(p => p.digits[1] === 6), 'larger numbers')

      plans.forEach(p => assertValidChallenge(generateChallenge(p, seeded(seed)), p.digits))
    }
  }
  assert.deepEqual(planPractice([4, 8]).map(p => p.rule), [4, 8, 4, 8].map(d => ({ kind: 'single', divisor: d })))
})

// ── game state ───────────────────────────────────────────────────────────────

function play(state: BridgeState, ...actions: Parameters<typeof bridgeReducer>[1][]): BridgeState {
  return actions.reduce(bridgeReducer, state)
}

const toggle = (index: number) => ({ type: 'toggle', index }) as const
const check = { type: 'check', challenge: EXAMPLE } as const

test('selecting and deselecting stones', () => {
  const s = play(INITIAL_BRIDGE_STATE, toggle(4), toggle(0), toggle(1))
  assert.deepEqual(s.selected, [0, 1, 4])
  assert.deepEqual(play(s, toggle(1)).selected, [0, 4])
  // checking with nothing selected does nothing
  assert.equal(bridgeReducer(INITIAL_BRIDGE_STATE, check), INITIAL_BRIDGE_STATE)
})

test('the right stones complete the crossing first time', () => {
  const s = play(INITIAL_BRIDGE_STATE, toggle(0), toggle(2), toggle(4), check)
  assert.equal(s.status, 'complete')
  assert.deepEqual(s.placed, [0, 2, 4])
  assert.deepEqual(s.wrong, [])
  assert.equal(s.firstCheckCorrect, true)
  assert.equal(s.hintLevel, 0, 'no hint forced on a correct path')
  // once complete, stones can't change
  assert.equal(bridgeReducer(s, toggle(1)), s)
  assert.deepEqual(crossingResults(EXAMPLE.rule, true), [{ divisor: 4, correct: true }])
})

test('a wrong stone is flagged, right ones stay placed, and the player retries', () => {
  // 1,248 ✓, 4,822 ✗ — and 2,316 and 7,500 are still missing
  let s = play(INITIAL_BRIDGE_STATE, toggle(0), toggle(3), check)
  assert.equal(s.status, 'retry')
  assert.deepEqual(s.placed, [0], 'the right stone joins the bridge')
  assert.deepEqual(s.wrong, [3], 'the wrong stone is flagged')
  assert.deepEqual(s.selected, [3], 'and left selected so the player can see it')
  assert.equal(s.hintLevel, 1, 'the rule is shown after a miss')
  assert.equal(stonesStillNeeded(s, EXAMPLE), 2)
  assert.equal(workedExampleTile(s, EXAMPLE), 3, 'the worked example uses the flagged stone')

  // placed stones are locked in
  assert.equal(bridgeReducer(s, toggle(0)), s)

  // deselect the wrong one, pick the missing ones, check again
  s = play(s, toggle(3), toggle(2), toggle(4))
  assert.deepEqual(s.wrong, [])
  s = bridgeReducer(s, check)
  assert.equal(s.status, 'complete')
  assert.deepEqual(s.placed, [0, 2, 4])
  assert.equal(s.firstCheckCorrect, false, 'accuracy remembers the first check')
  assert.deepEqual(crossingResults({ kind: 'both', divisors: [4, 9] }, false), [{ divisor: 4, correct: false }, { divisor: 9, correct: false }])
})

test('removing the only wrong stone still lets the player finish', () => {
  // every right stone plus one wrong one: the right ones go on the path…
  let s = play(INITIAL_BRIDGE_STATE, toggle(0), toggle(2), toggle(4), toggle(5), check)
  assert.deepEqual([s.status, s.placed, s.wrong], ['retry', [0, 2, 4], [5]])
  // …the wrong one is taken away, leaving nothing selected
  s = bridgeReducer(s, toggle(5))
  assert.deepEqual(s.selected, [])
  assert.equal(canCheck(s), true, 'Check path must stay available')
  s = bridgeReducer(s, check)
  assert.equal(s.status, 'complete')
  assert.equal(s.firstCheckCorrect, false)
})

test('re-checking a partial path without new stones just reports what is missing', () => {
  let s = play(INITIAL_BRIDGE_STATE, toggle(0), check)
  assert.deepEqual([s.status, s.placed, s.selected], ['retry', [0], []])
  s = bridgeReducer(s, check)
  assert.equal(s.status, 'retry')
  assert.equal(stonesStillNeeded(s, EXAMPLE), 2)
  assert.equal(canCheck(INITIAL_BRIDGE_STATE), false, 'nothing to check at the start')
})

test('try again clears the crossing but keeps hints and the first-check record', () => {
  const s = play(INITIAL_BRIDGE_STATE, toggle(1), check, { type: 'hint' }, { type: 'reset' })
  assert.deepEqual([s.selected, s.placed, s.wrong, s.status], [[], [], [], 'choosing'])
  assert.equal(s.hintLevel, 2)
  assert.equal(s.firstCheckCorrect, false)
})

test('hints get stronger one step at a time, up to a limit', () => {
  let s = INITIAL_BRIDGE_STATE
  for (let i = 1; i <= MAX_HINT + 2; i++) {
    s = bridgeReducer(s, { type: 'hint' })
    assert.equal(s.hintLevel, Math.min(i, MAX_HINT))
  }
  assert.equal(workedExampleTile(INITIAL_BRIDGE_STATE, EXAMPLE), 0)
})
