import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const getAllowedOrigin = (requestOrigin: string | null): string => {
  const allowedOrigins = [
    Deno.env.get("SITE_URL") || "",
    "http://localhost:8080",
    "http://localhost:5173",
    "http://localhost:3000",
  ].filter(Boolean);
  
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }
  return allowedOrigins[0] || "";
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = {
    "Access-Control-Allow-Origin": getAllowedOrigin(origin),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
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

    const email = user.email;

    console.log("Creating portal session");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    // Find customer
    const customers = await stripe.customers.list({ email: email!, limit: 1 });
    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ error: "No subscription found" }), { 
        status: 404, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${req.headers.get("origin")}/`,
    });

    console.log("Portal session created successfully");

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating portal session");
    return new Response(JSON.stringify({ error: "An error occurred while creating portal session" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
