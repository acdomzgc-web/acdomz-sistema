import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Save, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  BASE_VALUE,
  VALOR_AREA_COMUM,
  DENSIDADES,
  calcularLotes,
  formatCurrency,
  FaixasLotesTable,
  DensidadeTable,
} from '@/components/calculadora/utils'

export default function CalculadoraHonorarios() {
  const { toast } = useToast()
  const [condominios, setCondominios] = useState<any[]>([])
  const [selectedCondominioId, setSelectedCondominioId] = useState<string>('none')
  const [lotes, setLotes] = useState<number>(50)
  const [densidadeId, setDensidadeId] = useState<string>('medium')
  const [areasComuns, setAreasComuns] = useState<number>(2)
  const [isSaving, setIsSaving] = useState(false)
  const [isAuto, setIsAuto] = useState<boolean>(true)

  useEffect(() => {
    supabase
      .from('condominios')
      .select('*')
      .order('name')
      .then(({ data }) => {
        if (data) setCondominios(data)
      })
  }, [])

  useEffect(() => {
    if (isAuto && selectedCondominioId !== 'none') {
      const condo = condominios.find((c) => c.id === selectedCondominioId)
      if (condo) {
        setLotes(condo.total_units || 0)
        setDensidadeId(condo.calc_densidade_id || 'medium')
        setAreasComuns(condo.calc_areas_comuns || 0)
      }
    }
  }, [isAuto, selectedCondominioId, condominios])

  const calc = useMemo(() => {
    const densidade = DENSIDADES.find((x) => x.id === densidadeId) || DENSIDADES[1]

    const variavelLotes = calcularLotes(lotes || 0)
    const valorAreasComuns = (areasComuns || 0) * VALOR_AREA_COMUM
    const subtotal = BASE_VALUE + variavelLotes + valorAreasComuns
    const honorarioTecnico = subtotal * densidade.multiplier

    const teto_total = (lotes || 0) * densidade.teto_por_lote
    const limitadoTeto = teto_total > 0 ? Math.min(honorarioTecnico, teto_total) : honorarioTecnico
    const honorarioFinal = Math.max(BASE_VALUE, limitadoTeto)

    return {
      densidade,
      variavelLotes,
      valorAreasComuns,
      subtotal,
      honorarioTecnico,
      teto_total,
      limitadoTeto,
      honorarioFinal,
    }
  }, [lotes, densidadeId, areasComuns])

  const handleSave = async () => {
    setIsSaving(true)
    const cid = selectedCondominioId === 'none' ? null : selectedCondominioId
    const { error } = await supabase.from('calculos_honorarios').insert({
      condominio_id: cid,
      calculated_value: calc.honorarioFinal,
      details: {
        lotes,
        densidadeId,
        areasComuns,
        breakdown: { base: BASE_VALUE, ...calc },
      },
    })
    setIsSaving(false)
    if (error)
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    else
      toast({
        title: 'Cálculo Salvo',
        description: 'O cálculo de honorários foi registrado com sucesso.',
      })
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Calculadora de Honorários</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Parâmetros do Cálculo</CardTitle>
              <CardDescription>
                Preencha os dados abaixo para simular os honorários do condomínio.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2 flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full sm:flex-1 space-y-2">
                  <Label>Modo de Cálculo</Label>
                  <Select
                    value={isAuto ? 'auto' : 'manual'}
                    onValueChange={(val) => setIsAuto(val === 'auto')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Automático (Extrai dados do Condomínio)</SelectItem>
                      <SelectItem value="manual">Manual (Simulação Livre)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full sm:flex-1 space-y-2">
                  <Label>Condomínio Referência</Label>
                  <Select value={selectedCondominioId} onValueChange={setSelectedCondominioId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um condomínio..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {condominios.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="grid sm:grid-cols-2 gap-6 items-start">
                <div className="space-y-2">
                  <Label>Número de Lotes / Unidades</Label>
                  <Input
                    type="number"
                    min={0}
                    value={lotes}
                    disabled={isAuto && selectedCondominioId !== 'none'}
                    onChange={(e) => setLotes(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Variável baseada na quantidade. O valor é aplicado em cascata conforme a faixa
                    refinada.
                  </p>
                </div>
                <FaixasLotesTable />
              </div>
              <Separator />
              <div className="grid sm:grid-cols-2 gap-6 items-start">
                <div className="space-y-2">
                  <Label>Trilha de Densidade</Label>
                  <Select
                    value={densidadeId}
                    onValueChange={setDensidadeId}
                    disabled={isAuto && selectedCondominioId !== 'none'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DENSIDADES.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Multiplicador aplicado sobre o subtotal (Base + Lotes + Áreas) e define o teto
                    máximo comercial por lote.
                  </p>
                </div>
                <DensidadeTable />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Áreas Comuns (Qtd. Espaços)</Label>
                <Input
                  type="number"
                  min={0}
                  value={areasComuns}
                  disabled={isAuto && selectedCondominioId !== 'none'}
                  onChange={(e) => setAreasComuns(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground flex items-center">
                  <Info className="h-3 w-3 mr-1" /> Cada espaço operacional (piscina, salão, quadra)
                  adiciona {formatCurrency(VALOR_AREA_COMUM)} (10% do SMN) à base.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-5">
          <Card className="sticky top-6 border-primary/20 shadow-md">
            <CardHeader className="bg-primary/5 border-b pb-4">
              <CardTitle className="text-xl">Resumo do Cálculo</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-3 text-sm">
                <p className="font-semibold text-muted-foreground">1. Honorário Técnico</p>
                <div className="font-mono bg-muted/50 p-3 rounded-md text-xs space-y-1">
                  <p>= [2 SMN + Var. Lotes + (Áreas × 10% SMN)] × Densidade</p>
                  <p>
                    = [{formatCurrency(BASE_VALUE)} + {formatCurrency(calc.variavelLotes)} +{' '}
                    {formatCurrency(calc.valorAreasComuns)}] ×{' '}
                    {calc.densidade.multiplier.toFixed(2)}x
                  </p>
                  <p>
                    = [{formatCurrency(calc.subtotal)}] × {calc.densidade.multiplier.toFixed(2)}x
                  </p>
                  <p className="pt-1 mt-1 border-t border-border/50 text-foreground font-bold">
                    = {formatCurrency(calc.honorarioTecnico)}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3 text-sm">
                <p className="font-semibold text-muted-foreground">
                  2. Limites Estratégicos (Teto)
                </p>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Teto por Lote ({calc.densidade.name}):</span>
                  <span className="font-mono">{formatCurrency(calc.densidade.teto_por_lote)}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Teto Total ({lotes} lotes):</span>
                  <span className="font-mono text-destructive">
                    {formatCurrency(calc.teto_total)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Valor Limitado ao Teto:</span>
                  <span className="font-mono font-medium">{formatCurrency(calc.limitadoTeto)}</span>
                </div>
              </div>
              <Separator />
              <div className="space-y-3 text-sm">
                <p className="font-semibold text-primary">3. Honorário Final</p>
                <p className="text-xs text-muted-foreground">
                  max(Valor Fixo Base, Técnico limitado ao teto)
                </p>
                <div className="p-4 bg-primary text-primary-foreground rounded-lg flex items-center justify-between shadow-sm">
                  <span className="font-medium">Total Mensal</span>
                  <span className="text-2xl font-black tracking-tight">
                    {formatCurrency(calc.honorarioFinal)}
                  </span>
                </div>
              </div>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full h-12 text-base shadow-sm"
              >
                <Save className="mr-2 h-5 w-5" />
                Salvar Cálculo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
