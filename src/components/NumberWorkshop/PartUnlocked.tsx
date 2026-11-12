import { PARTS, type WorkshopSave } from '../../data/numberWorkshop'
import { useLang } from '../../i18n/LangContext'
import PartTray from './PartTray'
import RobotView from './RobotView'

interface Props {
  save: WorkshopSave
  part: string
  onContinue: () => void
  onWorkshop: () => void
}

/** Between rounds: the new part snaps onto the robot. */
export default function PartUnlocked({ save, part, onContinue, onWorkshop }: Props) {
  const { t } = useLang()
  const def = PARTS.find(p => p.id === part)!
  const complete = save.unlockedParts.length === PARTS.length

  return (
    <div className="ws-unlocked">
      <h1 className="ws-unlocked-title">
        <span aria-hidden="true">{def.icon} </span>{t('wsPartUnlocked', { x: t(def.nameKey) })}
      </h1>
      {complete && <p className="ws-unlocked-sub">🎉 {t('wsRobotDone')}</p>}
      <RobotView unlocked={save.unlockedParts} golden={save.goldenParts} fresh={part} />
      <PartTray unlocked={save.unlockedParts} golden={save.goldenParts} fresh={part} />
      <div className="ws-actions">
        <button type="button" className="ws-secondary-btn" onClick={onWorkshop}>{t('wsBackToWorkshop')}</button>
        <button type="button" className="btn-check" autoFocus onClick={onContinue}>{t('wsKeepBuilding')}</button>
      </div>
    </div>
  )
}
