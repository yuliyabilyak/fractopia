import { STATIONS, type StationId, type WorkshopSave } from '../../data/numberWorkshop'
import { useLang } from '../../i18n/LangContext'
import PartTray from './PartTray'
import RobotView from './RobotView'
import StarMeter from './StarMeter'
import { STATION_META } from './stations'

interface Props {
  save: WorkshopSave
  onPick: (station: StationId) => void
}

/** The shop floor: the robot so far, the parts tray, and the stations. */
export default function WorkshopHub({ save, onPick }: Props) {
  const { t } = useLang()
  return (
    <div className="ws-hub">
      <h1 className="ws-hub-title"><span aria-hidden="true">🤖 </span>{t('wsTitle')}</h1>
      <p className="ws-hub-intro">{t('wsIntro')}</p>

      <div className="ws-hub-robot">
        <RobotView unlocked={save.unlockedParts} golden={save.goldenParts} />
        <div className="game-hud">
          <span className="game-hud-chip"><StarMeter stars={save.stars} /></span>
          {save.highStreak > 0 && (
            <span className="game-hud-chip"><span className="game-hud-icon" aria-hidden="true">🔋</span>{t('wsBestStreak', { n: save.highStreak })}</span>
          )}
        </div>
      </div>

      <div className="ws-stations">
        {STATIONS.map(id => {
          const meta = STATION_META[id]
          return (
            <button key={id} type="button" className="ws-station-btn" onClick={() => onPick(id)}>
              <span className="ws-station-icon" aria-hidden="true">{meta.icon}</span>
              <span className="ws-station-name">{t(meta.nameKey)}</span>
              <span className="ws-station-desc">{t(meta.descKey)}</span>
              <span className="ws-station-level">{t('wsLevel', { n: save.stationLevels[id] })}</span>
            </button>
          )
        })}
      </div>

      <PartTray unlocked={save.unlockedParts} golden={save.goldenParts} />
    </div>
  )
}
