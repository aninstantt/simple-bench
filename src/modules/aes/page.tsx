import {
  Lock,
  Unlock,
  ArrowDownUp,
  KeyRound,
  FileText,
  FileOutput,
  ShieldAlert,
  Save
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { ColorButton } from '@/components/custom/color-button'
import { CopyButton } from '@/components/custom/copy'
import { PageHeader } from '@/components/custom/page-header'
import { SavedText } from '@/components/custom/saved-text'
import { WithLoading } from '@/components/custom/with-loading'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { encrypt, decrypt } from '@/lib/aes'
import { cn } from '@/lib/utils'

import { storeAesKey, retrieveAesKey, storeMode, retrieveMode } from './db'
import { RandomPasswordDialog } from './random-password-dialog'

export function AesPage() {
  const [hydrated, setHydrated] = useState(false)
  const [mode, setMode] = useState<Aes.Mode>('encrypt')
  const [key, setKey] = useState('')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [keySaved, setKeySaved] = useState(false)
  const saveKeyFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  const isEncrypt = mode === 'encrypt'

  const handleRun = () => {
    setError('')
    if (!key.trim()) {
      setError('请输入密钥')
      return
    }
    if (!input.trim()) {
      setError('请输入内容')
      return
    }
    try {
      setOutput(isEncrypt ? encrypt(input, key) : decrypt(input, key))
    } catch (e) {
      setError(e instanceof Error ? e.message : '操作失败')
      setOutput('')
    }
  }

  const handleToggleMode = () => {
    const next: Aes.Mode = isEncrypt ? 'decrypt' : 'encrypt'
    setMode(next)
    setOutput('')
    setError('')
    void storeMode(next)
  }

  const handleSaveKey = async () => {
    const trimmed = key.trim()
    if (!trimmed) {
      setError('请先输入密钥')
      return
    }
    setError('')
    try {
      await storeAesKey(trimmed)
      if (saveKeyFlashTimerRef.current) {
        clearTimeout(saveKeyFlashTimerRef.current)
      }
      setKeySaved(true)
      saveKeyFlashTimerRef.current = setTimeout(() => {
        setKeySaved(false)
        saveKeyFlashTimerRef.current = null
      }, 1000)
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败')
    }
  }

  useEffect(() => {
    setTimeout(() => {
      void retrieveAesKey()
        .then(v => {
          if (v) setKey(v)
        })
        .catch(() => {})

      void retrieveMode()
        .then(v => {
          if ((v && v === 'encrypt') || v === 'decrypt') setMode(v)
          else setMode('encrypt')
        })
        .catch(() => {})
        .finally(() => {
          setHydrated(true)
        })
    }, 1)

    return () => {
      if (saveKeyFlashTimerRef.current) {
        clearTimeout(saveKeyFlashTimerRef.current)
      }
    }
  }, [])

  return (
    <WithLoading loading={!hydrated}>
      <section className="mx-auto max-w-lg">
        <PageHeader
          icon={
            isEncrypt ? (
              <Lock className="size-4" />
            ) : (
              <Unlock className="size-4" />
            )
          }
          title={`AES ${isEncrypt ? '加密' : '解密'}`}
          description="基于 CryptoJS Passphrase 模式，输入内容与密钥即可完成对称加解密"
        />

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleMode}
              className="group inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-1.5 text-[13px] font-medium text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-100 active:scale-[0.97] dark:border-zinc-600 dark:bg-zinc-600/50 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-600"
            >
              <ArrowDownUp className="size-3 text-zinc-400 transition-transform duration-300 group-hover:rotate-180 dark:text-zinc-600" />
              <span className="text-zinc-400 dark:text-zinc-600">切换模式</span>
            </button>
            <RandomPasswordDialog />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-600 dark:text-zinc-400">
              <FileText className="size-3.5" />
              {isEncrypt ? '明文' : '密文'}
            </label>
            <Textarea
              className="min-h-24 resize-none font-mono text-[13px] leading-relaxed"
              placeholder={isEncrypt ? '输入要加密的内容' : '粘贴要解密的密文'}
              value={input}
              onChange={e => setInput(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label
              className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-600 dark:text-zinc-400"
              htmlFor="aes-key-input"
            >
              <KeyRound className="size-3.5" aria-hidden />
              密钥
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                id="aes-key-input"
                type="password"
                placeholder="输入 AES 密钥"
                className="h-12 min-h-12 w-full shrink-0 touch-manipulation text-[13px] sm:h-11 sm:min-h-0 sm:flex-1 sm:shrink"
                value={key}
                onChange={e => {
                  setKey(e.target.value)
                  if (saveKeyFlashTimerRef.current) {
                    clearTimeout(saveKeyFlashTimerRef.current)
                    saveKeyFlashTimerRef.current = null
                  }
                  setKeySaved(false)
                }}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => void handleSaveKey()}
                className={cn(
                  'inline-flex shrink-0 cursor-pointer touch-manipulation items-center gap-1 self-start rounded-md px-2 py-1 text-xs font-medium transition-colors active:scale-[0.97] sm:self-center',
                  keySaved
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600 dark:hover:text-zinc-200'
                )}
              >
                {keySaved ? (
                  <>
                    <SavedText />
                  </>
                ) : (
                  <>
                    <Save className="size-3" />
                    保存密钥
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="pt-1">
            <ColorButton
              onClick={handleRun}
              type={isEncrypt ? 'orange' : 'green'}
              className={cn(
                'h-11',
                isEncrypt
                  ? 'focus-visible:ring-[#FF5A33]/40'
                  : 'focus-visible:ring-[#00b3ad]/40'
              )}
            >
              {isEncrypt ? (
                <Lock className="size-3.5" />
              ) : (
                <Unlock className="size-3.5" />
              )}
              {isEncrypt ? '加密' : '解密'}
            </ColorButton>
          </div>
        </div>

        {error ? (
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-red-200/60 bg-red-50/60 px-3.5 py-2.5 dark:border-red-900/40 dark:bg-red-950/30">
            <ShieldAlert className="mt-px size-4 shrink-0 text-red-500 dark:text-red-400" />
            <p className="text-sm leading-relaxed text-red-700 dark:text-red-300">
              {error}
            </p>
          </div>
        ) : null}

        {output ? (
          <div
            className={
              isEncrypt
                ? 'mt-8 rounded-2xl border border-rose-200/50 bg-rose-50/40 p-5 py-2 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.04)] dark:border-rose-800/30 dark:bg-rose-950/20'
                : 'mt-8 rounded-2xl border border-emerald-200/50 bg-emerald-50/40 p-5 py-2 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.04)] dark:border-emerald-800/30 dark:bg-emerald-950/20'
            }
          >
            <div className="flex items-center justify-between">
              <span
                className={
                  isEncrypt
                    ? 'flex items-center gap-1.5 text-[13px] font-medium text-rose-700 dark:text-rose-300'
                    : 'flex items-center gap-1.5 text-[13px] font-medium text-emerald-700 dark:text-emerald-400'
                }
              >
                <FileOutput className="size-3.5" />
                {isEncrypt ? '密文' : '明文'}
              </span>
              <CopyButton text={output} showText />
            </div>
            <div className="mt-1 rounded-lg bg-zinc-50 px-4 py-3 font-mono text-[13px] leading-relaxed break-all text-zinc-600 select-all dark:bg-zinc-600/50 dark:text-zinc-200">
              {output}
            </div>
          </div>
        ) : null}
      </section>
    </WithLoading>
  )
}
