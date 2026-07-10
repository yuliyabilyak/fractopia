import type { Lang } from '../i18n/translations'

const LOCALE: Record<Lang, string> = { en: 'en-US', uk: 'uk-UA', cs: 'cs-CZ' }

export function speak(text: string, lang: Lang) {
  try {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = LOCALE[lang]
    utter.rate = 0.95
    window.speechSynthesis.speak(utter)
  } catch {
    // speech synthesis unavailable
  }
}
