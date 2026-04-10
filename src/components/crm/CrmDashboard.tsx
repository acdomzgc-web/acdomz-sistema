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
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
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
  const [chartType, setChartType] = useState('bar')
  const [funnelChartType, setFunnelChartType] = useState('donut')

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
              <Label className="text-xs text-muted-foreground font-semibold">Analisar por</Label>
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
              <Label className="text-xs text-muted-foreground font-semibold">Métrica</Label>
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
            <div className="space-y-1.5 flex-1">
              <Label className="text-xs text-muted-foreground font-semibold">
                Estilo de Gráfico
              </Label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Barras</SelectItem>
                  <SelectItem value="line">Linha de Tendência</SelectItem>
                  <SelectItem value="area">Área</SelectItem>
                  <SelectItem value="pie">Pizza</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="h-[320px] w-full mt-6">
            <ChartContainer config={chartConfig} className="h-full w-full min-h-[320px]">
              {chartType === 'bar' ? (
                <BarChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-muted/30"
                  />
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
              ) : chartType === 'line' ? (
                <LineChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-muted/30"
                  />
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
                  <Line
                    type="monotone"
                    dataKey={metric}
                    stroke={metric === 'value' ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))'}
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              ) : chartType === 'area' ? (
                <AreaChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-muted/30"
                  />
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
                  <Area
                    type="monotone"
                    dataKey={metric}
                    stroke={metric === 'value' ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))'}
                    fill={metric === 'value' ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))'}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              ) : (
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey={metric}
                    nameKey="name"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={true}
                  >
                    {data.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              )}
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-2 md:col-span-1 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Saúde do Funil</CardTitle>
            <Select value={funnelChartType} onValueChange={setFunnelChartType}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="donut">Rosca (Donut)</SelectItem>
                <SelectItem value="pie">Pizza</SelectItem>
                <SelectItem value="bar">Barras Horizontais</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[360px] w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ChartContainer config={{ value: { label: 'Quantidade' } }} className="h-full w-full">
                {funnelChartType === 'bar' ? (
                  <BarChart
                    data={pieData}
                    layout="vertical"
                    margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      className="stroke-muted/30"
                    />
                    <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      width={100}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={40}>
                      {pieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={funnelChartType === 'donut' ? 70 : 0}
                      outerRadius={120}
                      paddingAngle={funnelChartType === 'donut' ? 3 : 0}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                )}
              </ChartContainer>
            ) : (
              <div className="text-muted-foreground text-sm">Sem dados para exibir no funil.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
