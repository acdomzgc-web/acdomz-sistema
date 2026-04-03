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

    const content = `COMUNICADO OFICIAL

Condomínio: ${condominio?.name || 'Não informado'}
Endereço: ${condominio?.address || 'Não informado'}
Síndico: ${condominio?.sindico_name || 'Não informado'}
Administradora: ${condominio?.admin_name || 'Não informada'}
Data: ${new Date().toLocaleDateString('pt-BR')}

Prezados moradores,

${prompt ? `Em atenção ao tema: "${prompt}", informamos que as medidas necessárias estão sendo tomadas conforme as diretrizes do nosso regimento interno.` : 'Informamos que estamos realizando melhorias contínuas em nosso condomínio.'}

Contamos com a compreensão e colaboração de todos.

Atenciosamente,
A Administração`;

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
