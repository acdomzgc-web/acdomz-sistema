import { ReactNode } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Logo } from '@/components/Logo'

interface ReportLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function ReportLayout({ title, subtitle, children }: ReportLayoutProps) {
  return (
    <div className="p-8 pb-16 relative bg-white text-black min-h-screen font-sans">
      <div className="flex items-start justify-between border-b-2 border-slate-200 pb-6 mb-8">
        <div>
          <Logo
            className="mb-4"
            iconClassName="h-10 w-10"
            textClassName="text-3xl text-slate-900"
          />
          <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className="text-right text-sm text-slate-500">
          <p className="font-semibold text-slate-700">Relatório Oficial</p>
          <p>Emitido em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
        </div>
      </div>

      <div className="space-y-8 text-slate-800">{children}</div>

      <div className="mt-16 pt-4 border-t-2 border-slate-100 text-center text-xs text-slate-400 print:fixed print:bottom-4 print:w-full print:left-0 print:border-none print:mt-0 print:pt-0">
        <p>ACDOMZ Plataforma © {new Date().getFullYear()} - Gestão de Condomínios Integrada</p>
        <p>Este documento foi gerado automaticamente pelo sistema e possui validade informativa.</p>
      </div>
    </div>
  )
}
