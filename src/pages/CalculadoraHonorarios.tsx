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
  TIPOS,
  DENSIDADES,
  calcularLotes,
  formatCurrency,
  FaixasLotesTable,
  DensidadeTable,
} from '@/components/calculadora/utils'

export default function CalculadoraHonorarios() {
  const { toast } = useToast()
  const [condominios, setCondominios] = useState<{ id: string; name: string }[]>([])
  const [selectedCondominioId, setSelectedCondominioId] = useState<string>('none')
  const [tipoId, setTipoId] = useState<string>('horizontal')
  const [lotes, setLotes] = useState<number>(50)
  const [densidadeId, setDensidadeId] = useState<string>('media')
  const [areasComuns, setAreasComuns] = useState<number>(2)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    supabase
      .from('condominios')
      .select('id, name')
      .order('name')
      .then(({ data }) => {
        if (data) setCondominios(data)
      })
  }, [])

  const calc = useMemo(() => {
    const tipo = TIPOS.find((x) => x.id === tipoId) || TIPOS[0]
    const densidade = DENSIDADES.find((x) => x.id === densidadeId) || DENSIDADES[0]

    const variavelLotes = calcularLotes(lotes || 0)
    const valorAreasComuns = (areasComuns || 0) * VALOR_AREA_COMUM
    const subtotal = BASE_VALUE + variavelLotes + valorAreasComuns
    const honorarioTecnico = subtotal * densidade.multiplier

    const limitadoTeto = Math.min(honorarioTecnico, tipo.teto)
    const honorarioFinal = Math.max(BASE_VALUE, limitadoTeto)

    return {
      tipo,
      densidade,
      variavelLotes,
      valorAreasComuns,
      subtotal,
      honorarioTecnico,
      teto: tipo.teto,
      limitadoTeto,
      honorarioFinal,
    }
  }, [tipoId, lotes, densidadeId, areasComuns])

  const handleSave = async () => {
    setIsSaving(true)
    const cid = selectedCondominioId === 'none' ? null : selectedCondominioId
    const { error } = await supabase.from('calculos_honorarios').insert({
      condominio_id: cid,
      calculated_value: calc.honorarioFinal,
      details: {
        tipoId,
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
              <div className="space-y-2">
                <Label>Condomínio (Opcional)</Label>
                <Select value={selectedCondominioId} onValueChange={setSelectedCondominioId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um condomínio..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum (Apenas Simulação)</SelectItem>
                    {condominios.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Tipo de Condomínio</Label>
                <Select value={tipoId} onValueChange={setTipoId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground flex items-center">
                  <Info className="h-3 w-3 mr-1" /> Define o teto máximo (trilha) aplicável aos
                  honorários.
                </p>
              </div>
              <Separator />
              <div className="grid sm:grid-cols-2 gap-6 items-start">
                <div className="space-y-2">
                  <Label>Número de Lotes / Unidades</Label>
                  <Input
                    type="number"
                    min={0}
                    value={lotes}
                    onChange={(e) => setLotes(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Variável baseada na quantidade. O valor é aplicado em cascata conforme a faixa.
                  </p>
                </div>
                <FaixasLotesTable />
              </div>
              <Separator />
              <div className="grid sm:grid-cols-2 gap-6 items-start">
                <div className="space-y-2">
                  <Label>Categoria de Densidade</Label>
                  <Select value={densidadeId} onValueChange={setDensidadeId}>
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
                    Multiplicador aplicado sobre o subtotal (Base + Lotes + Áreas), refletindo o uso
                    da infraestrutura.
                  </p>
                </div>
                <DensidadeTable />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Áreas Comuns (Qtd.)</Label>
                <Input
                  type="number"
                  min={0}
                  value={areasComuns}
                  onChange={(e) => setAreasComuns(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground flex items-center">
                  <Info className="h-3 w-3 mr-1" /> Cada área (piscina, salão, etc) adiciona{' '}
                  {formatCurrency(VALOR_AREA_COMUM)} à base.
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
                  <p>= [2 SMN + Var. Lotes + (Áreas × 162,10)] × Dens.</p>
                  <p>
                    = [{formatCurrency(BASE_VALUE)} + {formatCurrency(calc.variavelLotes)} +{' '}
                    {formatCurrency(calc.valorAreasComuns)}] × {calc.densidade.multiplier}
                  </p>
                  <p>
                    = [{formatCurrency(calc.subtotal)}] × {calc.densidade.multiplier}
                  </p>
                  <p className="pt-1 mt-1 border-t border-border/50 text-foreground font-bold">
                    = {formatCurrency(calc.honorarioTecnico)}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3 text-sm">
                <p className="font-semibold text-muted-foreground">2. Limites (Teto por Trilha)</p>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Teto ({calc.tipo.name}):</span>
                  <span className="font-mono text-destructive">{formatCurrency(calc.teto)}</span>
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
                  max(2 SMN, Técnico limitado ao teto)
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
