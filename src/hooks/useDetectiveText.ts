import { useLang } from '../i18n/LangContext'
import { LOCALES, type Keys } from '../i18n/translations'
import {
  formatNumber,
  type Challenge, type Conclusion, type ConclusionPart, type Divisor, type LevelId, type Step,
} from '../data/numberDetective'

export const RULE_KEY: Record<Divisor, Keys> = {
  2: 'ndRule2', 3: 'ndRule3', 4: 'ndRule4', 5: 'ndRule5',
  6: 'ndRule6', 8: 'ndRule8', 9: 'ndRule9', 10: 'ndRule10',
}

export const LEVEL_NAME_KEY: Record<LevelId, Keys> = {
  1: 'ndLevel1', 2: 'ndLevel2', 3: 'ndLevel3', 4: 'ndLevel4', 5: 'ndLevel5',
}

/**
 * Turns rule/explanation data into localized sentences.
 */
export function useDetectiveText() {
  const { t, lang } = useLang()
  const locale = LOCALES[lang]

  const num = (n: number) => formatNumber(n, locale)
  const orList = (items: number[]) => new Intl.ListFormat(locale, { type: 'disjunction' }).format(items.map(String))

  function question(c: Challenge): string {
    if (c.kind === 'yes-no') return t('ndQuestionYesNo', { n: num(c.n), d: c.divisor })
    if (c.kind === 'two-rules') return t('ndQuestionTwo', { n: num(c.n), a: c.divisors[0], b: c.divisors[1] })
    return t('ndQuestionAll', { n: num(c.n) })
  }

  function rule(d: Divisor): string {
    return t(RULE_KEY[d])
  }

  function step(s: Step): string {
    switch (s.kind) {
      case 'rule':       return `${t('ndRuleFor', { d: s.divisor })}: ${rule(s.divisor)}`
      case 'last-digit': return t(s.ok ? 'ndStepDigitYes' : 'ndStepDigitNo', { digit: s.digit, allowed: orList(s.allowed) })
      case 'last-part':  return t(s.count === 2 ? 'ndStepLast2' : 'ndStepLast3', { part: s.part })
      case 'digit-sum':  return t('ndStepSum', { expr: s.digits.join(' + '), sum: s.sum })
      case 'divide':     return t(s.ok ? 'ndStepDivideYes' : 'ndStepDivideNo', { a: num(s.dividend), d: s.divisor, q: num(s.quotient), r: s.remainder })
    }
  }

  function part(p: ConclusionPart): string {
    return t(p.ok ? 'ndPartYes' : 'ndPartNo', { d: p.divisor })
  }

  function conclusion(c: Conclusion): string {
    if (c.asked.length === 2) {
      return t(c.ok ? 'ndConclBothYes' : 'ndConclBothNo', { n: num(c.n), a: c.asked[0], b: c.asked[1] })
    }
    return t(c.ok ? 'ndConclYes' : 'ndConclNo', { n: num(c.n), d: c.asked[0] })
  }

  return { num, question, rule, step, part, conclusion }
}
