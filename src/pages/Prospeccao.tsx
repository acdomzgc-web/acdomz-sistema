import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { CrmMetrics } from '@/components/crm/CrmMetrics'
import { KanbanBoard } from '@/components/crm/KanbanBoard'
import { LeadDialog } from '@/components/crm/LeadDialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Prospeccao() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const { toast } = useToast()

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
    const { error } = await supabase
      .from('crm_leads')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
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

      <CrmMetrics leads={leads} />

      <div className="mt-8">
        <KanbanBoard
          leads={leads}
          onEditLead={handleEditLead}
          onStatusChange={handleStatusChange}
        />
      </div>

      <LeadDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        lead={selectedLead}
        onSaved={fetchLeads}
      />
    </div>
  )
}
