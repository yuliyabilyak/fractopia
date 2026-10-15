// The landing page offers two topics; each topic page lists its games.
// Games link back to their topic page, not to the landing page.

import type { Keys } from '../i18n/translations'

export type TopicId = 'fractions' | 'divisibility'

export const TOPIC_PATH: Record<TopicId, string> = {
  fractions: '/learn/fractions',
  divisibility: '/learn/divisibility',
}

export interface TopicGame {
  path: string
  labelKey: Keys
}

export const TOPIC_GAMES: Record<TopicId, TopicGame[]> = {
  fractions: [
    { path: '/training', labelKey: 'trainingCentre' },
    { path: '/race', labelKey: 'raceMode' },
    { path: '/maze', labelKey: 'mazeMode' },
    { path: '/pyramid', labelKey: 'pyrMode' },
    { path: '/scarab', labelKey: 'scarabMode' },
    { path: '/snake', labelKey: 'snakeMode' },
    { path: '/scroll', labelKey: 'scrollMode' },
    { path: '/anubis', labelKey: 'anubisMode' },
    { path: '/pizza', labelKey: 'ptMode' },
    { path: '/scribe', labelKey: 'scribeMode' },
  ],
  divisibility: [
    { path: '/detective', labelKey: 'ndMode' },
    { path: '/bridges', labelKey: 'nbMode' },
  ],
}
