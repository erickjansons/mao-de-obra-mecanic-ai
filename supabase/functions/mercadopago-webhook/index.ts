import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function verifyWebhookSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string,
  secret: string
): Promise<boolean> {
  // Parse ts and v1 from x-signature header
  const parts: Record<string, string> = {};
  for (const part of xSignature.split(",")) {
    const [key, ...valueParts] = part.trim().split("=");
    parts[key.trim()] = valueParts.join("=").trim();
  }

  const ts = parts["ts"];
  const v1 = parts["v1"];

  if (!ts || !v1) return false;

  // Build the signed template per Mercado Pago docs
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  // Generate HMAC-SHA256
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(manifest));
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const computedHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  // Constant-time comparison
  if (computedHash.length !== v1.length) return false;
  let result = 0;
  for (let i = 0; i < computedHash.length; i++) {
    result |= computedHash.charCodeAt(i) ^ v1.charCodeAt(i);
  }
  return result === 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    console.log("Webhook received, type:", body.type);

    // Verify webhook signature
    const xSignature = req.headers.get("x-signature");
    const xRequestId = req.headers.get("x-request-id");
    const secret = Deno.env.get("MERCADO_PAGO_WEBHOOK_SECRET");
    const dataId = body.data?.id?.toString() || "";

    if (!xSignature || !xRequestId) {
      console.error("Missing signature headers");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!secret) {
      console.error("MERCADO_PAGO_WEBHOOK_SECRET not configured");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isValid = await verifyWebhookSignature(xSignature, xRequestId, dataId, secret);
    if (!isValid) {
      console.error("Invalid webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Webhook signature verified successfully");

    // Handle different webhook types
    if (body.type === "payment") {
      const paymentId = body.data?.id;
      
      if (!paymentId) {
        console.log("No payment ID found");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const accessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN")!;

      // Get payment details from Mercado Pago
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (!paymentResponse.ok) {
        console.error("Failed to fetch payment details");
        return new Response(JSON.stringify({ error: "Failed to fetch payment" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const payment = await paymentResponse.json();
      console.log("Payment status:", payment.status);

      // Only process approved payments
      if (payment.status === "approved") {
        let externalReference;
        try {
          externalReference = JSON.parse(payment.external_reference || "{}");
        } catch {
          console.error("Failed to parse external_reference");
          return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const userId = externalReference.user_id;
        const planType = externalReference.plan_type;

        if (!userId || !planType) {
          console.error("Missing user_id or plan_type in external_reference");
          return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const supabaseAdmin = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // Calculate period end based on plan type
        const now = new Date();
        let periodEnd: Date;
        
        if (planType === "annual") {
          periodEnd = new Date(now);
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
          periodEnd = new Date(now);
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        }

        // Check if subscription exists
        const { data: existingSub } = await supabaseAdmin
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (existingSub) {
          const { error: updateError } = await supabaseAdmin
            .from("subscriptions")
            .update({
              status: "active",
              plan_type: planType,
              current_period_start: now.toISOString(),
              current_period_end: periodEnd.toISOString(),
              stripe_customer_id: payment.payer?.id?.toString() || null,
              stripe_subscription_id: paymentId.toString(),
              updated_at: now.toISOString(),
            })
            .eq("user_id", userId);

          if (updateError) {
            console.error("Error updating subscription");
          } else {
            console.log("Subscription updated successfully");
          }
        } else {
          const { error: insertError } = await supabaseAdmin
            .from("subscriptions")
            .insert({
              user_id: userId,
              status: "active",
              plan_type: planType,
              current_period_start: now.toISOString(),
              current_period_end: periodEnd.toISOString(),
              stripe_customer_id: payment.payer?.id?.toString() || null,
              stripe_subscription_id: paymentId.toString(),
            });

          if (insertError) {
            console.error("Error creating subscription");
          } else {
            console.log("Subscription created successfully");
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const err = error as any;
    console.error("Webhook error:", err?.message ?? err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
