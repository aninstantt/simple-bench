import { describe, expect, it } from 'vite-plus/test'

import { decryptPackage, encryptPackage } from '@/lib/backup'

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

const dataKey =
  'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3'

describe('encryptPackage / decryptPackage', () => {
  it('round-trips a fake binary payload with the same data key', async () => {
    const fakePayload = concatTypedArrays([
      new Uint8Array([1, 2, 3, 4, 5]),
      new TextEncoder().encode('hello world, this is my fake sync payload'),
      new Uint8Array([255, 254, 253, 0, 42])
    ])

    const { encryptedBytes } = await encryptPackage(fakePayload, dataKey)

    expect(encryptedBytes).toBeInstanceOf(Uint8Array)
    expect(encryptedBytes.length).toBeGreaterThan(fakePayload.length)

    const decrypted = await decryptPackage(encryptedBytes, dataKey)

    expect(decrypted).toEqual(fakePayload)
  })

  it('fails to decrypt with a wrong data key', async () => {
    const fakePayload = new TextEncoder().encode('secret data')
    const { encryptedBytes } = await encryptPackage(fakePayload, dataKey)

    await expect(
      decryptPackage(
        encryptedBytes,
        'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      )
    ).rejects.toThrow()
  })
})
