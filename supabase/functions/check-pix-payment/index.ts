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
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const { payment_id } = await req.json();
    if (!payment_id) {
      return new Response(JSON.stringify({ error: "Payment ID required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN")!;

    // Check payment status
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!paymentResponse.ok) {
      throw new Error(`Failed to fetch payment: ${paymentResponse.status}`);
    }

    const payment = await paymentResponse.json();

    // If payment is approved, activate subscription
    if (payment.status === "approved") {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const userId = user.id;
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      // Check if subscription exists
      const { data: existingSub } = await supabaseAdmin
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingSub) {
        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "active",
            plan_type: "monthly",
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            stripe_customer_id: payment.payer?.id?.toString() || null,
            stripe_subscription_id: payment_id.toString(),
            updated_at: now.toISOString(),
          })
          .eq("user_id", userId);
      } else {
        await supabaseAdmin
          .from("subscriptions")
          .insert({
            user_id: userId,
            status: "active",
            plan_type: "monthly",
            current_period_start: now.toISOString(),
            current_period_end: periodEnd.toISOString(),
            stripe_customer_id: payment.payer?.id?.toString() || null,
            stripe_subscription_id: payment_id.toString(),
          });
      }
    }

    return new Response(JSON.stringify({
      status: payment.status,
      status_detail: payment.status_detail,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const err = error as any;
    console.error("Error checking payment:", err?.message ?? err);

    return new Response(
      JSON.stringify({
        error: "check_payment_failed",
        message: err?.message ?? "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
