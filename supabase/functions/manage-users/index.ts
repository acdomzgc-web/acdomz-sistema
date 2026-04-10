import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  
  try {
    const { action, userId, email, password, name, role } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    if (action === 'create') {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, role }
      });
      if (error) throw error;
      
      // Upsert profile data to guarantee consistency
      await supabaseAdmin.from('profiles').upsert({ 
        id: data.user.id, 
        email, 
        name, 
        role 
      });
      
      return new Response(JSON.stringify({ status: "success", user: data.user }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } 
    else if (action === 'delete') {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) throw error;
      
      // Cascades usually handle this, but explicitly deleting profiles to ensure data is clean
      await supabaseAdmin.from('profiles').delete().eq('id', userId);

      return new Response(JSON.stringify({ status: "success" }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    else if (action === 'update') {
      const updateData: any = { user_metadata: { name, role } };
      if (password) updateData.password = password;
      if (email) updateData.email = email;
      
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, updateData);
      if (error) throw error;
      
      await supabaseAdmin.from('profiles').update({ role, name, email }).eq('id', userId);
      
      return new Response(JSON.stringify({ status: "success", user: data.user }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    throw new Error('Ação inválida ou não suportada.');
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
