import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Label } from '@/components/ui/label'

const chartConfig = {
  count: { label: 'Quantidade', color: 'hsl(var(--chart-1))' },
  value: { label: 'Valor (R$)', color: 'hsl(var(--chart-2))' },
}

const statusMap: Record<string, string> = {
  qualificacao: 'Qualificação',
  primeiro_contato: 'Primeiro Contato',
  reuniao: 'Reunião/Apres.',
  proposta: 'Proposta Enviada',
  negociacao: 'Negociação',
  ganho: 'Ganho',
  perdido: 'Perdido',
}

const typeMap: Record<string, string> = {
  sindico: 'Síndico',
  administradora: 'Administradora',
  incorporadora: 'Incorporadora',
  construtora: 'Construtora',
  parceiro: 'Parceiro',
  outro: 'Outro',
}

const originMap: Record<string, string> = {
  indicacao: 'Indicação',
  site: 'Site',
  redes_sociais: 'Redes Sociais',
  prospeccao_ativa: 'Prospecção Ativa',
  evento: 'Evento',
  outro: 'Outro',
}

export function CrmDashboard({ leads }: { leads: any[] }) {
  const [dimension, setDimension] = useState('lead_type')
  const [metric, setMetric] = useState('count')

  const getLabel = (dim: string, val: string) => {
    if (!val) return 'Não Informado'
    if (dim === 'status') return statusMap[val] || val
    if (dim === 'lead_type') return typeMap[val] || val
    if (dim === 'origin') return originMap[val] || val
    return val
  }

  const data = useMemo(() => {
    const grouped = leads.reduce(
      (acc, lead) => {
        const rawKey = lead[dimension]
        const key = getLabel(dimension, rawKey)
        if (!acc[key]) acc[key] = { name: key, count: 0, value: 0 }
        acc[key].count += 1
        acc[key].value += Number(lead.value) || 0
        return acc
      },
      {} as Record<string, any>,
    )

    return Object.values(grouped).sort((a: any, b: any) => b[metric] - a[metric])
  }, [leads, dimension, metric])

  const pieData = useMemo(() => {
    const statusGroups = leads.reduce(
      (acc, lead) => {
        const key = statusMap[lead.status] || lead.status || 'Outro'
        if (!acc[key]) acc[key] = { name: key, value: 0 }
        acc[key].value += 1
        return acc
      },
      {} as Record<string, any>,
    )
    return Object.values(statusGroups).filter((d: any) => d.value > 0)
  }, [leads])

  const COLORS = [
    '#0ea5e9',
    '#8b5cf6',
    '#6366f1',
    '#ec4899',
    '#f43f5e',
    '#10b981',
    '#f59e0b',
    '#ef4444',
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="col-span-2 md:col-span-1 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Análise de Performance (Cruzamento de Dados)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <div className="space-y-1.5 flex-1">
              <Label className="text-xs text-muted-foreground font-semibold">
                Analisar por (Eixo X)
              </Label>
              <Select value={dimension} onValueChange={setDimension}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead_type">Tipo de Contato / Lead</SelectItem>
                  <SelectItem value="origin">Origem do Contato</SelectItem>
                  <SelectItem value="status">Estágio do Funil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 flex-1">
              <Label className="text-xs text-muted-foreground font-semibold">
                Métrica (Eixo Y)
              </Label>
              <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="count">Volume de Leads (Qtd)</SelectItem>
                  <SelectItem value="value">Valor Financeiro Estimado (R$)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="h-[320px] w-full mt-6">
            <ChartContainer config={chartConfig} className="h-full w-full min-h-[320px]">
              <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/30" />
                <XAxis
                  dataKey="name"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) =>
                    metric === 'value' ? `R$ ${val.toLocaleString('pt-BR')}` : val
                  }
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey={metric}
                  fill={metric === 'value' ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))'}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-2 md:col-span-1 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Saúde do Funil (Distribuição por Etapa)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={120}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-muted-foreground text-sm">Sem dados para exibir no funil.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
