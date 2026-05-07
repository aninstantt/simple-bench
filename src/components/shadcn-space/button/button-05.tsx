import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Button05Props = React.ComponentProps<typeof Button>

const Button05 = ({ className, children, ...props }: Button05Props) => {
  return (
    <div className="inline-flex h-fit w-fit items-center justify-center rounded-lg bg-linear-to-r from-[#F24E1E] via-[#A259FF] to-[#1ABCFE] p-px">
      <Button
        className={cn(
          'cursor-pointer rounded-md bg-background text-foreground hover:bg-background',
          className
        )}
        {...props}
      >
        {children}
      </Button>
    </div>
  )
}

export default Button05
