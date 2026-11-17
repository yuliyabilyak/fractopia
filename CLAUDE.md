# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server (Vite HMR)
npm run build      # tsc type-check + Vite production build
npm run lint       # ESLint
npx tsc -b         # type-check (bare `tsc --noEmit` checks nothing — root tsconfig has no files)
npm test           # node --test on src/**/*.test.ts (Node's built-in runner + native TS, no deps)
```

Tests cover pure data modules only (e.g. `src/data/numberDetective.test.ts`). Keep a tested module
free of extensionless runtime imports so Node can load it directly; test files are type-checked by
`tsconfig.node.json`, not `tsconfig.app.json`.

## Architecture

An interactive fractions learning app for children with dyslexia. Two pages:
- **`src/pages/Home.tsx`** — anonymous Firebase login
- **`src/pages/Fractions.tsx`** — session controller; owns all exercise data, session state, and feedback

### Exercise system

`src/data/exercises.ts` holds the `ALL_EXERCISES` array (400+ entries) and the `Exercise` /
`ExerciseType` types. `Fractions.tsx` shuffles 12 per session and renders the matching component
conditionally; `TrainingCentre.tsx` renders the same components one topic at a time. Adding a new
exercise type requires **eight coordinated changes**:

1. **New component** in `src/components/` — receives `onAnswer: (correct: boolean) => void`, wraps content in `.exercise-card`
2. **`ExerciseType` union** in `src/data/exercises.ts` — add the new string literal (and any new optional fields on `Exercise`)
3. **`ALL_EXERCISES` array** in `src/data/exercises.ts` — add puzzle entries
4. **Conditional render** in `Fractions.tsx` JSX — `{current.type === 'new-type' && feedback === null && (...)}`
5. **`toExerciseType()`** in `Fractions.tsx` — map the new type to the `ExerciseResult['exerciseType']` union
6. **`src/types/index.ts`** — add the literal to `ExerciseResult['exerciseType']`
7. **`src/i18n/translations.ts`** — add translation keys for all three languages (en / uk / cs)
8. **`TrainingCentre.tsx`** — add the same conditional render *and* a `TOPICS` entry, or the type is unreachable from the Training Centre

To unit-test exercise *data*, put the entries in their own pure module and spread it into
`ALL_EXERCISES` (see `src/data/divisorDuel.ts` + its test): `exercises.ts` itself imports component
types, which Node's test runner and `tsconfig.node.json` cannot load.

**Divisibility exercises** (`prime-forge`, `shared-keys`, `divisor-duel`, `meeting-point`, `multiple-magnet`) are listed in `DIVISIBILITY_TYPES` in
`exercises.ts`. They are filtered out of the fractions session. Each divisibility `TOPICS` tile has its
own button on the divisibility page and its own route (`/prime-factors`, `/common-divisors`,
`/common-multiples`), which renders `<TrainingCentre topic="divisibility" tile="…" />`: it opens straight
into that tile, and Back returns to the topic page. For a new divisibility type, add it to
`DIVISIBILITY_TYPES` and either put it in an existing tile, or add a tile (with `titleKey`), a route in
`App.tsx` and a `TOPIC_GAMES.divisibility` entry. Skip steps 4–6 (Fractions.tsx / `ExerciseResult`):
Training does not save results.

### Canvas exercises vs CSS/HTML exercises

Exercises that need interactive drawing (bars, pizzas, grids, etc.) use **Konva** (`react-konva`). Call `useContainerWidth(BASE_SIZE)` to get a responsive `{ ref, width }`, compute `scale = width / BASE_W`, and pass `scaleX={scale} scaleY={scale}` to the Konva `<Layer>`.

Exercises that are purely DOM-based (FractionTower, MatchingFractions, etc.) use plain HTML + CSS classes.

### Styling

All styles live in **`src/App.css`** using CSS custom properties (`--bg`, `--surface`, `--orange`, etc.) with a `[data-theme="dark"]` block for dark mode. There is no Tailwind. Do not add inline styles or new CSS files — extend App.css.

Reusable class names: `.exercise-card`, `.exercise-prompt`, `.btn-check`, `.btn-choice`, `.answer-choices`, `.feedback-banner`.

### Fonts & accessibility

OpenDyslexic is declared in `src/index.css` via `@font-face` pointing at `/public/fonts/`. It is the global body font. Keep minimum font sizes large and tap targets ≥ 44px.

**No voice reading.** Speech synthesis (auto-read prompts and 🔊 read-aloud buttons) was removed from the
whole app on purpose. Exercise prompts use the plain `Prompt` component. Don't add narration even when an
exercise spec asks for "audio narration"; check with the user first. Sound effects (`sounds.ts`) are unaffected.

### Internationalization

`useLang()` from `src/i18n/LangContext.tsx` returns `{ t, lang, setLang }`. `t('key', { n, d })` substitutes `{n}` / `{d}` placeholders. All three languages (en / uk / cs) must be updated together in `src/i18n/translations.ts`.

### Sounds

`src/utils/sounds.ts` exports `playFeedbackSound(correct)` and `playVictorySound()`. Both use the Web Audio API with no external files. `FeedbackBanner` calls `playFeedbackSound` automatically; call `playVictorySound` only for special celebrations.

### Firebase

Anonymous auth via `useAuth()` hook; Firestore progress via `useProgress(uid)`. Firebase config uses `VITE_FIREBASE_*` env vars. Progress is appended with `arrayUnion` on every answer — it is append-only, not updated.

### Routing

React Router v7. `/` → Home, `/fractions` → Fractions, `/training` → TrainingCentre (fractions tiles), `/prime-factors` / `/common-divisors` / `/common-multiples` → TrainingCentre opened on one divisibility tile. `vercel.json` rewrites all routes to `index.html` for SPA refresh support.
