import { useState, useEffect } from 'react'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ReportFinanceiroAcdomz } from '@/components/reports/ReportFinanceiroAcdomz'
import { ReportFinanceiroCondominio } from '@/components/reports/ReportFinanceiroCondominio'
import { ReportMoradores } from '@/components/reports/ReportMoradores'
import { ReportSindia } from '@/components/reports/ReportSindia'
import { ReportCalculos } from '@/components/reports/ReportCalculos'
import { supabase } from '@/lib/supabase/client'

export default function Relatorios() {
  const [tipo, setTipo] = useState('financeiro-acdomz')
  const [condominioId, setCondominioId] = useState('all')
  const [condominios, setCondominios] = useState<any[]>([])

  useEffect(() => {
    supabase
      .from('condominios')
      .select('id, name')
      .order('name')
      .then(({ data }) => {
        if (data) setCondominios(data)
      })
  }, [])

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="container py-6 max-w-6xl space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Central de Relatórios</h1>
          <p className="text-muted-foreground mt-1">
            Gere PDFs profissionais e consolidados para análise e apresentação.
          </p>
        </div>
        <Button onClick={handlePrint} className="gap-2" size="lg">
          <Printer className="h-4 w-4" />
          Gerar PDF / Imprimir
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden bg-muted/30 p-6 rounded-xl border border-border/50">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground/80">Tipo de Relatório</label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="financeiro-acdomz">Financeiro ACDOMZ Geral</SelectItem>
              <SelectItem value="financeiro-condominio">Financeiro por Condomínio</SelectItem>
              <SelectItem value="moradores">Moradores por Condomínio</SelectItem>
              <SelectItem value="sindia">Atividade SINDIA Bot</SelectItem>
              <SelectItem value="calculos">Cálculos de Honorários (Histórico)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {['financeiro-condominio', 'moradores', 'calculos'].includes(tipo) && (
          <div className="space-y-2 animate-fade-in">
            <label className="text-sm font-semibold text-foreground/80">
              Filtrar por Condomínio
            </label>
            <Select value={condominioId} onValueChange={setCondominioId}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Selecione o condomínio..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Condomínios</SelectItem>
                {condominios.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div
        id="print-area"
        className="bg-white text-black min-h-[800px] border border-border/50 rounded-xl shadow-sm overflow-hidden"
      >
        {tipo === 'financeiro-acdomz' && <ReportFinanceiroAcdomz />}
        {tipo === 'financeiro-condominio' && (
          <ReportFinanceiroCondominio condominioId={condominioId} />
        )}
        {tipo === 'moradores' && <ReportMoradores condominioId={condominioId} />}
        {tipo === 'sindia' && <ReportSindia />}
        {tipo === 'calculos' && <ReportCalculos condominioId={condominioId} />}
      </div>
    </div>
  )
}
