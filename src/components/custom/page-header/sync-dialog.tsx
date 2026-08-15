import * as ed from '@noble/ed25519'
import { hmac } from '@noble/hashes/hmac.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { sha512 } from '@noble/hashes/sha2.js'
import { bytesToHex } from '@noble/hashes/utils.js'
import {
  generateMnemonic,
  validateMnemonic,
  mnemonicToSeedSync
} from '@scure/bip39'
import { wordlist } from '@scure/bip39/wordlists/english.js'
import { useAtom } from 'jotai/react'
import {
  Check,
  CheckCircle,
  Cloud,
  Download,
  Key,
  RefreshCw,
  Trash2,
  Upload,
  X
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/animate-ui/components/buttons/button'
import { CopyButton } from '@/components/custom/copy'
import { WithLoading } from '@/components/custom/with-loading'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { BackupRequestError, syncDown, syncUp } from '@/lib/backup'
import {
  hasUnsyncedChangesAtom,
  syncAccountIssueAtom,
  syncConfigAtom,
  syncHasNewerVersionAtom,
  type SyncAccountConfig,
  versionAtom
} from '@/states/simple-bench'

import { StrictConfirmPopover } from '../strict-confirm-popover'

ed.hashes.sha512 = sha512

type SyncDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function deriveKey(seed: Uint8Array, label: string): Uint8Array {
  return hmac(sha256, seed, new TextEncoder().encode(label))
}

function deriveAll(seed: Uint8Array) {
  const syncId = bytesToHex(deriveKey(seed, 'sync-id'))
  const dataKey = bytesToHex(deriveKey(seed, 'data-key'))
  const privateKey = deriveKey(seed, 'ed25519-private')
  const publicKey = bytesToHex(ed.getPublicKey(privateKey))
  const privateKeyHex = bytesToHex(privateKey)
  return { syncId, dataKey, privateKey: privateKeyHex, publicKey }
}

export function SyncDialog({ open, onOpenChange }: SyncDialogProps) {
  const [mnemonic, setMnemonic] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [mnemonicError, setMnemonicError] = useState('')
  const [confirmGenerateOpen, setConfirmGenerateOpen] = useState(false)
  const [mnemonicConfirmOpen, setMnemonicConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [accountState, setAccountState] = useAtom(syncConfigAtom)
  const [, setSyncAccountIssue] = useAtom(syncAccountIssueAtom)
  const isSyncEnabled = accountState.status === 'ok'

  const syncId = accountState.status === 'ok' ? accountState.config.syncId : ''
  const privateKeyHex =
    accountState.status === 'ok' ? accountState.config.privateKey : ''
  const dataKeyHex =
    accountState.status === 'ok' ? accountState.config.dataKey : ''

  const [version, setVersion] = useAtom(versionAtom)
  const [, setHasUnsyncedChanges] = useAtom(hasUnsyncedChangesAtom)
  const [, setHasNewerVersion] = useAtom(syncHasNewerVersionAtom)

  const [checking, setChecking] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadConfirmOpen, setUploadConfirmOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
  const [forceOverwriteOpen, setForceOverwriteOpen] = useState(false)

  const handleCheck = async () => {
    setChecking(true)
    try {
      const res = await fetch('/api/backup-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sync_id: syncId, version })
      })
      if (!res.ok) {
        throw new BackupRequestError(
          res.status,
          (await res.json().catch(() => null))?.message || '您的同步账号异常'
        )
      }
      const json = await res.json()
      if (json.code === 0) {
        setSyncAccountIssue('')
        if (json.data?.has_newer) {
          setHasNewerVersion(true)
          toast.info('服务器有更新的版本')
        } else {
          setHasNewerVersion(false)
          toast.success('已是最新版本')
        }
      } else {
        toast.error(json.message || '检查失败')
      }
    } catch (e) {
      if (
        e instanceof BackupRequestError &&
        e.status >= 400 &&
        e.status < 500
      ) {
        setSyncAccountIssue(e.message)
      } else {
        toast.error('检查失败，请稍后再试')
      }
    } finally {
      setChecking(false)
    }
  }

  const handleUpload = async (force = false) => {
    setUploading(true)
    try {
      const nextVersion = await syncUp(
        syncId,
        version,
        privateKeyHex,
        dataKeyHex,
        force
      )
      setUploadConfirmOpen(false)
      setForceOverwriteOpen(false)
      setSyncAccountIssue('')
      setVersion(nextVersion)
      setHasUnsyncedChanges(false)
      toast.success('上传成功')
    } catch (e) {
      if (e instanceof BackupRequestError && e.status === 409) {
        setUploadConfirmOpen(false)
        setForceOverwriteOpen(true)
        return
      }
      if (
        e instanceof BackupRequestError &&
        e.status >= 400 &&
        e.status < 500
      ) {
        setSyncAccountIssue(e.message)
      } else {
        toast.error(e instanceof Error ? e.message : '上传失败')
      }
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const serverVersion = await syncDown(syncId, privateKeyHex, dataKeyHex)
      setVersion(serverVersion)
      setHasUnsyncedChanges(false)
      setSyncAccountIssue('')
      setDownloadDialogOpen(false)
      toast.success('下载成功，即将刷新页面')
      setTimeout(() => window.location.reload(), 1000)
    } catch (e) {
      if (
        e instanceof BackupRequestError &&
        e.status >= 400 &&
        e.status < 500
      ) {
        setSyncAccountIssue(e.message)
      } else {
        toast.error(e instanceof Error ? e.message : '下载失败')
      }
    } finally {
      setDownloading(false)
    }
  }

  const handleSaveMnemonic = async (newMnemonic: string) => {
    setLoading(true)
    const seed = mnemonicToSeedSync(newMnemonic)
    const keys = deriveAll(seed)

    try {
      const response = await fetch('/api/backup-new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sync_id: keys.syncId,
          public_key: keys.publicKey
        })
      })

      if (!response.ok) {
        toast.error('无法创建备份账户，请稍后再试。')
        return
      }

      const config: SyncAccountConfig = {
        syncId: keys.syncId,
        dataKey: keys.dataKey,
        privateKey: keys.privateKey,
        publicKey: keys.publicKey
      }

      setAccountState({ status: 'ok', config })
      setHasUnsyncedChanges(true)
      setSyncAccountIssue('')
      setMnemonic('')
      setInputValue('')
      toast.success('备份账户已添加')
    } catch {
      toast.error('无法创建备份账户，请稍后再试。')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmMnemonicAndDownload = async () => {
    setMnemonicConfirmOpen(false)
    setLoading(true)

    const seed = mnemonicToSeedSync(inputValue)
    const keys = deriveAll(seed)

    try {
      const response = await fetch('/api/backup-new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sync_id: keys.syncId,
          public_key: keys.publicKey
        })
      })

      if (!response.ok) {
        toast.error('无法创建备份账户，请稍后再试。')
        return
      }

      const config: SyncAccountConfig = {
        syncId: keys.syncId,
        dataKey: keys.dataKey,
        privateKey: keys.privateKey,
        publicKey: keys.publicKey
      }

      setAccountState({ status: 'ok', config })
      setSyncAccountIssue('')
      setMnemonic('')
      setInputValue('')

      try {
        const serverVersion = await syncDown(
          keys.syncId,
          keys.privateKey,
          keys.dataKey
        )
        setVersion(serverVersion)
        setHasUnsyncedChanges(false)
        toast.success('同步成功')
        setTimeout(() => window.location.reload(), 1000)
      } catch (e) {
        if (
          e instanceof BackupRequestError &&
          e.status >= 400 &&
          e.status < 500
        ) {
          setSyncAccountIssue(e.message)
        } else {
          toast.error(e instanceof Error ? e.message : '下载失败')
        }
      }
    } catch {
      toast.error('无法创建备份账户，请稍后再试。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={open => {
          onOpenChange(open)
          if (open) {
            setInputValue('')
            setMnemonicError('')
            setConfirmGenerateOpen(false)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Cloud className="size-4" />
              同步
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              将数据加密后上传至云端，以支持在其他设备上访问。
            </DialogDescription>
          </DialogHeader>

          <WithLoading loading={loading}>
            <div className="space-y-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200">
                助记词是您身份的唯一凭证，也是加密数据的唯一密钥。
                <br />
                务必妥善保管助记词，丢失后将 <b>永久</b> 无法找回云数据。
              </div>

              {isSyncEnabled ? (
                <div className="space-y-2">
                  {mnemonic && (
                    <div className="space-y-2">
                      <Textarea
                        value={mnemonic}
                        readOnly
                        className="min-h-24 font-mono text-xs"
                      />
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-olive-900">
                          请复制您的助记词，刷新页面后将永久丢失！
                        </p>
                        <CopyButton text={mnemonic} showText />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-1 dark:border-zinc-600 dark:bg-zinc-950/20">
                    <div className="min-w-0 space-y-0.5">
                      <div className="text-[13px] text-zinc-700 dark:text-zinc-200">
                        检查
                      </div>
                      <div className="text-[12px] text-zinc-400 dark:text-zinc-500">
                        检查云端与本地数据版本是否一致
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 shrink-0 p-0"
                      aria-label="检查更新"
                      disabled={checking}
                      onClick={handleCheck}
                    >
                      <RefreshCw
                        className={`size-3.5 ${checking ? 'animate-spin' : ''}`}
                      />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-1 dark:border-zinc-600 dark:bg-zinc-950/20">
                    <div className="min-w-0 space-y-0.5">
                      <div className="text-[13px] text-zinc-700 dark:text-zinc-200">
                        上传
                      </div>
                      <div className="text-[12px] text-zinc-400 dark:text-zinc-500">
                        将本地数据上传至云端备份
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 shrink-0 p-0"
                      aria-label="上传"
                      disabled={uploading}
                      onClick={() => setUploadConfirmOpen(true)}
                    >
                      <Upload className="size-3.5" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-1 dark:border-zinc-600 dark:bg-zinc-950/20">
                    <div className="min-w-0 space-y-0.5">
                      <div className="text-[13px] text-zinc-700 dark:text-zinc-200">
                        下载版本
                      </div>
                      <div className="text-[12px] text-zinc-400 dark:text-zinc-500">
                        从云端下载备份数据并覆盖本地
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 shrink-0 p-0"
                      aria-label="下载"
                      disabled={downloading}
                      onClick={() => setDownloadDialogOpen(true)}
                    >
                      <Download className="size-3.5" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <p className="flex items-center gap-1 text-xs text-emerald-500">
                      同步功能已开启
                      <CheckCircle className="size-3.5" />
                    </p>
                    <StrictConfirmPopover
                      align="end"
                      trigger={
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 p-0 text-xs font-normal text-gray-400"
                          aria-label="移除同步"
                        >
                          移除同步
                          <Trash2 className="size-3.5" />
                        </Button>
                      }
                      onConfirm={() => {
                        setAccountState({ status: 'unset', config: null })
                        setHasUnsyncedChanges(false)
                        setSyncAccountIssue('')
                        setMnemonic('')
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Textarea
                    placeholder="输入助记词"
                    className="min-h-24 font-mono text-xs"
                    value={inputValue}
                    onChange={e => {
                      setInputValue(e.target.value)
                      setMnemonicError('')
                    }}
                    disabled={loading}
                  />
                  {mnemonicError && (
                    <p className="text-xs text-red-500 dark:text-red-400">
                      {mnemonicError}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      aria-label="生成助记词"
                      disabled={loading}
                      onClick={() => setConfirmGenerateOpen(true)}
                    >
                      <Key className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      className="h-8 w-8 p-0"
                      aria-label="确认助记词"
                      disabled={loading}
                      onClick={() => {
                        if (!validateMnemonic(inputValue, wordlist)) {
                          setMnemonicError('无效的助记词')
                          return
                        }
                        setMnemonicConfirmOpen(true)
                      }}
                    >
                      <Check className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </WithLoading>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmGenerateOpen} onOpenChange={setConfirmGenerateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">生成新的助记词</DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              生成新的助记词将创建全新的数据账户。如果您当前已有正在使用的助记词，请不要使用此功能。是否确认？
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="取消"
              onClick={() => setConfirmGenerateOpen(false)}
            >
              <X className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="确认生成"
              onClick={() => {
                const newMnemonic = generateMnemonic(wordlist, 256)
                void handleSaveMnemonic(newMnemonic)
                setConfirmGenerateOpen(false)
              }}
            >
              <Check className="size-3.5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={mnemonicConfirmOpen} onOpenChange={setMnemonicConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <span className="text-amber-500">⚠️</span>
              使用已有助记词
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              使用已有的助记词将会直接下载云端存档，是否确认？
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="取消"
              disabled={loading}
              onClick={() => setMnemonicConfirmOpen(false)}
            >
              <X className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="确认"
              disabled={loading}
              onClick={handleConfirmMnemonicAndDownload}
            >
              {loading ? (
                <RefreshCw className="size-3.5 animate-spin" />
              ) : (
                <Check className="size-3.5" />
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={uploadConfirmOpen} onOpenChange={setUploadConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <span className="text-amber-500">⚠️</span>
              上传备份
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
              <span className="mb-1 inline-block">
                将本地数据上传至云端，云端数据将被覆盖。
              </span>
              <br />
              <span>通常情况下，无须手动执行此操作。系统会自动提示上传。</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="取消"
              disabled={uploading}
              onClick={() => setUploadConfirmOpen(false)}
            >
              <X className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="确认上传"
              disabled={uploading}
              onClick={() => handleUpload(false)}
            >
              {uploading ? (
                <RefreshCw className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={downloadDialogOpen} onOpenChange={setDownloadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <span className="text-amber-500">⚠️</span>
              下载备份
            </DialogTitle>
            <DialogDescription className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="mb-1 inline-block">
                即将用云端数据覆盖本地所有内容，此操作不可撤销。
              </span>
              <br />
              <span>通常情况下，无须手动执行此操作。系统会自动提示下载。</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="取消"
              disabled={downloading}
              onClick={() => setDownloadDialogOpen(false)}
            >
              <X className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="确认下载"
              disabled={downloading}
              onClick={handleDownload}
            >
              {downloading ? (
                <RefreshCw className="size-3.5 animate-spin" />
              ) : (
                <Download className="size-3.5" />
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={forceOverwriteOpen} onOpenChange={setForceOverwriteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <span className="text-amber-500">⚠️</span>
              云端版本更新
            </DialogTitle>
            <DialogDescription className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="mb-1 inline-block">
                服务器的备份版本比本地更新，直接上传会覆盖云端数据。
              </span>
              <br />
              <span>是否确认强制覆盖云端备份？</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="取消"
              disabled={uploading}
              onClick={() => setForceOverwriteOpen(false)}
            >
              <X className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              className="h-8 w-8 p-0"
              aria-label="确认强制覆盖"
              disabled={uploading}
              onClick={() => handleUpload(true)}
            >
              {uploading ? (
                <RefreshCw className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
