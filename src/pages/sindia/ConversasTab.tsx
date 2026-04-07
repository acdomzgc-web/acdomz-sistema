import { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { Search, AlertCircle, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Conversa } from './types'
import { ChatSheet } from './ChatSheet'

interface Props {
  conversas: Conversa[]
  loading: boolean
  onUpdate: (c: Conversa) => void
  startDate: string
  setStartDate: (d: string) => void
  endDate: string
  setEndDate: (d: string) => void
}

export function ConversasTab({
  conversas,
  loading,
  onUpdate,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: Props) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedChat, setSelectedChat] = useState<Conversa | null>(null)

  const filtered = useMemo(
    () =>
      conversas.filter((c) => {
        const matchName =
          c.profiles?.name?.toLowerCase().includes(search.toLowerCase()) ||
          (c.is_unauthorized && 'não autorizado'.includes(search.toLowerCase()))
        const matchStatus = statusFilter === 'all' || c.status === statusFilter
        return matchName && matchStatus
      }),
    [conversas, search, statusFilter],
  )

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por morador..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-[300px]"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="respondido">Respondido</SelectItem>
              <SelectItem value="pendente_revisao">Pendente Revisão</SelectItem>
            </SelectContent>
          </Select>
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
                <TableHead className="max-w-[200px]">Resumo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhuma conversa encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{format(parseISO(c.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell>
                      {c.is_unauthorized ? (
                        <div className="flex items-center gap-1 text-destructive">
                          <AlertCircle className="h-3 w-3" />
                          <span className="text-sm">Não Autorizado</span>
                        </div>
                      ) : (
                        c.profiles?.name || 'Desconhecido'
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={c.message || ''}>
                      {c.message}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={c.status === 'pendente_revisao' ? 'destructive' : 'default'}
                        className={
                          c.status === 'respondido'
                            ? 'bg-green-500 hover:bg-green-600 border-transparent text-primary-foreground'
                            : ''
                        }
                      >
                        {c.status === 'pendente_revisao' ? 'Pendente' : 'Respondido'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedChat(c)}>
                        <MessageCircle className="w-4 h-4 mr-2" /> Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <ChatSheet chat={selectedChat} onClose={() => setSelectedChat(null)} onUpdate={onUpdate} />
    </Card>
  )
}
