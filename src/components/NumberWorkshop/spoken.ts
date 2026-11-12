import type { Keys } from '../../i18n/translations'

type T = (key: Keys, vars?: Record<string, string | number>) => string

/**
 * Text for narration: "×" is read as "times" (never "x"), "=" as "equals",
 * a gap "?" as "what", and 12/18 as "12 over 18".
 */
export function spoken(text: string, t: T): string {
  return text
    .replace(/(\d+)\/(\d+)/g, (_, n, d) => t('wsSpeakFrac', { n, d }))
    .replace(/×/g, ` ${t('wsTimes')} `)
    .replace(/=/g, ` ${t('wsEquals')} `)
    .replace(/\?/g, ` ${t('wsWhat')} `)
    .replace(/\s+/g, ' ')
    .trim()
}
