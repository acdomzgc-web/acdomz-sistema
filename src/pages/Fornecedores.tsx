import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DashboardTab from '@/components/fornecedores/DashboardTab'
import FornecedoresTab from '@/components/fornecedores/FornecedoresTab'
import CategoriasTab from '@/components/fornecedores/CategoriasTab'
import { Briefcase } from 'lucide-react'

export default function Fornecedores() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 animate-fade-in">
      <div className="flex items-center space-x-3 pb-2 border-b">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Briefcase className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Fornecedores</h2>
          <p className="text-sm text-muted-foreground">
            Gestão completa de parceiros e fornecedores do condomínio.
          </p>
        </div>
      </div>
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="dashboard" className="px-6">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="fornecedores" className="px-6">
            Fornecedores
          </TabsTrigger>
          <TabsTrigger value="categorias" className="px-6">
            Categorias
          </TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="mt-0 border-none p-0 outline-none">
          <DashboardTab />
        </TabsContent>
        <TabsContent value="fornecedores" className="mt-0 border-none p-0 outline-none">
          <FornecedoresTab />
        </TabsContent>
        <TabsContent value="categorias" className="mt-0 border-none p-0 outline-none">
          <CategoriasTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
