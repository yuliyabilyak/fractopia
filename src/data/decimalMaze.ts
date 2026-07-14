export interface MazeQuestion {
  numerator: number
  denominator: number
  correct: string
  wrong: [string, string]
}

export type MazeDifficulty = 'easy' | 'medium' | 'hard' | 'expert'

export const MAZE_DIFFICULTIES: MazeDifficulty[] = ['easy', 'medium', 'hard', 'expert']

export const MAZE_LENGTH: Record<MazeDifficulty, number> = {
  easy:   6,
  medium: 8,
  hard:   9,
  expert: 10,
}

export const MAZE_POOL: Record<MazeDifficulty, MazeQuestion[]> = {
  // --- halves, quarters, fifths, tenths ---
  easy: [
    { numerator: 1, denominator: 2,  correct: '0.5',  wrong: ['0.2',  '1.2'] },
    { numerator: 3, denominator: 4,  correct: '0.75', wrong: ['0.25', '0.34'] },
    { numerator: 2, denominator: 5,  correct: '0.4',  wrong: ['0.25', '0.52'] },
    { numerator: 9, denominator: 10, correct: '0.9',  wrong: ['0.19', '0.09'] },
    { numerator: 1, denominator: 4,  correct: '0.25', wrong: ['0.75', '0.14'] },
    { numerator: 1, denominator: 5,  correct: '0.2',  wrong: ['0.5',  '0.15'] },
    { numerator: 3, denominator: 10, correct: '0.3',  wrong: ['0.13', '0.03'] },
    { numerator: 7, denominator: 10, correct: '0.7',  wrong: ['0.17', '0.07'] },
    { numerator: 1, denominator: 10, correct: '0.1',  wrong: ['0.01', '1.0'] },
    { numerator: 4, denominator: 5,  correct: '0.8',  wrong: ['0.58', '0.08'] },
  ],

  // --- eighths, twentieths, twenty-fifths, fortieths, fiftieths, hundredths ---
  medium: [
    { numerator: 7,  denominator: 20,  correct: '0.35',  wrong: ['0.75',  '0.07'] },
    { numerator: 13, denominator: 20,  correct: '0.65',  wrong: ['0.36',  '0.56'] },
    { numerator: 5,  denominator: 8,   correct: '0.625', wrong: ['0.652', '0.562'] },
    { numerator: 17, denominator: 25,  correct: '0.68',  wrong: ['0.86',  '0.17'] },
    { numerator: 1,  denominator: 8,   correct: '0.125', wrong: ['0.215', '0.152'] },
    { numerator: 3,  denominator: 8,   correct: '0.375', wrong: ['0.735', '0.573'] },
    { numerator: 9,  denominator: 20,  correct: '0.45',  wrong: ['0.54',  '0.09'] },
    { numerator: 11, denominator: 20,  correct: '0.55',  wrong: ['0.15',  '0.51'] },
    { numerator: 7,  denominator: 8,   correct: '0.875', wrong: ['0.785', '0.578'] },
    { numerator: 3,  denominator: 50,  correct: '0.06',  wrong: ['0.6',   '0.16'] },
    { numerator: 21, denominator: 50,  correct: '0.42',  wrong: ['0.24',  '0.4'] },
    { numerator: 9,  denominator: 40,  correct: '0.225', wrong: ['0.252', '0.9'] },
    { numerator: 27, denominator: 100, correct: '0.27',  wrong: ['0.72',  '0.207'] },
  ],

  // --- improper fractions, greater than one whole ---
  hard: [
    { numerator: 7,  denominator: 4,  correct: '1.75',  wrong: ['1.57',  '0.75'] },
    { numerator: 9,  denominator: 8,  correct: '1.125', wrong: ['1.215', '0.89'] },
    { numerator: 11, denominator: 5,  correct: '2.2',   wrong: ['1.2',   '2.02'] },
    { numerator: 13, denominator: 8,  correct: '1.625', wrong: ['1.652', '1.526'] },
    { numerator: 17, denominator: 10, correct: '1.7',   wrong: ['7.1',   '1.07'] },
    { numerator: 5,  denominator: 4,  correct: '1.25',  wrong: ['1.52',  '0.25'] },
    { numerator: 9,  denominator: 4,  correct: '2.25',  wrong: ['2.52',  '4.9'] },
    { numerator: 11, denominator: 4,  correct: '2.75',  wrong: ['2.57',  '4.11'] },
    { numerator: 21, denominator: 8,  correct: '2.625', wrong: ['2.652', '2.526'] },
    { numerator: 13, denominator: 5,  correct: '2.6',   wrong: ['2.06',  '1.3'] },
    { numerator: 19, denominator: 10, correct: '1.9',   wrong: ['9.1',   '1.09'] },
    { numerator: 11, denominator: 8,  correct: '1.375', wrong: ['1.735', '8.11'] },
  ],

  // --- repeating decimals, shown with parentheses around the repeating digits ---
  expert: [
    { numerator: 1,  denominator: 3, correct: '0.(3)',   wrong: ['0.3',   '0.(6)'] },
    { numerator: 2,  denominator: 3, correct: '0.(6)',   wrong: ['0.6',   '0.(3)'] },
    { numerator: 5,  denominator: 6, correct: '0.8(3)',  wrong: ['0.83',  '0.(83)'] },
    { numerator: 7,  denominator: 9, correct: '0.(7)',   wrong: ['0.7',   '0.(9)'] },
    { numerator: 11, denominator: 6, correct: '1.8(3)',  wrong: ['1.83',  '1.(83)'] },
    { numerator: 1,  denominator: 6, correct: '0.1(6)',  wrong: ['0.16',  '0.(16)'] },
    { numerator: 5,  denominator: 9, correct: '0.(5)',   wrong: ['0.5',   '0.(9)'] },
    { numerator: 7,  denominator: 6, correct: '1.1(6)',  wrong: ['1.16',  '1.(16)'] },
    { numerator: 4,  denominator: 9, correct: '0.(4)',   wrong: ['0.4',   '0.(9)'] },
    { numerator: 5,  denominator: 3, correct: '1.(6)',   wrong: ['1.6',   '1.(3)'] },
  ],
}
