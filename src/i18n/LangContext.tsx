import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { type Lang, translate } from './translations'

interface LangContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: Parameters<typeof translate>[1], vars?: Parameters<typeof translate>[2]) => string
}

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('lang') as Lang) ?? 'en'
  })

  const setLang = (l: Lang) => {
    localStorage.setItem('lang', l)
    setLangState(l)
  }

  const t: LangContextValue['t'] = (key, vars) => translate(lang, key, vars)

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside LangProvider')
  return ctx
}
