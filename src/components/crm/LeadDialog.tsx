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
    status: 'lead',
    value: '',
    notes: '',
  })

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        condominio_name: lead.condominio_name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        status: lead.status || 'lead',
        value: lead.value?.toString() || '',
        notes: lead.notes || '',
      })
    } else {
      setFormData({
        name: '',
        condominio_name: '',
        email: '',
        phone: '',
        status: 'lead',
        value: '',
        notes: '',
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

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nome do Contato <span className="text-red-500">*</span>
              </Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condominio_name">Nome do Condomínio</Label>
              <Input
                id="condominio_name"
                name="condominio_name"
                value={formData.condominio_name}
                onChange={handleChange}
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
              <Label htmlFor="status">Estágio no Funil</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => handleSelectChange('status', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Novos Leads</SelectItem>
                  <SelectItem value="em_contato">Em Contato</SelectItem>
                  <SelectItem value="respondido">Respondido</SelectItem>
                  <SelectItem value="negociacao">Negociação</SelectItem>
                  <SelectItem value="ganho">Ganho (Fechado)</SelectItem>
                  <SelectItem value="perdido">Perdido</SelectItem>
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
