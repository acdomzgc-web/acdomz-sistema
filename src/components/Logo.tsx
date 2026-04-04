import { cn } from '@/lib/utils'
import logoImg from '@/assets/logo-fundo-azul-268f7.jpeg'

interface LogoProps {
  className?: string
  showText?: boolean
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <img
        src={logoImg}
        alt="ACDOMZ Logo"
        className="h-9 w-auto object-contain rounded-md shadow-sm border border-border/50"
      />
      {showText && <span className="font-bold text-lg tracking-tight text-foreground">ACDOMZ</span>}
    </div>
  )
}
