You are adding a new exercise type to this fractions learning app. Follow the 7-step checklist exactly. Do not skip steps, do not add inline styles, do not use Tailwind or Framer Motion.

## Before you start

Read these files to understand current state:
- `src/pages/Fractions.tsx` — ExerciseType union, ALL_EXERCISES array, toExerciseType(), conditional render block
- `src/types/index.ts` — ExerciseResult['exerciseType'] union
- `src/i18n/translations.ts` — Keys type and all three language tables
- `src/App.css` — existing CSS custom properties and class naming patterns
- An existing component (e.g. `src/components/TrainBuilder.tsx`) for the component pattern

## The 7 steps (all required)

### Step 1 — New component in `src/components/`

- Receives `onAnswer: (correct: boolean) => void`
- Wraps all content in `<div className="exercise-card">`
- Uses `useLang()` for any user-facing strings
- Uses CSS classes from `src/App.css` — extend it with new classes prefixed uniquely (e.g. `.rl-` for RocketLaunch, `.tc-` for TrainBuilder). No inline styles.
- Canvas exercises: use `react-konva` with `useContainerWidth`. DOM exercises: plain HTML + CSS.
- Sounds: `playFeedbackSound` is called automatically by `FeedbackBanner`. Only call `playVictorySound()` for special multi-step celebrations.
- Animations: CSS `@keyframes` only. Add them to `src/App.css`.
- If the exercise handles its own success flow (countdown, reveal, etc.), call `onAnswer(true)` only at the very end when the child taps "Next". The parent `FeedbackBanner` will then show. Do not call `onAnswer` twice.

### Step 2 — Add to `ExerciseType` union in `src/pages/Fractions.tsx`

Add the new string literal to the union on line ~34.

### Step 3 — Add puzzle entries to `ALL_EXERCISES` in `src/pages/Fractions.tsx`

- Add at least 10–15 entries so the pool is varied
- Group them with a `// --- exercise-name ---` comment
- Keep difficulty graduated (easy → hard)
- Add any new fields needed to the `Exercise` interface (lines ~36–64)

### Step 4 — Add conditional render in `src/pages/Fractions.tsx`

Place it in the JSX block with the other exercise renders (~line 559–625). Pattern:

```tsx
{current.type === 'new-type' && feedback === null && (
  <NewComponent key={index} numerator={current.numerator} denominator={current.denominator} onAnswer={handleAnswer} />
)}
```

Pass only the props the component needs. Use `key={index}` so the component remounts per puzzle.

### Step 5 — Add to `toExerciseType()` in `src/pages/Fractions.tsx`

Add before the final `return 'pizza'` line:

```ts
if (type === 'new-type') return 'new-type'
```

### Step 6 — Add to `ExerciseResult['exerciseType']` in `src/types/index.ts`

Extend the union with the new literal string.

### Step 7 — Add translation keys in `src/i18n/translations.ts`

- Add new key(s) to the `Keys` type
- Add the key to **all three** language tables: `en`, `uk`, `cs`
- Use `{n}`, `{d}`, `{qty}` etc. placeholders as needed
- Ukrainian and Czech must be real translations, not placeholder text

## After all 7 steps

Run `npx tsc --noEmit` and fix any type errors before reporting done.

## Constraints

- No Tailwind, no Framer Motion, no new CSS files — all styles go in `src/App.css`
- No inline `style={{}}` props
- Tap targets ≥ 44px, minimum font sizes large (the audience has dyslexia)
- Dark mode: add `[data-theme="dark"]` overrides for any new colors that don't use existing CSS custom properties
- No tests (project has none)
- Single component file per exercise type
