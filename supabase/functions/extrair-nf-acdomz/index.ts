import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  
  // Simulated Gemini Vision extraction
  return new Response(JSON.stringify({ 
    status: "success", 
    message: "NF extraída via IA com sucesso.",
    data: {
      amount: "1500.00",
      date: new Date().toISOString().split('T')[0],
      description: "Serviços (Extraído via IA)"
    }
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
});
