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

    // Get device_id from request body
    const body = await req.json().catch(() => ({}));
    const deviceId = body.device_id;

    console.log("Creating transparent PIX payment with device_id:", deviceId ? "present" : "not present");

    const accessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN")!;

    // Build payment payload with device fingerprint
    const paymentPayload: Record<string, any> = {
      transaction_amount: 9.99,
      description: "Plano Mensal - Mão de Obra (30 dias)",
      payment_method_id: "pix",
      payer: {
        email: email,
      },
      external_reference: JSON.stringify({ user_id: userId, plan_type: "monthly" }),
      notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/mercadopago-webhook`,
    };

    // Add device_id for fraud prevention (required by Mercado Pago)
    if (deviceId) {
      paymentPayload.additional_info = {
        ip_address: req.headers.get("x-forwarded-for")?.split(",")[0] || req.headers.get("cf-connecting-ip") || "",
      };
      // Mercado Pago expects device_id in the header for fingerprinting
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
      "X-Idempotency-Key": `${userId}-monthly-${Date.now()}`,
    };

    // Add device fingerprint header if available
    if (deviceId) {
      headers["X-meli-session-id"] = deviceId;
    }

    // Create direct PIX payment using Mercado Pago Payments API
    const paymentResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers,
      body: JSON.stringify(paymentPayload),
    });

    if (!paymentResponse.ok) {
      const errorData = await paymentResponse.text();
      console.error("Mercado Pago API error:", errorData);
      throw new Error(`Mercado Pago API error: ${paymentResponse.status} - ${errorData}`);
    }

    const payment = await paymentResponse.json();
    console.log("PIX payment created successfully:", payment.id);

    // Extract PIX data
    const pixData = payment.point_of_interaction?.transaction_data;
    
    if (!pixData) {
      throw new Error("PIX data not available in response");
    }

    return new Response(JSON.stringify({
      payment_id: payment.id,
      status: payment.status,
      qr_code: pixData.qr_code,
      qr_code_base64: pixData.qr_code_base64,
      ticket_url: pixData.ticket_url,
      expiration_date: payment.date_of_expiration,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const err = error as any;
    console.error("Error creating PIX payment:", err?.message ?? err);

    return new Response(
      JSON.stringify({
        error: "pix_payment_failed",
        message: err?.message ?? "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
