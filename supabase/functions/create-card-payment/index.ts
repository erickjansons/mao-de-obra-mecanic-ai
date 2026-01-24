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

    // Get card data from request body
    const body = await req.json();
    const { 
      token, 
      payment_method_id, 
      installments, 
      issuer_id,
      device_id,
      payer_email,
      identification_type,
      identification_number
    } = body;

    if (!token || !payment_method_id || !installments) {
      return new Response(JSON.stringify({ error: "Missing required fields: token, payment_method_id, installments" }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    console.log("Creating card payment with token");

    const accessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN")!;

    // Calculate total amount for annual plan: 12x R$ 6.99 = R$ 83.88
    const totalAmount = 83.88;

    // Build payment payload
    const paymentPayload: Record<string, any> = {
      transaction_amount: totalAmount,
      token: token,
      description: "Plano Anual - Mão de Obra (12x R$ 6,99)",
      installments: parseInt(installments),
      payment_method_id: payment_method_id,
      payer: {
        email: payer_email || email,
        identification: identification_type && identification_number ? {
          type: identification_type,
          number: identification_number
        } : undefined
      },
      external_reference: JSON.stringify({ user_id: userId, plan_type: "annual" }),
      notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mercadopago-webhook`,
    };

    // Add issuer_id if provided
    if (issuer_id) {
      paymentPayload.issuer_id = parseInt(issuer_id);
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
      "X-Idempotency-Key": `${userId}-annual-${Date.now()}`,
    };

    // Add device fingerprint header if available
    if (device_id) {
      headers["X-meli-session-id"] = device_id;
    }

    console.log("Sending payment request to Mercado Pago");

    // Create card payment using Mercado Pago Payments API
    const paymentResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers,
      body: JSON.stringify(paymentPayload),
    });

    const payment = await paymentResponse.json();

    console.log("Mercado Pago response status:", paymentResponse.status);
    console.log("Payment response:", JSON.stringify(payment));

    if (!paymentResponse.ok) {
      console.error("Mercado Pago API error:", JSON.stringify(payment));
      
      // Extract meaningful error info
      const errorCause = payment.cause?.[0]?.description || payment.message || "Erro ao processar pagamento";
      
      return new Response(JSON.stringify({
        error: "payment_failed",
        status: "rejected",
        status_detail: payment.cause?.[0]?.code || "unknown_error",
        message: errorCause
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Card payment created:", payment.id, "Status:", payment.status);

    // If payment is approved, update subscription
    if (payment.status === "approved") {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const now = new Date();
      const endDate = new Date(now);
      endDate.setFullYear(endDate.getFullYear() + 1);

      // Check if user already has a subscription
      const { data: existingSub } = await supabaseAdmin
        .from("subscriptions")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existingSub) {
        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "active",
            plan_type: "annual",
            current_period_start: now.toISOString(),
            current_period_end: endDate.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq("user_id", userId);
      } else {
        await supabaseAdmin
          .from("subscriptions")
          .insert({
            user_id: userId,
            status: "active",
            plan_type: "annual",
            current_period_start: now.toISOString(),
            current_period_end: endDate.toISOString(),
          });
      }

      console.log("Subscription updated for user:", userId);
    }

    return new Response(JSON.stringify({
      payment_id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const err = error as any;
    console.error("Error creating card payment:", err?.message ?? err);

    return new Response(
      JSON.stringify({
        error: "card_payment_failed",
        message: err?.message ?? "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
