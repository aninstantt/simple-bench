import { describe, expect, it } from 'vite-plus/test'

import { encryptPackage, decryptPackage } from '@/lib/sync'

function concatTypedArrays(arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((sum, a) => sum + a.length, 0)
  const result = new Uint8Array(total)
  let offset = 0
  for (const a of arrays) {
    result.set(a, offset)
    offset += a.length
  }
  return result
}

describe('encryptPackage / decryptPackage', () => {
  it('round-trips a fake binary payload with the same mnemonic phrase', async () => {
    const fakePayload = concatTypedArrays([
      new Uint8Array([1, 2, 3, 4, 5]),
      new TextEncoder().encode('hello world, this is my fake sync payload'),
      new Uint8Array([255, 254, 253, 0, 42])
    ])

    const mnemonic = 'correct horse battery staple'

    const { encryptedBytes, hash } = await encryptPackage(fakePayload, mnemonic)

    expect(encryptedBytes).toBeInstanceOf(Uint8Array)
    expect(encryptedBytes.length).toBeGreaterThan(fakePayload.length)
    expect(hash).toMatch(/^[0-9a-f]{64}$/)

    const decrypted = await decryptPackage(encryptedBytes, mnemonic)

    expect(decrypted).toEqual(fakePayload)
  })

  it('fails to decrypt with a wrong mnemonic phrase', async () => {
    const fakePayload = new TextEncoder().encode('secret data')
    const { encryptedBytes } = await encryptPackage(
      fakePayload,
      'correct phrase'
    )

    await expect(
      decryptPackage(encryptedBytes, 'wrong phrase')
    ).rejects.toThrow()
  })

  it('produces a different hash when the payload changes', async () => {
    const phrase = 'same phrase'
    const { hash: hashA } = await encryptPackage(
      new TextEncoder().encode('first payload'),
      phrase
    )
    const { hash: hashB } = await encryptPackage(
      new TextEncoder().encode('second payload'),
      phrase
    )

    expect(hashA).not.toBe(hashB)
  })
})
