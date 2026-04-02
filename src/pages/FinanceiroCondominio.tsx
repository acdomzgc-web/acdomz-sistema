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
import { Badge } from '@/components/ui/badge'
import { api } from '@/services/api'
import { useAuth } from '@/hooks/use-auth'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Line, LineChart, XAxis, YAxis } from 'recharts'

const MOCK_INADIMPLENTES = [
  { id: 1, unit: 'Apt 101', amount: 1250.0, dueDate: '2024-03-10', daysLate: 15 },
  { id: 2, unit: 'Apt 304', amount: 850.5, dueDate: '2024-02-10', daysLate: 45 },
  { id: 3, unit: 'Apt 502', amount: 1500.0, dueDate: '2024-01-10', daysLate: 75 },
]

const mockChartData = [
  { name: 'Jan', saldo: 15000 },
  { name: 'Fev', saldo: 18000 },
  { name: 'Mar', saldo: 16500 },
  { name: 'Abr', saldo: 20000 },
  { name: 'Mai', saldo: 25000 },
  { name: 'Jun', saldo: 23000 },
]

export default function FinanceiroCondominio() {
  const { user } = useAuth()
  const [role, setRole] = useState<string>('morador')
  const [condos, setCondos] = useState<any[]>([])
  const [selectedCondo, setSelectedCondo] = useState<string>('')
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    api.profiles.get(user.id).then(({ data }) => {
      setRole(data?.role || 'morador')
      if (data?.role === 'admin') {
        api.condominios.list().then((res) => {
          setCondos(res.data || [])
          if (res.data?.[0]) setSelectedCondo(res.data[0].id)
        })
      } else if (data?.role === 'sindico') {
        api.financeiroCondominio.getBySindico(user.id).then((res) => {
          if (res.data) setSelectedCondo(res.data.id)
        })
      }
    })
  }, [user])

  useEffect(() => {
    if (!selectedCondo) return
    api.financeiroCondominio.list(selectedCondo).then((res) => setTransactions(res.data || []))
  }, [selectedCondo])

  const receitas = transactions
    .filter((t) => t.type === 'receita')
    .reduce((a, b) => a + Number(b.amount || 0), 0)
  const despesas = transactions
    .filter((t) => t.type === 'despesa')
    .reduce((a, b) => a + Number(b.amount || 0), 0)
  const saldo = receitas - despesas

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-[#1a3a52]">Financeiro do Condomínio</h1>
        {role === 'admin' && (
          <Select value={selectedCondo} onValueChange={setSelectedCondo}>
            <SelectTrigger className="w-[250px]">
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">R$ {receitas.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">R$ {despesas.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Saldo Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-[#1a3a52]">R$ {saldo.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Inadimplentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-500">
              {MOCK_INADIMPLENTES.length} Unidades
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-4">
          <h3 className="font-semibold mb-4 text-[#1a3a52]">Evolução do Saldo (Fluxo)</h3>
          <div className="h-[300px]">
            <ChartContainer
              config={{ saldo: { color: '#1a3a52', label: 'Saldo' } }}
              className="h-full w-full"
            >
              <LineChart data={mockChartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="saldo" stroke="var(--color-saldo)" strokeWidth={3} />
              </LineChart>
            </ChartContainer>
          </div>
        </Card>

        <Card className="p-4 overflow-auto max-h-[400px]">
          <h3 className="font-semibold mb-4 text-[#1a3a52] flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            Painel de Inadimplência
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Unidades com boletos em aberto. Dados nominais ocultados por LGPD.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Unidade</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Atraso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_INADIMPLENTES.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-medium text-[#1a3a52]">{i.unit}</TableCell>
                  <TableCell className="text-red-600 font-semibold">
                    R$ {i.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                      {i.daysLate} dias
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transações Lançadas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    Nenhuma movimentação registrada
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      {new Date(t.date || t.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{t.description || 'S/ Descrição'}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          t.type === 'receita'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }
                        variant="secondary"
                      >
                        {t.type?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`text-right font-bold ${t.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {t.type === 'receita' ? '+' : '-'} R$ {Number(t.amount).toFixed(2)}
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
