export type Lang = 'en' | 'uk' | 'cs'

export const LANGS: { code: Lang; flag: string; label: string }[] = [
  { code: 'en', flag: '🇬🇧', label: 'EN' },
  { code: 'uk', flag: '🇺🇦', label: 'UA' },
  { code: 'cs', flag: '🇨🇿', label: 'CS' },
]

type Keys =
  | 'homeTitle' | 'homeSubtitle' | 'start'
  | 'shadeBar' | 'tapPizza' | 'tapHexagon' | 'tapGrid'
  | 'identify' | 'compare' | 'isBigger' | 'equal'
  | 'check' | 'next' | 'playAgain'
  | 'counter' | 'correct' | 'wrong'
  | 'doneTitle' | 'doneScore'

const T: Record<Lang, Record<Keys, string>> = {
  en: {
    homeTitle:   '🍕 Math with Fractions',
    homeSubtitle: 'Learn fractions with pizzas and bars!',
    start:       'Start Learning',
    shadeBar:    'Shade {n}/{d} of the bar',
    tapPizza:    'Tap {n}/{d} slices of the pizza',
    tapHexagon:  'Tap {n}/{d} parts of the hexagon',
    tapGrid:     'Tap {n}/{d} squares',
    identify:    'What fraction is shaded?',
    compare:     'Which fraction is bigger?',
    isBigger:    '{f} is bigger',
    equal:       "They're equal",
    check:       'Check',
    next:        'Next',
    playAgain:   'Play Again',
    counter:     'Exercise {i} / {total} · Score: {score}',
    correct:     '🎉 Correct! Well done!',
    wrong:       '❌ Not quite — try the next one!',
    doneTitle:   'All done! 🎉',
    doneScore:   'You got {score}/{total} correct.',
  },
  uk: {
    homeTitle:   '🍕 Математика з дробами',
    homeSubtitle: 'Вчимо дроби з піцою та смужками!',
    start:       'Почати навчання',
    shadeBar:    'Зафарбуй {n}/{d} смужки',
    tapPizza:    'Натисни на {n}/{d} шматки піци',
    tapHexagon:  'Натисни на {n}/{d} частини шестикутника',
    tapGrid:     'Натисни на {n}/{d} квадрати',
    identify:    'Яка частина зафарбована?',
    compare:     'Який дріб більший?',
    isBigger:    '{f} більший',
    equal:       'Вони рівні',
    check:       'Перевірити',
    next:        'Далі',
    playAgain:   'Грати знову',
    counter:     'Завдання {i} / {total} · Рахунок: {score}',
    correct:     '🎉 Правильно! Чудово!',
    wrong:       '❌ Не зовсім — спробуй наступне!',
    doneTitle:   'Готово! 🎉',
    doneScore:   'Правильних відповідей: {score}/{total}.',
  },
  cs: {
    homeTitle:   '🍕 Matematika se zlomky',
    homeSubtitle: 'Učíme se zlomky s pizzou a pruhy!',
    start:       'Začít učení',
    shadeBar:    'Vybarvi {n}/{d} pruhu',
    tapPizza:    'Klepni na {n}/{d} kousky pizzy',
    tapHexagon:  'Klepni na {n}/{d} části šestiúhelníku',
    tapGrid:     'Klepni na {n}/{d} čtverce',
    identify:    'Jaký zlomek je vybarven?',
    compare:     'Který zlomek je větší?',
    isBigger:    '{f} je větší',
    equal:       'Jsou stejné',
    check:       'Zkontrolovat',
    next:        'Další',
    playAgain:   'Hrát znovu',
    counter:     'Úloha {i} / {total} · Skóre: {score}',
    correct:     '🎉 Správně! Výborně!',
    wrong:       '❌ Zkus to znovu!',
    doneTitle:   'Hotovo! 🎉',
    doneScore:   'Správných odpovědí: {score}/{total}.',
  },
}

type Vars = Record<string, string | number>

export function translate(lang: Lang, key: Keys, vars?: Vars): string {
  const str = T[lang][key]
  if (!vars) return str
  return str.replace(/{(\w+)}/g, (_, k) => String(vars[k] ?? ''))
}
