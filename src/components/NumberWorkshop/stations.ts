import type { StationId } from '../../data/numberWorkshop'
import type { Keys } from '../../i18n/translations'

export const STATION_META: Record<StationId, { icon: string; nameKey: Keys; descKey: Keys }> = {
  'tile-press':         { icon: '🔲', nameKey: 'wsStationTile',    descKey: 'wsStationTileDesc' },
  'factor-tree':        { icon: '🌳', nameKey: 'wsStationTree',    descKey: 'wsStationTreeDesc' },
  'missing-multiplier': { icon: '🔍', nameKey: 'wsStationMissing', descKey: 'wsStationMissingDesc' },
  'decimal-scaler':     { icon: '🔬', nameKey: 'wsStationScaler',  descKey: 'wsStationScalerDesc' },
  'fraction-cancel':    { icon: '✂️', nameKey: 'wsStationCancel',  descKey: 'wsStationCancelDesc' },
}
