import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { ReportLayout } from './ReportLayout'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'

export function ReportFinanceiroCondominio({ condominioId }: { condominioId: string }) {
  const [data, setData] = useState<any[]>([])
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
        .from('financeiro_condominio')
        .select('amount, type, description, date, condominios(name)')
      if (condominioId !== 'all') query = query.eq('condominio_id', condominioId)

      const { data: fin } = await query
      setData(fin || [])
      setLoading(false)
    }
    load()
  }, [condominioId])

  const stats = useMemo(() => {
    const receitas = data
      .filter((d) => d.type === 'receita')
      .reduce((a, b) => a + Number(b.amount || 0), 0)
    const despesas = data
      .filter((d) => d.type === 'despesa')
      .reduce((a, b) => a + Number(b.amount || 0), 0)
    const inadimplencia = receitas * 0.15 // mock 15% inadimplência para exemplo de relatório
    const saldo = receitas - despesas

    const pieData = [
      { name: 'Receitas', value: receitas },
      { name: 'Despesas', value: despesas },
    ]

    return { receitas, despesas, saldo, inadimplencia, pieData }
  }, [data])

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando dados...</div>

  return (
    <ReportLayout
      title="Relatório Financeiro do Condomínio"
      subtitle={`Condomínio: ${condominio?.name || 'Não selecionado'}`}
    >
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
          <p className="text-sm text-slate-500">Receitas Totais</p>
          <p className="text-2xl font-bold text-emerald-600">R$ {stats.receitas.toFixed(2)}</p>
        </div>
        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
          <p className="text-sm text-slate-500">Despesas Totais</p>
          <p className="text-2xl font-bold text-rose-600">R$ {stats.despesas.toFixed(2)}</p>
        </div>
        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
          <p className="text-sm text-slate-500">Saldo Atual</p>
          <p
            className={`text-2xl font-bold ${stats.saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
          >
            R$ {stats.saldo.toFixed(2)}
          </p>
        </div>
        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
          <p className="text-sm text-slate-500">Inadimplência Estimada</p>
          <p className="text-2xl font-bold text-amber-600">R$ {stats.inadimplencia.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8 print-break-inside-avoid">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b border-slate-200 pb-2 text-slate-800">
            Distribuição Financeira
          </h3>
          <div className="h-[300px]">
            <ChartContainer config={{ value: { color: 'hsl(var(--chart-1))' } }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    isAnimationActive={false}
                    data={stats.pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    <Cell fill="hsl(142, 71%, 45%)" />
                    <Cell fill="hsl(346, 87%, 43%)" />
                  </Pie>
                  <RechartsTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b border-slate-200 pb-2 text-slate-800">
            Top Transações Recentes
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 8).map((t, i) => (
                <TableRow key={i}>
                  <TableCell>{t.date ? format(new Date(t.date), 'dd/MM/yyyy') : '-'}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${t.type === 'receita' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}
                    >
                      {t.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    R$ {Number(t.amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-slate-500">
                    Nenhuma transação encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </ReportLayout>
  )
}
