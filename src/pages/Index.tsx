import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminOverview } from '@/components/dashboard/AdminOverview'
import { SpecificOverview } from '@/components/dashboard/SpecificOverview'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 bg-card p-6 rounded-xl border border-border/40 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent relative z-10">
          Dashboard Gerencial
        </h1>
        <p className="text-muted-foreground relative z-10">
          Acompanhe os principais indicadores dos seus condomínios com visualizações inovadoras e
          claras.
        </p>
      </div>

      <Tabs defaultValue="admin" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger
            value="admin"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Visão Geral ACDOMZ
          </TabsTrigger>
          <TabsTrigger
            value="specific"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Condomínio Específico
          </TabsTrigger>
          <TabsTrigger value="compare" disabled>
            Comparativo (Em Breve)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="admin" className="m-0">
          <AdminOverview />
        </TabsContent>
        <TabsContent value="specific" className="m-0">
          <SpecificOverview />
        </TabsContent>
      </Tabs>
    </div>
  )
}
