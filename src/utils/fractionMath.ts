export interface Fraction {
  numerator: number
  denominator: number
}

export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

export function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b)
}

export function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

export function fracKey(f: Fraction): string {
  return `${f.numerator}/${f.denominator}`
}

export function isEquivalent(a: Fraction, b: Fraction): boolean {
  return a.numerator * b.denominator === b.numerator * a.denominator
}

export function scaleFraction(base: Fraction, factor: number): Fraction {
  return { numerator: base.numerator * factor, denominator: base.denominator * factor }
}
