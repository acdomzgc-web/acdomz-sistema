import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'

type Profile = {
  id: string
  name: string
  email: string
  role: string
  created_at: string
}

export function PerfisAcessoTab() {
  const [perfis, setPerfis] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentPerfil, setCurrentPerfil] = useState<Partial<Profile & { password?: string }>>({})
  const [perfilToDelete, setPerfilToDelete] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const fetchPerfis = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários do sistema.',
        variant: 'destructive',
      })
    } else {
      setPerfis(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPerfis()
  }, [])

  const handleSave = async () => {
    if (!currentPerfil.name || !currentPerfil.email || !currentPerfil.role) {
      toast({
        title: 'Atenção',
        description: 'Preencha todos os campos obrigatórios (Nome, E-mail e Nível de Acesso).',
        variant: 'destructive',
      })
      return
    }

    if (!currentPerfil.id && !currentPerfil.password) {
      toast({
        title: 'Atenção',
        description: 'A senha é obrigatória para novos usuários.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)

    try {
      const payload = {
        action: currentPerfil.id ? 'update' : 'create',
        userId: currentPerfil.id,
        email: currentPerfil.email,
        password: currentPerfil.password,
        name: currentPerfil.name,
        role: currentPerfil.role,
      }

      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: payload,
      })

      if (error || data?.error) {
        throw new Error(
          data?.error || error?.message || 'Erro ao sincronizar usuário com o Supabase',
        )
      }

      toast({
        title: 'Sucesso',
        description: 'Usuário salvo com sucesso e sincronizado no Supabase.',
      })
      setIsDialogOpen(false)
      fetchPerfis()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!perfilToDelete) return
    setIsSaving(true)
    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'delete', userId: perfilToDelete },
      })

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || 'Erro ao excluir usuário no Supabase')
      }

      toast({ title: 'Sucesso', description: 'Usuário excluído com sucesso do sistema.' })
      fetchPerfis()
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setIsSaving(false)
      setIsDeleteDialogOpen(false)
      setPerfilToDelete(null)
    }
  }

  const openEdit = (perfil: Profile) => {
    setCurrentPerfil({ ...perfil, password: '' })
    setIsDialogOpen(true)
  }

  const openNew = () => {
    setCurrentPerfil({ role: 'morador', name: '', email: '', password: '' })
    setIsDialogOpen(true)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default">Administrador</Badge>
      case 'sindico':
        return <Badge variant="secondary">Síndico</Badge>
      default:
        return <Badge variant="outline">Morador</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Perfis de Acesso (Usuários)</CardTitle>
          <CardDescription>
            Crie novos usuários, defina e-mail, senha e atribua o nível de permissão no sistema.
          </CardDescription>
        </div>
        <Button onClick={openNew} className="flex gap-2">
          <Plus className="h-4 w-4" /> Novo Usuário
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-8 text-muted-foreground">
            Carregando usuários...
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Nível de Acesso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {perfis.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Nenhum usuário cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  perfis.map((perfil) => (
                    <TableRow key={perfil.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        {perfil.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{perfil.email}</TableCell>
                      <TableCell>{getRoleBadge(perfil.role)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(perfil)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setPerfilToDelete(perfil.id)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentPerfil.id ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            <DialogDescription>
              {currentPerfil.id
                ? 'Atualize os dados do usuário. Preencha a senha apenas se quiser alterá-la.'
                : 'Cadastre um novo usuário com e-mail e senha. Ele será sincronizado automaticamente no Supabase Auth.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                placeholder="Ex: João da Silva"
                value={currentPerfil.name || ''}
                onChange={(e) => setCurrentPerfil({ ...currentPerfil, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="Ex: joao@email.com"
                value={currentPerfil.email || ''}
                onChange={(e) => setCurrentPerfil({ ...currentPerfil, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha {currentPerfil.id && '(Opcional)'}</Label>
              <Input
                id="password"
                type="password"
                placeholder={
                  currentPerfil.id ? 'Deixe em branco para manter a atual' : 'Mínimo 6 caracteres'
                }
                value={currentPerfil.password || ''}
                onChange={(e) => setCurrentPerfil({ ...currentPerfil, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Nível de Acesso</Label>
              <Select
                value={currentPerfil.role || 'morador'}
                onValueChange={(value) => setCurrentPerfil({ ...currentPerfil, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador (Acesso Total)</SelectItem>
                  <SelectItem value="sindico">Síndico (Acesso Condominial)</SelectItem>
                  <SelectItem value="morador">Morador (Acesso Restrito)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação excluirá o usuário definitivamente do sistema e revogará seu acesso. Não
              poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSaving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSaving ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
