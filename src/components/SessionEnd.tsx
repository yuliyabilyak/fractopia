import { useState } from 'react'
import { useLang } from '../i18n/LangContext'
import { useLeaderboard } from '../hooks/useLeaderboard'
import type { LeaderboardEntry } from '../types'
import PerfectScoreAnimation from './PerfectScoreAnimation'

interface Props {
  totalScore:   number
  correctCount: number
  totalCount:   number
  onPlayAgain:  () => void
}

type Phase = 'entry' | 'saving' | 'done'

const MEDALS = ['🥇', '🥈', '🥉', '4.', '5.']

function fmtDate(ts: LeaderboardEntry['date'] | null | undefined): string {
  try {
    return ts!.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  } catch {
    return '—'
  }
}

export default function SessionEnd({ totalScore, correctCount, totalCount, onPlayAgain }: Props) {
  const { t } = useLang()
  const { entries, submitScore } = useLeaderboard()
  const [phase, setPhase]                   = useState<Phase>('entry')
  const [nickname, setNickname]             = useState('')
  const [savedNickname, setSavedNickname]   = useState('')
  const [saveError, setSaveError]           = useState(false)
  const isPerfect = correctCount === totalCount

  async function handleSave() {
    const name = nickname.trim()
    if (!name) return
    setSaveError(false)
    setPhase('saving')
    const ok = await submitScore(name, totalScore, correctCount, totalCount)
    if (ok) {
      setSavedNickname(name)
      setPhase('done')
    } else {
      setSaveError(true)
      setPhase('entry')
    }
  }

  return (
    <div className="se-wrapper">
      {isPerfect ? (
        <PerfectScoreAnimation />
      ) : (
        <h2 className="se-done-title">{t('doneTitle')}</h2>
      )}

      <div className="se-score-box">
        <p className="se-pts">{totalScore}</p>
        <p className="se-pts-label">{t('lbYourScore')}</p>
        <p
          className="se-correct"
          dangerouslySetInnerHTML={{
            __html: t('doneScore', { score: correctCount, total: totalCount })
              .replace(/(\d+\/\d+)/, '<strong>$1</strong>'),
          }}
        />
      </div>

      {phase === 'entry' && (
        <div className="se-form">
          {saveError && (
            <p className="se-error">Could not save — check your connection.</p>
          )}
          <input
            className="se-input"
            type="text"
            placeholder={t('lbNameHint')}
            value={nickname}
            maxLength={20}
            autoComplete="off"
            onChange={e => setNickname(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
          />
          <button
            className="se-btn-save"
            onClick={handleSave}
            disabled={!nickname.trim()}
          >
            {t('lbSave')}
          </button>
          <button className="se-btn-skip" onClick={onPlayAgain}>
            {t('playAgain')}
          </button>
        </div>
      )}

      {phase === 'saving' && (
        <p className="se-saving">{t('lbSaving')}</p>
      )}

      {phase === 'done' && (
        <>
          <div className="se-lb">
            <p className="se-lb-title">{t('lbTitle')}</p>
            {entries.length === 0 ? (
              <p className="se-lb-empty">No scores yet</p>
            ) : (
              <table className="se-lb-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t('lbPlayer')}</th>
                    <th>{t('lbScore')}</th>
                    <th>{t('lbDate')}</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, i) => (
                    <tr
                      key={i}
                      className={
                        e.nickname === savedNickname && e.score === totalScore
                          ? 'se-lb-row--mine'
                          : ''
                      }
                    >
                      <td><span className="se-rank">{MEDALS[i]}</span></td>
                      <td>{e.nickname}</td>
                      <td className="se-pts-cell">{e.score}</td>
                      <td>{fmtDate(e.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <button className="btn-start" onClick={onPlayAgain}>
            {t('playAgain')}
          </button>
        </>
      )}
    </div>
  )
}
