import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export function NotFoundPage() {
  return (
    <section className="flex flex-col items-center justify-center py-20 text-center">
      <span className="font-mono text-7xl font-bold tracking-tighter text-foreground/10">
        404
      </span>
      <p className="-mt-2 text-lg font-medium text-foreground/80">
        没有找到这个页面
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-foreground/5 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/10 dark:bg-foreground/10 dark:hover:bg-foreground/15"
      >
        <ArrowLeft className="size-3.5" />
        返回首页
      </Link>
    </section>
  )
}
