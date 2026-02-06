import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Webhook received:", JSON.stringify(body));

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
      console.log("Payment details:", JSON.stringify(payment));

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
          // Update existing subscription
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
            console.error("Error updating subscription:", updateError);
          } else {
            console.log("Subscription updated successfully");
          }
        } else {
          // Create new subscription
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
            console.error("Error creating subscription:", insertError);
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
      JSON.stringify({ error: err?.message ?? "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
