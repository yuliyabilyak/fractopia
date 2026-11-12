import { PARTS } from '../../data/numberWorkshop'
import { useLang } from '../../i18n/LangContext'

interface Props {
  unlocked: string[]
  golden: string[]
  /** the part that just snapped in, animated */
  fresh?: string | null
  size?: 'sm' | 'lg'
}

/** The robot, drawn in CSS: built parts solid, missing ones as dashed outlines. */
export default function RobotView({ unlocked, golden, fresh, size = 'lg' }: Props) {
  const { t } = useLang()
  return (
    <div
      className={`ws-robot ws-robot--${size}`}
      role="img"
      aria-label={t('wsPartsLabel', { n: unlocked.length, total: PARTS.length })}
    >
      {PARTS.map(part => {
        const state = !unlocked.includes(part.id) ? ' ws-rp--off' : golden.includes(part.id) ? ' ws-rp--gold' : ''
        return (
          <span
            key={part.id}
            aria-hidden="true"
            className={`ws-rp ws-rp--${part.id}${state}${fresh === part.id ? ' ws-rp--fresh' : ''}`}
          />
        )
      })}
    </div>
  )
}
