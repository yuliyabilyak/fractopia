# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server (Vite HMR)
npm run build      # tsc type-check + Vite production build
npm run lint       # ESLint
npx tsc --noEmit   # type-check only, no output
```

There are no tests.

## Architecture

An interactive fractions learning app for children with dyslexia. Two pages:
- **`src/pages/Home.tsx`** — anonymous Firebase login
- **`src/pages/Fractions.tsx`** — session controller; owns all exercise data, session state, and feedback

### Exercise system

`Fractions.tsx` holds the `ALL_EXERCISES` array (400+ entries), shuffles 12 per session, and renders the matching component conditionally. Adding a new exercise type requires **seven coordinated changes**:

1. **New component** in `src/components/` — receives `onAnswer: (correct: boolean) => void`, wraps content in `.exercise-card`
2. **`ExerciseType` union** in `Fractions.tsx` — add the new string literal
3. **`ALL_EXERCISES` array** — add puzzle entries
4. **Conditional render** in the JSX — `{current.type === 'new-type' && feedback === null && (...)}`
5. **`toExerciseType()`** in `Fractions.tsx` — map the new type to the `ExerciseResult['exerciseType']` union
6. **`src/types/index.ts`** — add the literal to `ExerciseResult['exerciseType']`
7. **`src/i18n/translations.ts`** — add translation keys for all three languages (en / uk / cs)

### Canvas exercises vs CSS/HTML exercises

Exercises that need interactive drawing (bars, pizzas, grids, etc.) use **Konva** (`react-konva`). Call `useContainerWidth(BASE_SIZE)` to get a responsive `{ ref, width }`, compute `scale = width / BASE_W`, and pass `scaleX={scale} scaleY={scale}` to the Konva `<Layer>`.

Exercises that are purely DOM-based (FractionTower, MatchingFractions, etc.) use plain HTML + CSS classes.

### Styling

All styles live in **`src/App.css`** using CSS custom properties (`--bg`, `--surface`, `--orange`, etc.) with a `[data-theme="dark"]` block for dark mode. There is no Tailwind. Do not add inline styles or new CSS files — extend App.css.

Reusable class names: `.exercise-card`, `.exercise-prompt`, `.btn-check`, `.btn-choice`, `.answer-choices`, `.feedback-banner`.

### Fonts & accessibility

OpenDyslexic is declared in `src/index.css` via `@font-face` pointing at `/public/fonts/`. It is the global body font. Keep minimum font sizes large and tap targets ≥ 44px.

### Internationalization

`useLang()` from `src/i18n/LangContext.tsx` returns `{ t, lang, setLang }`. `t('key', { n, d })` substitutes `{n}` / `{d}` placeholders. All three languages (en / uk / cs) must be updated together in `src/i18n/translations.ts`.

### Sounds

`src/utils/sounds.ts` exports `playFeedbackSound(correct)` and `playVictorySound()`. Both use the Web Audio API with no external files. `FeedbackBanner` calls `playFeedbackSound` automatically; call `playVictorySound` only for special celebrations.

### Firebase

Anonymous auth via `useAuth()` hook; Firestore progress via `useProgress(uid)`. Firebase config uses `VITE_FIREBASE_*` env vars. Progress is appended with `arrayUnion` on every answer — it is append-only, not updated.

### Routing

React Router v7. `/` → Home, `/fractions` → Fractions. `vercel.json` rewrites all routes to `index.html` for SPA refresh support.
