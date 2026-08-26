import { useAtom } from 'jotai/react'
import { Download, RefreshCw, Upload, XIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/animate-ui/components/buttons/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { BackupRequestError, syncDown, syncUp } from '@/lib/backup'
import {
  hasUnsyncedChangesAtom,
  syncAccountIssueAtom,
  syncConfigAtom,
  syncHasNewerVersionAtom,
  syncModulesAtom,
  versionAtom
} from '@/states/simple-bench'

const CHECK_RETRY_DELAY_MS = 2_000
const CHECK_INTERVAL_MS = 30_000

export function SyncNotice() {
  const [accountState] = useAtom(syncConfigAtom)
  const [accountIssue, setAccountIssue] = useAtom(syncAccountIssueAtom)
  const [version, setVersion] = useAtom(versionAtom)
  const [hasUnsyncedChanges, setHasUnsyncedChanges] = useAtom(
    hasUnsyncedChangesAtom
  )
  const [hasNewerVersion, setHasNewerVersion] = useAtom(syncHasNewerVersionAtom)
  const [enabledModules] = useAtom(syncModulesAtom)
  const [detailOpen, setDetailOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const syncId = accountState.status === 'ok' ? accountState.config.syncId : ''
  const privateKeyHex =
    accountState.status === 'ok' ? accountState.config.privateKey : ''
  const dataKeyHex =
    accountState.status === 'ok' ? accountState.config.dataKey : ''

  const syncIdRef = useRef(syncId)
  const versionRef = useRef(version)
  syncIdRef.current = syncId
  versionRef.current = version

  const handleUpload = async () => {
    setUploading(true)
    try {
      const nextVersion = await syncUp(
        syncId,
        version,
        privateKeyHex,
        dataKeyHex,
        false,
        enabledModules
      )
      setVersion(nextVersion)
      setHasUnsyncedChanges(false)
      setDetailOpen(false)
      toast.success('上传成功')
    } catch (e) {
      if (e instanceof BackupRequestError && e.status === 409) {
        toast.error('云端版本更新，请先在设置中同步')
      } else if (
        e instanceof BackupRequestError &&
        e.status >= 400 &&
        e.status < 500
      ) {
        setAccountIssue(e.message)
      } else {
        toast.error(e instanceof Error ? e.message : '上传失败')
      }
    } finally {
      setUploading(false)
    }
  }

  const doCheck = useRef(async (reportOnFailure = true): Promise<boolean> => {
    const sid = syncIdRef.current
    const ver = versionRef.current
    if (!sid) return true
    try {
      const res = await fetch('/api/backup-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sync_id: sid, version: ver })
      })
      if (!res.ok) {
        if (res.status >= 400 && res.status < 500) {
          if (reportOnFailure) {
            const json = await res.json().catch(() => null)
            setAccountIssue(json?.message || '同步账号异常')
          }
          return false
        }
        return true
      }
      const json = await res.json()
      if (json.code === 0 && json.data?.has_newer) {
        setHasNewerVersion(true)
      } else {
        setHasNewerVersion(false)
      }
      setAccountIssue('')
      return true
    } catch {
      return true
    }
  }).current

  useEffect(() => {
    if (accountState.status !== 'ok') {
      setHasNewerVersion(false)
      return
    }
    const runWithRetry = async () => {
      const ok = await doCheck(false)
      if (!ok) {
        await new Promise(resolve => setTimeout(resolve, CHECK_RETRY_DELAY_MS))
        await doCheck()
      }
    }
    void runWithRetry()
    const id = setInterval(() => void runWithRetry(), CHECK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [accountState.status, setHasNewerVersion])

  if (accountState.status === 'unset') {
    return null
  }

  const hasAccountIssue =
    accountState.status === 'corrupt' ||
    (accountState.status === 'ok' && accountIssue.length > 0)

  const closeAccountDialog = () => {
    setDetailOpen(false)
    setAccountIssue('')
  }

  if (hasAccountIssue) {
    return (
      <>
        <button
          type="button"
          className="shrink-0 text-xs text-red-600 underline underline-offset-4 dark:text-red-400"
          onClick={() => setDetailOpen(true)}
        >
          同步账号异常
        </button>
        <Dialog
          open={detailOpen}
          onOpenChange={open => !open && closeAccountDialog()}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-sm">同步账号异常</DialogTitle>
              <DialogDescription className="space-y-2 pt-2 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="mt-1 inline-block">
                  您的同步账号可能存在问题。
                </span>
                <br />
                <span>
                  如果问题持续存在，请重新录入您的助记词，以恢复同步功能。
                </span>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  if (hasNewerVersion && accountState.status === 'ok') {
    return (
      <>
        <button
          type="button"
          className="shrink-0 text-xs text-[#c100ff] underline underline-offset-4"
          onClick={() => setDetailOpen(true)}
        >
          有新的版本可用
        </button>
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-sm">服务器有新版本</DialogTitle>
              <DialogDescription className="pt-2 text-xs text-zinc-500 dark:text-zinc-400">
                请点击确认，下载最新版本。
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
                onClick={() => {
                  setHasNewerVersion(false)
                  setDetailOpen(false)
                }}
              >
                <XIcon className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="确认下载"
                disabled={downloading}
                onClick={async () => {
                  setDownloading(true)
                  try {
                    const serverVersion = await syncDown(
                      syncId,
                      privateKeyHex,
                      dataKeyHex,
                      enabledModules
                    )
                    setVersion(serverVersion)
                    setHasUnsyncedChanges(false)
                    setHasNewerVersion(false)
                    setDetailOpen(false)
                    toast.success('下载成功，即将刷新页面')
                    setTimeout(() => window.location.reload(), 1000)
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : '下载失败')
                  } finally {
                    setDownloading(false)
                  }
                }}
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
      </>
    )
  }

  if (hasUnsyncedChanges && accountState.status === 'ok') {
    return (
      <>
        <button
          type="button"
          className="shrink-0 text-xs text-amber-600 underline underline-offset-4 dark:text-amber-400"
          onClick={() => setDetailOpen(true)}
        >
          有未备份的更改
        </button>
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-sm">未同步的更改</DialogTitle>
              <DialogDescription className="pt-2 text-xs text-zinc-500 dark:text-zinc-400">
                您的本地数据还没有备份到云端，退出前请手动备份数据。
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
                onClick={() => setDetailOpen(false)}
              >
                <XIcon className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="default"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="上传"
                disabled={uploading}
                onClick={handleUpload}
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

  return null
}
