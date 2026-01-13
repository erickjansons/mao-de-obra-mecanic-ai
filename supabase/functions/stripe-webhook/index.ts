import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// No CORS headers needed for server-to-server webhook communication
// Stripe webhooks are server-to-server and don't require CORS

// Define allowed price IDs with their corresponding plan types
const ALLOWED_PRICES: Record<string, 'monthly' | 'annual'> = {
  'price_1SouFjRrRAPetjIvCxj0uasa': 'monthly',
  'price_1SotyCRrRAPetjIvsIUjFjfT': 'annual'
};

serve(async (req) => {
  // Webhooks are POST only - reject other methods
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2023-10-16",
  });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  let event: Stripe.Event;

  // SECURITY: Always require webhook signature verification - no unsafe fallback
  if (!webhookSecret || !signature) {
    console.error("Missing webhook secret or signature");
    return new Response(JSON.stringify({ error: "Webhook signature required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed");
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log("Processing webhook event");

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Processing checkout completion");

        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const customerId = session.customer as string;
          const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
          
          // Validate customer email exists
          if (!customer.email) {
            console.error("Customer has no email");
            return new Response(JSON.stringify({ error: "Invalid customer data" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Validate subscription items exist
          const items = subscription.items?.data;
          if (!items || items.length === 0) {
            console.error("No subscription items found");
            return new Response(JSON.stringify({ error: "Invalid subscription data" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          const priceId = items[0].price.id;
          
          // Validate price ID is in allowed list
          const planType = ALLOWED_PRICES[priceId];
          if (!planType) {
            console.error("Unauthorized price ID received");
            return new Response(JSON.stringify({ error: "Invalid price" }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Get user by email
          const { data: users, error: userError } = await supabase
            .from("profiles")
            .select("user_id")
            .eq("email", customer.email)
            .limit(1);

          if (userError || !users || users.length === 0) {
            console.error("Could not find user for checkout");
            break;
          }

          const userId = users[0].user_id;

          console.log("Updating subscription record");

          // Upsert subscription
          const { error: upsertError } = await supabase
            .from("subscriptions")
            .upsert({
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              plan_type: planType,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            }, { onConflict: "user_id" });

          if (upsertError) {
            console.error("Error upserting subscription record");
          } else {
            console.log("Subscription updated successfully");
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Processing subscription update");

        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (updateError) {
          console.error("Error updating subscription record");
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("Processing subscription cancellation");

        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            plan_type: "free",
          })
          .eq("stripe_subscription_id", subscription.id);

        if (updateError) {
          console.error("Error updating subscription record");
        }
        break;
      }

      default:
        console.log("Received unhandled event type");
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing webhook");
    return new Response(JSON.stringify({ error: "Webhook processing error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
