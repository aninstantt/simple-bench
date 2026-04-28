import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

import { generateRandomPassword } from '@/lib/password'

describe('generateRandomPassword', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('generates a 20-character password by default', () => {
    const password = generateRandomPassword()

    expect(password).toHaveLength(20)
    expect(password).toMatch(/^[A-Za-z0-9.!@#$%^&*_\-+=?]+$/)
  })

  it('requires length between 8 and 32', () => {
    expect(generateRandomPassword({ length: 8 })).toHaveLength(8)
    expect(generateRandomPassword({ length: 32 })).toHaveLength(32)
    expect(() => generateRandomPassword({ length: 7 })).toThrow(
      'Password length must be between 8 and 32'
    )
    expect(() => generateRandomPassword({ length: 33 })).toThrow(
      'Password length must be between 8 and 32'
    )
  })

  it('can exclude numbers and symbols', () => {
    const password = generateRandomPassword({
      length: 32,
      withDigits: false,
      withSymbols: false
    })

    expect(password).toMatch(/^[A-Za-z]+$/)
  })

  it('can remove similar-looking l, I, 0, and o', () => {
    const password = generateRandomPassword({
      length: 32,
      withoutSimilarLetters: true,
      withDigits: true,
      withSymbols: false
    })

    expect(password).not.toMatch(/[lI0o]/)
  })

  it('supports dot as a symbol', () => {
    vi.stubGlobal('crypto', {
      getRandomValues: vi.fn((values: Uint32Array) => {
        values[0] = 62
        return values
      })
    })

    expect(generateRandomPassword({ length: 8 })).toBe('........')
  })
})
