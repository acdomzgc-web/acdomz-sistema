import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

export function LeadDialog({
  open,
  onOpenChange,
  lead,
  onSaved,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  lead: any
  onSaved: () => void
}) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    condominio_name: '',
    email: '',
    phone: '',
    status: 'qualificacao',
    value: '',
    notes: '',
    lead_type: 'sindico',
    origin: 'prospeccao_ativa',
    units_count: '',
  })

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        condominio_name: lead.condominio_name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        status: lead.status || 'qualificacao',
        value: lead.value?.toString() || '',
        notes: lead.notes || '',
        lead_type: lead.lead_type || 'sindico',
        origin: lead.origin || 'prospeccao_ativa',
        units_count: lead.units_count?.toString() || '',
      })
    } else {
      setFormData({
        name: '',
        condominio_name: '',
        email: '',
        phone: '',
        status: 'qualificacao',
        value: '',
        notes: '',
        lead_type: 'sindico',
        origin: 'prospeccao_ativa',
        units_count: '',
      })
    }
  }, [lead, open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      name: formData.name,
      condominio_name: formData.condominio_name,
      email: formData.email,
      phone: formData.phone,
      status: formData.status,
      value: formData.value ? Number(formData.value) : null,
      notes: formData.notes,
      lead_type: formData.lead_type,
      origin: formData.origin,
      units_count: formData.units_count ? Number(formData.units_count) : null,
      updated_at: new Date().toISOString(),
    }

    let error
    if (lead?.id) {
      const res = await supabase.from('crm_leads').update(payload).eq('id', lead.id)
      error = res.error
    } else {
      const res = await supabase.from('crm_leads').insert([payload])
      error = res.error
    }

    if (error) {
      toast({ title: 'Erro ao salvar lead', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Lead salvo com sucesso!' })
      onSaved()
      onOpenChange(false)
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{lead ? 'Editar Lead' : 'Novo Lead'}</DialogTitle>
          <DialogDescription>
            Preencha os dados do lead para acompanhamento no CRM.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nome do Contato / Empresa <span className="text-red-500">*</span>
              </Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lead_type">Tipo de Contato</Label>
              <Select
                value={formData.lead_type}
                onValueChange={(v) => handleSelectChange('lead_type', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sindico">Síndico</SelectItem>
                  <SelectItem value="administradora">Administradora</SelectItem>
                  <SelectItem value="incorporadora">Incorporadora</SelectItem>
                  <SelectItem value="construtora">Construtora</SelectItem>
                  <SelectItem value="parceiro">Parceiro Estratégico</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="condominio_name">
                Nome do Condomínio{' '}
                <span className="text-xs text-muted-foreground font-normal">(Opcional)</span>
              </Label>
              <Input
                id="condominio_name"
                name="condominio_name"
                value={formData.condominio_name}
                onChange={handleChange}
                placeholder="Caso aplicável"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="units_count">Nº de Unidades (Potencial)</Label>
              <Input
                id="units_count"
                name="units_count"
                type="number"
                value={formData.units_count}
                onChange={handleChange}
                placeholder="Ex: 120"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone/WhatsApp</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin">Origem</Label>
              <Select
                value={formData.origin}
                onValueChange={(v) => handleSelectChange('origin', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indicacao">Indicação</SelectItem>
                  <SelectItem value="site">Site / Landing Page</SelectItem>
                  <SelectItem value="redes_sociais">Redes Sociais</SelectItem>
                  <SelectItem value="prospeccao_ativa">Prospecção Ativa</SelectItem>
                  <SelectItem value="evento">Evento / Feira</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Valor Estimado (R$)</Label>
              <Input
                id="value"
                name="value"
                type="number"
                step="0.01"
                value={formData.value}
                onChange={handleChange}
                placeholder="Ex: 1500.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estágio no Funil</Label>
            <Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="qualificacao">Qualificação</SelectItem>
                <SelectItem value="primeiro_contato">Primeiro Contato</SelectItem>
                <SelectItem value="reuniao">Reunião / Apresentação</SelectItem>
                <SelectItem value="proposta">Proposta Enviada</SelectItem>
                <SelectItem value="negociacao">Negociação</SelectItem>
                <SelectItem value="ganho">Fechado / Ganho</SelectItem>
                <SelectItem value="perdido">Perdido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Anotações / Histórico</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Registre detalhes das conversas e propostas..."
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
