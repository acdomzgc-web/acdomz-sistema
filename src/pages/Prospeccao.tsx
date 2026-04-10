import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { CrmMetrics } from '@/components/crm/CrmMetrics'
import { KanbanBoard } from '@/components/crm/KanbanBoard'
import { LeadDialog } from '@/components/crm/LeadDialog'
import { CrmDashboard } from '@/components/crm/CrmDashboard'
import { Button } from '@/components/ui/button'
import { Plus, LayoutDashboard, Kanban } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function Prospeccao() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const { toast } = useToast()

  // Filtros globais
  const [datePreset, setDatePreset] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchLeads = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('crm_leads')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      toast({ title: 'Erro ao carregar leads', description: error.message, variant: 'destructive' })
    } else {
      setLeads(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const handleEditLead = (lead: any) => {
    setSelectedLead(lead)
    setIsDialogOpen(true)
  }

  const handleNewLead = () => {
    setSelectedLead(null)
    setIsDialogOpen(true)
  }

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('crm_leads')
      .update({
        status: newStatus,
        updated_at: now,
        status_updated_at: now,
      })
      .eq('id', leadId)
    if (error) {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      fetchLeads()
    }
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1a3a52] dark:text-white">
            Prospecção (CRM)
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie seus leads, acompanhe negociações e analise suas métricas de conversão.
          </p>
        </div>
        <Button onClick={handleNewLead} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Lead
        </Button>
      </div>

      <div className="bg-card p-4 rounded-lg border shadow-sm flex flex-wrap gap-4 items-end">
        <div className="space-y-1.5 flex-1 min-w-[150px]">
          <label className="text-xs font-medium text-muted-foreground">Período</label>
          <select
            className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value)}
          >
            <option value="all">Todo o período</option>
            <option value="last_week">Última semana</option>
            <option value="this_month">Este mês</option>
            <option value="last_3_months">Últimos 3 meses</option>
            <option value="last_6_months">Últimos 6 meses</option>
            <option value="this_year">Este ano</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>

        {datePreset === 'custom' && (
          <>
            <div className="space-y-1.5 flex-1 min-w-[130px]">
              <label className="text-xs font-medium text-muted-foreground">Data Inicial</label>
              <input
                type="date"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-1.5 flex-1 min-w-[130px]">
              <label className="text-xs font-medium text-muted-foreground">Data Final</label>
              <input
                type="date"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="space-y-1.5 flex-1 min-w-[150px]">
          <label className="text-xs font-medium text-muted-foreground">Tipo de Contato</label>
          <select
            className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="sindico">Síndico</option>
            <option value="administradora">Administradora</option>
            <option value="incorporadora">Incorporadora</option>
            <option value="construtora">Construtora</option>
            <option value="parceiro">Parceiro</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        <div className="space-y-1.5 flex-1 min-w-[150px]">
          <label className="text-xs font-medium text-muted-foreground">Etapa</label>
          <select
            className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todas as Etapas</option>
            <option value="qualificacao">Qualificação</option>
            <option value="primeiro_contato">Primeiro Contato</option>
            <option value="reuniao">Reunião/Apresentação</option>
            <option value="proposta">Proposta Enviada</option>
            <option value="negociacao">Negociação</option>
            <option value="ganho">Fechado/Ganho</option>
            <option value="perdido">Perdido</option>
          </select>
        </div>
      </div>

      <CrmMetrics
        leads={leads.filter((lead) => {
          if (typeFilter !== 'all' && lead.lead_type !== typeFilter) return false
          if (statusFilter !== 'all' && lead.status !== statusFilter) return false
          if (datePreset !== 'all') {
            const leadDate = new Date(lead.created_at)
            const today = new Date()
            if (datePreset === 'last_week') {
              const limit = new Date()
              limit.setDate(today.getDate() - 7)
              if (leadDate < limit) return false
            } else if (datePreset === 'this_month') {
              if (
                leadDate.getMonth() !== today.getMonth() ||
                leadDate.getFullYear() !== today.getFullYear()
              )
                return false
            } else if (datePreset === 'last_3_months') {
              const limit = new Date()
              limit.setMonth(today.getMonth() - 3)
              if (leadDate < limit) return false
            } else if (datePreset === 'last_6_months') {
              const limit = new Date()
              limit.setMonth(today.getMonth() - 6)
              if (leadDate < limit) return false
            } else if (datePreset === 'this_year') {
              if (leadDate.getFullYear() !== today.getFullYear()) return false
            } else if (datePreset === 'custom') {
              if (dateFrom && leadDate < new Date(dateFrom)) return false
              if (dateTo && leadDate > new Date(dateTo + 'T23:59:59')) return false
            }
          }
          return true
        })}
      />

      <Tabs defaultValue="kanban" className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="kanban" className="gap-2">
              <Kanban className="w-4 h-4" /> Funil (Kanban)
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="w-4 h-4" /> Dashboard Analítico
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="kanban" className="m-0 focus-visible:outline-none">
          <KanbanBoard
            leads={leads.filter((lead) => {
              if (typeFilter !== 'all' && lead.lead_type !== typeFilter) return false
              if (statusFilter !== 'all' && lead.status !== statusFilter) return false
              if (datePreset !== 'all') {
                const leadDate = new Date(lead.created_at)
                const today = new Date()
                if (datePreset === 'last_week') {
                  const limit = new Date()
                  limit.setDate(today.getDate() - 7)
                  if (leadDate < limit) return false
                } else if (datePreset === 'this_month') {
                  if (
                    leadDate.getMonth() !== today.getMonth() ||
                    leadDate.getFullYear() !== today.getFullYear()
                  )
                    return false
                } else if (datePreset === 'last_3_months') {
                  const limit = new Date()
                  limit.setMonth(today.getMonth() - 3)
                  if (leadDate < limit) return false
                } else if (datePreset === 'last_6_months') {
                  const limit = new Date()
                  limit.setMonth(today.getMonth() - 6)
                  if (leadDate < limit) return false
                } else if (datePreset === 'this_year') {
                  if (leadDate.getFullYear() !== today.getFullYear()) return false
                } else if (datePreset === 'custom') {
                  if (dateFrom && leadDate < new Date(dateFrom)) return false
                  if (dateTo && leadDate > new Date(dateTo + 'T23:59:59')) return false
                }
              }
              return true
            })}
            onEditLead={handleEditLead}
            onStatusChange={handleStatusChange}
          />
        </TabsContent>

        <TabsContent value="dashboard" className="m-0 focus-visible:outline-none">
          <CrmDashboard
            leads={leads.filter((lead) => {
              if (typeFilter !== 'all' && lead.lead_type !== typeFilter) return false
              if (statusFilter !== 'all' && lead.status !== statusFilter) return false
              if (datePreset !== 'all') {
                const leadDate = new Date(lead.created_at)
                const today = new Date()
                if (datePreset === 'last_week') {
                  const limit = new Date()
                  limit.setDate(today.getDate() - 7)
                  if (leadDate < limit) return false
                } else if (datePreset === 'this_month') {
                  if (
                    leadDate.getMonth() !== today.getMonth() ||
                    leadDate.getFullYear() !== today.getFullYear()
                  )
                    return false
                } else if (datePreset === 'last_3_months') {
                  const limit = new Date()
                  limit.setMonth(today.getMonth() - 3)
                  if (leadDate < limit) return false
                } else if (datePreset === 'last_6_months') {
                  const limit = new Date()
                  limit.setMonth(today.getMonth() - 6)
                  if (leadDate < limit) return false
                } else if (datePreset === 'this_year') {
                  if (leadDate.getFullYear() !== today.getFullYear()) return false
                } else if (datePreset === 'custom') {
                  if (dateFrom && leadDate < new Date(dateFrom)) return false
                  if (dateTo && leadDate > new Date(dateTo + 'T23:59:59')) return false
                }
              }
              return true
            })}
          />
        </TabsContent>
      </Tabs>

      <LeadDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        lead={selectedLead}
        onSaved={fetchLeads}
      />
    </div>
  )
}
