import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const getAllowedOrigin = (_requestOrigin: string | null): string => {
  return "*";
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = {
    "Access-Control-Allow-Origin": getAllowedOrigin(origin),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Auth error occurred");
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const userId = user.id;
    const email = user.email;

    const { planType } = await req.json();
    if (!planType || !['monthly', 'annual'].includes(planType)) {
      return new Response(JSON.stringify({ error: "Invalid plan type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const baseUrl = origin || Deno.env.get("SITE_URL") || "";
    if (!baseUrl) {
      return new Response(JSON.stringify({ error: "Missing origin/site URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Creating Mercado Pago preference");

    const accessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN")!;

    // Define plan details
    const plans = {
      monthly: {
        title: "Plano Mensal - Mão de Obra",
        unit_price: 10.99,
        description: "Acesso ilimitado por 30 dias",
      },
      annual: {
        title: "Plano Anual - Mão de Obra",
        unit_price: 83.88, // 6.99 * 12
        description: "Acesso ilimitado por 1 ano (R$ 6,99/mês)",
      },
    };

    const selectedPlan = plans[planType as keyof typeof plans];

    // Create Mercado Pago preference
    const preferenceResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: selectedPlan.title,
            quantity: 1,
            unit_price: selectedPlan.unit_price,
            currency_id: "BRL",
            description: selectedPlan.description,
          },
        ],
        payer: {
          email: email,
        },
        back_urls: {
          success: `${baseUrl}/?success=true`,
          failure: `${baseUrl}/?canceled=true`,
          pending: `${baseUrl}/?pending=true`,
        },
        auto_return: "approved",
        external_reference: JSON.stringify({ user_id: userId, plan_type: planType }),
        notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mercadopago-webhook`,
      }),
    });

    if (!preferenceResponse.ok) {
      const errorData = await preferenceResponse.text();
      console.error("Mercado Pago API error:", errorData);
      throw new Error(`Mercado Pago API error: ${preferenceResponse.status}`);
    }

    const preference = await preferenceResponse.json();
    console.log("Preference created successfully");

    return new Response(JSON.stringify({ url: preference.init_point }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const err = error as any;
    console.error("Error creating checkout:", err?.message ?? err);

    return new Response(
      JSON.stringify({
        error: "checkout_failed",
        message: err?.message ?? "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
