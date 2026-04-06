import { Switch } from '@/components/ui/switch'

type Switch06Props = {
  checked: boolean
  onCheckedChange: (next: boolean) => void
  className?: string
}

const Switch06 = ({ checked, onCheckedChange, className }: Switch06Props) => {
  return (
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={
        className ?? 'data-checked:bg-zinc-900 dark:data-checked:bg-zinc-100'
      }
    />
  )
}

export default Switch06
