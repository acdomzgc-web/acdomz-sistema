import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import FinanceiroAcdomz from './FinanceiroAcdomz'
import DespesasAcdomz from './DespesasAcdomz'
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'

export default function DashboardFinanceiroAcdomz() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1a3a52]">Financeiro ACDOMZ</h1>
        <p className="text-muted-foreground">Gestão unificada de receitas, despesas e ROI.</p>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">Dashboard & ROI</TabsTrigger>
          <TabsTrigger value="entradas">Entradas</TabsTrigger>
          <TabsTrigger value="saidas">Saídas</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Bruta</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 145.000,00</div>
                <p className="text-xs text-muted-foreground">+12% em relação ao mês anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 85.400,00</div>
                <p className="text-xs text-muted-foreground">-2% em relação ao mês anterior</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
                <DollarSign className="h-4 w-4 text-[#1a3a52]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#1a3a52]">R$ 59.600,00</div>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">ROI Global</CardTitle>
                <Activity className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-primary">41,1%</div>
                <p className="text-xs text-primary/80">Retorno sobre Investimento Saudável</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Índices de Rendimento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Margem de Lucro Operacional</span>
                    <span className="text-sm font-bold text-emerald-600">35%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm font-medium">Crescimento de Receita (YoY)</span>
                    <span className="text-sm font-bold text-blue-600">18%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '18%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Composição de Receitas</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-[200px] text-muted-foreground text-sm border-2 border-dashed rounded-md">
                (Gráfico de Composição: Honorários, Consultoria, Outros)
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="entradas" className="animate-fade-in-up">
          <FinanceiroAcdomz />
        </TabsContent>

        <TabsContent value="saidas" className="animate-fade-in-up">
          <DespesasAcdomz />
        </TabsContent>
      </Tabs>
    </div>
  )
}
