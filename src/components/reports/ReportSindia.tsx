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

export function ReportSindia() {
  const [conversas, setConversas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('conversas_sindia')
        .select('message, status, created_at, is_unauthorized, condominios(name)')
        .order('created_at', { ascending: false })
      setConversas(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const stats = useMemo(() => {
    const total = conversas.length
    const resolvidas = conversas.filter((c) => c.status === 'respondido').length
    const pendentes = conversas.filter((c) => c.status !== 'respondido').length
    const taxaResolucao = total > 0 ? (resolvidas / total) * 100 : 0
    const naoAutorizados = conversas.filter((c) => c.is_unauthorized).length

    const pieData = [
      { name: 'Resolvidas', value: resolvidas },
      { name: 'Revisão', value: pendentes },
    ]

    return { total, resolvidas, pendentes, taxaResolucao, naoAutorizados, pieData }
  }, [conversas])

  if (loading) return <div className="p-8 text-center text-slate-500">Carregando dados...</div>

  return (
    <ReportLayout
      title="Relatório de Atividades SINDIA Bot"
      subtitle="Performance e estatísticas globais de atendimento virtual"
    >
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
          <p className="text-sm text-slate-500">Total de Interações</p>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
          <p className="text-sm text-slate-500">Taxa de Resolução</p>
          <p className="text-2xl font-bold text-blue-600">{stats.taxaResolucao.toFixed(1)}%</p>
        </div>
        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
          <p className="text-sm text-slate-500">Pendente Revisão</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pendentes}</p>
        </div>
        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
          <p className="text-sm text-slate-500">Acessos Não Autorizados</p>
          <p className="text-2xl font-bold text-rose-600">{stats.naoAutorizados}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8 print-break-inside-avoid">
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b border-slate-200 pb-2 text-slate-800">
            Status de Resolução
          </h3>
          <div className="h-[250px]">
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
                    outerRadius={80}
                    label
                  >
                    <Cell fill="#2563eb" />
                    <Cell fill="#f59e0b" />
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
            Últimas Interações
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Condomínio</TableHead>
                <TableHead>Mensagem</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversas.slice(0, 6).map((c, i) => (
                <TableRow key={i}>
                  <TableCell className="whitespace-nowrap text-slate-600">
                    {format(new Date(c.created_at), 'dd/MM/yy HH:mm')}
                  </TableCell>
                  <TableCell className="text-slate-800">
                    {(c.condominios as any)?.name || 'N/A'}
                  </TableCell>
                  <TableCell className="truncate max-w-[150px] text-slate-600">
                    {c.message}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-medium ${c.status === 'respondido' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}
                    >
                      {c.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </ReportLayout>
  )
}
