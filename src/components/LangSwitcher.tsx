import { useLang } from '../i18n/LangContext'
import { LANGS } from '../i18n/translations'

export default function LangSwitcher() {
  const { lang, setLang } = useLang()
  return (
    <div className="lang-switcher">
      {LANGS.map((l) => (
        <button
          key={l.code}
          className={`lang-btn ${lang === l.code ? 'active' : ''}`}
          onClick={() => setLang(l.code)}
        >
          {l.flag} {l.label}
        </button>
      ))}
    </div>
  )
}
