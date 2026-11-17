/**
 * Prime Forge ember bar: consecutive correct prime-forge answers in the current
 * session. Visual only — never saved. It lives at module level because each
 * exercise remounts; the host page calls `resetEmberStreak` on entry and exit.
 */

export const EMBER_MAX = 5

let streak = 0

export const getEmberStreak = () => streak

export function recordEmberResult(correct: boolean): number {
  streak = correct ? streak + 1 : 0
  return streak
}

export function resetEmberStreak() {
  streak = 0
}
