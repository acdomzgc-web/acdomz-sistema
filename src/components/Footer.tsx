import { Logo } from '@/components/Logo'

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-card py-6 px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Logo iconClassName="h-6 w-6" textClassName="text-sm" showText={false} />
          <p>© 2024 ACDOMZ. Todos os direitos reservados.</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">
            Política de Privacidade
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Termos de Uso
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Suporte
          </a>
        </div>
      </div>
    </footer>
  )
}
