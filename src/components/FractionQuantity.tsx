import { useState, useMemo } from 'react'
import { useLang } from '../i18n/LangContext'
import { useTheme } from '../i18n/ThemeContext'
import type { translate } from '../i18n/translations'

type TKey = Parameters<typeof translate>[1]

export type ItemKey =
  | 'itemApples' | 'itemEggs' | 'itemStars' | 'itemFlowers' | 'itemPencils'
  | 'itemBalloons' | 'itemOranges' | 'itemStrawberries' | 'itemBooks' | 'itemLemons'

const FUNNY_MAP: Record<ItemKey, { emoji: string; key: TKey }> = {
  itemApples:       { emoji: '🐸', key: 'itemFrog' },
  itemEggs:         { emoji: '🦋', key: 'itemButterfly' },
  itemStars:        { emoji: '🐢', key: 'itemTurtle' },
  itemFlowers:      { emoji: '🦜', key: 'itemParrot' },
  itemPencils:      { emoji: '🐠', key: 'itemFishAnimal' },
  itemBalloons:     { emoji: '🐝', key: 'itemBee' },
  itemOranges:      { emoji: '🦊', key: 'itemFox' },
  itemStrawberries: { emoji: '🐧', key: 'itemPenguin' },
  itemBooks:        { emoji: '🦩', key: 'itemFlamingo' },
  itemLemons:       { emoji: '🐬', key: 'itemDolphin' },
}

const EVIL_MAP: Record<ItemKey, { emoji: string; key: TKey }> = {
  itemApples:       { emoji: '🧛', key: 'itemVampire' },
  itemEggs:         { emoji: '🧙', key: 'itemWitch' },
  itemStars:        { emoji: '💀', key: 'itemSkull' },
  itemFlowers:      { emoji: '🦇', key: 'itemBat' },
  itemPencils:      { emoji: '🕷️', key: 'itemSpider' },
  itemBalloons:     { emoji: '👻', key: 'itemGhost' },
  itemOranges:      { emoji: '🧟', key: 'itemZombie' },
  itemStrawberries: { emoji: '🐍', key: 'itemSnake' },
  itemBooks:        { emoji: '🦂', key: 'itemScorpion' },
  itemLemons:       { emoji: '🧪', key: 'itemPotion' },
}

interface Props {
  numerator: number
  denominator: number
  quantity: number
  itemKey: ItemKey
  emoji: string
  answer: number
  onAnswer: (correct: boolean) => void
}

function makeChoices(n: number, d: number, qty: number, answer: number): number[] {
  const step = qty / d
  const candidates = new Set<number>()
  candidates.add(Math.round(step))
  candidates.add(qty - answer)
  candidates.add(Math.round(answer + step))
  candidates.add(Math.round(answer - step) > 0 ? Math.round(answer - step) : answer + 1)
  candidates.add(Math.round(qty * (n + 1) / d))
  for (let i = 1; candidates.size < 4; i++) candidates.add(answer + i)
  const distractors = [...candidates].filter(x => x > 0 && x !== answer && Number.isInteger(x))
  return [...distractors.sort(() => 0.5 - Math.random()).slice(0, 3), answer].sort(() => 0.5 - Math.random())
}

// highlightCount = null → no selection yet, all items shown equally
// highlightCount = N   → first N items highlighted, rest dimmed
function EmojiGroups({ qty, denominator, emoji, highlightCount }: {
  qty: number; denominator: number; emoji: string; highlightCount: number | null
}) {
  const groupSize = Math.round(qty / denominator)
  return (
    <div className="fq-groups">
      {Array.from({ length: denominator }, (_, gi) => (
        <div key={gi} className="fq-group">
          {Array.from({ length: groupSize }, (_, ji) => {
            const pos = gi * groupSize + ji
            const cls = highlightCount === null
              ? 'fq-emoji'
              : pos < highlightCount ? 'fq-emoji fq-emoji--sel' : 'fq-emoji fq-emoji--dim'
            return <span key={ji} className={cls} aria-hidden="true">{emoji}</span>
          })}
        </div>
      ))}
    </div>
  )
}

export default function FractionQuantity({
  numerator, denominator, quantity, itemKey, emoji, answer, onAnswer,
}: Props) {
  const { t } = useLang()
  const { theme } = useTheme()
  const [selected, setSelected] = useState<number | null>(null)

  const choices = useMemo(
    () => makeChoices(numerator, denominator, quantity, answer),
    [numerator, denominator, quantity, answer],
  )

  const override = theme === 'funny' ? FUNNY_MAP[itemKey]
                 : theme === 'evil'  ? EVIL_MAP[itemKey]
                 : null
  const effectiveEmoji = override?.emoji ?? emoji
  const item = t(override?.key ?? itemKey)
  const prompt = t('fracQuantity', { n: numerator, d: denominator, qty: quantity, item })
    .replace(/(\d+\/\d+)/, '<strong>$1</strong>')

  function handleChoice(c: number) {
    setSelected(c)
  }

  function handleSubmit() {
    if (selected === null) return
    onAnswer(selected === answer)
  }

  return (
    <div className="exercise-card">
      <p className="exercise-prompt" dangerouslySetInnerHTML={{ __html: prompt }} />
      <EmojiGroups qty={quantity} denominator={denominator} emoji={effectiveEmoji} highlightCount={selected} />
      <div className="answer-choices">
        {choices.map(c => (
          <button
            key={c}
            className={`answer-choice-btn${selected === c ? ' answer-choice-btn--sel' : ''}`}
            onClick={() => handleChoice(c)}
          >
            <span className="answer-choice-num">{c}</span>
            <span className="answer-choice-unit">{item}</span>
          </button>
        ))}
      </div>
      {selected !== null && (
        <button className="btn-check" onClick={handleSubmit}>
          {t('check')}
        </button>
      )}
    </div>
  )
}
