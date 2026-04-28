export type GenerateRandomPasswordOptions = {
  length?: number
  withDigits?: boolean
  withSymbols?: boolean
  withoutSimilarLetters?: boolean
}

export const DEFAULT_PASSWORD_LENGTH = 20
export const MIN_PASSWORD_LENGTH = 8
export const MAX_PASSWORD_LENGTH = 32

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const SYMBOLS = '.!@#$%^&*_-+=?'

function getRandomIndex(maxExclusive: number): number {
  const crypto = globalThis.crypto

  if (!crypto?.getRandomValues) {
    throw new Error('Secure random generator is unavailable')
  }

  const values = new Uint32Array(1)
  crypto.getRandomValues(values)

  return values[0] % maxExclusive
}

function createPasswordCharset({
  withDigits = true,
  withSymbols = true,
  withoutSimilarLetters = false
}: Pick<
  GenerateRandomPasswordOptions,
  'withDigits' | 'withSymbols' | 'withoutSimilarLetters'
>): string {
  let charset = LETTERS
  if (withDigits) charset += NUMBERS
  if (withSymbols) charset += SYMBOLS
  if (withoutSimilarLetters) charset = charset.replace(/[lI0o]/g, '')

  return charset
}

export function generateRandomPassword({
  length = DEFAULT_PASSWORD_LENGTH,
  withDigits = true,
  withSymbols = true,
  withoutSimilarLetters = false
}: GenerateRandomPasswordOptions = {}): string {
  if (
    !Number.isInteger(length) ||
    length < MIN_PASSWORD_LENGTH ||
    length > MAX_PASSWORD_LENGTH
  ) {
    throw new Error(
      `Password length must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH}`
    )
  }

  const charset = createPasswordCharset({
    withDigits,
    withSymbols,
    withoutSimilarLetters
  })

  return Array.from(
    { length },
    () => charset[getRandomIndex(charset.length)]
  ).join('')
}
