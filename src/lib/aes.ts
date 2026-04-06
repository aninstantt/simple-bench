import CryptoJS from 'crypto-js'

export function encrypt(plaintext: string, key: string): string {
  return CryptoJS.AES.encrypt(plaintext, key).toString()
}

export function decrypt(ciphertext: string, key: string): string {
  const isPassphrase = ciphertext.startsWith('U2FsdGVkX1')

  if (isPassphrase) {
    const dec = CryptoJS.AES.decrypt(ciphertext, key)
    const txt = dec.toString(CryptoJS.enc.Utf8)
    if (txt) return txt
  }

  throw new Error('Decrypt failed: unsupported format or wrong key')
}
