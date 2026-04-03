import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function Administradoras() {
  const [searchTerm, setSearchTerm] = useState('')
  const [admins, setAdmins] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<any>(null)
  const { toast } = useToast()

  const loadData = async () => {
    const { data } = await supabase.from('administradoras').select('*').order('name')
    if (data) setAdmins(data)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setEditingAdmin(null)
    }
  }

  const handleEdit = (admin: any) => {
    setEditingAdmin(admin)
    setOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const payload = {
      name: formData.get('name') as string,
      cnpj: formData.get('cnpj') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
    }

    if (editingAdmin) {
      const { error } = await supabase
        .from('administradoras')
        .update(payload)
        .eq('id', editingAdmin.id)

      if (error) {
        toast({ title: 'Erro ao atualizar administradora', variant: 'destructive' })
        return
      }
      toast({ title: 'Administradora atualizada com sucesso!' })
    } else {
      const { error } = await supabase.from('administradoras').insert(payload)

      if (error) {
        toast({ title: 'Erro ao cadastrar administradora', variant: 'destructive' })
        return
      }
      toast({ title: 'Administradora cadastrada com sucesso!' })
    }

    setOpen(false)
    setEditingAdmin(null)
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta administradora?')) return

    const { error } = await supabase.from('administradoras').delete().eq('id', id)
    if (error) {
      toast({ title: 'Erro ao excluir administradora', variant: 'destructive' })
      return
    }

    toast({ title: 'Administradora excluída com sucesso!' })
    loadData()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Administradoras</h1>
          <p className="text-muted-foreground">Gerencie as empresas parceiras do portal.</p>
        </div>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setEditingAdmin(null)}>
              <Plus className="h-4 w-4" /> Nova Administradora
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingAdmin ? 'Editar Administradora' : 'Cadastrar Administradora'}
              </DialogTitle>
            </DialogHeader>
            <form key={editingAdmin?.id || 'new'} onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Razão Social / Nome Fantasia</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingAdmin?.name}
                    required
                    placeholder="Ex: Gestão Prime Ltda"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      name="cnpj"
                      defaultValue={editingAdmin?.cnpj}
                      required
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      defaultValue={editingAdmin?.phone}
                      placeholder="(00) 0000-0000"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail Comercial</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={editingAdmin?.email}
                    placeholder="contato@empresa.com"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">Endereço Completo</Label>
                  <Input
                    id="address"
                    name="address"
                    defaultValue={editingAdmin?.address}
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingAdmin ? 'Salvar Alterações' : 'Salvar Cadastro'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="py-4 px-6 border-b bg-muted/20">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome ou CNPJ..."
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[250px]">Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Contatos</TableHead>
                <TableHead className="hidden md:table-cell">Endereço</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins
                .filter(
                  (a) =>
                    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    a.cnpj.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .map((admin) => (
                  <TableRow key={admin.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-primary">{admin.name}</TableCell>
                    <TableCell className="text-muted-foreground">{admin.cnpj}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{admin.email}</p>
                        <p className="text-muted-foreground">{admin.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {admin.address}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(admin)}
                          className="h-8 w-8 text-secondary hover:text-secondary-foreground hover:bg-secondary/20"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(admin.id)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
