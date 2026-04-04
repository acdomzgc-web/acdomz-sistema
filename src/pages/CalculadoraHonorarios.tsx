import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Save, Info, Calculator, CheckCircle2, ShieldAlert } from 'lucide-react'
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
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 animate-fade-in max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b pb-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
            <Calculator className="h-8 w-8 text-secondary" />
            Precificação de Honorários
          </h2>
          <p className="text-muted-foreground text-lg">
            Simule os honorários da base operacional utilizando as variáveis estratégicas 2026.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-lg border">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Modo de Cálculo</Label>
            <Select
              value={isAuto ? 'auto' : 'manual'}
              onValueChange={(val) => setIsAuto(val === 'auto')}
            >
              <SelectTrigger className="w-[180px] h-9 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Via Condomínio</SelectItem>
                <SelectItem value="manual">Simulação Livre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Condomínio Vínculo</Label>
            <Select value={selectedCondominioId} onValueChange={setSelectedCondominioId}>
              <SelectTrigger className="w-[220px] h-9 bg-background">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem vínculo</SelectItem>
                {condominios.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 space-y-8">
          <Card className="shadow-md border-primary/10 overflow-hidden">
            <div className="bg-primary/5 p-4 border-b flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-primary">Parâmetros Ativos</h3>
            </div>
            <CardContent className="p-6 space-y-8">
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-3 bg-muted/10 p-4 rounded-xl border border-muted">
                  <Label className="text-base text-foreground font-semibold">
                    Quantidade de Lotes
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    className="text-lg h-12 bg-background font-mono"
                    value={lotes}
                    disabled={isAuto && selectedCondominioId !== 'none'}
                    onChange={(e) => setLotes(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Valor aplicado em cascata baseada na tabela de escala.
                  </p>
                </div>

                <div className="space-y-3 bg-muted/10 p-4 rounded-xl border border-muted">
                  <Label className="text-base text-foreground font-semibold">
                    Trilha de Densidade
                  </Label>
                  <Select
                    value={densidadeId}
                    onValueChange={setDensidadeId}
                    disabled={isAuto && selectedCondominioId !== 'none'}
                  >
                    <SelectTrigger className="text-lg h-12 bg-background">
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
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Define o multiplicador e o limitador (teto) de proteção.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base text-foreground font-semibold">
                  Espaços de Área Comum
                </Label>
                <div className="flex gap-4 items-center">
                  <Input
                    type="number"
                    min={0}
                    className="w-32 text-lg h-12 text-center font-mono"
                    value={areasComuns}
                    disabled={isAuto && selectedCondominioId !== 'none'}
                    onChange={(e) => setAreasComuns(Number(e.target.value))}
                  />
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg flex-1 border">
                    <Info className="h-4 w-4 inline-block mr-2 text-secondary" />
                    Cada espaço adiciona {formatCurrency(VALOR_AREA_COMUM)} (10% do SMN).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <FaixasLotesTable />
            <DensidadeTable />
          </div>
        </div>

        <div className="lg:col-span-5">
          <Card className="sticky top-6 border-primary/20 shadow-xl overflow-hidden rounded-2xl">
            <div className="bg-primary p-6 text-primary-foreground text-center">
              <h3 className="text-lg font-medium opacity-90">Honorário Final Projetado</h3>
              <p className="text-5xl font-black mt-2 tracking-tight">
                {formatCurrency(calc.honorarioFinal)}
              </p>
              <p className="text-sm mt-3 opacity-80 font-mono">
                Por unidade: {formatCurrency(calc.honorarioFinal / (lotes || 1))}
              </p>
            </div>

            <CardContent className="p-6 space-y-6 bg-background">
              <div className="space-y-4 text-sm">
                <h4 className="font-semibold text-primary uppercase tracking-wider text-xs">
                  Composição do Técnico
                </h4>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Custo Fixo (2 SMN)</span>
                  <span className="font-mono font-medium">{formatCurrency(BASE_VALUE)}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Variável Lotes</span>
                  <span className="font-mono font-medium text-green-600">
                    +{formatCurrency(calc.variavelLotes)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Áreas Comuns</span>
                  <span className="font-mono font-medium text-green-600">
                    +{formatCurrency(calc.valorAreasComuns)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 bg-muted/30 px-2 rounded">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-mono font-bold">{formatCurrency(calc.subtotal)}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Multiplicador Densidade</span>
                  <span className="font-mono font-medium text-secondary">
                    x {calc.densidade.multiplier.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="font-semibold text-primary">Honorário Técnico</span>
                  <span className="font-mono font-bold text-primary">
                    {formatCurrency(calc.honorarioTecnico)}
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 space-y-3">
                <h4 className="font-semibold text-amber-800 uppercase tracking-wider text-xs flex items-center gap-2">
                  <ShieldAlert className="h-3 w-3" /> Trava Comercial (Teto)
                </h4>
                <div className="flex justify-between items-center text-sm text-amber-900/80">
                  <span>Limite da Trilha ({calc.densidade.name}):</span>
                  <span className="font-mono font-medium">{formatCurrency(calc.teto_total)}</span>
                </div>
                {calc.honorarioTecnico > calc.teto_total && calc.teto_total > 0 && (
                  <p className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                    Valor limitado pelo teto da densidade para viabilidade comercial.
                  </p>
                )}
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                size="lg"
                className="w-full text-base font-semibold shadow-md hover:shadow-lg transition-all"
              >
                <Save className="mr-2 h-5 w-5" />
                Salvar Simulação
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
