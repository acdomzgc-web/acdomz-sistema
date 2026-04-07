import { useEffect, useState } from 'react'
import { format, subDays, startOfDay, endOfDay, parseISO } from 'date-fns'
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
  const [selectedId, setSelectedId] = useState<string>('all')
  const [conversas, setConversas] = useState<Conversa[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))

  useEffect(() => {
    fetchCondominios()
  }, [])
  useEffect(() => {
    fetchConversas()
  }, [selectedId, startDate, endDate])

  const fetchCondominios = async () => {
    const { data } = await supabase
      .from('condominios')
      .select('id, name, sindia_active, sindia_prompt')
      .order('name')
    if (data) setCondominios(data)
  }

  const fetchConversas = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('conversas_sindia')
        .select(
          `id, created_at, message, response, status, is_unauthorized, manual_reply, user_id, profiles (name)`,
        )
        .order('created_at', { ascending: false })
      if (selectedId !== 'all') query = query.eq('condominio_id', selectedId)
      if (startDate) query = query.gte('created_at', startOfDay(parseISO(startDate)).toISOString())
      if (endDate) query = query.lte('created_at', endOfDay(parseISO(endDate)).toISOString())
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
            Gerencie a assistente virtual, personalize seu comportamento e acompanhe atendimentos.
          </p>
        </div>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Selecione o Condomínio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Condomínios</SelectItem>
            {condominios.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="conversas">Conversas e Histórico</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações do Bot</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <DashboardTab conversas={conversas} />
        </TabsContent>
        <TabsContent value="conversas">
          <ConversasTab
            conversas={conversas}
            loading={loading}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            onUpdate={(c) => setConversas((prev) => prev.map((p) => (p.id === c.id ? c : p)))}
          />
        </TabsContent>
        <TabsContent value="configuracoes">
          <ConfigTab
            condominio={selectedCondominio}
            onUpdate={(c) => setCondominios((prev) => prev.map((p) => (p.id === c.id ? c : p)))}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
