import { useAtom } from 'jotai/react'
import { Check, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/animate-ui/components/buttons/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { DEFAULT_HOME_COPY, homeCopyAtom } from '@/states/user-config'

import { MAX_HOME_COPY_LENGTH } from './constants'

type HomeCopyDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HomeCopyDialog({ open, onOpenChange }: HomeCopyDialogProps) {
  const [homeCopy, setHomeCopy] = useAtom(homeCopyAtom)
  const [draft, setDraft] = useState(homeCopy)

  useEffect(() => {
    if (open) setDraft(homeCopy)
  }, [open, homeCopy])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-sm">编辑首页文本</DialogTitle>
          <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
            首页文本会展示在主页底部，留空则使用默认文本。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="请输入首页文案"
            maxLength={MAX_HOME_COPY_LENGTH}
            className="min-h-24 text-sm"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-zinc-400">
              {draft.length}/{MAX_HOME_COPY_LENGTH}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-8 border-zinc-200 p-0 dark:border-zinc-600"
                aria-label="恢复默认首页文本"
                onClick={() => setDraft(DEFAULT_HOME_COPY)}
              >
                <RotateCcw className="size-3.5" />
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-8 w-8 p-0"
                aria-label="保存首页文本"
                onClick={() => {
                  const nextHomeCopy = draft.trim() || DEFAULT_HOME_COPY
                  setHomeCopy(nextHomeCopy)
                  onOpenChange(false)
                }}
              >
                <Check className="size-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
