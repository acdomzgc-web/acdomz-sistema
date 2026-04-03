import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { phone, question } = await req.json()

    if (!phone || !question) {
      throw new Error('O número de telefone (phone) e a pergunta (question) são obrigatórios.')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    // 1. Validar se o número está cadastrado na tabela moradores
    const { data: moradores, error: moradorError } = await supabaseClient
      .from('moradores')
      .select(`
        id, 
        user_id, 
        condominio_id, 
        condominios (
          id, 
          name, 
          sindico_id
        )
      `)
      .or(`phone.eq.${phone},whatsapp.eq.${phone}`)
      .limit(1)

    if (moradorError) throw moradorError

    // Se não encontrado
    if (!moradores || moradores.length === 0) {
      const notFoundReply =
        'Olá! Sou SINDIA, assistente de síndico da ACDOMZ. Você não está cadastrado em nenhum de nossos condomínios. Por favor, entre em contato com o síndico do seu condomínio para realizar o cadastro.'
      return new Response(JSON.stringify({ status: 'success', reply: notFoundReply }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const morador = moradores[0]
    const condominioId = morador.condominio_id
    const userId = morador.user_id

    // Buscar informações do síndico
    let sindicoContact = '[email/telefone do síndico]'
    const condominioInfo = Array.isArray(morador.condominios)
      ? morador.condominios[0]
      : morador.condominios

    if (condominioInfo?.sindico_id) {
      const { data: sindico } = await supabaseClient
        .from('profiles')
        .select('name, email')
        .eq('id', condominioInfo.sindico_id)
        .single()

      if (sindico) {
        sindicoContact = `${sindico.name} (${sindico.email})`
      }
    }

    // 2. Recuperar documentos do condomínio
    const { data: documentos, error: docsError } = await supabaseClient
      .from('documentos_condominio')
      .select('name, type, file_path')
      .eq('condominio_id', condominioId)

    if (docsError) throw docsError

    const hasDocs = documentos && documentos.length > 0

    // 3. Preparar instrução para o Gemini
    const instruction = `Você é SINDIA. Responda APENAS baseado nos documentos fornecidos. Se não encontrar, responda: 'Não encontrei essa informação nos documentos. Vou consultar o síndico e retorno em breve. Contato: ${sindicoContact}'`

    // Mocking the Gemini response based on context
    let aiResponse = ''
    const lowerQuestion = question.toLowerCase()
    const fallbackResponse = `Não encontrei essa informação nos documentos. Vou consultar o síndico e retorno em breve. Contato: ${sindicoContact}`

    if (
      lowerQuestion.includes('regra') ||
      lowerQuestion.includes('horário') ||
      lowerQuestion.includes('piscina') ||
      lowerQuestion.includes('mudança') ||
      lowerQuestion.includes('barulho') ||
      lowerQuestion.includes('festa')
    ) {
      if (hasDocs) {
        aiResponse =
          'Com base no Regimento Interno, o horário de silêncio é das 22h às 08h. Mudanças e uso do salão de festas devem ser agendados com antecedência junto à administração.'
      } else {
        aiResponse = fallbackResponse
      }
    } else if (
      lowerQuestion.includes('financeiro') ||
      lowerQuestion.includes('taxa') ||
      lowerQuestion.includes('boleto') ||
      lowerQuestion.includes('pagamento')
    ) {
      if (hasDocs) {
        aiResponse =
          'Conforme as informações financeiras recentes, os boletos da taxa condominial são enviados mensalmente por e-mail. O vencimento padrão ocorre no dia 10 de cada mês.'
      } else {
        aiResponse = fallbackResponse
      }
    } else if (
      lowerQuestion.includes('sindico') ||
      lowerQuestion.includes('síndico') ||
      lowerQuestion.includes('contato') ||
      lowerQuestion.includes('falar com')
    ) {
      aiResponse = `Você pode entrar em contato diretamente com o síndico através dos seguintes dados: ${sindicoContact}. Posso ajudar com mais alguma dúvida sobre o condomínio?`
    } else {
      aiResponse = fallbackResponse
    }

    // 4. Registrar conversa em conversas_sindia
    const { error: insertError } = await supabaseClient.from('conversas_sindia').insert({
      user_id: userId,
      condominio_id: condominioId,
      message: question,
      response: aiResponse,
    })

    if (insertError) {
      console.error('Erro ao registrar conversa:', insertError)
    }

    // 5. Retornar resposta ao WhatsApp
    return new Response(
      JSON.stringify({
        status: 'success',
        reply: aiResponse,
        _debug: { instruction, docsFound: documentos?.length || 0 },
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      },
    )
  } catch (err: any) {
    console.error('Erro no processamento do webhook SINDIA:', err)
    return new Response(JSON.stringify({ status: 'error', message: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
