import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Bot, FileCheck, Printer, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const MOCK_INADS = [
  { id: 1, unit: 'Apt 101', amount: 1250.0, daysLate: 15 },
  { id: 2, unit: 'Apt 304', amount: 850.5, daysLate: 45 },
]

export default function ParecerFinanceiro() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [role, setRole] = useState('morador')
  const [condos, setCondos] = useState<any[]>([])
  const [selectedCondo, setSelectedCondo] = useState('')
  const [period, setPeriod] = useState('mes')
  const [comentario, setComentario] = useState('')
  const [parecerIA, setParecerIA] = useState('')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ receitas: 0, despesas: 0, saldo: 0 })

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setRole(data?.role || 'morador')
        if (data?.role === 'admin') {
          supabase
            .from('condominios')
            .select('*')
            .then((res) => {
              setCondos(res.data || [])
              if (res.data?.[0]) setSelectedCondo(res.data[0].id)
            })
        } else if (data?.role === 'sindico') {
          supabase
            .from('condominios')
            .select('*')
            .eq('sindico_id', user.id)
            .then((res) => {
              setCondos(res.data || [])
              if (res.data?.[0]) setSelectedCondo(res.data[0].id)
            })
        }
      })
  }, [user])

  useEffect(() => {
    if (!selectedCondo) return
    supabase
      .from('financeiro_condominio')
      .select('*')
      .eq('condominio_id', selectedCondo)
      .then(({ data }) => {
        const txs = data || []
        const receitas = txs
          .filter((t) => t.type === 'receita')
          .reduce((a, b) => a + Number(b.amount || 0), 0)
        const despesas = txs
          .filter((t) => t.type === 'despesa')
          .reduce((a, b) => a + Number(b.amount || 0), 0)
        setStats({ receitas, despesas, saldo: receitas - despesas })
      })
  }, [selectedCondo, period])

  const gerarParecerIA = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('gerar-parecer-ia', {
        body: { condominio_id: selectedCondo, period, context: stats },
      })
      if (error) throw error
      setParecerIA(data.content)
      toast({ title: 'Sucesso', description: 'Parecer gerado com IA.' })
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto print:p-8 print:absolute print:inset-0 print:bg-white print:z-50 print:block">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <h1 className="text-3xl font-bold text-[#1a3a52]">Parecer Financeiro</h1>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes">Este Mês</SelectItem>
              <SelectItem value="semestre">Semestre</SelectItem>
              <SelectItem value="ano">Ano</SelectItem>
            </SelectContent>
          </Select>
          {role === 'admin' && (
            <Select value={selectedCondo} onValueChange={setSelectedCondo}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Condomínio" />
              </SelectTrigger>
              <SelectContent>
                {condos.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> PDF
          </Button>
        </div>
      </div>

      <div className="hidden print:flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold text-[#1a3a52]">ACDOMZ - Parecer Financeiro</h1>
        <div className="text-sm text-muted-foreground text-right">
          <p>Condomínio ID: {selectedCondo}</p>
          <p>Período: {period.toUpperCase()}</p>
          <p>Data: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">R$ {stats.receitas.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">R$ {stats.despesas.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Saldo Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#1a3a52]">R$ {stats.saldo.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="print:shadow-none print:border-none">
          <CardHeader className="print:px-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCheck className="w-5 h-5 print:hidden" /> Análise Técnica Automática
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 print:px-0">
            <div className="bg-muted/50 print:bg-white print:border print:border-gray-200 p-4 rounded-md min-h-[150px] whitespace-pre-wrap text-sm text-foreground">
              {parecerIA || 'O parecer será gerado após clicar no botão.'}
            </div>
            <Button
              onClick={gerarParecerIA}
              disabled={loading || !selectedCondo}
              className="w-full print:hidden"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Bot className="w-4 h-4 mr-2" />
              )}
              Gerar Parecer com IA (GPT-4)
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="print:shadow-none print:border-none">
            <CardHeader className="print:px-0">
              <CardTitle className="text-lg text-red-600 print:text-black">
                Quadro de Inadimplência
              </CardTitle>
            </CardHeader>
            <CardContent className="print:px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Atraso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_INADS.map((i) => (
                    <TableRow key={i.id}>
                      <TableCell className="font-medium">{i.unit}</TableCell>
                      <TableCell className="text-red-600">R$ {i.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-red-600 bg-red-50">
                          {i.daysLate} dias
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="print:hidden">
            <CardHeader>
              <CardTitle className="text-lg">Comentários e Notas Manuais</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Insira suas observações manuais (max 500 carac.)"
                maxLength={500}
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                className="resize-none h-24"
              />
            </CardContent>
          </Card>
          {comentario && (
            <div className="hidden print:block mt-6 border-t pt-4">
              <h3 className="font-bold text-lg mb-2">Notas do Administrador</h3>
              <p className="text-sm whitespace-pre-wrap text-justify">{comentario}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
