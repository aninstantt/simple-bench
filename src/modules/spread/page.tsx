import { Radio } from 'lucide-react'

import { PageHeader } from '@/components/custom/page-header'
import { WithLoading } from '@/components/custom/with-loading'

export function SpreadPage() {
  return (
    <WithLoading loading={false}>
      <section className="mx-auto max-w-lg space-y-4">
        <PageHeader icon={<Radio className="size-4" />} title="传播" />
      </section>
    </WithLoading>
  )
}
