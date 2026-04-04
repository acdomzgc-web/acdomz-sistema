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
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from 'recharts'
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

  const defaultVisibleKpis = {
    administradoras: true,
    condominios: true,
    sindicos: true,
    moradores: true,
    receita: true,
    despesa: true,
    lucro: true,
  }

  const [visibleKpis, setVisibleKpis] = useState(() => {
    const saved = localStorage.getItem('acdomz-kpi-prefs')
    return saved ? JSON.parse(saved) : defaultVisibleKpis
  })

  const handleKpiToggle = (key: keyof typeof visibleKpis) => {
    const newPrefs = { ...visibleKpis, [key]: !visibleKpis[key] }
    setVisibleKpis(newPrefs)
    localStorage.setItem('acdomz-kpi-prefs', JSON.stringify(newPrefs))
  }

  useEffect(() => {
    const loadData = async () => {
      const [condos, admins, moradores, profiles, receitas, despesasPt, despesasRec, recent] =
        await Promise.all([
          supabase.from('condominios').select('*', { count: 'exact', head: true }),
          supabase.from('administradoras').select('*', { count: 'exact', head: true }),
          supabase.from('moradores').select('*', { count: 'exact', head: true }),
          supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', 'sindico'),
          supabase.from('receitas_acdomz').select('amount'),
          supabase.from('despesas_pontuais_acdomz').select('amount'),
          supabase.from('despesas_recorrentes_acdomz').select('amount'),
          supabase
            .from('condominios')
            .select('id, name, total_units, sindia_active')
            .order('created_at', { ascending: false })
            .limit(5),
        ])

      const totalReceita =
        receitas.data?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0
      const totalDespesa =
        (despesasPt.data?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0) +
        (despesasRec.data?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0)

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
    }
    loadData()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings2 className="h-4 w-4" /> Personalizar Métricas
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Personalizar Dashboard</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Selecione quais métricas deseja exibir no painel principal.
              </p>
              <div className="grid gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="kpi-admin"
                    checked={visibleKpis.administradoras}
                    onCheckedChange={() => handleKpiToggle('administradoras')}
                  />
                  <label
                    htmlFor="kpi-admin"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Administradoras Parceiras
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="kpi-condo"
                    checked={visibleKpis.condominios}
                    onCheckedChange={() => handleKpiToggle('condominios')}
                  />
                  <label
                    htmlFor="kpi-condo"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Total Condomínios
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="kpi-sindicos"
                    checked={visibleKpis.sindicos}
                    onCheckedChange={() => handleKpiToggle('sindicos')}
                  />
                  <label
                    htmlFor="kpi-sindicos"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Total Síndicos
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="kpi-moradores"
                    checked={visibleKpis.moradores}
                    onCheckedChange={() => handleKpiToggle('moradores')}
                  />
                  <label
                    htmlFor="kpi-moradores"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Total Moradores
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="kpi-receita"
                    checked={visibleKpis.receita}
                    onCheckedChange={() => handleKpiToggle('receita')}
                  />
                  <label
                    htmlFor="kpi-receita"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Receita Consolidada
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="kpi-despesa"
                    checked={visibleKpis.despesa}
                    onCheckedChange={() => handleKpiToggle('despesa')}
                  />
                  <label
                    htmlFor="kpi-despesa"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Despesa Consolidada
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="kpi-lucro"
                    checked={visibleKpis.lucro}
                    onCheckedChange={() => handleKpiToggle('lucro')}
                  />
                  <label
                    htmlFor="kpi-lucro"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Lucro Líquido
                  </label>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleKpis.administradoras && (
          <KpiCard
            title="Administradoras Parceiras"
            value={stats.administradoras.toString()}
            icon={Briefcase}
            trend="+1"
          />
        )}
        {visibleKpis.condominios && (
          <KpiCard
            title="Total Condomínios"
            value={stats.condominios.toString()}
            icon={Building}
            trend="+2"
          />
        )}
        {visibleKpis.sindicos && (
          <KpiCard
            title="Total Síndicos"
            value={stats.sindicos.toString()}
            icon={UserCheck}
            trend="+3"
          />
        )}
        {visibleKpis.moradores && (
          <KpiCard
            title="Total Moradores"
            value={stats.moradores.toString()}
            icon={Users}
            trend="+12"
          />
        )}
        {visibleKpis.receita && (
          <KpiCard
            title="Receita Consolidada"
            value={formatCurrency(stats.receita)}
            icon={DollarSign}
            trend="+8%"
          />
        )}
        {visibleKpis.despesa && (
          <KpiCard
            title="Despesa Consolidada"
            value={formatCurrency(stats.despesa)}
            icon={TrendingDown}
            trend="-3%"
          />
        )}
        {visibleKpis.lucro && (
          <KpiCard
            title="Lucro Líquido"
            value={formatCurrency(stats.lucro)}
            icon={TrendingUp}
            trend="+12%"
          />
        )}
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
            <CardTitle>Condomínios Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead className="text-right">Unidades</TableHead>
                  <TableHead className="text-right">SINDIA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCondos.map((condo) => (
                  <TableRow key={condo.id}>
                    <TableCell className="font-medium">{condo.name}</TableCell>
                    <TableCell className="text-right">{condo.total_units || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={condo.sindia_active ? 'default' : 'secondary'}>
                        {condo.sindia_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {recentCondos.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-4 text-muted-foreground text-sm"
                    >
                      Nenhum condomínio cadastrado.
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
          {trend} no período
        </p>
      </CardContent>
    </Card>
  )
}
