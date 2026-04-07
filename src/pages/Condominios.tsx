import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Search, Building, Trash2 } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

export default function Condominios() {
  const [condos, setCondos] = useState<any[]>([])
  const [admins, setAdmins] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [editingCondo, setEditingCondo] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formTipo, setFormTipo] = useState<string>('horizontal')
  const { toast } = useToast()

  const loadData = async () => {
    const { data } = await supabase
      .from('condominios')
      .select('*, administradoras(name), profiles:sindico_id(name)')
      .order('name')
    if (data) setCondos(data)
  }

  useEffect(() => {
    loadData()
    supabase
      .from('administradoras')
      .select('*')
      .order('name')
      .then((res) => setAdmins(res.data || []))
    supabase
      .from('profiles')
      .select('*')
      .in('role', ['sindico', 'morador'])
      .order('name')
      .then((res) => setProfiles(res.data || []))
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const payload = {
      name: formData.get('name') as string,
      cnpj: formData.get('cnpj') as string,
      address: formData.get('address') as string,
      total_units: parseInt(formData.get('units') as string) || 0,
      admin_id:
        formData.get('admin_id') === 'none' ? null : (formData.get('admin_id') as string) || null,
      sindico_id:
        formData.get('sindico_id') === 'none'
          ? null
          : (formData.get('sindico_id') as string) || null,
      calc_densidade_id: (formData.get('calc_densidade_id') as string) || 'medium',
      calc_areas_comuns: parseInt(formData.get('calc_areas_comuns') as string) || 0,
      tipo: formTipo,
      ocupacao: (formData.get('ocupacao') as string) || 'residencial',
    }

    if (editingCondo) {
      const { error } = await supabase.from('condominios').update(payload).eq('id', editingCondo.id)
      if (error) {
        toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
        return
      }
      toast({ title: 'Condomínio atualizado com sucesso!' })
    } else {
      const { error } = await supabase.from('condominios').insert(payload)
      if (error) {
        toast({ title: 'Erro ao cadastrar', description: error.message, variant: 'destructive' })
        return
      }
      toast({ title: 'Condomínio salvo com sucesso!' })
    }

    setOpen(false)
    setEditingCondo(null)
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Deseja realmente excluir este condomínio? Todos os dados vinculados serão perdidos.',
      )
    )
      return

    try {
      await supabase.from('calculos_honorarios').delete().eq('condominio_id', id)
      await supabase.from('comunicados').delete().eq('condominio_id', id)
      await supabase.from('conversas_sindia').delete().eq('condominio_id', id)
      await supabase.from('documentos_condominio').delete().eq('condominio_id', id)
      await supabase.from('financeiro_condominio').delete().eq('condominio_id', id)
      await supabase.from('moradores').delete().eq('condominio_id', id)
      await supabase.from('parecer_financeiro').delete().eq('condominio_id', id)
      await supabase.from('receitas_acdomz').delete().eq('condominio_id', id)

      const { error } = await supabase.from('condominios').delete().eq('id', id)
      if (error) throw error

      toast({ title: 'Condomínio excluído com sucesso!' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' })
    }
  }

  const filteredCondos = condos.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cnpj?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleOpenEdit = (condo: any) => {
    setEditingCondo(condo)
    setFormTipo(condo?.tipo || 'horizontal')
    setOpen(true)
  }

  const handleOpenNew = () => {
    setEditingCondo(null)
    setFormTipo('horizontal')
    setOpen(true)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Condomínios</h1>
          <p className="text-muted-foreground">Gestão do portfólio de propriedades e parâmetros.</p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(isOpen) => {
            setOpen(isOpen)
            if (!isOpen) setEditingCondo(null)
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={handleOpenNew}>
              <Plus className="h-4 w-4" /> Novo Condomínio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[650px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-secondary" />{' '}
                {editingCondo ? 'Editar Condomínio' : 'Cadastrar Condomínio'}
              </DialogTitle>
            </DialogHeader>
            <form key={editingCondo?.id || 'new'} onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-primary border-b pb-1">
                    Informações Básicas
                  </h3>
                  <div className="grid gap-2">
                    <Label htmlFor="c-name">
                      Nome do Condomínio <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="c-name"
                      name="name"
                      defaultValue={editingCondo?.name}
                      required
                      placeholder="Ex: Residencial Alpha"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="c-cnpj">CNPJ</Label>
                      <Input
                        id="c-cnpj"
                        name="cnpj"
                        defaultValue={editingCondo?.cnpj}
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="c-address">Endereço Completo</Label>
                      <Input
                        id="c-address"
                        name="address"
                        defaultValue={editingCondo?.address}
                        placeholder="Rua, Número, Bairro, Cidade - UF"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mt-2">
                  <h3 className="text-sm font-semibold text-primary border-b pb-1">
                    Tipologia e Características (Cálculo)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label>
                        Tipo <span className="text-destructive">*</span>
                      </Label>
                      <Select value={formTipo} onValueChange={setFormTipo} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="horizontal">Horizontal (Lotes)</SelectItem>
                          <SelectItem value="vertical">Vertical (Torres/Unidades)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Ocupação</Label>
                      <Select
                        name="ocupacao"
                        defaultValue={editingCondo?.ocupacao || 'residencial'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residencial">Residencial</SelectItem>
                          <SelectItem value="comercial">Comercial</SelectItem>
                          <SelectItem value="misto">Misto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="c-units">
                        {formTipo === 'vertical' ? 'Qtd. de Unidades' : 'Qtd. de Lotes'}{' '}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="c-units"
                        name="units"
                        type="number"
                        required
                        min="1"
                        defaultValue={editingCondo?.total_units}
                        placeholder="Ex: 120"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mt-2">
                  <h3 className="text-sm font-semibold text-primary border-b pb-1">
                    Parâmetros Específicos (Calculadora de Honorários)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Trilha de Densidade (Metragem Média)</Label>
                      <Select
                        name="calc_densidade_id"
                        defaultValue={editingCondo?.calc_densidade_id || 'medium'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="starter">STARTER (até 250m²)</SelectItem>
                          <SelectItem value="medium">MEDIUM (251m² a 500m²)</SelectItem>
                          <SelectItem value="premium">PREMIUM (501m² a 1000m²)</SelectItem>
                          <SelectItem value="exclusive">EXCLUSIVE (acima de 1000m²)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Áreas Comuns (Qtd. Espaços/Lazer)</Label>
                      <Input
                        name="calc_areas_comuns"
                        type="number"
                        min="0"
                        defaultValue={editingCondo?.calc_areas_comuns || 0}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mt-2">
                  <h3 className="text-sm font-semibold text-primary border-b pb-1">
                    Relacionamentos Administrativos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Administradora Parceira</Label>
                      <Select name="admin_id" defaultValue={editingCondo?.admin_id || 'none'}>
                        <SelectTrigger>
                          <SelectValue placeholder="Nenhuma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhuma</SelectItem>
                          {admins.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Síndico Atual</Label>
                      <Select name="sindico_id" defaultValue={editingCondo?.sindico_id || 'none'}>
                        <SelectTrigger>
                          <SelectValue placeholder="Nenhum" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {profiles.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Condomínio</Button>
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
              placeholder="Buscar condomínios..."
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
                <TableHead>Condomínio / Endereço</TableHead>
                <TableHead>Administradora</TableHead>
                <TableHead>Síndico</TableHead>
                <TableHead className="text-center">Tipo</TableHead>
                <TableHead className="text-center">Tamanho</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCondos.map((condo) => (
                <TableRow key={condo.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="font-medium text-primary">{condo.name}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {condo.address || 'S/ Endereço'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-background font-normal">
                      {condo.administradoras?.name || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {condo.profiles?.name || '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="capitalize text-[10px]">
                      {condo.tipo || 'Horizontal'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {condo.total_units}{' '}
                    <span className="text-xs text-muted-foreground font-normal">
                      {condo.tipo === 'vertical' ? 'un' : 'lts'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(condo)}
                        className="h-8 w-8 text-secondary hover:text-secondary-foreground hover:bg-secondary/20"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(condo.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCondos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Nenhum condomínio encontrado.
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
