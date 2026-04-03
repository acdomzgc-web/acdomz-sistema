import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  Bot,
  FileCheck,
  Printer,
  Loader2,
  Download,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function ParecerFinanceiro() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [role, setRole] = useState('morador')
  const [condos, setCondos] = useState<any[]>([])
  const [selectedCondo, setSelectedCondo] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
  const [parecerIA, setParecerIA] = useState('')
  const [loading, setLoading] = useState(false)
  const [healthStatus, setHealthStatus] = useState<'saudavel' | 'alerta' | 'critico' | null>(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setRole(data?.role || 'morador')
        if (data?.role === 'admin') {
          supabase
            .from('condominios')
            .select('*')
            .then((res) => {
              setCondos(res.data || [])
              if (res.data?.[0]) setSelectedCondo(res.data[0].id)
            })
        } else if (data?.role === 'sindico') {
          supabase
            .from('condominios')
            .select('*')
            .eq('sindico_id', user.id)
            .then((res) => {
              setCondos(res.data || [])
              if (res.data?.[0]) setSelectedCondo(res.data[0].id)
            })
        }
      })
  }, [user])

  const gerarParecerIA = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('gerar-parecer-ia', {
        body: { condominio_id: selectedCondo, period: selectedDate },
      })
      if (error) throw error

      setParecerIA(data.content)

      const contentLower = data.content.toLowerCase()
      if (contentLower.includes('crític') || contentLower.includes('déficit')) {
        setHealthStatus('critico')
      } else if (
        contentLower.includes('atenção') ||
        contentLower.includes('alerta') ||
        contentLower.includes('inadimplência na casa')
      ) {
        setHealthStatus('alerta')
      } else {
        setHealthStatus('saudavel')
      }

      toast({ title: 'Sucesso', description: 'Parecer gerado analisando pastas e documentos.' })
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!parecerIA) return
    const element = document.createElement('a')
    const file = new Blob([parecerIA], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `Parecer_${selectedCondo}_${selectedDate}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto print:p-8 print:absolute print:inset-0 print:bg-white print:z-50 print:block animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-[#1a3a52]">Parecer Financeiro</h1>
          <p className="text-muted-foreground">
            Busca inteligente de documentos para geração de parecer.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-[160px]"
          />
          {role === 'admin' && (
            <Select value={selectedCondo} onValueChange={setSelectedCondo}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Condomínio" />
              </SelectTrigger>
              <SelectContent>
                {condos.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" /> Imprimir
          </Button>
        </div>
      </div>

      <div className="hidden print:flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold text-[#1a3a52]">ACDOMZ - Parecer Financeiro</h1>
        <div className="text-sm text-muted-foreground text-right">
          <p>Condomínio ID: {selectedCondo}</p>
          <p>Data Referência: {selectedDate}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="print:hidden border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Índice de Saúde Financeira</CardTitle>
          </CardHeader>
          <CardContent>
            {!healthStatus && (
              <p className="text-sm text-muted-foreground">
                Gere o parecer via IA para que o sistema analise os documentos e determine a saúde
                do condomínio.
              </p>
            )}
            {healthStatus === 'saudavel' && (
              <div className="flex items-center text-green-600 font-semibold text-lg">
                <CheckCircle className="mr-2 h-6 w-6" /> Saudável - Finanças em dia e operações
                sustentáveis
              </div>
            )}
            {healthStatus === 'alerta' && (
              <div className="flex items-center text-amber-500 font-semibold text-lg">
                <AlertTriangle className="mr-2 h-6 w-6" /> Alerta - Requer atenção ao fluxo ou taxas
                de inadimplência
              </div>
            )}
            {healthStatus === 'critico' && (
              <div className="flex items-center text-red-600 font-semibold text-lg">
                <XCircle className="mr-2 h-6 w-6" /> Crítico - Alerta máximo para déficit financeiro
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="print:shadow-none print:border-none">
          <CardHeader className="print:px-0 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileCheck className="w-5 h-5 print:hidden" /> Análise Técnica e Conclusão
            </CardTitle>
            {parecerIA && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="print:hidden gap-2"
              >
                <Download className="w-4 h-4" /> Baixar Parecer
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4 print:px-0">
            <div className="bg-muted/30 print:bg-white print:border print:border-gray-200 p-6 rounded-md min-h-[300px] whitespace-pre-wrap text-sm text-foreground leading-relaxed">
              {parecerIA ||
                'O parecer formatado (Posição Financeira, Desempenho e Orçamento, Inadimplência, Conclusão) será gerado aqui com base nos documentos da data selecionada.'}
            </div>
            <Button
              onClick={gerarParecerIA}
              disabled={loading || !selectedCondo}
              className="w-full print:hidden"
              size="lg"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Bot className="w-5 h-5 mr-2" />
              )}
              {loading ? 'Analisando documentos...' : 'Gerar Parecer Completo com IA (GPT-4)'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
