import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Condominio } from './types'
import { cn } from '@/lib/utils'

export function ConfigTab({
  condominio,
  globalConfig,
  onUpdate,
  onUpdateGlobal,
}: {
  condominio: Condominio | null
  globalConfig: any
  onUpdate: (c: Condominio) => void
  onUpdateGlobal: (g: any) => void
}) {
  const { toast } = useToast()
  const isGlobal = !condominio

  const [useGlobal, setUseGlobal] = useState(true)
  const [active, setActive] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [tone, setTone] = useState('amigavel')
  const [length, setLength] = useState('curta')
  const [delay, setDelay] = useState(2)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isGlobal && globalConfig) {
      setActive(globalConfig.sindia_active ?? true)
      setPrompt(globalConfig.sindia_prompt || '')
      setTone(globalConfig.sindia_tone || 'amigavel')
      setLength(globalConfig.sindia_response_length || 'curta')
      setDelay(globalConfig.sindia_delay_seconds ?? 2)
    } else if (condominio) {
      setUseGlobal(condominio.use_global_sindia_config ?? true)
      setActive(condominio.sindia_active ?? true)
      setPrompt(condominio.sindia_prompt || '')
      setTone(condominio.sindia_tone || 'amigavel')
      setLength(condominio.sindia_response_length || 'curta')
      setDelay(condominio.sindia_delay_seconds ?? 2)
    }
  }, [condominio, globalConfig, isGlobal])

  const displayActive = isGlobal ? active : useGlobal ? globalConfig?.sindia_active : active
  const displayPrompt = isGlobal ? prompt : useGlobal ? globalConfig?.sindia_prompt : prompt
  const displayTone = isGlobal ? tone : useGlobal ? globalConfig?.sindia_tone : tone
  const displayLength = isGlobal
    ? length
    : useGlobal
      ? globalConfig?.sindia_response_length
      : length
  const displayDelay = isGlobal ? delay : useGlobal ? globalConfig?.sindia_delay_seconds : delay
  const disabledForm = !isGlobal && useGlobal

  const handleSave = async () => {
    setSaving(true)
    try {
      if (isGlobal) {
        const updates = {
          sindia_active: active,
          sindia_prompt: prompt,
          sindia_tone: tone,
          sindia_response_length: length,
          sindia_delay_seconds: delay,
        }
        const { error } = await supabase
          .from('sindia_configuracoes_globais')
          .update(updates)
          .eq('id', 1)
        if (error) throw error
        onUpdateGlobal({ ...globalConfig, ...updates })
      } else {
        if (!condominio) return
        const updates = {
          use_global_sindia_config: useGlobal,
          sindia_active: active,
          sindia_prompt: prompt,
          sindia_tone: tone,
          sindia_response_length: length,
          sindia_delay_seconds: delay,
        }
        const { error } = await supabase.from('condominios').update(updates).eq('id', condominio.id)
        if (error) throw error
        onUpdate({ ...condominio, ...updates })
      }
      toast({ title: 'Sucesso', description: 'Configurações atualizadas.' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isGlobal ? 'Configurações Globais' : `Configurações - ${condominio?.name}`}
        </CardTitle>
        <CardDescription>
          {isGlobal
            ? 'Defina o comportamento padrão da SINDIA para todos os condomínios.'
            : 'Personalize o comportamento da SINDIA apenas para este condomínio.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isGlobal && (
          <div className="flex items-center justify-between border rounded-md p-4 bg-primary/5">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold text-primary">
                Usar Configurações Globais
              </Label>
              <p className="text-sm text-muted-foreground">
                Se desativado, este condomínio terá configurações exclusivas.
              </p>
            </div>
            <Switch checked={useGlobal} onCheckedChange={setUseGlobal} />
          </div>
        )}

        <div
          className={cn(
            'space-y-6 transition-opacity',
            disabledForm && 'opacity-50 pointer-events-none',
          )}
        >
          <div className="flex items-center justify-between border rounded-md p-4 bg-card">
            <div className="space-y-0.5">
              <Label className="text-base">Atendimento Automático (SINDIA)</Label>
              <p className="text-sm text-muted-foreground">Ativar ou desativar o bot.</p>
            </div>
            <Switch checked={displayActive} onCheckedChange={setActive} disabled={disabledForm} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Tom da Conversa</Label>
              <Select
                value={displayTone || 'amigavel'}
                onValueChange={setTone}
                disabled={disabledForm}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal e Polido</SelectItem>
                  <SelectItem value="amigavel">Amigável e Empático</SelectItem>
                  <SelectItem value="tecnico">Técnico e Direto</SelectItem>
                  <SelectItem value="descontraido">Descontraído</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tamanho da Resposta</Label>
              <Select
                value={displayLength || 'curta'}
                onValueChange={setLength}
                disabled={disabledForm}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="curta">Curta e Objetiva</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="elaborada">Elaborada e Detalhada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3 border rounded-md p-4 bg-card">
            <div className="flex justify-between items-center">
              <Label>Tempo de Resposta (Delay: {displayDelay ?? 2}s)</Label>
            </div>
            <Slider
              value={[displayDelay ?? 2]}
              onValueChange={(v) => setDelay(v[0])}
              max={10}
              step={1}
              disabled={disabledForm}
            />
            <p className="text-xs text-muted-foreground">
              Tempo que a SINDIA vai simular "digitando" antes de enviar a resposta.
            </p>
          </div>

          <div className="space-y-2 border rounded-md p-4 bg-card">
            <Label className="text-base">System Prompt (Regras de Ouro)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Instruções absolutas que a IA deve seguir. Base para a personalidade.
            </p>
            <Textarea
              value={displayPrompt || ''}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              className="font-mono text-sm"
              disabled={disabledForm}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
