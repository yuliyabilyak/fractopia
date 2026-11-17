interface Props {
  /** trusted markup built from translations and numbers */
  html: string
}

/** The exercise's one short instruction line. */
export default function Prompt({ html }: Props) {
  return <p className="exercise-prompt" dangerouslySetInnerHTML={{ __html: html }} />
}
