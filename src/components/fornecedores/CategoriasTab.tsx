import { useState, useEffect } from 'react'
import { fornecedoresService, Categoria } from '@/services/fornecedores'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Edit2, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'

export default function CategoriasTab() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [editing, setEditing] = useState<Partial<Categoria> | null>(null)

  const load = async () => {
    try {
      const data = await fornecedoresService.getCategorias()
      setCategorias(data)
    } catch (e) {
      toast.error('Erro ao carregar categorias')
    }
  }
  useEffect(() => {
    load()
  }, [])

  const handleSave = async () => {
    if (!editing?.nome) return toast.error('Nome é obrigatório')
    try {
      await fornecedoresService.saveCategoria({
        ...editing,
        cor: editing.cor || '#cccccc',
      } as Categoria)
      toast.success('Categoria salva')
      setEditing(null)
      load()
    } catch (e) {
      toast.error('Erro ao salvar')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta categoria?')) return
    try {
      await fornecedoresService.deleteCategoria(id)
      toast.success('Excluída com sucesso')
      load()
    } catch (e) {
      toast.error('Erro ao excluir')
    }
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Categorias Cadastradas</h3>
          <Button onClick={() => setEditing({ cor: '#3b82f6' })} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Nova Categoria
          </Button>
        </div>
        <div className="grid gap-3">
          {categorias.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-card hover:border-primary/50 transition-all hover:shadow-sm group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full shadow-inner border border-black/10"
                  style={{ backgroundColor: c.cor }}
                />
                <span className="font-medium">{c.nome}</span>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" onClick={() => setEditing(c)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {categorias.length === 0 && (
            <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg">
              Nenhuma categoria cadastrada.
            </div>
          )}
        </div>
      </div>
      <div className="border rounded-lg p-6 h-fit bg-card sticky top-4 shadow-sm">
        <h3 className="font-semibold mb-6 text-lg">
          {editing?.id ? 'Editar Categoria' : 'Nova Categoria'}
        </h3>
        {editing ? (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <Label>Nome da Categoria</Label>
              <Input
                value={editing.nome || ''}
                onChange={(e) => setEditing({ ...editing, nome: e.target.value })}
                placeholder="Ex: Limpeza"
              />
            </div>
            <div className="space-y-3">
              <Label>Cor de Identificação</Label>
              <div className="flex gap-4 items-center p-3 border rounded-md bg-muted/30">
                <Input
                  type="color"
                  className="w-12 h-12 p-1 cursor-pointer rounded border-0 bg-transparent"
                  value={editing.cor || '#cccccc'}
                  onChange={(e) => setEditing({ ...editing, cor: e.target.value })}
                />
                <div className="flex-1 flex flex-col gap-2">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Preview da Tag
                  </span>
                  <Badge
                    style={{ backgroundColor: editing.cor || '#cccccc' }}
                    className="text-white w-fit px-3 py-1 shadow-sm font-normal border-none"
                  >
                    {editing.nome || 'Nome da Categoria'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex-1 shadow-sm">
                Salvar Categoria
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-3 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
              <Plus className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm px-4">
              Selecione uma categoria para editar ou clique no botão para criar uma nova.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
