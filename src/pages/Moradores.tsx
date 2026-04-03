import { useState, useEffect } from 'react'
import { Plus, Search, MessageCircle, Edit, MoreHorizontal, PowerOff } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

type Role = 'Proprietário' | 'Locatário' | 'Morador' | 'Conselho Consultivo' | 'Conselho Fiscal'

const roleColors: Record<Role | string, string> = {
  Proprietário: 'bg-[#1a3a52] text-white hover:bg-[#1a3a52]/90',
  Locatário: 'bg-[#10B981] text-white hover:bg-[#10B981]/90',
  Morador: 'bg-[#9CA3AF] text-white hover:bg-[#9CA3AF]/90',
  'Conselho Consultivo': 'bg-[#F59E0B] text-white hover:bg-[#F59E0B]/90',
  'Conselho Fiscal': 'bg-[#EF4444] text-white hover:bg-[#EF4444]/90',
}

export default function Moradores() {
  const [residents, setResidents] = useState<any[]>([])
  const [condos, setCondos] = useState<any[]>([])
  const [selectedCondo, setSelectedCondo] = useState('all')
  const [selectedRole, setSelectedRole] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [open, setOpen] = useState(false)
  const [editingRes, setEditingRes] = useState<any>(null)
  const { toast } = useToast()

  const loadData = async () => {
    let query = supabase.from('moradores').select('*, condominios(name)').order('name')
    if (selectedCondo !== 'all') query = query.eq('condominio_id', selectedCondo)
    if (selectedRole !== 'all') query = query.eq('role', selectedRole)
    const { data } = await query
    if (data) setResidents(data)
  }

  useEffect(() => {
    supabase
      .from('condominios')
      .select('id, name')
      .order('name')
      .then((res) => setCondos(res.data || []))
  }, [])

  useEffect(() => {
    loadData()
  }, [selectedCondo, selectedRole])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const payload = {
      name: formData.get('name') as string,
      unit: formData.get('unit') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      role: formData.get('role') as string,
      condominio_id: formData.get('condominio_id') as string,
      status: (formData.get('status') as string) || 'Ativo',
    }

    if (editingRes) {
      const { error } = await supabase.from('moradores').update(payload).eq('id', editingRes.id)
      if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' })
        return
      }
      toast({ title: 'Morador atualizado com sucesso!' })
    } else {
      const { error } = await supabase.from('moradores').insert(payload)
      if (error) {
        toast({ title: 'Erro', description: error.message, variant: 'destructive' })
        return
      }
      toast({ title: 'Morador cadastrado com sucesso!' })
    }
    setOpen(false)
    setEditingRes(null)
    loadData()
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    await supabase.from('moradores').update({ status: newStatus }).eq('id', id)
    toast({ title: `Morador ${newStatus === 'Ativo' ? 'ativado' : 'inativado'} com sucesso!` })
    loadData()
  }

  const filtered = residents.filter(
    (r) =>
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.unit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Moradores</h1>
          <p className="text-muted-foreground">
            Controle de residentes, proprietários e conselheiros.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditingRes(null)
            setOpen(true)
          }}
        >
          <Plus className="h-4 w-4" /> Novo Morador
        </Button>
      </div>

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen)
          if (!isOpen) setEditingRes(null)
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingRes ? 'Editar Morador' : 'Cadastrar Novo Morador'}</DialogTitle>
          </DialogHeader>
          <form key={editingRes?.id || 'new'} onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nome Completo</Label>
                <Input name="name" defaultValue={editingRes?.name} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Condomínio</Label>
                  <Select
                    name="condominio_id"
                    defaultValue={editingRes?.condominio_id || ''}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {condos.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Unidade / Bloco</Label>
                  <Input
                    name="unit"
                    defaultValue={editingRes?.unit}
                    required
                    placeholder="Ex: Apt 101 Bloco A"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Perfil</Label>
                  <Select name="role" defaultValue={editingRes?.role || 'Morador'} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Proprietário">Proprietário</SelectItem>
                      <SelectItem value="Locatário">Locatário</SelectItem>
                      <SelectItem value="Morador">Morador</SelectItem>
                      <SelectItem value="Conselho Consultivo">Conselho Consultivo</SelectItem>
                      <SelectItem value="Conselho Fiscal">Conselho Fiscal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Telefone / WhatsApp</Label>
                  <Input
                    name="phone"
                    defaultValue={editingRes?.phone}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>E-mail</Label>
                <Input
                  name="email"
                  type="email"
                  defaultValue={editingRes?.email}
                  placeholder="email@exemplo.com"
                />
              </div>
              {editingRes && (
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select name="status" defaultValue={editingRes.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="py-4 px-6 border-b bg-muted/20 flex flex-row flex-wrap items-center gap-4 space-y-0">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome, unidade ou e-mail..."
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCondo} onValueChange={setSelectedCondo}>
            <SelectTrigger className="w-[200px] bg-background">
              <SelectValue placeholder="Condomínio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Condomínios</SelectItem>
              {condos.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Filtrar por Perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Perfis</SelectItem>
              <SelectItem value="Proprietário">Proprietários</SelectItem>
              <SelectItem value="Locatário">Locatários</SelectItem>
              <SelectItem value="Morador">Moradores</SelectItem>
              <SelectItem value="Conselho Consultivo">Conselho Consultivo</SelectItem>
              <SelectItem value="Conselho Fiscal">Conselho Fiscal</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Nome & Perfil</TableHead>
                <TableHead>Condomínio / Unidade</TableHead>
                <TableHead>Contatos</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((res) => (
                <TableRow key={res.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="font-medium text-foreground">{res.name}</div>
                    <Badge
                      className={`mt-1 text-[10px] py-0 px-1.5 ${roleColors[res.role || 'Morador'] || roleColors['Morador']}`}
                    >
                      {res.role || 'Morador'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-primary">{res.condominios?.name || '-'}</div>
                    <div className="text-muted-foreground text-xs font-medium">{res.unit}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <span>{res.phone || '-'}</span>
                        {res.phone && (
                          <a
                            href={`https://wa.me/55${res.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-green-600 hover:text-green-700"
                            title="Chamar no WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      <div className="text-muted-foreground text-xs">{res.email || '-'}</div>
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
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem
                          className="cursor-pointer gap-2"
                          onClick={() => {
                            setEditingRes(res)
                            setOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4 text-muted-foreground" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                          onClick={() =>
                            handleStatusChange(res.id, res.status === 'Ativo' ? 'Inativo' : 'Ativo')
                          }
                        >
                          <PowerOff className="h-4 w-4" />{' '}
                          {res.status === 'Ativo' ? 'Inativar Morador' : 'Ativar Morador'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Nenhum morador encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
