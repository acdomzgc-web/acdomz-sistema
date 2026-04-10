import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Users, TrendingUp, DollarSign } from 'lucide-react'

export function CrmMetrics({ leads }: { leads: any[] }) {
  const totalLeads = leads.length
  const wonLeads = leads.filter((l) => l.status === 'ganho').length
  const lostLeads = leads.filter((l) => l.status === 'perdido').length
  const activeLeads = totalLeads - wonLeads - lostLeads

  const conversionRate =
    totalLeads > 0 ? ((wonLeads / (wonLeads + lostLeads || 1)) * 100).toFixed(1) : '0.0'

  const pipelineValue = leads
    .filter((l) => !['ganho', 'perdido'].includes(l.status))
    .reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de Leads
          </CardTitle>
          <Users className="w-4 h-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalLeads}</div>
          <p className="text-xs text-muted-foreground mt-1">{activeLeads} ativos no funil</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Taxa de Conversão
          </CardTitle>
          <TrendingUp className="w-4 h-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{conversionRate}%</div>
          <p className="text-xs text-muted-foreground mt-1">Dos leads finalizados</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Negócios Fechados
          </CardTitle>
          <Target className="w-4 h-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{wonLeads}</div>
          <p className="text-xs text-muted-foreground mt-1">Ganhos com sucesso</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Valor em Pipeline
          </CardTitle>
          <DollarSign className="w-4 h-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              pipelineValue,
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Soma de leads ativos</p>
        </CardContent>
      </Card>
    </div>
  )
}
