import { Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  iconClassName?: string
  textClassName?: string
  showText?: boolean
}

export function Logo({ className, iconClassName, textClassName, showText = true }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center justify-center p-1.5 bg-primary rounded-lg shadow-sm">
        <Building2 className={cn('h-6 w-6 text-secondary', iconClassName)} strokeWidth={2.5} />
      </div>
      {showText && (
        <span className={cn('font-bold text-xl tracking-tight text-primary', textClassName)}>
          ACDOMZ
        </span>
      )}
    </div>
  )
}
