import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Plus, Edit, Search, Building } from 'lucide-react'
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
      admin_id: (formData.get('admin_id') as string) || null,
      sindico_id: (formData.get('sindico_id') as string) || null,
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

  const filteredCondos = condos.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cnpj?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Condomínios</h1>
          <p className="text-muted-foreground">Gestão do portfólio de propriedades.</p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(isOpen) => {
            setOpen(isOpen)
            if (!isOpen) setEditingCondo(null)
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setEditingCondo(null)}>
              <Plus className="h-4 w-4" /> Novo Condomínio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-secondary" />{' '}
                {editingCondo ? 'Editar Condomínio' : 'Cadastrar Condomínio'}
              </DialogTitle>
            </DialogHeader>
            <form key={editingCondo?.id || 'new'} onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-primary border-b pb-1">
                    Informações Básicas
                  </h3>
                  <div className="grid gap-2">
                    <Label htmlFor="c-name">Nome do Condomínio</Label>
                    <Input
                      id="c-name"
                      name="name"
                      defaultValue={editingCondo?.name}
                      required
                      placeholder="Ex: Residencial Alpha"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                      <Label htmlFor="c-units">Total de Unidades</Label>
                      <Input
                        id="c-units"
                        name="units"
                        type="number"
                        defaultValue={editingCondo?.total_units}
                        placeholder="Ex: 120"
                      />
                    </div>
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

                <div className="space-y-4 mt-2">
                  <h3 className="text-sm font-semibold text-primary border-b pb-1">
                    Relacionamentos
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Administradora</Label>
                      <Select name="admin_id" defaultValue={editingCondo?.admin_id || ''}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
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
                      <Select name="sindico_id" defaultValue={editingCondo?.sindico_id || ''}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um morador/síndico..." />
                        </SelectTrigger>
                        <SelectContent>
                          {profiles.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} ({p.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
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
                <TableHead>Condomínio</TableHead>
                <TableHead>Administradora</TableHead>
                <TableHead>Síndico</TableHead>
                <TableHead className="text-center">Unidades</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCondos.map((condo) => (
                <TableRow key={condo.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="font-medium text-primary">{condo.name}</div>
                    <div className="text-xs text-muted-foreground">{condo.address}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-background">
                      {condo.administradoras?.name || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {condo.profiles?.name || '-'}
                  </TableCell>
                  <TableCell className="text-center font-medium">{condo.total_units}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingCondo(condo)
                          setOpen(true)
                        }}
                        className="h-8 w-8 text-secondary hover:text-secondary-foreground hover:bg-secondary/20"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCondos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
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
