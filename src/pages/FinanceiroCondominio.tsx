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
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Line, LineChart, XAxis, YAxis } from 'recharts'

const MOCK_INAD = [
  { id: 1, unit: 'Apt 101', amount: 1250, daysLate: 15 },
  { id: 2, unit: 'Apt 304', amount: 850, daysLate: 45 },
]
const mockChart = [
  { name: 'Jan', saldo: 15000 },
  { name: 'Fev', saldo: 18000 },
  { name: 'Mar', saldo: 16500 },
]

export default function FinanceiroCondominio() {
  const { user } = useAuth()
  const [role, setRole] = useState('morador')
  const [condos, setCondos] = useState<any[]>([])
  const [selectedCondo, setSelectedCondo] = useState('')
  const [transactions, setTransactions] = useState<any[]>([])

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

  useEffect(() => {
    if (!selectedCondo) return
    supabase
      .from('financeiro_condominio')
      .select('*')
      .eq('condominio_id', selectedCondo)
      .order('date', { ascending: false })
      .then((res) => setTransactions(res.data || []))
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
        {role !== 'morador' && (
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

      <div className="space-y-6">
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
              <p className="text-2xl font-bold text-amber-500">{MOCK_INAD.length} Unidades</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-4">
            <h3 className="font-semibold mb-4 text-[#1a3a52]">Evolução do Saldo</h3>
            <div className="h-[250px]">
              <ChartContainer
                config={{ saldo: { color: '#1a3a52', label: 'Saldo' } }}
                className="h-full w-full"
              >
                <LineChart data={mockChart}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="saldo"
                    stroke="var(--color-saldo)"
                    strokeWidth={3}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </Card>
          <Card className="p-4 overflow-auto max-h-[330px]">
            <h3 className="font-semibold mb-4 text-[#1a3a52] flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span> Inadimplência
              Ativa
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_INAD.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.unit}</TableCell>
                    <TableCell className="text-red-600">R$ {i.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  )
}
