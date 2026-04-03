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
      <div
        className={cn(
          'flex items-center justify-center rounded-md overflow-hidden',
          iconClassName || 'h-8 w-8',
        )}
      >
        <img
          src="https://img.usecurling.com/i?q=building&color=blue&shape=fill"
          alt="ACDOMZ Logo"
          className="h-full w-full object-contain"
        />
      </div>
      {showText && (
        <span className={cn('font-bold tracking-tight text-primary', textClassName || 'text-xl')}>
          ACDOMZ
        </span>
      )}
    </div>
  )
}
