import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Condominio, Conversa } from './sindia/types'
import { DashboardTab } from './sindia/DashboardTab'
import { ConversasTab } from './sindia/ConversasTab'
import { ConfigTab } from './sindia/ConfigTab'

export default function Sindia() {
  const { toast } = useToast()
  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [globalConfig, setGlobalConfig] = useState<any>(null)
  const [selectedId, setSelectedId] = useState<string>('all')
  const [conversas, setConversas] = useState<Conversa[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCondominios()
    fetchGlobalConfig()
  }, [])

  useEffect(() => {
    fetchConversas()
  }, [selectedId])

  const fetchGlobalConfig = async () => {
    const { data } = await supabase.from('sindia_configuracoes_globais').select('*').single()
    if (data) setGlobalConfig(data)
  }

  const fetchCondominios = async () => {
    const { data } = await supabase
      .from('condominios')
      .select(
        'id, name, sindia_active, sindia_prompt, use_global_sindia_config, sindia_tone, sindia_response_length, sindia_delay_seconds',
      )
      .order('name')
    if (data) setCondominios(data)
  }

  const fetchConversas = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('conversas_sindia')
        .select(
          `id, created_at, message, response, status, is_unauthorized, manual_reply, user_id, phone, condominio_id, profiles (name, foto_url)`,
        )
        .order('created_at', { ascending: false })
        .limit(1000)

      if (selectedId !== 'all') query = query.eq('condominio_id', selectedId)

      const { data, error } = await query
      if (error) throw error
      setConversas(data as unknown as Conversa[])
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const selectedCondominio = condominios.find((c) => c.id === selectedId) || null

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">SINDIA Bot</h2>
          <p className="text-muted-foreground">
            Central de atendimento inteligente e configurações do bot de WhatsApp.
          </p>
        </div>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Selecione o Condomínio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos (Visão Global)</SelectItem>
            {condominios.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="conversas" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="conversas">Conversas e Histórico</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações do Bot</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard Analítico</TabsTrigger>
        </TabsList>

        <TabsContent value="conversas" className="m-0">
          <ConversasTab
            conversas={conversas}
            loading={loading}
            onAddConversa={(c) => setConversas((prev) => [c, ...prev])}
          />
        </TabsContent>

        <TabsContent value="configuracoes">
          <ConfigTab
            condominio={selectedCondominio}
            globalConfig={globalConfig}
            onUpdate={(c) => setCondominios((prev) => prev.map((p) => (p.id === c.id ? c : p)))}
            onUpdateGlobal={setGlobalConfig}
          />
        </TabsContent>

        <TabsContent value="dashboard">
          <DashboardTab conversas={conversas} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
