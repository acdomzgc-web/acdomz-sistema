import { useState, useEffect } from 'react'
import { Plus, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { useToast } from '@/hooks/use-toast'
import { api } from '@/services/api'
import { supabase } from '@/lib/supabase/client'

export default function DespesasAcdomz() {
  const [despesas, setDespesas] = useState<any[]>([])
  const [condominios, setCondominios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [condominioId, setCondominioId] = useState('none')

  const [filterCondo, setFilterCondo] = useState('all')
  const [period, setPeriod] = useState<string>('last_3')
  const [specificMonth, setSpecificMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const resCondos = await api.condominios.list()
    if (resCondos.data) setCondominios(resCondos.data)

    const { data } = await supabase.from('despesas_pontuais_acdomz').select('*')
    if (data) setDespesas(data)

    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !date) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' })
      return
    }
    try {
      const { error } = await supabase.from('despesas_pontuais_acdomz').insert([
        {
          amount: parseFloat(amount),
          date,
          description,
        },
      ])
      if (error) throw error

      toast({ title: 'Despesa registrada com sucesso' })
      setOpen(false)
      loadData()
      setAmount('')
      setDate('')
      setDescription('')
      setCondominioId('none')
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    }
  }

  const filtered = despesas
    .filter((r) => {
      // Currently despesas_pontuais_acdomz doesn't have condominio_id, but keeping structure for future
      if (period === 'all') return true
      if (!r.date) return false

      const rDate = new Date(r.date)
      const now = new Date()
      let start = new Date(2000, 0, 1)
      let end = new Date(2100, 11, 31)

      if (period === 'specific_month') {
        const [y, m] = specificMonth.split('-')
        start = new Date(parseInt(y), parseInt(m) - 1, 1)
        end = new Date(parseInt(y), parseInt(m), 0)
      } else if (period === 'last_3') {
        start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      } else if (period === 'last_6') {
        start = new Date(now.getFullYear(), now.getMonth() - 5, 1)
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      } else if (period === 'annual') {
        start = new Date(now.getFullYear(), 0, 1)
        end = new Date(now.getFullYear(), 11, 31)
      }
      return rDate >= start && rDate <= end
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-primary">Saídas (Despesas)</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-card p-1 rounded-md border shadow-sm">
            <Calendar className="w-4 h-4 ml-2 text-muted-foreground" />
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[160px] h-8 border-0 bg-transparent shadow-none focus:ring-0">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="specific_month">Mês Específico</SelectItem>
                <SelectItem value="last_3">Últimos 3 Meses</SelectItem>
                <SelectItem value="last_6">Últimos 6 Meses</SelectItem>
                <SelectItem value="annual">Anual</SelectItem>
                <SelectItem value="all">Todo o Período</SelectItem>
              </SelectContent>
            </Select>
            {period === 'specific_month' && (
              <Input
                type="month"
                value={specificMonth}
                onChange={(e) => setSpecificMonth(e.target.value)}
                className="w-[140px] h-8 text-sm bg-background border-l rounded-none rounded-r-md"
              />
            )}
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 text-white hover:bg-red-700">
                <Plus className="mr-2 h-4 w-4" /> Nova Despesa
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Registrar Nova Despesa Operacional</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valor (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descrição / Fornecedor</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                  Salvar Despesa
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-muted/10 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-lg">Histórico de Saídas</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/20">
              <TableRow>
                <TableHead className="pl-6">Data</TableHead>
                <TableHead>Descrição / Fornecedor</TableHead>
                <TableHead className="text-right pr-6">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    Nenhuma despesa encontrada neste período.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/10">
                    <TableCell className="pl-6 text-sm">
                      {r.date
                        ? new Date(r.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                        : '-'}
                    </TableCell>
                    <TableCell className="text-sm">{r.description || '-'}</TableCell>
                    <TableCell className="text-right pr-6 text-red-600 font-bold">
                      R$ {Number(r.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
