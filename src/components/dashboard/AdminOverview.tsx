import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Building2,
  Users,
  Wallet,
  TrendingUp,
  TrendingDown,
  Building,
  ShieldCheck,
  Settings2,
} from 'lucide-react'

const allMetrics = [
  { id: 'admin', label: 'Administradoras Parceiras', icon: Building, color: 'text-blue-500' },
  { id: 'condo', label: 'Total de Condomínios', icon: Building2, color: 'text-indigo-500' },
  { id: 'residents', label: 'Total de Moradores', icon: Users, color: 'text-green-500' },
  { id: 'sindicos', label: 'Total de Síndicos', icon: ShieldCheck, color: 'text-orange-500' },
  {
    id: 'revenue',
    label: 'Receita',
    icon: TrendingUp,
    color: 'text-emerald-500',
    isCurrency: true,
  },
  { id: 'expense', label: 'Despesa', icon: TrendingDown, color: 'text-red-500', isCurrency: true },
  { id: 'profit', label: 'Lucro', icon: Wallet, color: 'text-blue-600', isCurrency: true },
]

const mockData = {
  Mês: {
    admin: 12,
    condo: 45,
    residents: 1250,
    sindicos: 30,
    revenue: 150000,
    expense: 90000,
    profit: 60000,
  },
  Trimestre: {
    admin: 14,
    condo: 48,
    residents: 1300,
    sindicos: 32,
    revenue: 450000,
    expense: 270000,
    profit: 180000,
  },
  Semestre: {
    admin: 15,
    condo: 50,
    residents: 1400,
    sindicos: 35,
    revenue: 900000,
    expense: 550000,
    profit: 350000,
  },
  Ano: {
    admin: 18,
    condo: 60,
    residents: 1800,
    sindicos: 40,
    revenue: 1800000,
    expense: 1100000,
    profit: 700000,
  },
  'All Time': {
    admin: 25,
    condo: 120,
    residents: 3500,
    sindicos: 85,
    revenue: 5500000,
    expense: 3200000,
    profit: 2300000,
  },
}

export default function AdminOverview() {
  const [period, setPeriod] = useState('Mês')
  const [visibleMetrics, setVisibleMetrics] = useState<string[]>(allMetrics.map((m) => m.id))

  const currentData = mockData[period as keyof typeof mockData] || mockData['Mês']

  const toggleMetric = (id: string) => {
    setVisibleMetrics((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
  }

  const formatValue = (value: number, isCurrency?: boolean) => {
    if (isCurrency) {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    }
    return value.toLocaleString('pt-BR')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Visão Geral</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Mês">Mês Atual</SelectItem>
              <SelectItem value="Trimestre">Trimestre</SelectItem>
              <SelectItem value="Semestre">Semestre</SelectItem>
              <SelectItem value="Ano">Ano</SelectItem>
              <SelectItem value="All Time">All Time</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Settings2 className="h-4 w-4" />
                <span className="hidden sm:inline">Personalizar</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="end">
              <div className="space-y-4">
                <h4 className="font-medium text-sm border-b pb-2">Métricas Visíveis</h4>
                <div className="space-y-3">
                  {allMetrics.map((metric) => (
                    <div key={metric.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`metric-${metric.id}`}
                        checked={visibleMetrics.includes(metric.id)}
                        onCheckedChange={() => toggleMetric(metric.id)}
                      />
                      <label
                        htmlFor={`metric-${metric.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {metric.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {visibleMetrics.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-secondary/20">
          <Settings2 className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Nenhuma métrica selecionada. Clique em personalizar para exibir os indicadores.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {allMetrics
            .filter((m) => visibleMetrics.includes(m.id))
            .map((metric, index) => {
              const Icon = metric.icon
              const value = currentData[metric.id as keyof typeof currentData] || 0

              return (
                <Card
                  key={metric.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </CardTitle>
                    <div className={`p-2 rounded-md bg-secondary/50 ${metric.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatValue(value as number, metric.isCurrency)}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      )}
    </div>
  )
}
