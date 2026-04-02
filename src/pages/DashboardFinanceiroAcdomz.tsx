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
import { Line, LineChart, Bar, BarChart, Pie, PieChart, XAxis, YAxis, Cell } from 'recharts'
import { api } from '@/services/api'

const lineChartData = [
  { name: 'Jan', receita: 15000, despesa: 12000 },
  { name: 'Fev', receita: 18000, despesa: 13500 },
  { name: 'Mar', receita: 16500, despesa: 14000 },
  { name: 'Abr', receita: 22000, despesa: 15000 },
  { name: 'Mai', receita: 21000, despesa: 16000 },
  { name: 'Jun', receita: 25000, despesa: 15500 },
]

const pieData = [
  { name: 'Taxa Administrativa', value: 85000 },
  { name: 'Assessoria', value: 15000 },
  { name: 'Outros', value: 17500 },
]

const COLORS = ['#1a3a52', '#d4af8f', '#10B981', '#F59E0B']

export default function DashboardFinanceiroAcdomz() {
  const [data, setData] = useState<any>({ receitas: [], despesasP: [], despesasR: [] })

  useEffect(() => {
    Promise.all([
      api.receitas.list(),
      api.despesasPontuais.list(),
      api.despesasRecorrentes.list(),
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

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-[#1a3a52]">Dashboard Financeiro ACDOMZ</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">R$ {totalReceitas.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Despesa Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">R$ {totalDespesas.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Lucro Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#1a3a52]">R$ {lucro.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Inadimplentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-500">3 Condomínios</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="geral">
        <TabsList>
          <TabsTrigger value="geral">Resumo Geral</TabsTrigger>
          <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="categoria">Por Categoria</TabsTrigger>
          <TabsTrigger value="transacoes">Transações</TabsTrigger>
        </TabsList>
        <TabsContent value="geral" className="h-[400px] mt-4">
          <Card className="p-4 h-full">
            <ChartContainer
              config={{
                receita: { color: '#10B981', label: 'Receita' },
                despesa: { color: '#EF4444', label: 'Despesa' },
              }}
              className="h-full w-full"
            >
              <BarChart data={lineChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="receita" fill="var(--color-receita)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesa" fill="var(--color-despesa)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </Card>
        </TabsContent>
        <TabsContent value="fluxo" className="h-[400px] mt-4">
          <Card className="p-4 h-full">
            <ChartContainer
              config={{
                receita: { color: '#10B981', label: 'Receita' },
                despesa: { color: '#EF4444', label: 'Despesa' },
              }}
              className="h-full w-full"
            >
              <LineChart data={lineChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="receita"
                  stroke="var(--color-receita)"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="despesa"
                  stroke="var(--color-despesa)"
                  strokeWidth={3}
                />
              </LineChart>
            </ChartContainer>
          </Card>
        </TabsContent>
        <TabsContent value="categoria" className="h-[400px] mt-4 flex gap-4">
          <Card className="p-4 flex-1">
            <h3 className="text-center font-medium mb-2">Receitas por Categoria</h3>
            <ChartContainer
              config={{ value: { label: 'Valor', color: '#1a3a52' } }}
              className="h-[300px] w-full"
            >
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
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
          <Card>
            <CardHeader>
              <CardTitle>Últimas Movimentações ACDOMZ</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.receitas.slice(0, 5).map((r: any) => (
                    <TableRow key={`rec-${r.id}`}>
                      <TableCell>{r.date}</TableCell>
                      <TableCell>{r.description}</TableCell>
                      <TableCell className="text-green-600">
                        + R$ {Number(r.amount).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.despesasP.slice(0, 5).map((d: any) => (
                    <TableRow key={`desp-${d.id}`}>
                      <TableCell>{d.date}</TableCell>
                      <TableCell>{d.description}</TableCell>
                      <TableCell className="text-red-600">
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
