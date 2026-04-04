import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Building2,
  Users,
  Wallet,
  TrendingUp,
  TrendingDown,
  Building,
  ShieldCheck,
  Settings2,
  BarChart3,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { usePreferences } from '@/hooks/use-preferences'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const METRICS_CONFIG = [
  { id: 'admin', label: 'Administradoras Parceiras', icon: Building, color: 'text-blue-500' },
  { id: 'condominios', label: 'Total de Condomínios', icon: Building2, color: 'text-indigo-500' },
  { id: 'moradores', label: 'Total de Moradores', icon: Users, color: 'text-orange-500' },
  { id: 'sindicos', label: 'Total de Síndicos', icon: ShieldCheck, color: 'text-purple-500' },
  { id: 'receita', label: 'Receita Total', icon: TrendingUp, color: 'text-green-500' },
  { id: 'despesa', label: 'Despesa Total', icon: TrendingDown, color: 'text-red-500' },
  { id: 'lucro', label: 'Lucro Consolidado', icon: Wallet, color: 'text-emerald-500' },
]

const MOCK_DATA = {
  admin: { value: '12', trend: '+2 esse mês' },
  condominios: { value: '48', trend: '+5 esse mês' },
  moradores: { value: '1.240', trend: '+120 esse mês' },
  sindicos: { value: '36', trend: '+4 esse mês' },
  receita: { value: 'R$ 485.000', trend: '+15% vs último período' },
  despesa: { value: 'R$ 312.000', trend: '+5% vs último período' },
  lucro: { value: 'R$ 173.000', trend: '+22% vs último período' },
}

const generateChartData = (period: string, specificMonth: string) => {
  const data = []
  let points = 0
  let labelPrefix = ''

  if (period === 'mes') {
    const monthNames = [
      'Jan',
      'Fev',
      'Mar',
      'Abr',
      'Mai',
      'Jun',
      'Jul',
      'Ago',
      'Set',
      'Out',
      'Nov',
      'Dez',
    ]
    const mName = monthNames[parseInt(specificMonth)]
    points = 4
    for (let i = 1; i <= points; i++) {
      data.push({
        name: `Sem. ${i} (${mName})`,
        receita: Math.round(120000 * (1 + (Math.random() * 0.4 - 0.1))),
        despesa: Math.round(78000 * (1 + (Math.random() * 0.3 - 0.1))),
      })
    }
    return data
  }

  switch (period) {
    case 'trimestre':
      points = 3
      labelPrefix = 'Mês '
      break
    case 'semestre':
      points = 6
      labelPrefix = 'Mês '
      break
    case 'ano':
      points = 12
      labelPrefix = 'Mês '
      break
    case 'all':
      points = 5
      labelPrefix = 'Ano '
      break
    default:
      points = 6
      labelPrefix = 'Mês '
      break
  }

  let baseReceita =
    period === 'all'
      ? 5000000
      : period === 'ano'
        ? 400000
        : period === 'semestre'
          ? 400000
          : period === 'trimestre'
            ? 400000
            : 120000
  let baseDespesa = baseReceita * 0.65

  for (let i = 1; i <= points; i++) {
    const rMulti = 1 + (Math.random() * 0.4 - 0.1)
    const dMulti = 1 + (Math.random() * 0.3 - 0.1)

    data.push({
      name: `${labelPrefix}${period === 'all' ? 2020 + i : i}`,
      receita: Math.round(baseReceita * rMulti),
      despesa: Math.round(baseDespesa * dMulti),
    })
  }
  return data
}

export function AdminOverview() {
  const { visibleMetrics, setVisibleMetrics } = usePreferences()
  const [period, setPeriod] = useState('semestre')
  const [specificMonth, setSpecificMonth] = useState(new Date().getMonth().toString())
  const [chartType, setChartType] = useState('bar')

  const chartData = useMemo(() => generateChartData(period, specificMonth), [period, specificMonth])

  const toggleMetric = (id: string) => {
    if (visibleMetrics.includes(id)) {
      if (visibleMetrics.length > 1) {
        setVisibleMetrics(visibleMetrics.filter((m) => m !== id))
      }
    } else {
      setVisibleMetrics([...visibleMetrics, id])
    }
  }

  const chartConfig = {
    receita: { label: 'Receita', color: 'hsl(var(--chart-1))' },
    despesa: { label: 'Despesa', color: 'hsl(var(--chart-2))' },
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes">Mês Específico</SelectItem>
              <SelectItem value="trimestre">Último Trimestre</SelectItem>
              <SelectItem value="semestre">Último Semestre</SelectItem>
              <SelectItem value="ano">Último Ano</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>

          {period === 'mes' && (
            <Select value={specificMonth} onValueChange={setSpecificMonth}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Janeiro</SelectItem>
                <SelectItem value="1">Fevereiro</SelectItem>
                <SelectItem value="2">Março</SelectItem>
                <SelectItem value="3">Abril</SelectItem>
                <SelectItem value="4">Maio</SelectItem>
                <SelectItem value="5">Junho</SelectItem>
                <SelectItem value="6">Julho</SelectItem>
                <SelectItem value="7">Agosto</SelectItem>
                <SelectItem value="8">Setembro</SelectItem>
                <SelectItem value="9">Outubro</SelectItem>
                <SelectItem value="10">Novembro</SelectItem>
                <SelectItem value="11">Dezembro</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Settings2 className="w-4 h-4" />
              Personalizar Métricas
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Métricas Visíveis</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {METRICS_CONFIG.map((metric) => (
              <DropdownMenuCheckboxItem
                key={metric.id}
                checked={visibleMetrics.includes(metric.id)}
                onCheckedChange={() => toggleMetric(metric.id)}
              >
                {metric.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {METRICS_CONFIG.filter((m) => visibleMetrics.includes(m.id)).map((metric) => {
          const Icon = metric.icon
          const data = MOCK_DATA[metric.id as keyof typeof MOCK_DATA]

          return (
            <Card
              key={metric.id}
              className="shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-muted/50 ${metric.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{data.trend}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Evolução Financeira</CardTitle>
            <CardDescription>
              Comparativo de receitas e despesas no período selecionado
            </CardDescription>
          </div>
          <ToggleGroup
            type="single"
            value={chartType}
            onValueChange={(v) => v && setChartType(v)}
            className="bg-muted/50 p-1 rounded-lg"
          >
            <ToggleGroupItem value="bar" aria-label="Gráfico de Barras">
              <BarChart3 className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="line" aria-label="Gráfico de Linha">
              <LineChartIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="area" aria-label="Gráfico de Área">
              <AreaChartIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            {chartType === 'bar' && (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `R$ ${value / 1000}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend verticalAlign="top" height={36} />
                <Bar
                  dataKey="receita"
                  fill="var(--color-receita)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
                <Bar
                  dataKey="despesa"
                  fill="var(--color-despesa)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            )}
            {chartType === 'line' && (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `R$ ${value / 1000}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="receita"
                  stroke="var(--color-receita)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="despesa"
                  stroke="var(--color-despesa)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            )}
            {chartType === 'area' && (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-receita)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-receita)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-despesa)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-despesa)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `R$ ${value / 1000}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend verticalAlign="top" height={36} />
                <Area
                  type="monotone"
                  dataKey="receita"
                  stroke="var(--color-receita)"
                  fillOpacity={1}
                  fill="url(#colorReceita)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="despesa"
                  stroke="var(--color-despesa)"
                  fillOpacity={1}
                  fill="url(#colorDespesa)"
                  strokeWidth={2}
                />
              </AreaChart>
            )}
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
