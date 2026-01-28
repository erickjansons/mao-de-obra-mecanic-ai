import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Get user from token
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { token } = await req.json();
    
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanToken = token.trim();

    // Use service role to manage tokens
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Check if token exists and is not used
    const { data: tokenData, error: tokenError } = await adminClient
      .from('redemption_tokens')
      .select('*')
      .eq('token', cleanToken)
      .maybeSingle();

    if (tokenError) {
      console.error('Error checking token:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!tokenData) {
      return new Response(
        JSON.stringify({ error: 'Token não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (tokenData.is_used) {
      return new Response(
        JSON.stringify({ error: 'Token já foi utilizado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark token as used
    const { error: updateTokenError } = await adminClient
      .from('redemption_tokens')
      .update({
        is_used: true,
        used_by: user.id,
        used_at: new Date().toISOString(),
      })
      .eq('id', tokenData.id);

    if (updateTokenError) {
      console.error('Error updating token:', updateTokenError);
      return new Response(
        JSON.stringify({ error: 'Erro ao resgatar token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create or update subscription to monthly plan
    const { data: existingSub } = await adminClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setFullYear(periodEnd.getFullYear() + 100); // Lifetime access

    if (existingSub) {
      // Update existing subscription
      const { error: subError } = await adminClient
        .from('subscriptions')
        .update({
          plan_type: 'monthly',
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq('user_id', user.id);

      if (subError) {
        console.error('Error updating subscription:', subError);
        return new Response(
          JSON.stringify({ error: 'Erro ao ativar assinatura' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Create new subscription
      const { error: subError } = await adminClient
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_type: 'monthly',
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
        });

      if (subError) {
        console.error('Error creating subscription:', subError);
        return new Response(
          JSON.stringify({ error: 'Erro ao criar assinatura' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Plano PRO ativado com sucesso!' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
