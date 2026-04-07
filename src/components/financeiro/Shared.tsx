import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Settings2 } from 'lucide-react'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function FinanceiroCharts({ data, color }: { data: any[]; color: string }) {
  const [viewTypeRec, setViewTypeRec] = useState<'pie' | 'bar'>('pie')
  const [viewTypeCat, setViewTypeCat] = useState<'pie' | 'bar'>('pie')

  const recData = [
    {
      name: 'Recorrente',
      value: data.filter((d) => d.is_recurrent).reduce((a, b) => a + Number(b.amount), 0),
    },
    {
      name: 'Pontual',
      value: data.filter((d) => !d.is_recurrent).reduce((a, b) => a + Number(b.amount), 0),
    },
  ]

  const catMap = data.reduce(
    (acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount)
      return acc
    },
    {} as Record<string, number>,
  )
  const catData = Object.keys(catMap).map((k) => ({ name: k, value: catMap[k] }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <Card className="shadow-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/10 border-b">
          <CardTitle className="text-sm font-semibold text-primary">
            Recorrente vs Pontual
          </CardTitle>
          <Select value={viewTypeRec} onValueChange={(v: any) => setViewTypeRec(v)}>
            <SelectTrigger className="w-[100px] h-8 text-xs bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pie">Pizza</SelectItem>
              <SelectItem value="bar">Barras</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="h-[250px] p-4">
          <ChartContainer config={{ value: { label: 'Valor' } }} className="h-full w-full">
            {viewTypeRec === 'pie' ? (
              <PieChart>
                <Pie
                  data={recData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {recData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            ) : (
              <BarChart data={recData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            )}
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/10 border-b">
          <CardTitle className="text-sm font-semibold text-primary">Por Categoria</CardTitle>
          <Select value={viewTypeCat} onValueChange={(v: any) => setViewTypeCat(v)}>
            <SelectTrigger className="w-[100px] h-8 text-xs bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pie">Pizza</SelectItem>
              <SelectItem value="bar">Barras</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="h-[250px] p-4">
          <ChartContainer config={{ value: { label: 'Valor' } }} className="h-full w-full">
            {viewTypeCat === 'pie' ? (
              <PieChart>
                <Pie
                  data={catData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                >
                  {catData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            ) : (
              <BarChart data={catData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            )}
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export function CategoriasDialog({ type, onUpdate }: { type: string; onUpdate: () => void }) {
  const [open, setOpen] = useState(false)
  const [cats, setCats] = useState<any[]>([])
  const [newCat, setNewCat] = useState('')

  const load = async () => {
    const { data } = await supabase
      .from('categorias_financeiras')
      .select('*')
      .eq('type', type)
      .order('name')
    if (data) setCats(data)
  }
  useEffect(() => {
    if (open) load()
  }, [open])

  const handleAdd = async () => {
    if (!newCat) return
    await supabase.from('categorias_financeiras').insert({ name: newCat, type })
    setNewCat('')
    load()
    onUpdate()
  }

  const handleDel = async (id: string) => {
    await supabase.from('categorias_financeiras').delete().eq('id', id)
    load()
    onUpdate()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Gerenciar Categorias" className="shrink-0">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Categorias de {type === 'receita' ? 'Receitas' : 'Despesas'}</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mb-4">
          <Input
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="Nova categoria..."
          />
          <Button onClick={handleAdd}>Add</Button>
        </div>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {cats.map((c) => (
            <div key={c.id} className="flex justify-between items-center p-2 border rounded">
              <span className="text-sm font-medium">{c.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDel(c.id)}
                className="h-6 w-6 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {cats.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma categoria encontrada.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
