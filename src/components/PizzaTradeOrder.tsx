import { useEffect, useState } from 'react'
import { useLang } from '../i18n/LangContext'
import { playFeedbackSound } from '../utils/sounds'
import SpeakPrompt from './SpeakPrompt'
import PizzaTradePizza from './PizzaTradePizza'
import { formatMixed, totalSlices, type PizzaOrder, type MixedNumber } from '../data/pizzaTrade'

interface Props {
  order: PizzaOrder
  toppingEmoji: string
  onComplete: (correct: boolean) => void
}

type Phase = 'question' | 'regroupBeat' | 'revealed'
const REVEAL_MS = 1600

function MixedDisplay({ m }: { m: MixedNumber }) {
  if (m.numerator === 0) {
    return <span className="pt-mixed-display"><span className="pt-whole-num">{m.whole}</span></span>
  }
  return (
    <span className="pt-mixed-display">
      {m.whole > 0 && <span className="pt-whole-num">{m.whole}</span>}
      <span className="frac-display">
        <span className="frac-n">{m.numerator}</span>
        <span className="frac-bar-line" />
        <span className="frac-d">{m.denominator}</span>
      </span>
    </span>
  )
}

export default function PizzaTradeOrder({ order, toppingEmoji, onComplete }: Props) {
  const { t } = useLang()
  const [phase, setPhase] = useState<Phase>('question')
  const [wholeCount, setWholeCount] = useState(0)
  const [selectedSlices, setSelectedSlices] = useState<Set<number>>(new Set())
  const [wasCorrect, setWasCorrect] = useState(false)

  const opSymbol = order.operation === 'add' ? '+' : '−'
  const promptKey = order.operation === 'add' ? 'ptAddPrompt' : 'ptSubtractPrompt'
  const promptText = t(promptKey, { left: formatMixed(order.left), right: formatMixed(order.right) })

  const targetTotal = totalSlices(order.result)
  const maxWholeStepper = order.result.whole + 3
  const regroupCaptionKey = order.operation === 'add' ? 'ptRegroupAddCaption' : 'ptRegroupSubtractCaption'

  function afterAnswer(correct: boolean) {
    playFeedbackSound(correct)
    setWasCorrect(correct)
    setPhase(order.regroup ? 'regroupBeat' : 'revealed')
  }

  useEffect(() => {
    if (phase !== 'revealed') return
    const id = setTimeout(() => onComplete(wasCorrect), REVEAL_MS)
    return () => clearTimeout(id)
    // onComplete is stable per round (defined fresh by the parent); only phase should retrigger this
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  function handleChoice(i: number) {
    if (phase !== 'question') return
    afterAnswer(i === order.correctIndex)
  }

  function toggleSlice(i: number) {
    if (phase !== 'question') return
    setSelectedSlices(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  function addWhole() {
    if (phase !== 'question') return
    setWholeCount(w => Math.min(w + 1, maxWholeStepper))
  }

  function removeWhole() {
    if (phase !== 'question') return
    setWholeCount(w => Math.max(0, w - 1))
  }

  function submitGenerate() {
    if (phase !== 'question') return
    afterAnswer(wholeCount === order.result.whole && selectedSlices.size === order.result.numerator)
  }

  return (
    <div className="exercise-card">
      <SpeakPrompt html={promptText} text={promptText} />

      <div className="pt-order-ticket">
        <PizzaTradePizza denominator={order.left.denominator} totalShaded={totalSlices(order.left)} toppingEmoji={toppingEmoji} size={84} />
        <span className="pt-op-symbol">{opSymbol}</span>
        <PizzaTradePizza denominator={order.right.denominator} totalShaded={totalSlices(order.right)} toppingEmoji={toppingEmoji} size={84} />
      </div>

      {phase === 'question' && (
        <>
          <p className="exercise-prompt">{t(order.mode === 'select' ? 'ptQuestionSelect' : 'ptQuestionGenerate')}</p>

          {order.mode === 'select' && order.choices && (
            <div className="pt-choice-row">
              {order.choices.map((choice, i) => (
                <button key={i} type="button" className="pt-choice-btn" onClick={() => handleChoice(i)}>
                  <PizzaTradePizza denominator={choice.denominator} totalShaded={totalSlices(choice)} toppingEmoji={toppingEmoji} size={64} />
                  <MixedDisplay m={choice} />
                </button>
              ))}
            </div>
          )}

          {order.mode === 'generate' && (
            <>
              <div className="pt-whole-stepper">
                <button type="button" className="pt-stepper-btn" onClick={removeWhole} disabled={wholeCount === 0} aria-label={t('ptRemovePizza')}>−</button>
                <PizzaTradePizza denominator={order.result.denominator} totalShaded={wholeCount * order.result.denominator} toppingEmoji={toppingEmoji} size={64} />
                <button type="button" className="pt-stepper-btn" onClick={addWhole} disabled={wholeCount >= maxWholeStepper} aria-label={t('ptAddPizza')}>+</button>
              </div>
              <PizzaTradePizza
                denominator={order.result.denominator}
                totalShaded={selectedSlices.size}
                toppingEmoji={toppingEmoji}
                size={84}
                selectable
                selected={selectedSlices}
                onToggle={toggleSlice}
                maxSlices={order.result.denominator}
              />
              <MixedDisplay m={{ whole: wholeCount, numerator: selectedSlices.size, denominator: order.result.denominator }} />
              <button type="button" className="btn-check" onClick={submitGenerate}>{t('check')}</button>
            </>
          )}
        </>
      )}

      {phase === 'regroupBeat' && (
        <div className="pt-regroup-beat">
          <div className={order.operation === 'add' ? 'pt-fuse-anim' : 'pt-cut-anim'}>
            <PizzaTradePizza denominator={order.result.denominator} totalShaded={targetTotal} toppingEmoji={toppingEmoji} size={84} color="reveal" />
          </div>
          <p className="pt-regroup-caption">{t(regroupCaptionKey, { d: order.result.denominator })}</p>
          <button type="button" className="btn-check" onClick={() => setPhase('revealed')}>{t('ptContinue')}</button>
        </div>
      )}

      {phase === 'revealed' && (
        <div className="pt-reveal">
          <p className={wasCorrect ? 'pt-reveal-correct' : 'pt-reveal-wrong'}>
            {wasCorrect ? t('correct') : t('ptNeutralWrong')}
          </p>
          <PizzaTradePizza denominator={order.result.denominator} totalShaded={targetTotal} toppingEmoji={toppingEmoji} size={84} color="reveal" />
          <MixedDisplay m={order.result} />
        </div>
      )}
    </div>
  )
}
