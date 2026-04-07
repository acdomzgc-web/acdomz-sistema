import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Condominio } from './types'

export function ConfigTab({
  condominio,
  onUpdate,
}: {
  condominio: Condominio | null
  onUpdate: (c: Condominio) => void
}) {
  const { toast } = useToast()
  const [isActive, setIsActive] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (condominio) {
      setIsActive(condominio.sindia_active ?? true)
      setPrompt(
        condominio.sindia_prompt ||
          'Você é SINDIA, a assistente virtual inteligente da ACDOMZ. Responda de forma educada, formal e APENAS baseada nos documentos fornecidos do condomínio.',
      )
    }
  }, [condominio])

  const handleSave = async () => {
    if (!condominio) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('condominios')
        .update({ sindia_active: isActive, sindia_prompt: prompt })
        .eq('id', condominio.id)

      if (error) throw error
      onUpdate({ ...condominio, sindia_active: isActive, sindia_prompt: prompt })
      toast({ title: 'Sucesso', description: 'Configurações da SINDIA atualizadas.' })
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (!condominio) {
    return (
      <div className="p-8 text-center bg-muted/30 rounded-lg border border-dashed">
        <h3 className="text-lg font-medium">Selecione um Condomínio</h3>
        <p className="text-muted-foreground">
          Escolha um condomínio no filtro superior para gerenciar suas configurações do bot.
        </p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações da SINDIA - {condominio.name}</CardTitle>
        <CardDescription>
          Personalize o comportamento e o conhecimento da assistente virtual.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between border rounded-md p-4 bg-card">
          <div className="space-y-0.5">
            <Label className="text-base">Status do Bot</Label>
            <p className="text-sm text-muted-foreground">
              Habilitar ou desabilitar o atendimento automático para este condomínio.
            </p>
          </div>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>

        <div className="space-y-3 border rounded-md p-4 bg-card">
          <div className="space-y-0.5">
            <Label className="text-base">System Prompt (Instruções de IA)</Label>
            <p className="text-sm text-muted-foreground">
              Defina a personalidade, as regras de negócio e como a SINDIA deve se comportar nas
              interações com os moradores.
            </p>
          </div>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={8}
            className="font-mono text-sm"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
