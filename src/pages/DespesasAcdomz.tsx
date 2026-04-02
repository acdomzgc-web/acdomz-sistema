import { useState, useEffect } from 'react'
import { Plus, Calendar, CreditCard } from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/services/api'

export default function DespesasAcdomz() {
  const [recorrentes, setRecorrentes] = useState<any[]>([])
  const [pontuais, setPontuais] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [openRecorrente, setOpenRecorrente] = useState(false)
  const [recDesc, setRecDesc] = useState('')
  const [recAmount, setRecAmount] = useState('')
  const [recDay, setRecDay] = useState('')

  const [openPontual, setOpenPontual] = useState(false)
  const [ponDesc, setPonDesc] = useState('')
  const [ponAmount, setPonAmount] = useState('')
  const [ponDate, setPonDate] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [resRec, resPon] = await Promise.all([
      api.despesasRecorrentes.list(),
      api.despesasPontuais.list(),
    ])
    if (resRec.data) setRecorrentes(resRec.data)
    if (resPon.data) setPontuais(resPon.data)
    setLoading(false)
  }

  const handleSaveRecorrente = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await api.despesasRecorrentes.create({
        description: recDesc,
        amount: parseFloat(recAmount),
        day_of_month: parseInt(recDay),
      })
      if (error) throw error
      toast({ title: 'Despesa recorrente adicionada' })
      setOpenRecorrente(false)
      loadData()
      setRecDesc('')
      setRecAmount('')
      setRecDay('')
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    }
  }

  const handleSavePontual = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await api.despesasPontuais.create({
        description: ponDesc,
        amount: parseFloat(ponAmount),
        date: ponDate,
      })
      if (error) throw error
      toast({ title: 'Despesa pontual adicionada' })
      setOpenPontual(false)
      loadData()
      setPonDesc('')
      setPonAmount('')
      setPonDate('')
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Despesas ACDOMZ</h1>
      </div>

      <Tabs defaultValue="recorrentes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recorrentes">
            <Calendar className="mr-2 h-4 w-4" /> Recorrentes
          </TabsTrigger>
          <TabsTrigger value="pontuais">
            <CreditCard className="mr-2 h-4 w-4" /> Pontuais
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recorrentes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Despesas Fixas Mensais</CardTitle>
              <Dialog open={openRecorrente} onOpenChange={setOpenRecorrente}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Nova Recorrente
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Despesa Recorrente</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaveRecorrente} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Descrição / Categoria</Label>
                      <Input
                        value={recDesc}
                        onChange={(e) => setRecDesc(e.target.value)}
                        required
                        placeholder="Ex: Contabilidade, Software..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Valor Mensal (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={recAmount}
                          onChange={(e) => setRecAmount(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Dia de Vencimento</Label>
                        <Input
                          type="number"
                          min="1"
                          max="31"
                          value={recDay}
                          onChange={(e) => setRecDay(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      Salvar
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dia Venc.</TableHead>
                      <TableHead>Descrição / Categoria</TableHead>
                      <TableHead className="text-right">Valor Mensal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          Carregando...
                        </TableCell>
                      </TableRow>
                    ) : recorrentes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          Nenhuma despesa recorrente encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      recorrentes.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">Dia {r.day_of_month}</TableCell>
                          <TableCell>{r.description}</TableCell>
                          <TableCell className="text-right text-rose-600 font-medium">
                            R${' '}
                            {Number(r.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pontuais">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Despesas Pontuais (Avulsas)</CardTitle>
              <Dialog open={openPontual} onOpenChange={setOpenPontual}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="secondary">
                    <Plus className="mr-2 h-4 w-4" /> Nova Pontual
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Despesa Pontual</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSavePontual} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Descrição / Categoria</Label>
                      <Input
                        value={ponDesc}
                        onChange={(e) => setPonDesc(e.target.value)}
                        required
                        placeholder="Ex: Material de escritório..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Valor (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={ponAmount}
                          onChange={(e) => setPonAmount(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Data</Label>
                        <Input
                          type="date"
                          value={ponDate}
                          onChange={(e) => setPonDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      Salvar
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição / Categoria</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          Carregando...
                        </TableCell>
                      </TableRow>
                    ) : pontuais.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          Nenhuma despesa pontual encontrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      pontuais.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>
                            {r.date ? new Date(r.date).toLocaleDateString('pt-BR') : '-'}
                          </TableCell>
                          <TableCell>{r.description}</TableCell>
                          <TableCell className="text-right text-rose-600 font-medium">
                            R${' '}
                            {Number(r.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
