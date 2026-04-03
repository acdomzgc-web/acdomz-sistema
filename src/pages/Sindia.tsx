import { useEffect, useState, useMemo } from 'react'
import { format, subDays, startOfDay, endOfDay, parseISO } from 'date-fns'
import { Bot, MessageSquare, AlertTriangle, CheckCircle, Search, AlertCircle } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'

import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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
import { Badge } from '@/components/ui/badge'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

type Condominio = { id: string; name: string; sindia_active: boolean }
type Conversa = {
  id: string
  created_at: string
  message: string | null
  response: string | null
  status: string
  is_unauthorized: boolean
  user_id: string | null
  profiles: { name: string } | null
}

export default function Sindia() {
  const { toast } = useToast()

  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [selectedCondominio, setSelectedCondominio] = useState<string>('all')
  const [isBotActive, setIsBotActive] = useState(true)

  const [conversas, setConversas] = useState<Conversa[]>([])
  const [loading, setLoading] = useState(true)

  const [startDate, setStartDate] = useState<string>(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [searchMorador, setSearchMorador] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchCondominios()
  }, [])

  useEffect(() => {
    if (selectedCondominio && selectedCondominio !== 'all') {
      const cond = condominios.find((c) => c.id === selectedCondominio)
      if (cond) setIsBotActive(cond.sindia_active ?? true)
    }
    fetchConversas()
  }, [selectedCondominio, startDate, endDate, condominios])

  const fetchCondominios = async () => {
    const { data } = await supabase
      .from('condominios')
      .select('id, name, sindia_active')
      .order('name')
    if (data) setCondominios(data)
  }

  const fetchConversas = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('conversas_sindia')
        .select(`
          id, created_at, message, response, status, is_unauthorized, user_id,
          profiles (name)
        `)
        .order('created_at', { ascending: false })

      if (selectedCondominio !== 'all') {
        query = query.eq('condominio_id', selectedCondominio)
      }
      if (startDate) {
        query = query.gte('created_at', startOfDay(parseISO(startDate)).toISOString())
      }
      if (endDate) {
        query = query.lte('created_at', endOfDay(parseISO(endDate)).toISOString())
      }

      const { data, error } = await query
      if (error) throw error
      setConversas(data as unknown as Conversa[])
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar conversas',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleBotStatus = async (checked: boolean) => {
    if (selectedCondominio === 'all') return
    try {
      const { error } = await supabase
        .from('condominios')
        .update({ sindia_active: checked })
        .eq('id', selectedCondominio)

      if (error) throw error
      setIsBotActive(checked)
      setCondominios((prev) =>
        prev.map((c) => (c.id === selectedCondominio ? { ...c, sindia_active: checked } : c)),
      )
      toast({
        title: 'Status atualizado',
        description: `O bot foi ${checked ? 'ativado' : 'desativado'} para este condomínio.`,
      })
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar status',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  const handleReview = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'respondido' ? 'pendente_revisao' : 'respondido'
    try {
      const { error } = await supabase
        .from('conversas_sindia')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
      setConversas((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)))
      toast({ title: 'Status atualizado', description: 'A conversa foi atualizada com sucesso.' })
    } catch (error: any) {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
    }
  }

  const filteredConversas = useMemo(() => {
    return conversas.filter((c) => {
      const moradorMatch =
        c.profiles?.name?.toLowerCase().includes(searchMorador.toLowerCase()) ||
        (c.is_unauthorized && 'não autorizado'.includes(searchMorador.toLowerCase()))
      const statusMatch = statusFilter === 'all' || c.status === statusFilter
      return moradorMatch && statusMatch
    })
  }, [conversas, searchMorador, statusFilter])

  const totalMensagens = conversas.length
  const resolvidas = conversas.filter((c) => c.status === 'respondido').length
  const taxaResolucao = totalMensagens > 0 ? Math.round((resolvidas / totalMensagens) * 100) : 0
  const naoAutorizadas = conversas.filter((c) => c.is_unauthorized).length

  const chartData = useMemo(() => {
    const days: Record<string, number> = {}
    conversas.forEach((c) => {
      const day = format(parseISO(c.created_at), 'dd/MM')
      days[day] = (days[day] || 0) + 1
    })
    return Object.entries(days)
      .map(([date, count]) => ({ date, count }))
      .reverse()
  }, [conversas])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">SINDIA Bot</h2>
          <p className="text-muted-foreground">
            Gerencie a assistente virtual e acompanhe os atendimentos.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedCondominio} onValueChange={setSelectedCondominio}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Selecione o Condomínio" />
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

          {selectedCondominio !== 'all' && (
            <div className="flex items-center space-x-2 bg-card border px-4 py-2 rounded-md">
              <Switch id="bot-active" checked={isBotActive} onCheckedChange={toggleBotStatus} />
              <Label htmlFor="bot-active" className="cursor-pointer">
                {isBotActive ? 'Bot Ativo' : 'Bot Inativo'}
              </Label>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Mensagens</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMensagens}</div>
            <p className="text-xs text-muted-foreground">No período selecionado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Resolução</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taxaResolucao}%</div>
            <p className="text-xs text-muted-foreground">Sem necessidade de revisão</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tentativas Não Autorizadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{naoAutorizadas}</div>
            <p className="text-xs text-muted-foreground">Números não cadastrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perguntas Frequentes</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium truncate" title="1. Horário de silêncio">
              1. Horário de silêncio
            </div>
            <div className="text-sm font-medium truncate" title="2. Boleto condomínio">
              2. Boleto condomínio
            </div>
            <div className="text-sm font-medium truncate" title="3. Reserva salão">
              3. Reserva salão
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-7">
          <CardHeader>
            <CardTitle>Volume de Conversas</CardTitle>
            <CardDescription>Quantidade de interações por dia no período.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            {chartData.length > 0 ? (
              <ChartContainer
                config={{ count: { label: 'Mensagens', color: 'hsl(var(--primary))' } }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="count"
                      fill="var(--color-count)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={50}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                Nenhum dado para exibir no período
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Conversas</CardTitle>
          <CardDescription>
            Acompanhe e revise as interações da SINDIA com os moradores.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex items-center gap-2 flex-1">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por morador..."
                value={searchMorador}
                onChange={(e) => setSearchMorador(e.target.value)}
                className="max-w-[300px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap">Status:</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="respondido">Respondido</SelectItem>
                  <SelectItem value="pendente_revisao">Pendente Revisão</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[140px]"
              />
              <span className="text-muted-foreground">até</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[140px]"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Morador</TableHead>
                  <TableHead className="max-w-[200px]">Pergunta</TableHead>
                  <TableHead className="max-w-[300px]">Resposta da SINDIA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Carregando conversas...
                    </TableCell>
                  </TableRow>
                ) : filteredConversas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma conversa encontrada com os filtros atuais.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredConversas.map((conversa) => (
                    <TableRow key={conversa.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(parseISO(conversa.created_at), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        {conversa.is_unauthorized ? (
                          <div className="flex items-center gap-1 text-destructive">
                            <AlertCircle className="h-3 w-3" />
                            <span className="text-sm">Não Autorizado</span>
                          </div>
                        ) : (
                          conversa.profiles?.name || 'Desconhecido'
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={conversa.message || ''}>
                        {conversa.message}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate" title={conversa.response || ''}>
                        {conversa.response}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            conversa.status === 'pendente_revisao' ? 'destructive' : 'default'
                          }
                          className={
                            conversa.status === 'respondido'
                              ? 'bg-green-500 hover:bg-green-600 border-transparent text-primary-foreground'
                              : ''
                          }
                        >
                          {conversa.status === 'pendente_revisao'
                            ? 'Pendente Revisão'
                            : 'Respondido'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReview(conversa.id, conversa.status)}
                        >
                          {conversa.status === 'respondido'
                            ? 'Marcar para Revisão'
                            : 'Marcar como Resolvido'}
                        </Button>
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
