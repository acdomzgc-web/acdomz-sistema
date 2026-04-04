import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Search, ShieldAlert, Plus, Edit, Trash2, UserPlus } from 'lucide-react'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Sindicos() {
  const [sindicos, setSindicos] = useState<any[]>([])
  const [condominios, setCondominios] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [open, setOpen] = useState(false)
  const [editingSindico, setEditingSindico] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const loadData = async () => {
    // Busca síndicos
    const { data: profs } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'sindico')
      .order('name')

    // Busca os condomínios para mapear onde atuam
    const { data: conds } = await supabase.from('condominios').select('id, name, sindico_id')

    if (profs) {
      // Mapeia os condomínios de cada síndico
      const mapped = profs.map((s) => ({
        ...s,
        atuacao: conds?.filter((c) => c.sindico_id === s.id) || [],
      }))
      setSindicos(mapped)
    }

    if (conds) {
      setCondominios(conds)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    const formData = new FormData(e.currentTarget)

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const telefone = formData.get('telefone') as string
    const condominio_id = formData.get('condominio_id') as string

    try {
      let userId = editingSindico?.id

      // 1. Criar ou Atualizar Usuário via Edge Function
      if (editingSindico) {
        const payload: any = { action: 'update', userId, name, email, role: 'sindico' }
        if (password) payload.password = password

        const { error } = await supabase.functions.invoke('manage-users', { body: payload })
        if (error) throw error

        // Atualiza telefone no profile
        await supabase.from('profiles').update({ telefone }).eq('id', userId)
        toast({ title: 'Síndico atualizado com sucesso!' })
      } else {
        if (!password) throw new Error('A senha é obrigatória para novos cadastros.')
        const { data, error } = await supabase.functions.invoke('manage-users', {
          body: { action: 'create', email, password, name, role: 'sindico' },
        })
        if (error) throw error
        userId = data?.user?.id
        if (userId) {
          await supabase.from('profiles').update({ telefone }).eq('id', userId)
        }
        toast({ title: 'Síndico cadastrado com sucesso!' })
      }

      // 2. Vincular ao condomínio se selecionado
      if (condominio_id && userId) {
        await supabase.from('condominios').update({ sindico_id: userId }).eq('id', condominio_id)
      }

      setOpen(false)
      loadData()
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.message || 'Falha ao salvar síndico',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este síndico e seu acesso ao sistema?')) return

    try {
      const { error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'delete', userId: id },
      })
      if (error) throw error

      // Remover vínculo de condomínios
      await supabase.from('condominios').update({ sindico_id: null }).eq('sindico_id', id)

      toast({ title: 'Síndico excluído com sucesso!' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' })
    }
  }

  const filtered = sindicos.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Síndicos Profissionais</h1>
          <p className="text-muted-foreground">
            Gerencie o cadastro e acesso de síndicos profissionais do ecossistema.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/configuracoes">
            <Button variant="outline" className="gap-2">
              <UserPlus className="h-4 w-4" /> Painel de Perfis
            </Button>
          </Link>
          <Button
            className="gap-2"
            onClick={() => {
              setEditingSindico(null)
              setOpen(true)
            }}
          >
            <Plus className="h-4 w-4" /> Cadastrar Síndico
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingSindico ? 'Editar Síndico' : 'Cadastrar Novo Síndico'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nome Completo</Label>
                <Input name="name" defaultValue={editingSindico?.name} required />
              </div>
              <div className="grid gap-2">
                <Label>E-mail de Acesso</Label>
                <Input name="email" type="email" defaultValue={editingSindico?.email} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Telefone</Label>
                  <Input name="telefone" defaultValue={editingSindico?.telefone} />
                </div>
                <div className="grid gap-2">
                  <Label>
                    Senha{' '}
                    {editingSindico && (
                      <span className="text-xs text-muted-foreground">(Opcional)</span>
                    )}
                  </Label>
                  <Input
                    name="password"
                    type="password"
                    required={!editingSindico}
                    placeholder={editingSindico ? 'Deixe em branco para manter' : 'Senha segura'}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Atribuir ao Condomínio</Label>
                <Select name="condominio_id">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione (Opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {condominios.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  O síndico terá acesso a todos os dados do condomínio selecionado.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar Síndico'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="py-4 px-6 border-b bg-muted/20">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome ou e-mail..."
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
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Condomínios Ativos</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sindico) => (
                <TableRow key={sindico.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-primary">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-secondary" /> {sindico.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {sindico.telefone || 'Sem telefone'}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{sindico.email}</TableCell>
                  <TableCell>
                    {sindico.atuacao.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {sindico.atuacao.map((c: any) => (
                          <Badge key={c.id} variant="secondary" className="text-xs">
                            {c.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Nenhum vínculo</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className="border-green-500 text-green-700 bg-green-50"
                    >
                      Acesso Ativo
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingSindico(sindico)
                        setOpen(true)
                      }}
                      className="h-8 w-8 text-secondary hover:text-secondary-foreground hover:bg-secondary/20"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(sindico.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/20 ml-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum síndico profissional encontrado.
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
