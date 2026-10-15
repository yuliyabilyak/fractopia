import { LOCALES, type Lang } from '../i18n/translations'

export function speak(text: string, lang: Lang) {
  try {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = LOCALES[lang]
    utter.rate = 0.95
    window.speechSynthesis.speak(utter)
  } catch {
    // speech synthesis unavailable
  }
}
