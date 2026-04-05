import { useState, useEffect } from 'react'
import {
  Building,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Briefcase,
  UserCheck,
  Settings2,
  Activity,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'

const revenueData = [
  { month: 'Jan', revenue: 45000, expense: 32000 },
  { month: 'Fev', revenue: 48000, expense: 33000 },
  { month: 'Mar', revenue: 52000, expense: 31000 },
  { month: 'Abr', revenue: 51000, expense: 35000 },
  { month: 'Mai', revenue: 58000, expense: 34000 },
  { month: 'Jun', revenue: 62000, expense: 36000 },
]

export function AdminOverview() {
  const [stats, setStats] = useState({
    condominios: 0,
    administradoras: 0,
    moradores: 0,
    sindicos: 0,
    receita: 0,
    despesa: 0,
    lucro: 0,
  })
  const [recentCondos, setRecentCondos] = useState<any[]>([])
  const [period, setPeriod] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area')
  const [chartData, setChartData] = useState<any[]>([])

  const [visibleKpis, setVisibleKpis] = useState(() => {
    const saved = localStorage.getItem('acdomz-kpi-prefs')
    return saved
      ? JSON.parse(saved)
      : {
          administradoras: true,
          condominios: true,
          sindicos: true,
          moradores: true,
          receita: true,
          despesa: true,
          lucro: true,
        }
  })

  const handleKpiToggle = (key: string) => {
    const newPrefs = { ...visibleKpis, [key]: !visibleKpis[key] }
    setVisibleKpis(newPrefs)
    localStorage.setItem('acdomz-kpi-prefs', JSON.stringify(newPrefs))
  }

  useEffect(() => {
    const loadData = async () => {
      const now = new Date()
      const year = now.getFullYear()
      let start: Date | null = null
      let end: Date | null = null
      let monthsCount = 12

      if (period === 'year') {
        start = new Date(year, 0, 1)
        end = new Date(year, 11, 31)
      } else if (period === 'semester') {
        const isFirst = now.getMonth() < 6
        start = new Date(year, isFirst ? 0 : 6, 1)
        end = new Date(year, isFirst ? 5 : 11, isFirst ? 30 : 31)
        monthsCount = 6
      } else if (period === 'quarter') {
        const q = Math.floor(now.getMonth() / 3)
        start = new Date(year, q * 3, 1)
        end = new Date(year, q * 3 + 3, 0)
        monthsCount = 3
      } else if (period === 'month') {
        start = new Date(year, selectedMonth - 1, 1)
        end = new Date(year, selectedMonth, 0)
        monthsCount = 1
      }

      let recQuery = supabase.from('receitas_acdomz').select('amount, date')
      let despPtQuery = supabase.from('despesas_pontuais_acdomz').select('amount, date')

      if (start && end) {
        const startStr = start.toISOString().split('T')[0]
        const endStr = end.toISOString().split('T')[0]
        recQuery = recQuery.gte('date', startStr).lte('date', endStr)
        despPtQuery = despPtQuery.gte('date', startStr).lte('date', endStr)
      }

      const [condos, admins, moradores, profiles, receitas, despesasPt, despesasRec, recent] =
        await Promise.all([
          supabase.from('condominios').select('*', { count: 'exact', head: true }),
          supabase.from('administradoras').select('*', { count: 'exact', head: true }),
          supabase.from('moradores').select('*', { count: 'exact', head: true }),
          supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'sindico'),
          recQuery,
          despPtQuery,
          supabase.from('despesas_recorrentes_acdomz').select('amount'),
          supabase
            .from('condominios')
            .select('id, name, total_units, sindia_active')
            .order('created_at', { ascending: false })
            .limit(5),
        ])

      const totalReceita =
        receitas.data?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0
      const totalDespesaPt =
        despesasPt.data?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0
      const totalDespesaRec =
        despesasRec.data?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0
      const totalDespesa = totalDespesaPt + totalDespesaRec * (period === 'all' ? 12 : monthsCount)

      setStats({
        condominios: condos.count || 0,
        administradoras: admins.count || 0,
        moradores: moradores.count || 0,
        sindicos: profiles.count || 0,
        receita: totalReceita,
        despesa: totalDespesa,
        lucro: totalReceita - totalDespesa,
      })

      if (recent.data) setRecentCondos(recent.data)

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
      const dataByMonth: Record<string, { revenue: number; expense: number }> = {}

      receitas.data?.forEach((r) => {
        if (!r.date) return
        const m = r.date.substring(0, 7)
        if (!dataByMonth[m]) dataByMonth[m] = { revenue: 0, expense: 0 }
        dataByMonth[m].revenue += Number(r.amount) || 0
      })

      despesasPt.data?.forEach((d) => {
        if (!d.date) return
        const m = d.date.substring(0, 7)
        if (!dataByMonth[m]) dataByMonth[m] = { revenue: 0, expense: 0 }
        dataByMonth[m].expense += Number(d.amount) || 0
      })

      Object.keys(dataByMonth).forEach((m) => {
        dataByMonth[m].expense += totalDespesaRec
      })

      let builtChartData = Object.keys(dataByMonth)
        .sort()
        .map((k) => ({
          month: monthNames[parseInt(k.split('-')[1]) - 1],
          revenue: dataByMonth[k].revenue,
          expense: dataByMonth[k].expense,
        }))

      setChartData(builtChartData.length === 0 ? revenueData : builtChartData)
    }
    loadData()
  }, [period, selectedMonth])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const kpis = [
    {
      id: 'administradoras',
      title: 'Administradoras Parceiras',
      value: stats.administradoras.toString(),
      icon: Briefcase,
      trend: '+1',
      color: 'green',
    },
    {
      id: 'condominios',
      title: 'Total Condomínios',
      value: stats.condominios.toString(),
      icon: Building,
      trend: '+2',
      color: 'green',
    },
    {
      id: 'sindicos',
      title: 'Total Síndicos',
      value: stats.sindicos.toString(),
      icon: UserCheck,
      trend: '+3',
      color: 'green',
    },
    {
      id: 'moradores',
      title: 'Total Moradores',
      value: stats.moradores.toString(),
      icon: Users,
      trend: '+12',
      color: 'green',
    },
    {
      id: 'receita',
      title: 'Receita Consolidada',
      value: formatCurrency(stats.receita),
      icon: DollarSign,
      trend: '+8%',
      color: 'green',
    },
    {
      id: 'despesa',
      title: 'Despesa Consolidada',
      value: formatCurrency(stats.despesa),
      icon: TrendingDown,
      trend: '-3%',
      color: 'green',
    },
    {
      id: 'lucro',
      title: 'Lucro Líquido',
      value: formatCurrency(stats.lucro),
      icon: TrendingUp,
      trend: '+12%',
      color: 'green',
    },
  ] as const

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card/50 p-4 rounded-xl border border-border/40 backdrop-blur-sm shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[160px] bg-background shadow-sm">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo o Período</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
              <SelectItem value="semester">Este Semestre</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
              <SelectItem value="month">Mês Específico</SelectItem>
            </SelectContent>
          </Select>

          {period === 'month' && (
            <Select
              value={selectedMonth.toString()}
              onValueChange={(v) => setSelectedMonth(parseInt(v))}
            >
              <SelectTrigger className="w-[140px] bg-background shadow-sm">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <SelectItem key={m} value={m.toString()}>
                    {new Date(2000, m - 1).toLocaleString('pt-BR', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 bg-background shadow-sm hover:shadow-md transition-all"
            >
              <Settings2 className="h-4 w-4" /> Personalizar Métricas
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Personalizar Dashboard</DialogTitle>
            </DialogHeader>
            <div className="py-4 grid gap-3">
              <p className="text-sm text-muted-foreground mb-2">
                Selecione as métricas que deseja exibir.
              </p>
              {kpis.map((kpi) => (
                <div
                  key={kpi.id}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={`kpi-${kpi.id}`}
                    checked={visibleKpis[kpi.id as keyof typeof visibleKpis]}
                    onCheckedChange={() => handleKpiToggle(kpi.id)}
                  />
                  <label
                    htmlFor={`kpi-${kpi.id}`}
                    className="text-sm font-medium leading-none cursor-pointer flex-1"
                  >
                    {kpi.title}
                  </label>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {kpis.map(
          (kpi) =>
            visibleKpis[kpi.id as keyof typeof visibleKpis] && (
              <KpiCard
                key={kpi.id}
                title={kpi.title}
                value={kpi.value}
                icon={kpi.icon}
                trend={kpi.trend}
                trendColor={kpi.color as 'green' | 'red'}
              />
            ),
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 overflow-hidden border-border/40 shadow-sm transition-all hover:shadow-md bg-gradient-to-b from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border/40 bg-card/50">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Evolução Financeira</CardTitle>
            </div>
            <Select value={chartType} onValueChange={(v: any) => setChartType(v)}>
              <SelectTrigger className="w-[140px] h-8 text-xs bg-background shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="area">Área (Evolução)</SelectItem>
                <SelectItem value="line">Linhas (Tendência)</SelectItem>
                <SelectItem value="bar">Barras (Comparativo)</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="pl-2 pt-6">
            <ChartContainer
              config={{
                revenue: { label: 'Receitas', color: 'hsl(var(--chart-1))' },
                expense: { label: 'Despesas', color: 'hsl(var(--chart-5))' },
              }}
              className="h-[320px] w-full"
            >
              {chartType === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    tickFormatter={(val) => `R$${val / 1000}k`}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    dx={-10}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    fillOpacity={1}
                    fill="url(#colorRev)"
                    strokeWidth={3}
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="var(--color-expense)"
                    fillOpacity={1}
                    fill="url(#colorExp)"
                    strokeWidth={3}
                  />
                </AreaChart>
              ) : chartType === 'line' ? (
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    tickFormatter={(val) => `R$${val / 1000}k`}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    dx={-10}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="var(--color-expense)"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    tickFormatter={(val) => `R$${val / 1000}k`}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    dx={-10}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="revenue"
                    fill="var(--color-revenue)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="expense"
                    fill="var(--color-expense)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              )}
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-border/40 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="border-b border-border/40 bg-card/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" /> Condomínios Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-foreground">Nome</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">
                    Unidades
                  </TableHead>
                  <TableHead className="text-right font-semibold text-foreground">
                    Status SINDIA
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCondos.map((condo) => (
                  <TableRow key={condo.id} className="transition-colors hover:bg-muted/30">
                    <TableCell className="font-medium">{condo.name}</TableCell>
                    <TableCell className="text-right">{condo.total_units || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={condo.sindia_active ? 'default' : 'secondary'}
                        className={
                          condo.sindia_active
                            ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0'
                            : ''
                        }
                      >
                        {condo.sindia_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {recentCondos.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-8 text-muted-foreground text-sm"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Building className="h-8 w-8 text-muted-foreground/50" />
                        <p>Nenhum condomínio cadastrado.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
  trendColor,
}: {
  title: string
  value: string
  icon: any
  trend: string
  trendColor: 'green' | 'red'
}) {
  const isGreen = trendColor === 'green'
  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 border border-border/40 bg-gradient-to-br from-card to-card/80 group">
      <div className="absolute -right-6 -top-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none transform group-hover:scale-110 duration-500">
        <Icon className="h-32 w-32" />
      </div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div
          className={`p-2 rounded-lg ${isGreen ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10 pt-2">
        <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
        <div className="flex items-center mt-3">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-md ${isGreen ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}
          >
            {trend}
          </span>
          <span className="text-xs text-muted-foreground ml-2 font-medium">
            vs. período anterior
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
