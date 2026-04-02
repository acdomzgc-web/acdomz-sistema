import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { condominio_id, period, context } = await req.json()

    // Mock OpenAI GPT-4 technical report generation
    const parecer = `Parecer Financeiro Automatizado (Período: ${period})\n\nCom base na Demonstração do Resultado do Exercício (DRE) e no Fluxo de Caixa do período selecionado, observamos que o condomínio apresenta um quadro financeiro estável e sob controle. As receitas arrecadadas superaram as despesas operacionais em uma margem saudável, garantindo a liquidez necessária para honrar os compromissos de curto prazo e manter o fundo de reserva alimentado.\n\nApesar do cenário positivo, a taxa de inadimplência requer um monitoramento contínuo. Sugerimos a adoção de medidas amigáveis de cobrança e negociação para os residentes das unidades em atraso, a fim de mitigar impactos no planejamento de longo prazo.\n\nConclusão: O condomínio encontra-se em conformidade com as diretrizes orçamentárias estabelecidas.`

    return new Response(
      JSON.stringify({
        status: 'success',
        content: parecer,
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      },
    )
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
