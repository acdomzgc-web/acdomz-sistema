import { cn } from '@/lib/utils'
import logoUrl from '@/assets/logo-fundo-azul-65e70.jpeg'

interface LogoProps {
  className?: string
  showText?: boolean
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <img src={logoUrl} alt="ACDOMZ Logo" className="h-8 w-auto rounded-md object-contain" />
      {showText && (
        <span className="font-bold text-xl tracking-tight text-primary truncate">ACDOMZ</span>
      )}
    </div>
  )
}
