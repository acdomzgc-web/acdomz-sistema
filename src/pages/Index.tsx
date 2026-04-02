import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminOverview } from '@/components/dashboard/AdminOverview'
import { SpecificOverview } from '@/components/dashboard/SpecificOverview'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Dashboard Gerencial</h1>
        <p className="text-muted-foreground">
          Acompanhe os principais indicadores dos seus condomínios.
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
