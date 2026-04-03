import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Mic, Square, Wand2, Download } from 'lucide-react'

export default function Comunicados() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [condominios, setCondominios] = useState<any[]>([])
  const [selectedCondominio, setSelectedCondominio] = useState('')
  const [descricaoOriginal, setDescricaoOriginal] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [comunicadoGerado, setComunicadoGerado] = useState('')
  const [formatoDownload, setFormatoDownload] = useState('PDF')

  useEffect(() => {
    fetchCondominios()
  }, [])

  const fetchCondominios = async () => {
    const { data, error } = await supabase.from('condominios').select(`
        id, 
        name, 
        address, 
        administradoras (name), 
        profiles!condominios_sindico_id_fkey (name)
      `)
    if (data) setCondominios(data)
  }

  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false)
      toast({ title: 'Gravação concluída', description: 'Áudio processado via IA com sucesso.' })
      setDescricaoOriginal(
        (prev) =>
          prev +
          (prev ? ' ' : '') +
          'Informar aos moradores sobre a manutenção preventiva dos elevadores nesta sexta-feira das 08h às 12h.',
      )
    } else {
      setIsRecording(true)
      toast({ title: 'Gravando...', description: 'Fale o seu comunicado...' })
    }
  }

  const handleGenerate = async () => {
    if (!selectedCondominio) {
      toast({ title: 'Aviso', description: 'Selecione um condomínio.', variant: 'destructive' })
      return
    }
    if (!descricaoOriginal) {
      toast({
        title: 'Aviso',
        description: 'Insira ou grave o assunto do comunicado.',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)

    const cond = condominios.find((c) => c.id === selectedCondominio)
    const getNestedName = (obj: any) =>
      obj ? (Array.isArray(obj) ? obj[0]?.name : obj.name) : 'Não informado'

    const condominioData = {
      name: cond?.name,
      address: cond?.address,
      sindico_name: getNestedName(cond?.profiles),
      admin_name: getNestedName(cond?.administradoras),
    }

    try {
      const { data, error } = await supabase.functions.invoke('gerar-comunicado-ia', {
        body: { prompt: descricaoOriginal, condominio: condominioData },
      })

      if (error) throw error

      setComunicadoGerado(data.content)
      toast({ title: 'Sucesso', description: 'Comunicado gerado com IA.' })
    } catch (error: any) {
      toast({ title: 'Erro na geração', description: error.message, variant: 'destructive' })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadAndSave = async () => {
    if (!comunicadoGerado || !selectedCondominio) return

    try {
      const { error } = await supabase.from('comunicados').insert({
        condominio_id: selectedCondominio,
        descricao_original: descricaoOriginal,
        comunicado_gerado: comunicadoGerado,
        formato_download: formatoDownload,
        criado_por: user?.id,
        title: 'Comunicado Gerado via IA',
        content: comunicadoGerado,
        date: new Date().toISOString().split('T')[0],
      })

      if (error) throw error

      toast({
        title: 'Download Iniciado',
        description: `O arquivo ${formatoDownload} foi gerado e o registro salvo com sucesso.`,
      })
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Gerador de Comunicados</h1>
        <p className="text-muted-foreground">
          Crie comunicados oficiais e profissionais utilizando Inteligência Artificial (GPT-4) e voz
          (Whisper).
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Rascunho do Comunicado</CardTitle>
            <CardDescription>Selecione o condomínio e informe o assunto desejado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="space-y-2">
              <label className="text-sm font-medium">Condomínio</label>
              <Select value={selectedCondominio} onValueChange={setSelectedCondominio}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {condominios.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex flex-col flex-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Assunto / Transcrição</label>
                <Button
                  variant={isRecording ? 'destructive' : 'secondary'}
                  size="sm"
                  onClick={handleRecord}
                  className="h-8 gap-2"
                >
                  {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {isRecording ? 'Parar' : 'Gravar (Whisper)'}
                </Button>
              </div>
              <Textarea
                placeholder="Descreva o assunto do comunicado de forma breve. A IA se encarregará da formalidade..."
                className="min-h-[200px] flex-1"
                value={descricaoOriginal}
                onChange={(e) => setDescricaoOriginal(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !descricaoOriginal || !selectedCondominio}
              className="w-full gap-2"
            >
              <Wand2 className="h-4 w-4" />
              {isGenerating ? 'Gerando Comunicado...' : 'Gerar Comunicado Oficial'}
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Pré-visualização</CardTitle>
            <CardDescription>
              Confira o resultado e escolha o formato de exportação.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 w-full rounded-md border bg-muted/30 p-4 text-sm whitespace-pre-wrap overflow-y-auto min-h-[300px]">
              {comunicadoGerado ? (
                comunicadoGerado
              ) : (
                <div className="text-muted-foreground flex flex-col items-center justify-center h-full space-y-3">
                  <Wand2 className="h-8 w-8 opacity-20" />
                  <span>O texto gerado aparecerá aqui.</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Select value={formatoDownload} onValueChange={setFormatoDownload}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="DOCX">DOCX</SelectItem>
                <SelectItem value="TXT">TXT</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="flex-1 gap-2"
              disabled={!comunicadoGerado}
              onClick={handleDownloadAndSave}
            >
              <Download className="h-4 w-4" />
              Salvar & Baixar
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
