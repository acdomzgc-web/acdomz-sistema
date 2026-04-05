import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import FinanceiroAcdomz from './FinanceiroAcdomz'
import DespesasAcdomz from './DespesasAcdomz'
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
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

export default function DashboardFinanceiroAcdomz() {
  const [period, setPeriod] = useState<string>('last_3')
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('area')
  const [activeTab, setActiveTab] = useState('dashboard')

  const [summary, setSummary] = useState({ receita: 0, despesa: 0, lucro: 0, roi: 0 })
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [period, selectedMonth])

  const loadData = async () => {
    setLoading(true)
    const now = new Date()
    let start = new Date(2000, 0, 1)
    let end = new Date(2100, 11, 31)

    if (period === 'specific_month') {
      start = new Date(now.getFullYear(), selectedMonth - 1, 1)
      end = new Date(now.getFullYear(), selectedMonth, 0)
    } else if (period === 'last_3') {
      start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    } else if (period === 'last_6') {
      start = new Date(now.getFullYear(), now.getMonth() - 5, 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    } else if (period === 'annual') {
      start = new Date(now.getFullYear(), 0, 1)
      end = new Date(now.getFullYear(), 11, 31)
    }

    const startStr = start.toISOString().split('T')[0]
    const endStr = end.toISOString().split('T')[0]

    let qReceitas = supabase.from('receitas_acdomz').select('amount, date')
    let qDespesas = supabase.from('despesas_pontuais_acdomz').select('amount, date')

    if (period !== 'all') {
      qReceitas = qReceitas.gte('date', startStr).lte('date', endStr)
      qDespesas = qDespesas.gte('date', startStr).lte('date', endStr)
    }

    const [resRec, resDesp] = await Promise.all([qReceitas, qDespesas])

    let totalReceita = 0
    let totalDespesa = 0
    const dataByMonth: Record<string, { receita: number; despesa: number; lucro: number }> = {}

    resRec.data?.forEach((r) => {
      const val = Number(r.amount) || 0
      totalReceita += val
      if (r.date) {
        const m = r.date.substring(0, 7)
        if (!dataByMonth[m]) dataByMonth[m] = { receita: 0, despesa: 0, lucro: 0 }
        dataByMonth[m].receita += val
      }
    })

    resDesp.data?.forEach((d) => {
      const val = Number(d.amount) || 0
      totalDespesa += val
      if (d.date) {
        const m = d.date.substring(0, 7)
        if (!dataByMonth[m]) dataByMonth[m] = { receita: 0, despesa: 0, lucro: 0 }
        dataByMonth[m].despesa += val
      }
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
    const formattedChartData = Object.keys(dataByMonth)
      .sort()
      .map((key) => {
        const m = parseInt(key.split('-')[1]) - 1
        const rec = dataByMonth[key].receita
        const desp = dataByMonth[key].despesa
        return {
          month: monthNames[m] + '/' + key.split('-')[0].substring(2),
          receita: rec,
          despesa: desp,
          lucro: rec - desp,
        }
      })

    const lucro = totalReceita - totalDespesa
    const roi = totalDespesa > 0 ? (lucro / totalDespesa) * 100 : totalReceita > 0 ? 100 : 0

    setSummary({ receita: totalReceita, despesa: totalDespesa, lucro, roi })
    setChartData(
      formattedChartData.length > 0
        ? formattedChartData
        : [{ month: 'Sem dados', receita: 0, despesa: 0, lucro: 0 }],
    )
    setLoading(false)
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Financeiro ACDOMZ</h1>
          <p className="text-muted-foreground mt-1">
            Gestão unificada, elegante e precisa de receitas, despesas e ROI.
          </p>
        </div>
        {activeTab === 'dashboard' && (
          <div className="flex flex-wrap items-center gap-3 bg-card p-2 rounded-lg border shadow-sm">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="Selecione o Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="specific_month">Mês Específico</SelectItem>
                <SelectItem value="last_3">Últimos 3 Meses</SelectItem>
                <SelectItem value="last_6">Últimos 6 Meses</SelectItem>
                <SelectItem value="annual">Anual</SelectItem>
                <SelectItem value="all">Todo o Período</SelectItem>
              </SelectContent>
            </Select>
            {period === 'specific_month' && (
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
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 bg-muted/50 p-1">
          <TabsTrigger value="dashboard" className="rounded-md">
            Dashboard & Evolução
          </TabsTrigger>
          <TabsTrigger value="entradas" className="rounded-md">
            Entradas
          </TabsTrigger>
          <TabsTrigger value="saidas" className="rounded-md">
            Saídas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 animate-fade-in-up mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-card to-emerald-500/5 border-emerald-500/20 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  Receita Bruta
                </CardTitle>
                <div className="p-2 bg-emerald-500/10 rounded-full">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(summary.receita)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-card to-red-500/5 border-red-500/20 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  Despesas Totais
                </CardTitle>
                <div className="p-2 bg-red-500/10 rounded-full">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.despesa)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-card to-blue-500/5 border-blue-500/20 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  Lucro Líquido
                </CardTitle>
                <div className="p-2 bg-blue-500/10 rounded-full">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">
                  {formatCurrency(summary.lucro)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-primary">ROI Global</CardTitle>
                <div className="p-2 bg-primary/20 rounded-full">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-primary">{summary.roi.toFixed(1)}%</div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50 shadow-sm bg-gradient-to-b from-card to-card/80">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Evolução Financeira
              </CardTitle>
              <Select value={chartType} onValueChange={(v: any) => setChartType(v)}>
                <SelectTrigger className="w-[180px] h-9 text-sm bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="area">Área (Tendência Suave)</SelectItem>
                  <SelectItem value="bar">Barras (Comparativo)</SelectItem>
                  <SelectItem value="line">Linhas (Evolução)</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="pt-6 pl-0">
              <ChartContainer
                config={{
                  receita: { label: 'Receitas', color: '#10b981' },
                  despesa: { label: 'Despesas', color: '#ef4444' },
                  lucro: { label: 'Lucro', color: '#3b82f6' },
                }}
                className="h-[400px] w-full"
              >
                {loading ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    Carregando dados...
                  </div>
                ) : chartType === 'bar' ? (
                  <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                      opacity={0.5}
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
                    <Bar dataKey="receita" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="despesa" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="lucro" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                ) : chartType === 'line' ? (
                  <LineChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                      opacity={0.5}
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
                      dataKey="receita"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="despesa"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="lucro"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                ) : (
                  <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradRec" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradDesp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradLucro" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                      opacity={0.5}
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
                      dataKey="receita"
                      stroke="#10b981"
                      fill="url(#gradRec)"
                      strokeWidth={3}
                    />
                    <Area
                      type="monotone"
                      dataKey="despesa"
                      stroke="#ef4444"
                      fill="url(#gradDesp)"
                      strokeWidth={3}
                    />
                    <Area
                      type="monotone"
                      dataKey="lucro"
                      stroke="#3b82f6"
                      fill="url(#gradLucro)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                )}
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entradas" className="animate-fade-in-up mt-2">
          <FinanceiroAcdomz />
        </TabsContent>

        <TabsContent value="saidas" className="animate-fade-in-up mt-2">
          <DespesasAcdomz />
        </TabsContent>
      </Tabs>
    </div>
  )
}
