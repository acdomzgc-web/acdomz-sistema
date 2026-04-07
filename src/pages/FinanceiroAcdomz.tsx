import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, Loader2, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { FinanceiroCharts, CategoriasDialog } from '@/components/financeiro/Shared'

export default function FinanceiroAcdomz() {
  const [data, setData] = useState<any[]>([])
  const [cats, setCats] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const [form, setForm] = useState({
    id: '',
    description: '',
    amount: '',
    date: '',
    is_recurrent: false,
    category: 'Geral',
  })

  const load = async () => {
    const res = await supabase
      .from('receitas_acdomz')
      .select('*')
      .order('date', { ascending: false })
    if (res.data) setData(res.data)
  }
  const loadCats = async () => {
    const res = await supabase
      .from('categorias_financeiras')
      .select('*')
      .eq('type', 'receita')
      .order('name')
    if (res.data) setCats(res.data)
  }
  useEffect(() => {
    load()
    loadCats()
  }, [])

  const handleUploadNF = async (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await supabase.functions.invoke('extrair-nf-acdomz', { body: {} })
      if (res.error) throw res.error
      setForm((p) => ({
        ...p,
        amount: res.data.data.amount,
        description: res.data.data.description,
        date: res.data.data.date,
      }))
      toast({ title: 'NF lida com sucesso via IA!' })
    } catch (err: any) {
      toast({ title: 'Erro IA', description: err.message, variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    const payload = {
      description: form.description,
      amount: Number(form.amount),
      date: form.date,
      is_recurrent: form.is_recurrent,
      category: form.category,
    }
    if (form.id) await supabase.from('receitas_acdomz').update(payload).eq('id', form.id)
    else await supabase.from('receitas_acdomz').insert(payload)
    toast({ title: 'Salvo com sucesso' })
    setOpen(false)
    load()
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <FinanceiroCharts data={data} color="#10b981" />
      <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
        <h3 className="font-semibold text-lg text-primary">Histórico de Entradas</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() =>
                setForm({
                  id: '',
                  description: '',
                  amount: '',
                  date: new Date().toISOString().split('T')[0],
                  is_recurrent: false,
                  category: cats[0]?.name || 'Geral',
                })
              }
            >
              <Plus className="w-4 h-4 mr-2" /> Nova Receita
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{form.id ? 'Editar Receita' : 'Nova Receita'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {!form.id && (
                <div
                  className="bg-muted/30 p-4 rounded-xl border border-dashed flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => document.getElementById('nf-upload')?.click()}
                >
                  {uploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
                  ) : (
                    <Receipt className="w-6 h-6 text-primary mb-2" />
                  )}
                  <span className="text-sm font-medium">Anexar e Ler NF (IA)</span>
                  <input
                    id="nf-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.png"
                    onChange={handleUploadNF}
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label>Descrição</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Valor</Label>
                  <Input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 items-end">
                <div className="grid gap-2">
                  <Label>Categoria</Label>
                  <div className="flex gap-2">
                    <Select
                      value={form.category}
                      onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {cats.map((c) => (
                          <SelectItem key={c.id} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <CategoriasDialog type="receita" onUpdate={loadCats} />
                  </div>
                </div>
                <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/20">
                  <Switch
                    checked={form.is_recurrent}
                    onCheckedChange={(c) => setForm((p) => ({ ...p, is_recurrent: c }))}
                  />
                  <Label className="cursor-pointer font-medium">Recorrente?</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((d) => (
              <TableRow key={d.id} className="hover:bg-muted/30">
                <TableCell className="font-medium text-primary">{d.description}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal">
                    {d.category || 'Geral'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {d.is_recurrent ? (
                    <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                      Recorrente
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-amber-200 text-amber-700 bg-amber-50"
                    >
                      Pontual
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(d.date).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="text-emerald-600 font-bold">
                  R$ {Number(d.amount).toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setForm({
                        id: d.id,
                        description: d.description,
                        amount: d.amount,
                        date: d.date,
                        is_recurrent: d.is_recurrent,
                        category: d.category || cats[0]?.name,
                      })
                      setOpen(true)
                    }}
                  >
                    <Edit className="w-4 h-4 text-secondary" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={async () => {
                      await supabase.from('receitas_acdomz').delete().eq('id', d.id)
                      load()
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  Nenhuma entrada encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
