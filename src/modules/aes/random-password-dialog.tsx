import { useAtom } from 'jotai/react'
import { MapPlus, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { CopyButton } from '@/components/custom/copy'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  generateRandomPassword
} from '@/lib/password'
import { randomPasswordOptionsAtom } from '@/states/password'

const PASSWORD_OPTION_ITEMS = [
  {
    key: 'withDigits',
    label: '数字'
  },
  {
    key: 'withSymbols',
    label: '字符'
  },
  {
    key: 'withoutSimilarLetters',
    label: '移除lI0o'
  }
] as const

function clampPasswordLength(length: number) {
  return Math.min(MAX_PASSWORD_LENGTH, Math.max(MIN_PASSWORD_LENGTH, length))
}

function resolveLengthInput(value: string, fallback: number) {
  const trimmedValue = value.trim()
  if (trimmedValue === '') return fallback

  const length = Number(trimmedValue)
  if (!Number.isInteger(length)) return fallback

  return clampPasswordLength(length)
}

export function RandomPasswordDialog() {
  const [options, setOptions] = useAtom(randomPasswordOptionsAtom)
  const [lengthInputValue, setLengthInputValue] = useState(() =>
    String(options.length)
  )
  const [password, setPassword] = useState(() =>
    generateRandomPassword(options)
  )

  useEffect(() => {
    setLengthInputValue(String(options.length))
  }, [options.length])

  const handleLengthChange = (value: string) => {
    if (!/^\d*$/.test(value)) return

    setLengthInputValue(value)
    if (value === '') return

    const length = Number(value)
    if (
      !Number.isInteger(length) ||
      length < MIN_PASSWORD_LENGTH ||
      length > MAX_PASSWORD_LENGTH
    ) {
      return
    }

    setOptions(prev => ({
      ...prev,
      length
    }))
  }

  const commitLengthInput = () => {
    const length = resolveLengthInput(lengthInputValue, options.length)

    setLengthInputValue(String(length))
    setOptions(prev => ({
      ...prev,
      length
    }))

    return length
  }

  const handleGenerate = () => {
    const length = commitLengthInput()
    const nextOptions = {
      ...options,
      length
    }

    try {
      setPassword(generateRandomPassword(nextOptions))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '生成失败', {
        richColors: true,
        position: 'top-center'
      })
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex size-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-500 transition-all hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-700 active:scale-[0.97] dark:border-zinc-600 dark:bg-zinc-600/50 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-600"
          aria-label="生成随机密码"
          title="生成随机密码"
        >
          <MapPlus className="size-4" />
        </button>
      </DialogTrigger>

      <DialogContent onOpenAutoFocus={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>生成随机密码</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="flex items-center gap-3">
            <label
              className="shrink-0 text-[12px] font-medium text-zinc-600 dark:text-zinc-400"
              htmlFor="random-password-length"
            >
              长度
            </label>
            <Input
              id="random-password-length"
              type="number"
              min={MIN_PASSWORD_LENGTH}
              max={MAX_PASSWORD_LENGTH}
              step={1}
              inputMode="numeric"
              value={lengthInputValue}
              onChange={e => handleLengthChange(e.target.value)}
              onBlur={commitLengthInput}
              className="w-16 text-[13px]"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {PASSWORD_OPTION_ITEMS.map(item => (
              <label
                key={item.key}
                className="flex min-h-9 items-center justify-center gap-1.5 rounded-md bg-zinc-50 px-2 text-[12px] text-zinc-700 transition-colors hover:bg-zinc-100 dark:bg-zinc-600/40 dark:text-zinc-200 dark:hover:bg-zinc-600/60"
              >
                <input
                  type="checkbox"
                  checked={options[item.key]}
                  onChange={e => {
                    const checked = e.target.checked
                    setOptions(prev => ({
                      ...prev,
                      [item.key]: checked
                    }))
                  }}
                  className="size-3.5 rounded border-zinc-300 accent-(--my-red-1) dark:border-zinc-600"
                />
                <span className="truncate">{item.label}</span>
              </label>
            ))}
          </div>

          <div className="rounded-lg bg-zinc-50 px-3 py-4 font-mono text-[12px] leading-relaxed break-all text-zinc-700 select-all dark:bg-zinc-600/50 dark:text-zinc-100">
            {password}
          </div>

          <div className="flex items-center justify-end gap-3">
            <CopyButton
              text={password}
              showText
              iconClassName="size-3.5"
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-700 active:scale-[0.97] dark:text-zinc-300 dark:hover:bg-zinc-600"
            />
            <button
              type="button"
              onClick={handleGenerate}
              className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-700 active:scale-[0.97] dark:text-zinc-300 dark:hover:bg-zinc-600"
            >
              <RefreshCw className="size-3.5" />
              生成
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
