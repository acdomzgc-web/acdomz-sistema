import { useState, useEffect } from 'react'
import { Plus, Search, MessageCircle, Edit, MoreHorizontal } from 'lucide-react'
import { api } from '@/services/api'
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
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Role = 'Proprietário' | 'Locatário' | 'Morador' | 'Conselho Consultivo' | 'Conselho Fiscal'

const roleColors: Record<Role, string> = {
  Proprietário: 'bg-[#1a3a52] text-white hover:bg-[#1a3a52]/90',
  Locatário: 'bg-[#10B981] text-white hover:bg-[#10B981]/90',
  Morador: 'bg-[#9CA3AF] text-white hover:bg-[#9CA3AF]/90',
  'Conselho Consultivo': 'bg-[#F59E0B] text-white hover:bg-[#F59E0B]/90',
  'Conselho Fiscal': 'bg-[#EF4444] text-white hover:bg-[#EF4444]/90',
}

export default function Moradores() {
  const [residents, setResidents] = useState<any[]>([])

  useEffect(() => {
    api.moradores.list().then((res) => setResidents(res.data || []))
  }, [])
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Moradores</h1>
          <p className="text-muted-foreground">
            Controle de residentes, proprietários e conselheiros.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Novo Morador
        </Button>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="py-4 px-6 border-b bg-muted/20 flex flex-row flex-wrap items-center gap-4 space-y-0">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome, unidade ou CPF..."
              className="pl-9 bg-background"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Filtrar por Perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Perfis</SelectItem>
              <SelectItem value="prop">Proprietários</SelectItem>
              <SelectItem value="loc">Locatários</SelectItem>
              <SelectItem value="cons">Membros do Conselho</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Nome & Perfil</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Contatos</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {residents.map((res) => (
                <TableRow key={res.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="font-medium text-foreground">{res.name}</div>
                    <Badge
                      className={`mt-1 text-[10px] py-0 px-1.5 ${roleColors[res.role as Role] || roleColors['Morador']}`}
                    >
                      {res.role || 'Morador'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium">{res.unit}</TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <span>{res.phone}</span>
                        <a
                          href="#"
                          className="text-green-600 hover:text-green-700"
                          title="Chamar no WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      </div>
                      <div className="text-muted-foreground text-xs">{res.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={res.status === 'Ativo' ? 'outline' : 'secondary'}
                      className={
                        res.status === 'Ativo' ? 'border-green-500 text-green-700 bg-green-50' : ''
                      }
                    >
                      {res.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem className="cursor-pointer gap-2">
                          <Edit className="h-4 w-4 text-muted-foreground" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                          Inativar Morador
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
