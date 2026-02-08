import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Não autorizado");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Não autorizado");

    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Acesso negado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const { action, tokens: tokenValues, token_id } = await req.json();

    if (action === "create") {
      if (!tokenValues || !Array.isArray(tokenValues) || tokenValues.length === 0) {
        throw new Error("Forneça uma lista de tokens");
      }

      // Check for duplicates
      const { data: existing } = await supabaseAdmin
        .from("redemption_tokens")
        .select("token")
        .in("token", tokenValues);

      const existingTokens = (existing || []).map((t: any) => t.token);
      const newTokens = tokenValues.filter((t: string) => !existingTokens.includes(t));

      if (newTokens.length === 0) {
        throw new Error("Todos os tokens já existem");
      }

      const rows = newTokens.map((t: string) => ({ token: t }));
      const { error: insertError } = await supabaseAdmin
        .from("redemption_tokens")
        .insert(rows);

      if (insertError) throw insertError;

      return new Response(
        JSON.stringify({
          created: newTokens.length,
          duplicates: existingTokens.length,
          tokens: newTokens,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "delete") {
      if (!token_id) throw new Error("Forneça o ID do token");

      // Only delete unused tokens
      const { error: deleteError } = await supabaseAdmin
        .from("redemption_tokens")
        .delete()
        .eq("id", token_id)
        .eq("is_used", false);

      if (deleteError) throw deleteError;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Ação inválida. Use 'create' ou 'delete'");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: error instanceof Error && error.message === "Não autorizado" ? 401 : 500,
    });
  }
});
