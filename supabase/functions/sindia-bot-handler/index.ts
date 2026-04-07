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

    const { data: globalConfig } = await supabaseClient
      .from('sindia_configuracoes_globais')
      .select('*')
      .eq('id', 1)
      .single()

    const { data: moradores, error: moradorError } = await supabaseClient
      .from('moradores')
      .select(`
        id, 
        user_id, 
        condominio_id, 
        condominios (
          id, 
          name, 
          sindico_id,
          sindia_prompt,
          sindia_active,
          use_global_sindia_config,
          sindia_tone,
          sindia_response_length,
          sindia_delay_seconds
        )
      `)
      .or(`phone.eq.${phone},whatsapp.eq.${phone}`)
      .limit(1)

    if (moradorError) throw moradorError

    if (!moradores || moradores.length === 0) {
      const notFoundReply =
        'Olá! Sou SINDIA, assistente de síndico da ACDOMZ. Você não está cadastrado em nenhum de nossos condomínios. Por favor, entre em contato com o síndico do seu condomínio para realizar o cadastro.'

      await supabaseClient.from('conversas_sindia').insert({
        phone: phone,
        message: question,
        response: notFoundReply,
        is_unauthorized: true,
        status: 'respondido',
      })

      return new Response(JSON.stringify({ status: 'success', reply: notFoundReply }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const morador = moradores[0]
    const condominioId = morador.condominio_id
    const userId = morador.user_id

    let sindicoContact = '[email/telefone do síndico]'
    const condominioInfo = Array.isArray(morador.condominios)
      ? morador.condominios[0]
      : morador.condominios

    const useGlobal = condominioInfo?.use_global_sindia_config ?? true
    const isActive = useGlobal ? globalConfig?.sindia_active : condominioInfo?.sindia_active
    const tone = useGlobal ? globalConfig?.sindia_tone : condominioInfo?.sindia_tone
    const length = useGlobal
      ? globalConfig?.sindia_response_length
      : condominioInfo?.sindia_response_length
    const delay = useGlobal
      ? globalConfig?.sindia_delay_seconds
      : condominioInfo?.sindia_delay_seconds
    const customPrompt = useGlobal ? globalConfig?.sindia_prompt : condominioInfo?.sindia_prompt

    if (isActive === false) {
      return new Response(
        JSON.stringify({
          status: 'success',
          reply:
            'O atendimento automático da SINDIA está temporariamente desativado para este condomínio. Por favor, contate a administração.',
        }),
        {
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        },
      )
    }

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

    const { data: documentos } = await supabaseClient
      .from('documentos_condominio')
      .select('name, type, file_path')
      .eq('condominio_id', condominioId)

    const hasDocs = documentos && documentos.length > 0

    const basePrompt =
      customPrompt || 'Você é SINDIA. Responda APENAS baseado nos documentos fornecidos.'
    const instruction = `${basePrompt} Tom da conversa: ${tone}. Tamanho da resposta: ${length}. Se não encontrar a informação, responda: 'Não encontrei essa informação nos documentos. Vou consultar o síndico e retorno em breve. Contato: ${sindicoContact}'`

    let aiResponse = ''
    const lowerQuestion = question.toLowerCase()
    const fallbackResponse = `Não encontrei essa informação nos documentos. Vou consultar o síndico e retorno em breve. Contato: ${sindicoContact}`

    if (
      lowerQuestion.includes('regra') ||
      lowerQuestion.includes('horário') ||
      lowerQuestion.includes('piscina')
    ) {
      if (hasDocs)
        aiResponse = 'Com base no Regimento Interno, o horário de silêncio é das 22h às 08h.'
      else aiResponse = fallbackResponse
    } else if (lowerQuestion.includes('sindico') || lowerQuestion.includes('contato')) {
      aiResponse = `Você pode entrar em contato diretamente com o síndico através dos seguintes dados: ${sindicoContact}. Posso ajudar com mais alguma dúvida?`
    } else {
      aiResponse = fallbackResponse
    }

    if (delay && delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay * 1000))
    }

    await supabaseClient.from('conversas_sindia').insert({
      user_id: userId,
      condominio_id: condominioId,
      phone: phone,
      message: question,
      response: aiResponse,
      status: 'respondido',
      is_unauthorized: false,
    })

    return new Response(
      JSON.stringify({
        status: 'success',
        reply: aiResponse,
        _debug: { instruction, delay_used: delay },
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      },
    )
  } catch (err: any) {
    return new Response(JSON.stringify({ status: 'error', message: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
