import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { ReportLayout } from './ReportLayout'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'

export function ReportCalculos({ condominioId }: { condominioId: string }) {
  const [calculos, setCalculos] = useState<any[]>([])
  const [condominio, setCondominio] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (condominioId !== 'all') {
        const { data: cond } = await supabase
          .from('condominios')
          .select('name')
          .eq('id', condominioId)
          .single()
        if (cond) setCondominio(cond)
      } else {
        setCondominio({ name: 'Todos os Condomínios' })
      }

      let query = supabase
        .from('calculos_honorarios')
        .select('calculated_value, details, created_at, condominios(name)')
      if (condominioId !== 'all') query = query.eq('condominio_id', condominioId)

      const { data } = await query.order('created_at', { ascending: false })
      setCalculos(data || [])
      setLoading(false)
    }
    load()
  }, [condominioId])

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando dados...</div>

  return (
    <ReportLayout
      title="Histórico de Cálculos de Honorários"
      subtitle={`Condomínio: ${condominio?.name || 'Não selecionado'} - Total de Registros: ${calculos.length}`}
    >
      <div className="print-break-inside-avoid">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold text-slate-700">Data de Simulação</TableHead>
              <TableHead className="font-bold text-slate-700">Condomínio</TableHead>
              <TableHead className="font-bold text-slate-700">
                Detalhes da Trilha (Densidade / Lotes)
              </TableHead>
              <TableHead className="text-right font-bold text-slate-700">Áreas Comuns</TableHead>
              <TableHead className="text-right font-bold text-slate-700">
                Valor Final Calculado
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calculos.map((c, i) => (
              <TableRow key={i}>
                <TableCell className="text-slate-600">
                  {format(new Date(c.created_at), 'dd/MM/yyyy HH:mm')}
                </TableCell>
                <TableCell className="font-medium text-slate-800">
                  {(c.condominios as any)?.name || 'Simulação Geral'}
                </TableCell>
                <TableCell>
                  <span className="text-xs text-slate-500 block">
                    Lotes: {c.details?.lotes || 0}
                  </span>
                  <span className="text-xs text-slate-500 block">
                    Densidade: {c.details?.densidadeLabel || 'N/A'}
                  </span>
                </TableCell>
                <TableCell className="text-right text-slate-600">
                  {c.details?.areasComuns || 0}
                </TableCell>
                <TableCell className="text-right font-bold text-emerald-600">
                  R$ {Number(c.calculated_value).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
            {calculos.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  Nenhum cálculo de honorário encontrado no histórico.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </ReportLayout>
  )
}
