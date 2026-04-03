import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { ReportLayout } from './ReportLayout'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
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

export function ReportFinanceiroAcdomz() {
  const [data, setData] = useState<{ receitas: any[]; despesas: any[] }>({
    receitas: [],
    despesas: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [recRes, despPRes, despRRes] = await Promise.all([
        supabase.from('receitas_acdomz').select('amount, date, description, condominios(name)'),
        supabase.from('despesas_pontuais_acdomz').select('amount, date, description'),
        supabase.from('despesas_recorrentes_acdomz').select('amount, day_of_month, description'),
      ])

      const receitas = recRes.data || []
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()
      const recorrentes = (despRRes.data || []).map((d) => ({
        amount: d.amount,
        date: `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d.day_of_month || 1).padStart(2, '0')}`,
        description: d.description,
      }))
      const despesas = [...(despPRes.data || []), ...recorrentes]

      setData({ receitas, despesas })
      setLoading(false)
    }
    load()
  }, [])

  const stats = useMemo(() => {
    const totalReceitas = data.receitas.reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
    const totalDespesas = data.despesas.reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
    const saldo = totalReceitas - totalDespesas

    const monthly = data.receitas.reduce((acc: any, curr) => {
      const month = curr.date?.substring(0, 7) || 'N/A'
      if (!acc[month]) acc[month] = { name: month, Receitas: 0, Despesas: 0 }
      acc[month].Receitas += Number(curr.amount || 0)
      return acc
    }, {})

    data.despesas.forEach((curr) => {
      const month = curr.date?.substring(0, 7) || 'N/A'
      if (!monthly[month]) monthly[month] = { name: month, Receitas: 0, Despesas: 0 }
      monthly[month].Despesas += Number(curr.amount || 0)
    })

    const chartData = Object.values(monthly).sort((a: any, b: any) => a.name.localeCompare(b.name))

    return { totalReceitas, totalDespesas, saldo, chartData }
  }, [data])

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando dados...</div>

  return (
    <ReportLayout
      title="Relatório Financeiro Geral ACDOMZ"
      subtitle="Visão consolidada de receitas e despesas operacionais"
    >
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
          <p className="text-sm text-slate-500">Total Receitas</p>
          <p className="text-2xl font-bold text-emerald-600">R$ {stats.totalReceitas.toFixed(2)}</p>
        </div>
        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
          <p className="text-sm text-slate-500">Total Despesas</p>
          <p className="text-2xl font-bold text-rose-600">R$ {stats.totalDespesas.toFixed(2)}</p>
        </div>
        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
          <p className="text-sm text-slate-500">Saldo Consolidado</p>
          <p
            className={`text-2xl font-bold ${stats.saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
          >
            R$ {stats.saldo.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mb-8 print-break-inside-avoid">
        <h3 className="text-lg font-semibold mb-4 border-b border-slate-200 pb-2 text-slate-800">
          Evolução Mensal (Receitas vs Despesas)
        </h3>
        <div className="h-[300px]">
          <ChartContainer
            config={{
              receitas: { color: 'hsl(142, 71%, 45%)' },
              despesas: { color: 'hsl(346, 87%, 43%)' },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <RechartsTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar
                  isAnimationActive={false}
                  dataKey="Receitas"
                  fill="var(--color-receitas)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  isAnimationActive={false}
                  dataKey="Despesas"
                  fill="var(--color-despesas)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>

      <div className="print-break-inside-avoid">
        <h3 className="text-lg font-semibold mb-4 border-b border-slate-200 pb-2 text-slate-800">
          Últimas Receitas
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Condomínio</TableHead>
              <TableHead className="text-right">Valor (R$)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.receitas.slice(0, 10).map((r, i) => (
              <TableRow key={i}>
                <TableCell>{r.date ? format(new Date(r.date), 'dd/MM/yyyy') : '-'}</TableCell>
                <TableCell>{r.description}</TableCell>
                <TableCell>{(r.condominios as any)?.name || '-'}</TableCell>
                <TableCell className="text-right">{Number(r.amount).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </ReportLayout>
  )
}
