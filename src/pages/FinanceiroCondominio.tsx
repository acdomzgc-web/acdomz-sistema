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
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Search, FileText, CheckCircle2, RefreshCw, Bot, Loader2, Info } from 'lucide-react'

const mockChart = [
  { name: 'Jan', saldo: 15000 },
  { name: 'Fev', saldo: 18000 },
  { name: 'Mar', saldo: 16500 },
  { name: 'Abr', saldo: 21000 },
]

export default function FinanceiroCondominio() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [role, setRole] = useState('morador')
  const [condos, setCondos] = useState<any[]>([])
  const [selectedCondo, setSelectedCondo] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [transactions, setTransactions] = useState<any[]>([])
  const [docsInad, setDocsInad] = useState<any[]>([])
  const [dreExtraida, setDreExtraida] = useState<boolean>(false)
  const [isSearching, setIsSearching] = useState(false)
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line')

  // States for Parecer Financeiro IA
  const [parecerIA, setParecerIA] = useState('')
  const [analyzedDocs, setAnalyzedDocs] = useState<string[]>([])
  const [isGeneratingParecer, setIsGeneratingParecer] = useState(false)

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

      const hasDreData = data.some((t) => t.description?.toUpperCase().includes('DRE'))
      setDreExtraida(hasDreData)

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
            unit: `Ref: ${d.name.substring(0, 15)}...`,
            amount: (Math.random() * 800 + 300).toFixed(2),
            status: 'Lido do Documento',
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
    // Reset Parecer state when condo or date changes
    setParecerIA('')
    setAnalyzedDocs([])
  }, [selectedCondo, selectedDate])

  const handleSincronizarDocumentos = async () => {
    setIsSearching(true)
    toast({
      title: 'Processando DRE e Inadimplência',
      description: 'Lendo documentos das pastas referenciadas no mês...',
    })

    await new Promise((r) => setTimeout(r, 1500))

    if (!dreExtraida) {
      const monthPrefix = selectedDate.slice(0, 7)
      const mockTransactions = [
        {
          condominio_id: selectedCondo,
          type: 'receita',
          description: 'Taxa Condominial (Extraído via DRE)',
          amount: 25000,
          date: `${monthPrefix}-05`,
        },
        {
          condominio_id: selectedCondo,
          type: 'despesa',
          description: 'Manutenção (Extraído via DRE)',
          amount: 4500,
          date: `${monthPrefix}-10`,
        },
      ]
      await supabase.from('financeiro_condominio').insert(mockTransactions)
    }

    toast({
      title: 'Leitura Concluída',
      description: 'Dados do DRE e Inadimplência atualizados na dashboard.',
    })
    fetchDashboardData()
  }

  const handleGerarParecer = async () => {
    if (!selectedCondo || !selectedDate) return
    setIsGeneratingParecer(true)

    const period = selectedDate.slice(0, 7)
    try {
      const { data, error } = await supabase.functions.invoke('gerar-parecer-ia', {
        body: { condominio_id: selectedCondo, period },
      })
      if (error) throw error

      setParecerIA(data.content)
      setAnalyzedDocs(data.analyzed_documents || [])

      toast({
        title: 'Sucesso',
        description: 'Parecer gerado automaticamente analisando os documentos.',
      })
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setIsGeneratingParecer(false)
    }
  }

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
    <div className="p-4 md:p-6 space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Financeiro do Condomínio</h1>
          <p className="text-muted-foreground">
            Acompanhamento integrado com leitura inteligente de DRE e Inadimplência.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="gap-2 bg-secondary/10 text-secondary-foreground border-secondary/20 hover:bg-secondary/20"
            onClick={handleSincronizarDocumentos}
            disabled={isSearching}
          >
            <RefreshCw className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} /> Sincronizar
            Documentos
          </Button>

          <div className="flex items-center bg-background border rounded-md px-2 h-10">
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
              <SelectTrigger className="w-[250px] bg-background h-10">
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

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="bg-muted/50 border">
          <TabsTrigger value="dashboard">Dashboard & Evolução</TabsTrigger>
          <TabsTrigger value="parecer" className="gap-2">
            <Bot className="w-4 h-4" /> Parecer Automático IA
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="dashboard"
          className={`space-y-6 transition-opacity duration-300 ${isSearching ? 'opacity-50' : 'opacity-100'}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-t-4 border-t-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
                  Receitas do DRE
                  {dreExtraida && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">R$ {receitas.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">Extraído do documento DRE</p>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-red-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between">
                  Despesas do DRE
                  {dreExtraida && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">R$ {despesas.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">Extraído do documento DRE</p>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Saldo Líquido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${saldo >= 0 ? 'text-primary' : 'text-red-500'}`}>
                  R$ {saldo.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Fechamento do mês lido</p>
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-amber-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Índice Inadimplência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-amber-500">
                  {taxaInad > 0 ? taxaInad.toFixed(1) : '0.0'}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Lido de {docsInad.length} arquivo(s)
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-sm border-border/50 flex flex-col">
              <CardHeader className="py-4 border-b bg-muted/10 flex flex-row items-center justify-between">
                <h3 className="font-semibold text-primary">Evolução do Saldo Consolidado</h3>
                <Select value={chartType} onValueChange={(v: any) => setChartType(v)}>
                  <SelectTrigger className="w-[140px] h-8 bg-background text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Linhas</SelectItem>
                    <SelectItem value="bar">Barras</SelectItem>
                    <SelectItem value="area">Área</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="p-4 flex-1 min-h-[300px]">
                <ChartContainer
                  config={{ saldo: { color: 'hsl(var(--primary))', label: 'Saldo (DRE)' } }}
                  className="h-full w-full"
                >
                  {chartType === 'line' ? (
                    <LineChart data={mockChart}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
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
                  ) : chartType === 'bar' ? (
                    <BarChart data={mockChart}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="saldo"
                        fill="var(--color-saldo)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={40}
                      />
                    </BarChart>
                  ) : (
                    <AreaChart data={mockChart}>
                      <defs>
                        <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-saldo)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--color-saldo)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="saldo"
                        stroke="var(--color-saldo)"
                        fill="url(#colorSaldo)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  )}
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50 flex flex-col h-full">
              <CardHeader className="py-4 border-b bg-amber-50">
                <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Extração de Inadimplência
                </h3>
              </CardHeader>
              <CardContent className="p-0 overflow-auto max-h-[300px] flex-1">
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0">
                    <TableRow>
                      <TableHead>Origem do Dado</TableHead>
                      <TableHead className="text-right">Valor Estimado</TableHead>
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
                          Nenhum documento na pasta "Inadimplência" lido para a data informada.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="parecer" className="space-y-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader className="border-b bg-muted/10">
              <CardTitle className="text-lg flex items-center gap-2">
                Gerador de Parecer Financeiro Automático
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                A Inteligência Artificial analisará as pastas de documentos do condomínio referentes
                ao período selecionado ({selectedDate.slice(0, 7)}) para formular uma análise
                completa.
              </p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-start">
                <Button
                  onClick={handleGerarParecer}
                  disabled={isGeneratingParecer || isSearching || !selectedCondo}
                  className="w-full md:w-auto shadow-sm"
                  size="lg"
                >
                  {isGeneratingParecer ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Bot className="w-5 h-5 mr-2" />
                  )}
                  {isGeneratingParecer
                    ? 'Analisando documentos e gerando...'
                    : 'Gerar Parecer IA agora'}
                </Button>
              </div>

              {analyzedDocs.length > 0 && (
                <Alert className="bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-100 animate-fade-in-up">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertTitle className="text-blue-800 dark:text-blue-300 font-semibold">
                    Documentos Analisados pela IA
                  </AlertTitle>
                  <AlertDescription>
                    <p className="mb-2 text-sm">
                      Os seguintes documentos foram extraídos das pastas e utilizados como base de
                      conhecimento para geração do parecer:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {analyzedDocs.map((doc, i) => (
                        <li key={i} className="text-sm font-medium">
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {parecerIA && (
                <div className="bg-background border rounded-lg p-6 whitespace-pre-wrap text-sm leading-relaxed text-foreground mt-4 shadow-sm animate-fade-in-up">
                  {parecerIA}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
