import { User, Shield, Settings, MonitorSmartphone, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DadosPessoaisTab } from '@/components/configuracoes/DadosPessoaisTab'
import { SegurancaTab } from '@/components/configuracoes/SegurancaTab'
import { PreferenciasTab } from '@/components/configuracoes/PreferenciasTab'
import { SessoesTab } from '@/components/configuracoes/SessoesTab'
import { PerfisAcessoTab } from '@/components/configuracoes/PerfisAcessoTab'

export default function Configuracoes() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1a3a52] dark:text-white">
          Configurações de Perfil
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie suas informações, segurança e preferências da plataforma.
        </p>
      </div>

      <Tabs defaultValue="dados-pessoais" className="w-full">
        <TabsList className="grid grid-cols-5 md:w-[750px] mb-6">
          <TabsTrigger value="dados-pessoais" className="flex gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Dados</span>
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="flex gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="preferencias" className="flex gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Preferências</span>
          </TabsTrigger>
          <TabsTrigger value="sessoes" className="flex gap-2">
            <MonitorSmartphone className="h-4 w-4" />
            <span className="hidden sm:inline">Sessões</span>
          </TabsTrigger>
          <TabsTrigger value="perfis" className="flex gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Perfis de Acesso</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dados-pessoais" className="animate-fade-in-up">
          <DadosPessoaisTab />
        </TabsContent>
        <TabsContent value="perfis" className="animate-fade-in-up">
          <PerfisAcessoTab />
        </TabsContent>
        <TabsContent value="seguranca" className="animate-fade-in-up">
          <SegurancaTab />
        </TabsContent>
        <TabsContent value="preferencias" className="animate-fade-in-up">
          <PreferenciasTab />
        </TabsContent>
        <TabsContent value="sessoes" className="animate-fade-in-up">
          <SessoesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
