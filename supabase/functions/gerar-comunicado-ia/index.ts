import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  
  try {
    const { prompt, condominio } = await req.json();

    const content = `[CARTA FORMAL]

Local: ${condominio?.address || 'Endereço não informado'}
Data: ${new Date().toLocaleDateString('pt-BR')}
Para: Moradores do Condomínio ${condominio?.name || 'Não informado'}

Prezados(as) Senhores(as),

Em atenção ao assunto: "${prompt}", servimo-nos do presente comunicado para informar que a administração, representada pelo síndico ${condominio?.sindico_name || 'responsável'}, está ciente e tomando todas as providências cabíveis.

Solicitamos a colaboração de todos para que as diretrizes do nosso regimento interno sejam plenamente respeitadas, visando sempre a segurança e o bem-estar coletivo.

Quaisquer dúvidas, a administração encontra-se à disposição.

Atenciosamente,

A Administração
ACDOMZ - Gestão de Condomínios`;

    return new Response(JSON.stringify({ status: "success", content }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
