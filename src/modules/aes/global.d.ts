export {}

declare global {
  namespace Aes {
    type Mode = 'encrypt' | 'decrypt'

    interface TableKV {
      id: number
      val: string
    }
  }
}
