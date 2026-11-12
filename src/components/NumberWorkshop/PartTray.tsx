import { PARTS } from '../../data/numberWorkshop'
import { useLang } from '../../i18n/LangContext'

interface Props {
  unlocked: string[]
  golden: string[]
  fresh?: string | null
}

/** The collection: every part, built or still to come. */
export default function PartTray({ unlocked, golden, fresh }: Props) {
  const { t } = useLang()
  return (
    <section className="ws-tray" aria-label={t('wsTrayTitle')}>
      <h2 className="ws-tray-title">{t('wsTrayTitle')} · {unlocked.length}/{PARTS.length}</h2>
      <ul className="ws-tray-grid">
        {PARTS.map(part => {
          const isOn = unlocked.includes(part.id)
          const isGold = golden.includes(part.id)
          const name = t(part.nameKey)
          return (
            <li
              key={part.id}
              className={`ws-tray-slot${isOn ? '' : ' ws-tray-slot--off'}${isGold ? ' ws-tray-slot--gold' : ''}${fresh === part.id ? ' ws-tray-slot--fresh' : ''}`}
            >
              <span className="ws-tray-icon" aria-hidden="true">{isOn ? part.icon : '🔒'}</span>
              <span className="ws-tray-name">
                {isOn ? (isGold ? t('wsPartGolden', { x: name }) : name) : <span className="ws-sr-only">{t('wsPartLocked')}</span>}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
