import { useState, useEffect } from 'react'
import { fornecedoresService, Fornecedor, Categoria } from '@/services/fornecedores'
import { Search, Plus, LayoutGrid, List as ListIcon, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import FornecedorSheet from './FornecedorSheet'

export default function FornecedoresTab() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards')
  const [editing, setEditing] = useState<Partial<Fornecedor> | null>(null)
  const [isSheetOpen, setSheetOpen] = useState(false)
  const [filterCat, setFilterCat] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const loadData = async () => {
    const [f, c] = await Promise.all([
      fornecedoresService.getFornecedores(),
      fornecedoresService.getCategorias(),
    ])
    setFornecedores(f)
    setCategorias(c)
  }
  useEffect(() => {
    loadData()
  }, [])

  const filtered = fornecedores.filter((f) => {
    if (
      search &&
      !f.razao_social.toLowerCase().includes(search.toLowerCase()) &&
      !f.nome_fantasia?.toLowerCase().includes(search.toLowerCase())
    )
      return false
    if (filterCat !== 'all' && !f.categorias?.some((c) => c.id === filterCat)) return false
    if (filterStatus !== 'all' && f.status !== filterStatus) return false
    return true
  })

  const openNew = () => {
    setEditing({})
    setSheetOpen(true)
  }
  const openEdit = (f: Fornecedor) => {
    setEditing(f)
    setSheetOpen(true)
  }

  const Tags = ({ cats }: { cats: Categoria[] }) => {
    const vis = cats.slice(0, 3)
    const hid = cats.slice(3)
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {vis.map((c) => (
          <Badge
            key={c.id}
            style={{ backgroundColor: c.cor }}
            className="text-white font-normal px-2 py-0.5 shadow-sm border-none"
          >
            {c.nome}
          </Badge>
        ))}
        {hid.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="px-2 py-0.5">
                +{hid.length}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {hid.map((c) => (
                <div key={c.id}>{c.nome}</div>
              ))}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-1 gap-2 w-full md:max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar fornecedor..."
              className="pl-8 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              {categorias.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="suspenso">Suspenso</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(v) => v && setViewMode(v as any)}
            className="bg-background border rounded-md p-1"
          >
            <ToggleGroupItem value="cards" aria-label="Cards">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Tabela">
              <ListIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button onClick={openNew}>
            <Plus className="mr-2 w-4 h-4" /> Novo Fornecedor
          </Button>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((f) => (
            <Card
              key={f.id}
              className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all group bg-card"
              onClick={() => openEdit(f)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                    {f.nome_fantasia || f.razao_social}
                  </CardTitle>
                  <Badge
                    variant={
                      f.status === 'ativo'
                        ? 'default'
                        : f.status === 'suspenso'
                          ? 'secondary'
                          : 'destructive'
                    }
                    className="capitalize"
                  >
                    {f.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground truncate" title={f.razao_social}>
                  {f.razao_social}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{f.avaliacao > 0 ? f.avaliacao : '-'}</span>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {f.contato_telefone || f.contato_email || 'Sem contato'}
                  </div>
                </div>
                <Tags cats={f.categorias || []} />
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Nenhum fornecedor encontrado.
            </div>
          )}
        </div>
      ) : (
        <div className="border rounded-md bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Categorias</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Avaliação</TableHead>
                <TableHead>Contato</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((f) => (
                <TableRow
                  key={f.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => openEdit(f)}
                >
                  <TableCell className="font-medium">
                    {f.nome_fantasia || f.razao_social}
                    <div className="text-xs text-muted-foreground font-normal">
                      {f.documento || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Tags cats={f.categorias || []} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {f.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{' '}
                      <span className="font-medium">{f.avaliacao || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {f.contato_telefone || f.contato_email || '-'}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum fornecedor encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {isSheetOpen && (
        <FornecedorSheet
          open={isSheetOpen}
          onOpenChange={setSheetOpen}
          fornecedor={editing}
          onSaved={loadData}
          categoriasDisponiveis={categorias}
        />
      )}
    </div>
  )
}
