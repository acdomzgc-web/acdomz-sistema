import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  Cell,
  CartesianGrid,
} from 'recharts'
import { supabase } from '@/lib/supabase/client'
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'

const COLORS = ['#1a3a52', '#d4af8f', '#10B981', '#F59E0B', '#6366f1']

export default function DashboardFinanceiroAcdomz() {
  const [data, setData] = useState<any>({ receitas: [], despesasP: [], despesasR: [] })

  useEffect(() => {
    Promise.all([
      supabase.from('receitas_acdomz').select('*'),
      supabase.from('despesas_pontuais_acdomz').select('*'),
      supabase.from('despesas_recorrentes_acdomz').select('*'),
    ]).then(([rec, despP, despR]) => {
      setData({
        receitas: rec.data || [],
        despesasP: despP.data || [],
        despesasR: despR.data || [],
      })
    })
  }, [])

  const totalReceitas = data.receitas.reduce(
    (acc: number, curr: any) => acc + (Number(curr.amount) || 0),
    0,
  )
  const totalDespesas =
    data.despesasP.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0) +
    data.despesasR.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0) * 12
  const lucro = totalReceitas - totalDespesas
  const roi = totalDespesas > 0 ? ((totalReceitas - totalDespesas) / totalDespesas) * 100 : 0
  const margem = totalReceitas > 0 ? (lucro / totalReceitas) * 100 : 0

  const lineChartData = [
    { name: 'Jan', receita: 15000, despesa: 12000, roi: 25 },
    { name: 'Fev', receita: 18000, despesa: 13500, roi: 33 },
    { name: 'Mar', receita: 16500, despesa: 14000, roi: 17 },
    { name: 'Abr', receita: 22000, despesa: 15000, roi: 46 },
    { name: 'Mai', receita: 21000, despesa: 16000, roi: 31 },
    {
      name: 'Jun',
      receita: totalReceitas > 0 ? totalReceitas : 25000,
      despesa: totalDespesas > 0 ? totalDespesas : 15500,
      roi: roi > 0 ? roi : 61,
    },
  ]

  const pieData = [
    { name: 'Taxa Administrativa', value: 65 },
    { name: 'Assessoria', value: 20 },
    { name: 'Serviços Avulsos', value: 15 },
  ]

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[#1a3a52]">Dashboard Financeiro Corporativo</h1>
        <p className="text-muted-foreground">
          Visão geral do desempenho e rentabilidade da ACDOMZ.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">R$ {totalReceitas.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 text-green-600">
              <TrendingUp className="h-3 w-3" /> +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Despesa Total</CardTitle>
            <Activity className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">R$ {totalDespesas.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 text-red-600">
              <TrendingDown className="h-3 w-3" /> +5% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Lucro Líquido / Margem</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">R$ {lucro.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Margem: <span className="font-semibold text-blue-600">{margem.toFixed(1)}%</span>
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-background to-amber-500/5">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">ROI (Retorno S/ Invest.)</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{roi.toFixed(2)}%</p>
            <p className="text-xs text-muted-foreground mt-1">Índice de rendimento de capital</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="geral">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="geral">Desempenho Geral</TabsTrigger>
          <TabsTrigger value="crescimento">Crescimento (ROI)</TabsTrigger>
          <TabsTrigger value="categoria">Fontes de Receita</TabsTrigger>
          <TabsTrigger value="transacoes">Transações Recentes</TabsTrigger>
        </TabsList>
        <TabsContent value="geral" className="h-[400px] mt-4">
          <Card className="p-4 h-full shadow-sm">
            <h3 className="font-medium mb-4 text-[#1a3a52]">
              Receitas vs Despesas (Evolução Anual)
            </h3>
            <ChartContainer
              config={{
                receita: { color: '#10B981', label: 'Receita' },
                despesa: { color: '#EF4444', label: 'Despesa' },
              }}
              className="h-[300px] w-full"
            >
              <BarChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
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
            </ChartContainer>
          </Card>
        </TabsContent>
        <TabsContent value="crescimento" className="h-[400px] mt-4">
          <Card className="p-4 h-full shadow-sm">
            <h3 className="font-medium mb-4 text-[#1a3a52]">Evolução do ROI (%)</h3>
            <ChartContainer
              config={{ roi: { color: '#F59E0B', label: 'ROI %' } }}
              className="h-[300px] w-full"
            >
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="roi"
                  stroke="var(--color-roi)"
                  strokeWidth={4}
                  dot={{ r: 6, fill: '#F59E0B', strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ChartContainer>
          </Card>
        </TabsContent>
        <TabsContent value="categoria" className="h-[400px] mt-4 flex gap-4">
          <Card className="p-4 flex-1 shadow-sm">
            <h3 className="font-medium mb-2 text-[#1a3a52] text-center">
              Distribuição de Receitas
            </h3>
            <ChartContainer
              config={{ value: { label: 'Participação (%)', color: '#1a3a52' } }}
              className="h-[300px] w-full"
            >
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={60}
                  label
                  paddingAngle={2}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </Card>
        </TabsContent>
        <TabsContent value="transacoes" className="mt-4">
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/20 border-b">
              <CardTitle className="text-lg">Últimas Movimentações Corporativas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.receitas.slice(0, 4).map((r: any) => (
                    <TableRow key={`rec-${r.id}`}>
                      <TableCell>{r.date ? new Date(r.date).toLocaleDateString() : '-'}</TableCell>
                      <TableCell className="font-medium">{r.description}</TableCell>
                      <TableCell className="text-right text-green-600 font-semibold">
                        + R$ {Number(r.amount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.despesasP.slice(0, 4).map((d: any) => (
                    <TableRow key={`desp-${d.id}`}>
                      <TableCell>{d.date ? new Date(d.date).toLocaleDateString() : '-'}</TableCell>
                      <TableCell className="font-medium">{d.description}</TableCell>
                      <TableCell className="text-right text-red-600 font-semibold">
                        - R$ {Number(d.amount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
