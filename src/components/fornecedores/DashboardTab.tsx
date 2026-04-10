import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Settings, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { fornecedoresService, Fornecedor, Categoria } from '@/services/fornecedores'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const METRICS: any = {
  total: { label: 'Total de Fornecedores', val: (f: any[]) => f.length },
  ativos: { label: 'Ativos', val: (f: any[]) => f.filter((x) => x.status === 'ativo').length },
  inativos: {
    label: 'Inativos/Suspensos',
    val: (f: any[]) => f.filter((x) => x.status !== 'ativo').length,
  },
  categorias: { label: 'Categorias Cadastradas', val: (_: any, c: any[]) => c.length },
  sem_contrato: {
    label: 'Sem Contrato',
    val: (f: any[]) => f.filter((x) => !x.contrato_assinado).length,
  },
  media: {
    label: 'Média Avaliação',
    val: (f: any[]) => {
      const r = f.filter((x) => x.avaliacao > 0)
      return r.length
        ? (r.reduce((a: number, b: any) => a + b.avaliacao, 0) / r.length).toFixed(1)
        : '0.0'
    },
  },
}
const DEFAULT_PREFS = Object.keys(METRICS).map((id) => ({
  id,
  type: id,
  title: METRICS[id].label,
  visible: true,
}))

export default function DashboardTab() {
  const { user } = useAuth()
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [prefs, setPrefs] = useState<any[]>(DEFAULT_PREFS)
  const [isSettingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      fornecedoresService.getFornecedores(),
      fornecedoresService.getCategorias(),
      user ? fornecedoresService.getPrefs(user.id) : Promise.resolve(null),
    ]).then(([f, c, p]) => {
      setFornecedores(f)
      setCategorias(c)
      if (p && p.length) {
        const merged = p.map((pref: any) => ({
          ...DEFAULT_PREFS.find((dp) => dp.id === pref.id),
          ...pref,
        }))
        const missing = DEFAULT_PREFS.filter((dp) => !merged.find((m: any) => m.id === dp.id))
        setPrefs([...merged, ...missing])
      }
    })
  }, [user])

  const savePrefs = async (newPrefs: any[]) => {
    setPrefs(newPrefs)
    if (user) await fornecedoresService.savePrefs(user.id, newPrefs)
  }

  const toggleVisible = (idx: number) => {
    const newPrefs = [...prefs]
    newPrefs[idx].visible = !newPrefs[idx].visible
    savePrefs(newPrefs)
  }

  const move = (idx: number, dir: number) => {
    if (idx + dir < 0 || idx + dir >= prefs.length) return
    const newPrefs = [...prefs]
    ;[newPrefs[idx], newPrefs[idx + dir]] = [newPrefs[idx + dir], newPrefs[idx]]
    savePrefs(newPrefs)
  }

  const pieData = categorias
    .map((c) => ({
      name: c.nome,
      value: fornecedores.filter((f) => f.categorias?.some((cat) => cat.id === c.id)).length,
      fill: c.cor,
    }))
    .filter((d) => d.value > 0)

  const barData = [1, 2, 3, 4, 5].map((star) => ({
    nota: `${star} Estrela${star > 1 ? 's' : ''}`,
    quantidade: fornecedores.filter((f) => f.avaliacao === star).length,
  }))

  const visibleCards = prefs.filter((p) => p.visible)

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isSettingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" /> Personalizar Cards
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Personalizar Métricas</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 mt-4">
              {prefs.map((p, i) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 border rounded bg-card hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => toggleVisible(i)}>
                      {p.visible ? (
                        <Eye className="w-4 h-4 text-primary" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                    <span
                      className={p.visible ? 'font-medium' : 'text-muted-foreground line-through'}
                    >
                      {p.title}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={i === prefs.length - 1}
                      onClick={() => move(i, 1)}
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {visibleCards.map((p) => (
          <Card key={p.id} className="bg-card shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">{p.title}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-bold">
                {METRICS[p.type]?.val(fornecedores, categorias)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Fornecedores por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {pieData.length > 0 ? (
              <ChartContainer config={{ value: { label: 'Quantidade' } }} className="w-full h-full">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                  >
                    {pieData.map((e, i) => (
                      <Cell key={i} fill={e.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Sem dados
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Distribuição por Avaliação</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer
              config={{ quantidade: { label: 'Fornecedores', color: 'hsl(var(--primary))' } }}
              className="w-full h-full"
            >
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="nota" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="quantidade" fill="var(--color-quantidade)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
