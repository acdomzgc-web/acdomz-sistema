import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { Plus, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function FinanceiroAcdomz() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<string>('last_3')
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ description: '', amount: '', date: '' })
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [period, selectedMonth])

  const loadData = async () => {
    setLoading(true)
    let q = supabase.from('receitas_acdomz').select('*').order('date', { ascending: false })

    const now = new Date()
    let start, end
    if (period === 'specific_month') {
      start = new Date(now.getFullYear(), selectedMonth - 1, 1)
      end = new Date(now.getFullYear(), selectedMonth, 0)
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

    if (start && end) {
      q = q
        .gte('date', start.toISOString().split('T')[0])
        .lte('date', end.toISOString().split('T')[0])
    }

    const { data: res } = await q
    if (res) setData(res)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('receitas_acdomz').delete().eq('id', id)
    loadData()
    toast({ title: 'Receita excluída' })
  }

  const handleSave = async () => {
    if (!formData.description || !formData.amount || !formData.date) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' })
      return
    }
    await supabase.from('receitas_acdomz').insert([
      {
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: formData.date,
      },
    ])
    setIsDialogOpen(false)
    setFormData({ description: '', amount: '', date: '' })
    loadData()
    toast({ title: 'Receita adicionada' })
  }

  return (
    <Card className="border-border/50 shadow-sm bg-gradient-to-b from-card to-card/80">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b bg-muted/20 pb-4">
        <CardTitle className="text-lg font-semibold">Lista de Entradas</CardTitle>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[160px] bg-background">
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
            <Select
              value={selectedMonth.toString()}
              onValueChange={(v) => setSelectedMonth(parseInt(v))}
            >
              <SelectTrigger className="w-[140px] bg-background">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <SelectItem key={m} value={m.toString()}>
                    {new Date(2000, m - 1).toLocaleString('pt-BR', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="w-4 h-4 mr-2" /> Nova Receita
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Receita</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ex: Mensalidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <Button
                  onClick={handleSave}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="w-[80px] text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.date ? format(new Date(item.date), 'dd/MM/yyyy') : '-'}
                  </TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right text-emerald-600 font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      item.amount,
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Nenhuma receita encontrada para o período.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
