import { useMemo } from 'react'
import { useLang } from '../i18n/LangContext'

export type ItemKey =
  | 'itemApples' | 'itemEggs' | 'itemStars' | 'itemFlowers' | 'itemPencils'
  | 'itemBalloons' | 'itemOranges' | 'itemStrawberries' | 'itemBooks' | 'itemLemons'

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

function EmojiGroups({ qty, denominator, numerator, emoji }: {
  qty: number; denominator: number; numerator: number; emoji: string
}) {
  const groupSize = Math.round(qty / denominator)
  return (
    <div className="fq-groups">
      {Array.from({ length: denominator }, (_, i) => (
        <div key={i} className={`fq-group ${i < numerator ? 'fq-group--active' : 'fq-group--dim'}`}>
          {Array.from({ length: groupSize }, (_, j) => (
            <span key={j} className="fq-emoji" aria-hidden="true">{emoji}</span>
          ))}
        </div>
      ))}
    </div>
  )
}

export default function FractionQuantity({
  numerator, denominator, quantity, itemKey, emoji, answer, onAnswer,
}: Props) {
  const { t } = useLang()

  const choices = useMemo(
    () => makeChoices(numerator, denominator, quantity, answer),
    [numerator, denominator, quantity, answer],
  )

  const item = t(itemKey)
  const prompt = t('fracQuantity', { n: numerator, d: denominator, qty: quantity, item })
    .replace(/(\d+\/\d+)/, '<strong>$1</strong>')

  return (
    <div className="exercise-card">
      <p className="exercise-prompt" dangerouslySetInnerHTML={{ __html: prompt }} />
      <EmojiGroups qty={quantity} denominator={denominator} numerator={numerator} emoji={emoji} />
      <div className="answer-choices">
        {choices.map(c => (
          <button key={c} className="answer-choice-btn" onClick={() => onAnswer(c === answer)}>
            <span className="answer-choice-num">{c}</span>
            <span className="answer-choice-unit">{item}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
