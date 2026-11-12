import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  ALL_STATIONS, BATTERY_SIZE, DEFAULT_SAVE, MAX_DENOMINATOR, NEW_SESSION, PARTS, STARS_PER_PART, TIMES, TILE_MAX_SIDE,
  applyAnswer, batteryCharge, choiceParts, factorPairs, formatDecimal, generateProblem, isCorrectAnswer, isCorrectChoice,
  isPrime, missingSlots, normalizeSave, parseValue, primeFactors, problemKey, productOf, solutionParts, splitFactors,
  splitOptions,
  type CancelProblem, type Level, type MissingProblem, type Rng, type ScalerProblem, type TileProblem, type TreeProblem,
  type WorkshopProblem, type WorkshopSave,
} from './numberWorkshop.ts'

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

const LEVELS: Level[] = [1, 2, 3]
const SAMPLES = 400
const MAX_TARGET: Record<Level, number> = { 1: 30, 2: 60, 3: 100 }

function* problems(): Generator<WorkshopProblem> {
  for (const station of ALL_STATIONS) {
    for (const level of LEVELS) {
      const rng = seeded(station.length * 100 + level)
      for (let i = 0; i < SAMPLES; i++) yield generateProblem(station, level, rng)
    }
  }
}

const times = (...xs: (string | number)[]) => xs.map(String)

test('exact values and products', () => {
  assert.deepEqual(parseValue('0.24'), { n: 6, d: 25 })
  assert.deepEqual(productOf(['24', '0.01']), { n: 6, d: 25 })
  assert.deepEqual(productOf(['2', '2', '3', '3']), { n: 36, d: 1 })
  assert.equal(productOf(['2', 'x']), null)
  assert.equal(formatDecimal({ n: 3, d: 50 }, 2), '0.06')
  assert.deepEqual(splitFactors(`2 ${TIMES} 3 ${TIMES} 4`), ['2', '3', '4'])
})

test('prime helpers', () => {
  assert.deepEqual(primeFactors(72), [2, 2, 2, 3, 3])
  assert.deepEqual(primeFactors(13), [13])
  assert.deepEqual(factorPairs(24), [[2, 12], [3, 8], [4, 6]])
  assert.ok(isPrime(2) && isPrime(97) && !isPrime(1) && !isPrime(91))
})

test('every generated problem has exactly one correct card, and a correct solution', () => {
  for (const p of problems()) {
    assert.ok(isCorrectAnswer(p, solutionParts(p)), `solution wrong for ${problemKey(p)}`)
    if (p.answerMode !== 'select') continue
    const choices = p.choices!
    assert.ok(choices.length >= 3 && choices.length <= 4, `${choices.length} cards for ${problemKey(p)}: ${choices.join(' | ')}`)
    assert.equal(new Set(choices).size, choices.length, `duplicate cards: ${choices.join(' | ')}`)
    const correct = choices.map((_, i) => i).filter(i => isCorrectChoice(p, i))
    assert.deepEqual(correct, [p.correctIndex], `${problemKey(p)}: ${choices.join(' | ')}`)
  }
})

test('products only — no + anywhere in what the student sees', () => {
  for (const p of problems()) {
    for (const s of [...(p.choices ?? []), ...('cards' in p ? p.cards ?? [] : [])]) {
      assert.ok(!s.includes('+'), `${problemKey(p)}: ${s}`)
      assert.ok(!/\dx\d/i.test(s), `letter x used as times: ${s}`)
    }
  }
})

test('targets follow the level limits, and composites are preferred', () => {
  for (const p of problems()) {
    if (p.station === 'tile-press' || p.station === 'factor-tree' || p.station === 'missing-multiplier') {
      assert.ok(p.target <= MAX_TARGET[p.level], problemKey(p))
    }
    if (p.station === 'tile-press') {
      assert.ok(!isPrime(p.target) && factorPairs(p.target, TILE_MAX_SIDE[p.level]).length > 0, problemKey(p))
    }
    if (p.station === 'factor-tree' && !isPrime(p.target)) {
      const k = primeFactors(p.target).length
      if (p.level === 1) assert.ok(k <= 3, `level 1 tree deeper than 2 splits: ${p.target}`)
      if (p.level === 3) assert.ok(k >= 4, `level 3 tree too easy: ${p.target}`)
    }
    if (p.station === 'factor-tree' && isPrime(p.target)) assert.ok(p.level < 3, 'prime teaching problem at level 3')
  }
})

test('missing multiplier: level 1 small factors and two slots, more slots later', () => {
  let threes = 0
  for (const p of problems()) {
    if (p.station !== 'missing-multiplier') continue
    const all = [...p.knownFactors, p.answer]
    if (p.level === 1) assert.ok(all.length === 2 && all.every(f => f >= 2 && f <= 6), problemKey(p))
    if (p.level > 1) assert.ok(all.every(f => f >= 2 && f <= 10), problemKey(p))
    if (all.length === 3) threes++
    assert.equal(all.reduce((a, b) => a * b, 1), p.target)
    if (p.answerMode === 'build') assert.ok(p.cards!.includes(String(p.answer)) && p.cards!.length >= 3)
  }
  assert.ok(threes > 0)
})

test('decimal scaler: terminating values with all their zeros, one more place per level', () => {
  for (const p of problems()) {
    if (p.station !== 'decimal-scaler') continue
    const places = p.value.split('.')[1].length
    assert.equal(places, p.level, p.value)
    assert.match(p.value, /[1-9]$/)
    assert.equal(formatDecimal(parseValue(p.value)!, places), p.value)
    if (p.answerMode === 'build') {
      assert.ok(p.cards!.includes(String(p.whole)))
      const right = p.cards!.filter(c => isCorrectAnswer(p, [c, p.scaleFactor]))
      assert.deepEqual(right, [String(p.whole)])
    }
  }
})

test('fraction cancel: shared factor > 1, denominators ≤ 20', () => {
  for (const p of problems()) {
    if (p.station !== 'fraction-cancel') continue
    assert.ok(p.commonFactor > 1 && p.denominator <= MAX_DENOMINATOR, problemKey(p))
    assert.equal(p.topFactors[0] * p.topFactors[1], p.numerator)
    assert.equal(p.bottomFactors[0] * p.bottomFactors[1], p.denominator)
  }
})

test('grading multiplies — any valid arrangement is right, sums never are', () => {
  const tile: TileProblem = { station: 'tile-press', level: 2, answerMode: 'build', target: 24 }
  assert.ok(isCorrectAnswer(tile, times(4, 6)))
  assert.ok(isCorrectAnswer(tile, times(8, 3)))
  assert.ok(isCorrectAnswer(tile, times(2, 12)))
  assert.ok(!isCorrectAnswer(tile, times(1, 24)), 'a 1-wide strip is not a split')
  assert.ok(!isCorrectAnswer(tile, times(20, 4)), '20 + 4 is a sum')
  assert.ok(!isCorrectAnswer(tile, times(5, 5)))

  const tree: TreeProblem = { station: 'factor-tree', level: 2, answerMode: 'build', target: 36 }
  assert.ok(isCorrectAnswer(tree, times(3, 2, 3, 2)))
  assert.ok(!isCorrectAnswer(tree, times(4, 9)), 'not split down to primes')
  assert.ok(!isCorrectAnswer(tree, times(2, 2, 3)))
  const prime: TreeProblem = { ...tree, target: 13 }
  assert.ok(isCorrectAnswer(prime, ['13']))
  assert.ok(!isCorrectAnswer(prime, times(1, 13)))

  const missing: MissingProblem = {
    station: 'missing-multiplier', level: 2, answerMode: 'build', target: 60, knownFactors: [2, 5], missingIndex: 2, answer: 6,
  }
  assert.deepEqual(missingSlots(missing), [2, 5, null])
  assert.ok(isCorrectAnswer(missing, times(2, 5, 6)))
  assert.ok(!isCorrectAnswer(missing, times(10, 6)), 'shown factors must stay')
  assert.ok(!isCorrectAnswer(missing, times(2, 5, 53)), '60 − 7 is the additive slip')

  const scaler: ScalerProblem = { station: 'decimal-scaler', level: 2, answerMode: 'build', value: '0.24', scaleFactor: '0.01', whole: 24 }
  assert.ok(isCorrectAnswer(scaler, ['24', '0.01']))
  assert.ok(isCorrectAnswer(scaler, ['240', '0.001']))
  assert.ok(!isCorrectAnswer(scaler, ['24', '0.1']))
  assert.ok(!isCorrectAnswer(scaler, ['2.4', '0.1']), 'first factor must be whole')

  const cancel: CancelProblem = {
    station: 'fraction-cancel', level: 2, answerMode: 'build', numerator: 12, denominator: 18, commonFactor: 6,
    topFactors: [2, 6], bottomFactors: [6, 3],
  }
  assert.ok(isCorrectAnswer(cancel, ['6', '6']))
  assert.ok(!isCorrectAnswer(cancel, ['2', '3']))
  assert.ok(!isCorrectAnswer(cancel, ['2', '2']), 'only part of the shared multiplier')
  assert.ok(isCorrectAnswer(cancel, ['2/3']))
  assert.ok(!isCorrectAnswer(cancel, ['4/6']))
  assert.deepEqual(choiceParts(cancel, '2/3'), ['2/3'])
})

test('mode A distractors include the classic slips', () => {
  const rng = seeded(5)
  let sawMisplacedDecimal = false
  let sawAdditive = false
  for (let i = 0; i < 300; i++) {
    const s = generateProblem('decimal-scaler', 2, rng) as ScalerProblem
    if (s.answerMode === 'select' && s.choices!.includes(`${s.whole} ${TIMES} 0.1`)) sawMisplacedDecimal = true
    const m = generateProblem('missing-multiplier', 1, rng) as MissingProblem
    const known = m.knownFactors.reduce((a, b) => a * b, 1)
    if (m.answerMode === 'select' && m.choices!.includes(String(m.target - known))) sawAdditive = true
  }
  assert.ok(sawMisplacedDecimal && sawAdditive)
})

test('factor tree split options: real pairs plus one that only adds up', () => {
  const rng = seeded(9)
  for (let n = 4; n <= 100; n++) {
    const opts = splitOptions(n, rng)
    if (isPrime(n)) { assert.deepEqual(opts, []); continue }
    const real = opts.filter(([a, b]) => a * b === n)
    assert.ok(real.length >= 1 && real.length <= 3, `${n}`)
    assert.equal(opts.length - real.length, 1, `${n}: ${JSON.stringify(opts)}`)
  }
})

test('no immediate repeats', () => {
  const rng = seeded(3)
  for (const station of ALL_STATIONS) {
    let prev: WorkshopProblem | null = null
    for (let i = 0; i < 200; i++) {
      const p = generateProblem(station, 2, rng, prev)
      if (prev) assert.notEqual(problemKey(p), problemKey(prev))
      prev = p
    }
  }
})

test('mode B is rarer at level 1 than at level 3', () => {
  const share = (level: Level) => {
    const rng = seeded(11)
    let build = 0
    for (let i = 0; i < 1000; i++) if (generateProblem('tile-press', level, rng).answerMode === 'build') build++
    return build / 1000
  }
  assert.ok(share(1) < 0.4 && share(3) > 0.6)
})

// ── progress ─────────────────────────────────────────────────────────────────

function play(answers: boolean[], station = 'tile-press' as const, start: WorkshopSave = DEFAULT_SAVE) {
  let save = start
  let session = NEW_SESSION
  const events = []
  for (const correct of answers) {
    const r = applyAnswer(save, session, station, correct)
    save = r.save
    session = r.session
    events.push(r.events)
  }
  return { save, session, events }
}

test('three stars build a part; wrong answers never take anything away', () => {
  const { save, events } = play([true, false, true, true])
  assert.deepEqual(save.unlockedParts, [PARTS[0].id])
  assert.equal(save.stars, 0)
  assert.equal(events[3].partUnlocked, PARTS[0].id)
  assert.equal(events[1].starEarned, false)
  assert.deepEqual(play([false, false], 'tile-press', save).save, save)
})

test('a station levels up after 3 in a row, never down, and caps at 3', () => {
  const r = play([true, true, true])
  assert.equal(r.save.stationLevels['tile-press'], 2)
  assert.equal(r.events[2].levelUp, 2)
  assert.equal(r.save.stationLevels['factor-tree'], 1)
  assert.equal(play([true, true, false, true, true]).save.stationLevels['tile-press'], 1)
  const many = play(Array(20).fill(true))
  assert.equal(many.save.stationLevels['tile-press'], 3)
  assert.equal(play([false, false, false], 'tile-press', many.save).save.stationLevels['tile-press'], 3)
})

test('a full battery gilds the oldest plain part', () => {
  const r = play(Array(BATTERY_SIZE * 2).fill(true))
  assert.equal(r.events[BATTERY_SIZE - 1].batteryFull, true)
  assert.equal(r.events[BATTERY_SIZE - 1].goldenPart, PARTS[0].id)
  assert.deepEqual(r.save.goldenParts, [PARTS[0].id, PARTS[1].id])
  assert.equal(r.save.highStreak, BATTERY_SIZE * 2)
  assert.equal(batteryCharge(0), 0)
  assert.equal(batteryCharge(BATTERY_SIZE), BATTERY_SIZE)
  assert.equal(batteryCharge(BATTERY_SIZE + 2), 2)
})

test('the robot stops growing at the last part', () => {
  assert.equal(play(Array(STARS_PER_PART * (PARTS.length + 2)).fill(true)).save.unlockedParts.length, PARTS.length)
})

test('normalizeSave fills defaults for users who never played', () => {
  assert.deepEqual(normalizeSave(undefined), DEFAULT_SAVE)
  assert.deepEqual(normalizeSave({}), DEFAULT_SAVE)
  const partial = normalizeSave({
    unlockedParts: ['body', 'nope', 'body'],
    stationLevels: { 'factor-tree': 3, 'tile-press': 9, 'bond-bridge': 2 },
    stars: 7, goldenParts: ['head'],
  })
  assert.deepEqual(partial.unlockedParts, ['body'])
  assert.equal(partial.stationLevels['factor-tree'], 3)
  assert.equal(partial.stationLevels['tile-press'], 1)
  assert.ok(!('bond-bridge' in partial.stationLevels), 'unknown stations dropped')
  assert.equal(partial.stars, STARS_PER_PART - 1)
  assert.deepEqual(partial.goldenParts, [])
})
