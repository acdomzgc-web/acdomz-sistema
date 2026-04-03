import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

type PerfilAcesso = {
  id: string
  nome: string
  funcao: string
  descricao: string
  created_at: string
}

export function PerfisAcessoTab() {
  const [perfis, setPerfis] = useState<PerfilAcesso[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentPerfil, setCurrentPerfil] = useState<Partial<PerfilAcesso>>({})
  const [perfilToDelete, setPerfilToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchPerfis = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('perfis_acesso' as any)
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      console.error(error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os perfis.',
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
    if (!currentPerfil.nome || !currentPerfil.funcao) {
      toast({
        title: 'Atenção',
        description: 'Preencha os campos obrigatórios.',
        variant: 'destructive',
      })
      return
    }

    const payload = {
      nome: currentPerfil.nome,
      funcao: currentPerfil.funcao,
      descricao: currentPerfil.descricao || '',
    }

    if (currentPerfil.id) {
      const { error } = await supabase
        .from('perfis_acesso' as any)
        .update(payload)
        .eq('id', currentPerfil.id)
      if (error) {
        toast({ title: 'Erro', description: 'Erro ao atualizar perfil.', variant: 'destructive' })
      } else {
        toast({ title: 'Sucesso', description: 'Perfil atualizado com sucesso.' })
        setIsDialogOpen(false)
        fetchPerfis()
      }
    } else {
      const { error } = await supabase.from('perfis_acesso' as any).insert([payload])
      if (error) {
        toast({
          title: 'Erro',
          description: 'Erro ao criar perfil. O nome pode já existir.',
          variant: 'destructive',
        })
      } else {
        toast({ title: 'Sucesso', description: 'Perfil criado com sucesso.' })
        setIsDialogOpen(false)
        fetchPerfis()
      }
    }
  }

  const handleDelete = async () => {
    if (!perfilToDelete) return
    const { error } = await supabase
      .from('perfis_acesso' as any)
      .delete()
      .eq('id', perfilToDelete)
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao excluir perfil.', variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Perfil excluído com sucesso.' })
      fetchPerfis()
    }
    setIsDeleteDialogOpen(false)
    setPerfilToDelete(null)
  }

  const openEdit = (perfil: PerfilAcesso) => {
    setCurrentPerfil(perfil)
    setIsDialogOpen(true)
  }

  const openNew = () => {
    setCurrentPerfil({ funcao: 'admin' })
    setIsDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Perfis de Acesso</CardTitle>
          <CardDescription>
            Gerencie os perfis de acesso e suas respectivas funções no sistema.
          </CardDescription>
        </div>
        <Button onClick={openNew} className="flex gap-2">
          <Plus className="h-4 w-4" /> Novo Perfil
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center p-8 text-muted-foreground">Carregando perfis...</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Perfil</TableHead>
                  <TableHead>Função Base</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {perfis.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Nenhum perfil cadastrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  perfis.map((perfil) => (
                    <TableRow key={perfil.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        {perfil.nome}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={perfil.funcao === 'admin' ? 'default' : 'secondary'}
                          className="capitalize"
                        >
                          {perfil.funcao === 'admin' ? 'Administrador' : 'Síndico'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[300px] truncate">
                        {perfil.descricao}
                      </TableCell>
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
            <DialogTitle>{currentPerfil.id ? 'Editar Perfil' : 'Novo Perfil'}</DialogTitle>
            <DialogDescription>
              Defina o nome do perfil e sua função base no sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Perfil</Label>
              <Input
                id="nome"
                placeholder="Ex: Assistente Financeiro"
                value={currentPerfil.nome || ''}
                onChange={(e) => setCurrentPerfil({ ...currentPerfil, nome: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="funcao">Função Base</Label>
              <Select
                value={currentPerfil.funcao || 'admin'}
                onValueChange={(value) => setCurrentPerfil({ ...currentPerfil, funcao: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a função" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador (Acesso Total)</SelectItem>
                  <SelectItem value="sindico">Síndico (Acesso Condominial)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição (Opcional)</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva as responsabilidades deste perfil..."
                value={currentPerfil.descricao || ''}
                onChange={(e) => setCurrentPerfil({ ...currentPerfil, descricao: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir perfil?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O perfil será permanentemente removido do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
