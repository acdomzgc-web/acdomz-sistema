import { useState, useEffect } from 'react'
import { FileText, Building, Users, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
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
} from 'recharts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

export function SpecificOverview() {
  const [condominios, setCondominios] = useState<any[]>([])
  const [selectedCondo, setSelectedCondo] = useState<string>('')
  const [period, setPeriod] = useState<string>('all')
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar')

  const [summary, setSummary] = useState({
    docsCount: 0,
    adminName: '-',
    sindicoName: '-',
    receita: 0,
    despesa: 0,
  })
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    supabase
      .from('condominios')
      .select('id, name')
      .order('name')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setCondominios(data)
          setSelectedCondo(data[0].id)
        }
      })
  }, [])

  useEffect(() => {
    if (!selectedCondo) return

    const loadData = async () => {
      const now = new Date()
      const year = now.getFullYear()
      let start: Date | null = null
      let end: Date | null = null

      if (period === 'year') {
        start = new Date(year, 0, 1)
        end = new Date(year, 11, 31)
      } else if (period === 'semester') {
        const isFirst = now.getMonth() < 6
        start = new Date(year, isFirst ? 0 : 6, 1)
        end = new Date(year, isFirst ? 5 : 11, isFirst ? 30 : 31)
      } else if (period === 'quarter') {
        const q = Math.floor(now.getMonth() / 3)
        start = new Date(year, q * 3, 1)
        end = new Date(year, q * 3 + 3, 0)
      } else if (period === 'month') {
        start = new Date(year, selectedMonth - 1, 1)
        end = new Date(year, selectedMonth, 0)
      }

      const { data: condoData } = await supabase
        .from('condominios')
        .select(`
          id,
          administradoras ( name ),
          sindico_id
        `)
        .eq('id', selectedCondo)
        .single()

      let sindicoName = 'Não atribuído'
      if (condoData?.sindico_id) {
        const { data: p } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', condoData.sindico_id)
          .single()
        if (p) sindicoName = p.name
      }

      const { count: docsCount } = await supabase
        .from('documentos_condominio')
        .select('*', { count: 'exact', head: true })
        .eq('condominio_id', selectedCondo)

      let finQuery = supabase
        .from('financeiro_condominio')
        .select('amount, type, date')
        .eq('condominio_id', selectedCondo)

      if (start && end) {
        finQuery = finQuery
          .gte('date', start.toISOString().split('T')[0])
          .lte('date', end.toISOString().split('T')[0])
      }

      const { data: finData } = await finQuery

      let receita = 0
      let despesa = 0
      const dataByMonth: Record<string, { in: number; out: number }> = {}

      finData?.forEach((f) => {
        const val = Number(f.amount) || 0
        if (f.type === 'receita') receita += val
        else despesa += val

        if (f.date) {
          const m = f.date.substring(0, 7)
          if (!dataByMonth[m]) dataByMonth[m] = { in: 0, out: 0 }
          if (f.type === 'receita') dataByMonth[m].in += val
          else dataByMonth[m].out += val
        }
      })

      setSummary({
        docsCount: docsCount || 0,
        adminName: condoData?.administradoras?.name || 'Não atribuída',
        sindicoName,
        receita,
        despesa,
      })

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
      const builtChartData = Object.keys(dataByMonth)
        .sort()
        .map((k) => ({
          month: monthNames[parseInt(k.split('-')[1]) - 1],
          in: dataByMonth[k].in,
          out: dataByMonth[k].out,
        }))

      setChartData(
        builtChartData.length > 0 ? builtChartData : [{ month: 'Sem dados', in: 0, out: 0 }],
      )
    }

    loadData()
  }, [selectedCondo, period, selectedMonth])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
            <Building className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">Condomínio Selecionado</h2>
            <Select value={selectedCondo} onValueChange={setSelectedCondo}>
              <SelectTrigger className="w-[280px] h-8 border-0 bg-transparent p-0 text-lg font-bold text-primary focus:ring-0 focus:ring-offset-0 shadow-none">
                <SelectValue placeholder="Selecione um condomínio" />
              </SelectTrigger>
              <SelectContent>
                {condominios.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[160px] bg-background shadow-sm">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo o Período</SelectItem>
              <SelectItem value="year">Anual</SelectItem>
              <SelectItem value="semester">Semestral</SelectItem>
              <SelectItem value="quarter">Trimestral</SelectItem>
              <SelectItem value="month">Mensal</SelectItem>
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
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary hover:shadow-md transition-all group cursor-default">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.docsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Arquivos registrados</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-secondary hover:shadow-md transition-all group cursor-default">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liderança</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground group-hover:text-secondary transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold truncate" title={summary.sindicoName}>
              {summary.sindicoName}
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate" title={summary.adminName}>
              {summary.adminName}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-all group cursor-default">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground group-hover:text-green-500 transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.receita)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">No período selecionado</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 hover:shadow-md transition-all group cursor-default">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground group-hover:text-red-500 transition-colors" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.despesa)}</div>
            <p className="text-xs text-muted-foreground mt-1">No período selecionado</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40 shadow-sm hover:shadow-md transition-all bg-gradient-to-b from-card to-card/50">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-card/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" /> Análise Financeira
          </CardTitle>
          <Select value={chartType} onValueChange={(v: any) => setChartType(v)}>
            <SelectTrigger className="w-[160px] h-8 text-xs bg-background shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Barras (Comparativo)</SelectItem>
              <SelectItem value="line">Linhas (Tendência)</SelectItem>
              <SelectItem value="area">Área (Evolução)</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="pt-6 pl-2">
          <ChartContainer
            config={{
              in: { label: 'Receitas', color: 'hsl(var(--chart-3))' },
              out: { label: 'Despesas', color: 'hsl(var(--chart-5))' },
            }}
            className="h-[350px] w-full"
          >
            {chartType === 'bar' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
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
                <Bar dataKey="in" fill="var(--color-in)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Bar dataKey="out" fill="var(--color-out)" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            ) : chartType === 'line' ? (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
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
                  dataKey="in"
                  stroke="var(--color-in)"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="out"
                  stroke="var(--color-out)"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-in)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-in)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-out)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-out)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
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
                  dataKey="in"
                  stroke="var(--color-in)"
                  fill="url(#colorIn)"
                  strokeWidth={3}
                />
                <Area
                  type="monotone"
                  dataKey="out"
                  stroke="var(--color-out)"
                  fill="url(#colorOut)"
                  strokeWidth={3}
                />
              </AreaChart>
            )}
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
