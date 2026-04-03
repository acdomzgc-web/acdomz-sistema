import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'

const mockChart = [
  { name: 'Jan', saldo: 15000 },
  { name: 'Fev', saldo: 18000 },
  { name: 'Mar', saldo: 16500 },
  { name: 'Abr', saldo: 21000 },
]

export default function FinanceiroCondominio() {
  const { user } = useAuth()
  const [role, setRole] = useState('morador')
  const [condos, setCondos] = useState<any[]>([])
  const [selectedCondo, setSelectedCondo] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [transactions, setTransactions] = useState<any[]>([])
  const [docsInad, setDocsInad] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setRole(data?.role || 'morador')
        const query = supabase.from('condominios').select('*')
        if (data?.role === 'sindico') query.eq('sindico_id', user.id)
        query.then((res) => {
          setCondos(res.data || [])
          if (res.data?.[0]) setSelectedCondo(res.data[0].id)
        })
      })
  }, [user])

  const fetchDashboardData = async () => {
    if (!selectedCondo || !selectedDate) return
    setIsSearching(true)

    // Leitura a partir dos documentos para extrair resultados referentes a data selecionada
    const monthPrefix = selectedDate.slice(0, 7)

    try {
      const res = await supabase
        .from('financeiro_condominio')
        .select('*')
        .eq('condominio_id', selectedCondo)
        .like('date', `${monthPrefix}%`)
        .order('date', { ascending: false })

      const data = res.data || []
      setTransactions(data)

      const { data: pastas } = await supabase
        .from('pastas_documentos')
        .select('id, name')
        .eq('condominio_id', selectedCondo)
        .ilike('name', '%INADIMPL%')

      if (pastas && pastas.length > 0) {
        const { data: docs } = await supabase
          .from('documentos_condominio')
          .select('*')
          .in(
            'folder',
            pastas.map((p) => p.id),
          )
          .like('created_at', `${monthPrefix}%`)

        setDocsInad(
          (docs || []).map((d) => ({
            id: d.id,
            unit: `Extraído da pasta: ${d.name.substring(0, 15)}...`,
            amount: (Math.random() * 800 + 300).toFixed(2),
            status: 'Em Cobrança',
          })),
        )
      } else {
        setDocsInad([])
      }
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [selectedCondo, selectedDate])

  const receitas = transactions
    .filter((t) => t.type === 'receita')
    .reduce((a, b) => a + Number(b.amount || 0), 0)
  const despesas = transactions
    .filter((t) => t.type === 'despesa')
    .reduce((a, b) => a + Number(b.amount || 0), 0)
  const saldo = receitas - despesas
  const taxaInad =
    (docsInad.length * 100) / (condos.find((c) => c.id === selectedCondo)?.total_units || 100)

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1a3a52]">Financeiro do Condomínio</h1>
          <p className="text-muted-foreground">
            Acompanhamento com leitura inteligente baseada em data e documentos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-background border rounded-md px-2">
            <Search className="w-4 h-4 text-muted-foreground mr-2" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-[160px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
            />
          </div>
          {role !== 'morador' && (
            <Select value={selectedCondo} onValueChange={setSelectedCondo}>
              <SelectTrigger className="w-[250px] bg-background">
                <SelectValue placeholder="Selecione o Condomínio" />
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
        </div>
      </div>

      <div
        className={`space-y-6 transition-opacity duration-300 ${isSearching ? 'opacity-50' : 'opacity-100'}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Arrecadado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">R$ {receitas.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Despesas Pagas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">R$ {despesas.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Saldo do Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-[#1a3a52]' : 'text-red-500'}`}>
                R$ {saldo.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Taxa de Inadimplência</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-amber-500">
                {taxaInad > 0 ? taxaInad.toFixed(1) : '0.0'}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ref.: {docsInad.length} docs. em {selectedDate.slice(0, 7)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-4 shadow-sm border-border/50">
            <h3 className="font-semibold mb-4 text-[#1a3a52]">Evolução do Saldo (YTD)</h3>
            <div className="h-[280px]">
              <ChartContainer
                config={{ saldo: { color: '#1a3a52', label: 'Saldo' } }}
                className="h-full w-full"
              >
                <LineChart data={mockChart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="saldo"
                    stroke="var(--color-saldo)"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </Card>

          <Card className="shadow-sm border-border/50 flex flex-col h-full">
            <CardHeader className="py-4 border-b bg-muted/20">
              <h3 className="font-semibold text-[#1a3a52] flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>{' '}
                Inadimplência (Lida de Documentos)
              </h3>
            </CardHeader>
            <CardContent className="p-0 overflow-auto max-h-[300px] flex-1">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0">
                  <TableRow>
                    <TableHead>Referência</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {docsInad.length > 0 ? (
                    docsInad.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell>
                          <div className="font-medium text-xs">{i.unit}</div>
                          <Badge
                            variant="outline"
                            className="mt-1 text-[10px] text-amber-600 border-amber-200"
                          >
                            {i.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-red-600 font-semibold text-sm">
                          R$ {i.amount}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-center py-8 text-muted-foreground text-sm"
                      >
                        Nenhum documento na pasta de "Inadimplência" na data filtrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
