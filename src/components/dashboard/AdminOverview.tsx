import { useState, useEffect } from 'react'
import { Building, Users, DollarSign, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { api } from '@/services/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const revenueData = [
  { month: 'Jan', revenue: 45000, expense: 32000 },
  { month: 'Fev', revenue: 48000, expense: 33000 },
  { month: 'Mar', revenue: 52000, expense: 31000 },
  { month: 'Abr', revenue: 51000, expense: 35000 },
  { month: 'Mai', revenue: 58000, expense: 34000 },
  { month: 'Jun', revenue: 62000, expense: 36000 },
]

const recentCondos = [
  { id: 1, name: 'Residencial Alpha', units: 120, status: 'Ativo' },
  { id: 2, name: 'Condomínio Beta Premium', units: 85, status: 'Ativo' },
  { id: 3, name: 'Torres do Sol', units: 200, status: 'Atendimento' },
]

export function AdminOverview() {
  const [stats, setStats] = useState({ condos: 0, moradores: 0 })

  useEffect(() => {
    api.dashboard.stats().then((res) => setStats(res))
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          title="Total Condomínios"
          value={stats.condos.toString()}
          icon={Building}
          trend="+2%"
        />
        <KpiCard
          title="Moradores Ativos"
          value={stats.moradores.toString()}
          icon={Users}
          trend="+15%"
        />
        <KpiCard title="Receita Mensal" value="R$ 1.2M" icon={DollarSign} trend="+8%" />
        <KpiCard title="Despesa Mensal" value="R$ 840k" icon={TrendingDown} trend="-3%" />
        <KpiCard title="Lucro Líquido" value="R$ 360k" icon={TrendingUp} trend="+12%" />
        <KpiCard title="Acessos SINDIA" value="89%" icon={Activity} trend="+5%" />
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4 hover-lift">
          <CardHeader>
            <CardTitle>Evolução Financeira (Últimos 6 meses)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{
                revenue: { label: 'Receitas', color: 'hsl(var(--chart-1))' },
                expense: { label: 'Despesas', color: 'hsl(var(--chart-2))' },
              }}
              className="h-[300px]"
            >
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={(val) => `R$${val / 1000}k`}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="var(--color-expense)"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 hover-lift">
          <CardHeader>
            <CardTitle>Condomínios em Destaque</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Unidades</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCondos.map((condo) => (
                  <TableRow key={condo.id}>
                    <TableCell className="font-medium">{condo.name}</TableCell>
                    <TableCell className="text-right">{condo.units}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={condo.status === 'Ativo' ? 'default' : 'secondary'}>
                        {condo.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
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
}: {
  title: string
  value: string
  icon: any
  trend: string
}) {
  const isPositive = trend.startsWith('+')
  return (
    <Card className="hover-lift">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-secondary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary">{value}</div>
        <p className={`text-xs mt-1 font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {trend} em relação ao mês anterior
        </p>
      </CardContent>
    </Card>
  )
}
