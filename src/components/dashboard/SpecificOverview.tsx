import { FileText, AlertCircle, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

const cashFlowData = [
  { month: 'Sem 1', in: 12000, out: 8000 },
  { month: 'Sem 2', in: 15000, out: 9500 },
  { month: 'Sem 3', in: 18000, out: 7000 },
  { month: 'Sem 4', in: 14000, out: 11000 },
]

const defaulters = [
  {
    id: 1,
    unit: 'Apto 101',
    name: 'Carlos Silva',
    amount: 'R$ 850,00',
    status: 'Atrasado 15 dias',
  },
  { id: 2, unit: 'Apto 405', name: 'Mariana Costa', amount: 'R$ 1.700,00', status: 'Acordo Feito' },
  { id: 3, unit: 'Apto 802', name: 'João Santos', amount: 'R$ 425,00', status: 'Notificado' },
]

export function SpecificOverview() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
            <BuildingIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-medium text-muted-foreground">Condomínio Selecionado</h2>
            <Select defaultValue="alpha">
              <SelectTrigger className="w-[280px] h-8 border-0 bg-transparent p-0 text-lg font-bold text-primary focus:ring-0 focus:ring-offset-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alpha">Residencial Alpha</SelectItem>
                <SelectItem value="beta">Condomínio Beta Premium</SelectItem>
                <SelectItem value="sol">Torres do Sol</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Badge
          variant="outline"
          className="text-sm px-3 py-1 bg-green-50 text-green-700 border-green-200"
        >
          Status: Saudável
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moradores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <p className="text-xs text-muted-foreground">98% de ocupação</p>
          </CardContent>
        </Card>
        <Card className="hover-lift border-l-4 border-l-secondary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground">5 atualizados este mês</p>
          </CardContent>
        </Card>
        <Card className="hover-lift border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita MTD</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 59.000</div>
            <p className="text-xs text-muted-foreground">+12% vs. meta</p>
          </CardContent>
        </Card>
        <Card className="hover-lift border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inadimplência</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2%</div>
            <p className="text-xs text-muted-foreground">R$ 2.975 pendentes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Fluxo de Caixa Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                in: { label: 'Entradas', color: 'hsl(var(--chart-3))' },
                out: { label: 'Saídas', color: 'hsl(var(--chart-5))' },
              }}
              className="h-[300px]"
            >
              <BarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={(val) => `R$${val / 1000}k`}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="in" fill="var(--color-in)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="out" fill="var(--color-out)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Lista de Inadimplentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {defaulters.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                >
                  <div>
                    <p className="font-semibold text-sm">
                      {d.unit} - {d.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{d.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-destructive">{d.amount}</p>
                    <button className="text-xs text-primary hover:underline font-medium">
                      Notificar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function BuildingIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  )
}
