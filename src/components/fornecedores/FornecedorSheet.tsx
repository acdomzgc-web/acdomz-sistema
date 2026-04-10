import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { fornecedoresService, Fornecedor } from '@/services/fornecedores'
import { supabase } from '@/lib/supabase/client'
import { Star } from 'lucide-react'
import { toast } from 'sonner'

export default function FornecedorSheet({
  open,
  onOpenChange,
  fornecedor,
  onSaved,
  categoriasDisponiveis,
}: any) {
  const [data, setData] = useState<Partial<Fornecedor>>({
    status: 'ativo',
    avaliacao: 0,
    contrato_assinado: false,
  })
  const [catIds, setCatIds] = useState<string[]>([])
  const [condIds, setCondIds] = useState<string[]>([])
  const [condominios, setCondominios] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase
      .from('condominios')
      .select('id, name')
      .order('name')
      .then((res) => {
        if (res.data) setCondominios(res.data)
      })
  }, [])

  useEffect(() => {
    if (fornecedor?.id) {
      setData(fornecedor)
      setCatIds(fornecedor.categorias?.map((c: any) => c.id) || [])
      setCondIds(fornecedor.condominios?.map((c: any) => c.id) || [])
    } else {
      setData({ status: 'ativo', avaliacao: 0, contrato_assinado: false })
      setCatIds([])
      setCondIds([])
    }
  }, [fornecedor])

  const handleSave = async () => {
    if (!data.razao_social) return toast.error('Razão Social é obrigatória')
    try {
      setLoading(true)
      await fornecedoresService.saveFornecedor(data, catIds, condIds)
      toast.success('Fornecedor salvo com sucesso')
      onSaved()
      onOpenChange(false)
    } catch (e: any) {
      toast.error('Erro ao salvar: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleCat = (id: string) =>
    setCatIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  const toggleCond = (id: string) =>
    setCondIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] w-full overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{data.id ? 'Editar Fornecedor' : 'Novo Fornecedor'}</SheetTitle>
        </SheetHeader>

        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Razão Social *</Label>
              <Input
                value={data.razao_social || ''}
                onChange={(e) => setData({ ...data, razao_social: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Nome Fantasia</Label>
              <Input
                value={data.nome_fantasia || ''}
                onChange={(e) => setData({ ...data, nome_fantasia: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CNPJ/CPF</Label>
              <Input
                value={data.documento || ''}
                onChange={(e) => setData({ ...data, documento: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={data.status}
                onValueChange={(v: any) => setData({ ...data, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="suspenso">Suspenso</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contato Responsável</Label>
              <Input
                value={data.contato_responsavel || ''}
                onChange={(e) => setData({ ...data, contato_responsavel: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={data.contato_telefone || ''}
                onChange={(e) => setData({ ...data, contato_telefone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                value={data.contato_email || ''}
                onChange={(e) => setData({ ...data, contato_email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Site</Label>
              <Input
                value={data.contato_site || ''}
                onChange={(e) => setData({ ...data, contato_site: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Avaliação</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 cursor-pointer transition-colors ${data.avaliacao! >= star ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`}
                  onClick={() => setData({ ...data, avaliacao: star })}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Categorias</Label>
              <ScrollArea className="h-[120px] border rounded-md p-3">
                {categoriasDisponiveis?.map((c: any) => (
                  <div key={c.id} className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id={`cat-${c.id}`}
                      checked={catIds.includes(c.id)}
                      onCheckedChange={() => toggleCat(c.id)}
                    />
                    <label
                      htmlFor={`cat-${c.id}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {c.nome}
                    </label>
                  </div>
                ))}
              </ScrollArea>
            </div>
            <div className="space-y-2">
              <Label>Condomínios Atendidos</Label>
              <ScrollArea className="h-[120px] border rounded-md p-3">
                {condominios.map((c: any) => (
                  <div key={c.id} className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id={`cond-${c.id}`}
                      checked={condIds.includes(c.id)}
                      onCheckedChange={() => toggleCond(c.id)}
                    />
                    <label
                      htmlFor={`cond-${c.id}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {c.name}
                    </label>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Validade Documentos</Label>
              <Input
                type="date"
                value={data.validade_documentos || ''}
                onChange={(e) => setData({ ...data, validade_documentos: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Faixa de Preço</Label>
              <Input
                placeholder="Ex: $$"
                value={data.faixa_preco || ''}
                onChange={(e) => setData({ ...data, faixa_preco: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <Input
                value={data.forma_pagamento || ''}
                onChange={(e) => setData({ ...data, forma_pagamento: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2 mt-6">
              <Switch
                id="contrato"
                checked={data.contrato_assinado}
                onCheckedChange={(v) => setData({ ...data, contrato_assinado: v })}
              />
              <Label htmlFor="contrato">Contrato Assinado</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={data.observacoes || ''}
              onChange={(e) => setData({ ...data, observacoes: e.target.value })}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <SheetFooter className="mt-8">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
