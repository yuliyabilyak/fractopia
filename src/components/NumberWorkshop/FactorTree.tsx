import { useState } from 'react'
import { isCorrectAnswer, isCorrectChoice, isPrime, splitOptions, type TreeProblem } from '../../data/numberWorkshop'
import { useLang } from '../../i18n/LangContext'
import AnswerCards from './AnswerCards'
import WorkshopPrompt from './WorkshopPrompt'
import { Product, ValueText } from './Values'

interface Props {
  problem: TreeProblem
  onAnswer: (correct: boolean) => void
}

interface TreeNode {
  value: number
  kids?: [TreeNode, TreeNode]
}

/** Nodes are addressed by path: "" is the root, "0"/"1" its children, "01" … */
function splitAt(node: TreeNode, path: string, pair: [number, number]): TreeNode {
  if (path === '') return { ...node, kids: [{ value: pair[0] }, { value: pair[1] }] }
  const [head, rest] = [Number(path[0]), path.slice(1)]
  const kids = [...node.kids!] as [TreeNode, TreeNode]
  kids[head] = splitAt(kids[head], rest, pair)
  return { ...node, kids }
}

const leaves = (node: TreeNode): number[] => (node.kids ? [...leaves(node.kids[0]), ...leaves(node.kids[1])] : [node.value])

/** Break a number into multipliers until only primes are left: 36 → 4 × 9 → 2 × 2 × 3 × 3. */
export default function FactorTree({ problem, onAnswer }: Props) {
  const { t } = useLang()
  const target = problem.target
  const primeTarget = isPrime(target)

  return (
    <div className="exercise-card ws-station-card">
      <WorkshopPrompt textKey="wsPromptTree" value={String(target)} />
      {problem.answerMode === 'select' ? (
        <AnswerCards
          wide
          choices={problem.choices!}
          onPick={i => onAnswer(isCorrectChoice(problem, i))}
          render={c => <span className="ws-big-value"><ValueText value={c} /></span>}
        />
      ) : (
        <TreeBuilder problem={problem} onAnswer={onAnswer} />
      )}
      {primeTarget && problem.answerMode === 'build' && (
        <p className="ws-note">{t('wsAlreadySimple', { x: target })}</p>
      )}
    </div>
  )
}

function TreeBuilder({ problem, onAnswer }: Props) {
  const { t } = useLang()
  const [history, setHistory] = useState<TreeNode[]>([{ value: problem.target }])
  const [selected, setSelected] = useState<{ path: string; value: number; options: [number, number][] } | null>(null)
  const tree = history[history.length - 1]

  const select = (path: string, value: number) =>
    setSelected(s => (s?.path === path ? null : { path, value, options: splitOptions(value) }))

  const split = (pair: [number, number]) => {
    if (!selected) return
    setHistory(h => [...h, splitAt(tree, selected.path, pair)])
    setSelected(null)
  }

  const undo = () => {
    setHistory(h => (h.length > 1 ? h.slice(0, -1) : h))
    setSelected(null)
  }

  const renderNode = (node: TreeNode, path: string) => {
    const prime = isPrime(node.value)
    const splittable = !node.kids && !prime
    return (
      <div key={path} className="ws-tree-branch">
        {splittable ? (
          <button
            type="button"
            className={`ws-tree-node ws-tree-node--open${selected?.path === path ? ' ws-tree-node--selected' : ''}`}
            aria-pressed={selected?.path === path}
            aria-label={t('wsSplitAria', { x: node.value })}
            onClick={() => select(path, node.value)}
          >
            {node.value}
          </button>
        ) : (
          <span className={`ws-tree-node${prime ? ' ws-tree-node--prime' : ''}`}>
            {node.value}
            {prime && <span className="ws-prime-badge" aria-hidden="true">✓</span>}
            {prime && <span className="ws-sr-only">, {t('wsPrime')}</span>}
          </span>
        )}
        {node.kids && <div className="ws-tree-kids">{node.kids.map((k, i) => renderNode(k, path + i))}</div>}
      </div>
    )
  }

  return (
    <>
      <div className="ws-tree">{renderNode(tree, '')}</div>

      {selected && (
        <div className="ws-split-panel" role="group" aria-label={t('wsSplitInto', { x: selected.value })}>
          <p className="ws-split-title">{t('wsSplitInto', { x: selected.value })}</p>
          <div className="ws-split-options">
            {selected.options.map(([a, b]) => (
              <button key={`${a}-${b}`} type="button" className="ws-split-btn" onClick={() => split([a, b])}>
                <Product factors={[a, b]} />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="ws-actions">
        <button type="button" className="ws-secondary-btn" disabled={history.length === 1} onClick={undo}>
          {t('wsUndo')}
        </button>
        <button type="button" className="btn-check" onClick={() => onAnswer(isCorrectAnswer(problem, leaves(tree).map(String)))}>
          {t('check')}
        </button>
      </div>
    </>
  )
}
