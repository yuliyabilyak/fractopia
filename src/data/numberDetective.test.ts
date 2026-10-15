import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  DIVISORS, LEVELS, LEVEL_LENGTH, RULE_PAIRS,
  ruleSays, isDivisible, digitSum, lastDigits, explain, explainBoth,
  formatNumber, tokenizeNumber, isHighlighted, generateNumber, digitRange,
  yesNoChallenge, twoRulesChallenge, allDivisorsChallenge, generateLevel, generatePractice,
  checkAnswer, challengeRules, addRuleResults, ruleStanding, rulesNeedingPractice, unlockedLevel,
  type Challenge, type Rng, type Step,
} from './numberDetective.ts'

/** mulberry32 — small deterministic PRNG so failures are reproducible */
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

function digitCount(n: number): number {
  return String(n).length
}

// ── divisibility rules ───────────────────────────────────────────────────────

test('every rule agrees with plain arithmetic for all 3–5 digit numbers', () => {
  for (let n = 100; n <= 99_999; n++) {
    for (const d of DIVISORS) {
      if (ruleSays(n, d) !== isDivisible(n, d)) assert.fail(`rule for ${d} is wrong on ${n}`)
    }
  }
})

test('rules agree with arithmetic on sampled 6-digit numbers and edge values', () => {
  const rng = seeded(1)
  const samples = [100_000, 999_999, 100_008, 123_456, 999_990, 100_800]
  for (let i = 0; i < 20_000; i++) samples.push(100_000 + Math.floor(rng() * 900_000))
  for (const n of samples) {
    for (const d of DIVISORS) assert.equal(ruleSays(n, d), isDivisible(n, d), `${n} ÷ ${d}`)
  }
})

test('digit helpers', () => {
  assert.equal(digitSum(12_348), 18)
  assert.equal(lastDigits(12_348, 2), '48')
  assert.equal(lastDigits(1_208, 2), '08')
  assert.equal(lastDigits(5_000, 3), '000')
})

// ── explanations ─────────────────────────────────────────────────────────────

function kinds(steps: Step[]) {
  return steps.map(s => s.kind)
}

test('divisible by 4: highlights the last two digits and divides them (spec example)', () => {
  const ex = explain(12_348, 4)
  assert.deepEqual(kinds(ex.steps), ['rule', 'last-part', 'divide'])
  assert.deepEqual(ex.steps[1], { kind: 'last-part', count: 2, part: '48', highlight: 2, group: undefined })
  assert.deepEqual(ex.steps[2], { kind: 'divide', dividend: 48, divisor: 4, quotient: 12, remainder: 0, ok: true, highlight: 2, group: undefined })
  assert.deepEqual(ex.conclusion, { n: 12_348, asked: [4], parts: [], ok: true })
})

test('divisible by 3: sums every digit (spec example)', () => {
  const ex = explain(12_348, 3)
  assert.deepEqual(kinds(ex.steps), ['rule', 'digit-sum', 'divide'])
  const sum = ex.steps[1]
  assert.ok(sum.kind === 'digit-sum')
  assert.deepEqual(sum.digits, [1, 2, 3, 4, 8])
  assert.equal(sum.sum, 18)
  assert.equal(sum.highlight, 'all')
  const div = ex.steps[2]
  assert.ok(div.kind === 'divide')
  assert.deepEqual([div.dividend, div.divisor, div.quotient, div.remainder], [18, 3, 6, 0])
  assert.equal(ex.conclusion.ok, true)
})

test('divisible by 6: shows the 2 and 3 checks separately, then combines them', () => {
  const yes = explain(1_236, 6)
  assert.deepEqual(kinds(yes.steps), ['rule', 'last-digit', 'digit-sum', 'divide'])
  assert.deepEqual(yes.steps.map(s => s.group), [undefined, 2, 3, 3])
  assert.deepEqual(yes.conclusion.parts, [{ divisor: 2, ok: true }, { divisor: 3, ok: true }])
  assert.equal(yes.conclusion.ok, true)

  // even but digit sum 1+2+3+8 = 14 → not divisible by 3
  const no = explain(1_238, 6)
  assert.deepEqual(no.conclusion.parts, [{ divisor: 2, ok: true }, { divisor: 3, ok: false }])
  assert.equal(no.conclusion.ok, false)
})

test('last-digit rules report the digit and the allowed list', () => {
  const ex = explain(735, 2)
  assert.deepEqual(ex.steps[1], { kind: 'last-digit', digit: 5, allowed: [0, 2, 4, 6, 8], ok: false, highlight: 1, group: undefined })
  assert.equal(explain(735, 5).conclusion.ok, true)
  assert.equal(explain(730, 10).conclusion.ok, true)
})

test('non-divisible explanations carry the remainder', () => {
  const ex = explain(1_250, 4)
  const div = ex.steps[2]
  assert.ok(div.kind === 'divide')
  assert.deepEqual([div.dividend, div.quotient, div.remainder, div.ok], [50, 12, 2, false])
  assert.equal(ex.conclusion.ok, false)
})

test('leading zeros in the last digits are kept for display but not for dividing', () => {
  const ex = explain(10_008, 8)
  assert.ok(ex.steps[1].kind === 'last-part' && ex.steps[1].part === '008')
  assert.ok(ex.steps[2].kind === 'divide' && ex.steps[2].dividend === 8 && ex.steps[2].quotient === 1)
})

test('explanation verdicts always match arithmetic', () => {
  const rng = seeded(7)
  for (let i = 0; i < 3_000; i++) {
    const n = 100 + Math.floor(rng() * 999_900)
    for (const d of DIVISORS) {
      const ex = explain(n, d)
      assert.equal(ex.conclusion.ok, isDivisible(n, d))
      for (const step of ex.steps) {
        if (step.kind === 'divide') assert.equal(step.dividend, step.divisor * step.quotient + step.remainder)
      }
      for (const part of ex.conclusion.parts) assert.equal(part.ok, isDivisible(n, part.divisor))
    }
  }
})

test('two-rule explanations group each rule and require both', () => {
  const ex = explainBoth(1_236, [3, 4])
  assert.deepEqual(ex.steps.map(s => s.group), [3, 3, 3, 4, 4, 4])
  assert.deepEqual(ex.conclusion.parts, [{ divisor: 3, ok: true }, { divisor: 4, ok: true }])
  assert.equal(ex.conclusion.ok, true)
  assert.equal(explainBoth(1_238, [2, 3]).conclusion.ok, false)
})

// ── formatting ───────────────────────────────────────────────────────────────

test('numbers are grouped by locale, consistently from 4 digits up', () => {
  assert.equal(formatNumber(12_348, 'en-US'), '12,348')
  assert.equal(formatNumber(7_200, 'en-US'), '7,200')
  assert.equal(formatNumber(348, 'en-US'), '348')
  // Czech and Ukrainian group with a (no-break) space, 4-digit numbers included
  assert.match(formatNumber(7_200, 'cs-CZ'), /^7\s200$/)
  assert.match(formatNumber(12_348, 'uk-UA'), /^12\s348$/)
})

test('tokenizeNumber keeps separators and counts digit positions from the right', () => {
  const tokens = tokenizeNumber('12,348')
  assert.deepEqual(tokens, [
    { type: 'digit', char: '1', fromRight: 5 },
    { type: 'digit', char: '2', fromRight: 4 },
    { type: 'sep', char: ',' },
    { type: 'digit', char: '3', fromRight: 3 },
    { type: 'digit', char: '4', fromRight: 2 },
    { type: 'digit', char: '8', fromRight: 1 },
  ])
  assert.equal(isHighlighted(2, 2), true)
  assert.equal(isHighlighted(3, 2), false)
  assert.equal(isHighlighted(5, 'all'), true)
  assert.equal(isHighlighted(1, 0), false)
})

// ── generation ───────────────────────────────────────────────────────────────

test('generateNumber respects length, step, predicate and avoid-list', () => {
  const rng = seeded(3)
  for (let i = 0; i < 500; i++) {
    const digits = 3 + (i % 4)
    const avoid = new Set([digitRange(digits)[0] + 12])
    const n = generateNumber(rng, digits, 12, x => x % 5 !== 0, avoid)
    assert.equal(digitCount(n), digits)
    assert.equal(n % 12, 0)
    assert.notEqual(n % 5, 0)
    assert.ok(!avoid.has(n))
  }
})

test('generateNumber falls back to scanning when random draws keep missing', () => {
  // only one 3-digit number qualifies; a constant rng would never find it by chance
  const n = generateNumber(() => 0, 3, 1, x => x === 777)
  assert.equal(n, 777)
  assert.throws(() => generateNumber(() => 0.5, 3, 1, () => false))
})

test('yes/no challenges produce both outcomes, correctly labelled', () => {
  const rng = seeded(11)
  for (const d of DIVISORS) {
    for (const want of [true, false]) {
      for (let i = 0; i < 50; i++) {
        const c = yesNoChallenge(rng, d, 3 + (i % 4), want, true)
        assert.ok(c.kind === 'yes-no')
        assert.equal(c.answer, want, `${c.n} ÷ ${d}`)
        assert.equal(c.answer, isDivisible(c.n, d))
      }
    }
  }
})

test('two-rule challenges hit each requested outcome', () => {
  const rng = seeded(5)
  for (const pair of RULE_PAIRS) {
    assert.ok(pair[0] % pair[1] !== 0 && pair[1] % pair[0] !== 0, `${pair} — one rule implies the other`)
    for (const outcome of ['both', 'first', 'second', 'neither'] as const) {
      const c = twoRulesChallenge(rng, pair, 4, outcome)
      assert.ok(c.kind === 'two-rules')
      const [a, b] = [isDivisible(c.n, pair[0]), isDivisible(c.n, pair[1])]
      const expected = { both: [true, true], first: [true, false], second: [false, true], neither: [false, false] }[outcome]
      assert.deepEqual([a, b], expected, `${c.n} for ${pair} (${outcome})`)
      assert.equal(c.answer, a && b)
    }
  }
})

test('all-divisors challenges are unambiguous: at least one right and one wrong option', () => {
  const rng = seeded(9)
  for (let i = 0; i < 2_000; i++) {
    const optionCount = 5 + (i % 4) // 5–8
    const c = allDivisorsChallenge(rng, 3 + (i % 4), optionCount)
    assert.ok(c.kind === 'all-divisors')
    assert.equal(c.options.length, optionCount)
    assert.equal(new Set(c.options).size, optionCount)
    assert.deepEqual(c.options, [...c.options].sort((x, y) => x - y))
    assert.deepEqual(c.correct, c.options.filter(d => isDivisible(c.n, d)))
    assert.ok(c.correct.length >= 1 && c.correct.length < optionCount, `${c.n}: ${c.correct} of ${c.options}`)
  }
})

function assertChallengeConsistent(c: Challenge) {
  if (c.kind === 'yes-no') assert.equal(c.answer, isDivisible(c.n, c.divisor))
  else if (c.kind === 'two-rules') assert.equal(c.answer, c.divisors.every(d => isDivisible(c.n, d)))
  else assert.deepEqual(c.correct, c.options.filter(d => isDivisible(c.n, d)))
}

test('levels follow the progression and never repeat a number', () => {
  for (let seed = 0; seed < 200; seed++) {
    for (const level of LEVELS) {
      const challenges = generateLevel(level, seeded(seed * 10 + level))
      assert.equal(challenges.length, LEVEL_LENGTH[level])
      assert.equal(new Set(challenges.map(c => c.n)).size, challenges.length, `repeat in level ${level}`)
      challenges.forEach(assertChallengeConsistent)

      const lengths = challenges.map(c => digitCount(c.n))
      if (level === 1) {
        assert.ok(challenges.every(c => c.kind === 'yes-no' && c.divisor !== 8))
        assert.ok(lengths.every(l => l === 3))
        // the single rules are introduced one by one, in a fixed order
        assert.deepEqual(challenges.slice(0, 7).map(c => c.kind === 'yes-no' && c.divisor), [10, 2, 5, 3, 9, 4, 6])
      }
      if (level === 2) {
        assert.ok(challenges.every(c => c.kind === 'yes-no'))
        assert.ok(lengths.every(l => l >= 4 && l <= 6))
        assert.deepEqual(new Set(challenges.map(c => c.kind === 'yes-no' && c.divisor)), new Set(DIVISORS))
      }
      if (level === 3) assert.ok(challenges.every(c => c.kind === 'two-rules'))
      if (level === 4) assert.ok(challenges.every(c => c.kind === 'all-divisors'))
      if (level === 5) {
        assert.deepEqual(new Set(challenges.map(c => c.kind)), new Set(['yes-no', 'two-rules', 'all-divisors']))
        assert.ok(challenges.every(c => c.kind !== 'yes-no' || c.focus === 0), 'level 5 gives no highlight up front')
      }
      if (level <= 2) {
        const yes = challenges.filter(c => c.kind === 'yes-no' && c.answer).length
        assert.equal(yes, challenges.length / 2, 'yes/no answers are balanced')
      }
    }
  }
})

test('practice rounds only use the requested rules', () => {
  const rounds = generatePractice([4, 8], seeded(2))
  assert.equal(rounds.length, 6)
  assert.ok(rounds.every(c => c.kind === 'yes-no' && (c.divisor === 4 || c.divisor === 8)))
  rounds.forEach(assertChallengeConsistent)
})

// ── answers & progress ───────────────────────────────────────────────────────

test('checkAnswer', () => {
  const yn: Challenge = { kind: 'yes-no', n: 12_348, divisor: 4, answer: true, focus: 2 }
  assert.equal(checkAnswer(yn, true), true)
  assert.equal(checkAnswer(yn, false), false)

  const all: Challenge = { kind: 'all-divisors', n: 1_233, options: [2, 3, 4, 8, 9], correct: [3, 9] }
  assert.equal(checkAnswer(all, [9, 3]), true, 'order does not matter')
  assert.equal(checkAnswer(all, [3]), false, 'missing one')
  assert.equal(checkAnswer(all, [3, 9, 2]), false, 'one extra')
  assert.equal(checkAnswer(all, [3, 9, 9]), true)
  assert.equal(checkAnswer(all, true), false)
  assert.deepEqual(challengeRules(all), [2, 3, 4, 8, 9])
})

test('per-rule stats, practice suggestions and unlocking', () => {
  let stats = addRuleResults({}, [{ divisor: 4, correct: false }, { divisor: 3, correct: true }])
  stats = addRuleResults(stats, [{ divisor: 4, correct: false }, { divisor: 8, correct: true }, { divisor: 8, correct: false }])
  assert.deepEqual(stats[4], { correct: 0, total: 2 })
  assert.equal(ruleStanding(stats[3]), 'good')
  assert.equal(ruleStanding(stats[4]), 'practise')
  assert.equal(ruleStanding(stats[9]), 'new')
  assert.deepEqual(rulesNeedingPractice(stats), [4, 8], 'weakest first')

  assert.equal(unlockedLevel([]), 1)
  assert.equal(unlockedLevel([1, 2]), 3)
  assert.equal(unlockedLevel([2]), 1, 'levels unlock in order')
  assert.equal(unlockedLevel([1, 2, 3, 4, 5]), 5)
})
