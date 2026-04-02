import { useState, useEffect } from 'react'
import { Plus, Upload, Loader2 } from 'lucide-react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

export default function FinanceiroAcdomz() {
  const [receitas, setReceitas] = useState<any[]>([])
  const [condominios, setCondominios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const { toast } = useToast()

  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [description, setDescription] = useState('')
  const [condominioId, setCondominioId] = useState('')

  const [filterCondo, setFilterCondo] = useState('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [resReceitas, resCondos] = await Promise.all([
      api.receitas.list(),
      api.condominios.list(),
    ])
    if (resReceitas.data) setReceitas(resReceitas.data)
    if (resCondos.data) setCondominios(resCondos.data)
    setLoading(false)
  }

  const handleExtractNF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setExtracting(true)
    try {
      const { data, error } = await supabase.functions.invoke('extrair-nf-acdomz', {
        body: { filename: file.name },
      })

      if (error) throw error

      toast({ title: 'NF Processada com sucesso (IA)' })

      if (data?.data) {
        setAmount(data.data.amount)
        setDate(data.data.date)
        setDescription(data.data.description)
      }

      if (condominios.length > 0) {
        setCondominioId(condominios[0].id)
      }
    } catch (error: any) {
      toast({ title: 'Erro ao processar NF', description: error.message, variant: 'destructive' })
    } finally {
      setExtracting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!condominioId || !amount || !date) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' })
      return
    }

    try {
      const { error } = await api.receitas.create({
        condominio_id: condominioId,
        amount: parseFloat(amount),
        date,
        description,
      })
      if (error) throw error

      toast({ title: 'Receita registrada com sucesso' })
      setOpen(false)
      loadData()
      setAmount('')
      setDate('')
      setDescription('')
      setCondominioId('')
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    }
  }

  const filtered = receitas.filter((r) => filterCondo === 'all' || r.condominio_id === filterCondo)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Financeiro ACDOMZ</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Nova Receita
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Registrar Nova Receita</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="upload" className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload NF (IA)</TabsTrigger>
                <TabsTrigger value="manual">Manual</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4 py-4">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {extracting ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
                      ) : (
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      )}
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Clique para enviar NF PDF</span> ou arraste
                      </p>
                    </div>
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={handleExtractNF}
                      disabled={extracting}
                    />
                  </label>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Condomínio Identificado</Label>
                      <Select value={condominioId} onValueChange={setCondominioId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {condominios.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Valor Extraído (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Data Extraída</Label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição / Categoria</Label>
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full">
                    Confirmar e Salvar
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="manual" className="py-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Condomínio</Label>
                    <Select value={condominioId} onValueChange={setCondominioId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o Condomínio" />
                      </SelectTrigger>
                      <SelectContent>
                        {condominios.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                    <Label>Descrição / Categoria</Label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Salvar Receita
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Histórico de Receitas</CardTitle>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select value={filterCondo} onValueChange={setFilterCondo}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filtrar por Condomínio" />
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Condomínio</TableHead>
                  <TableHead>Descrição / Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      Nenhuma receita encontrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        {r.date ? new Date(r.date).toLocaleDateString('pt-BR') : '-'}
                      </TableCell>
                      <TableCell className="font-medium">{r.condominios?.name || '-'}</TableCell>
                      <TableCell>{r.description || '-'}</TableCell>
                      <TableCell className="text-right text-emerald-600 font-medium">
                        R$ {Number(r.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
