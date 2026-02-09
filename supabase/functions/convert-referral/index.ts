import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Commission rate: 45% (displayed as 50% with transfer fees)
const COMMISSION_RATE = 0.45;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, subscriptionAmount } = await req.json();

    if (!userId || !subscriptionAmount) {
      return new Response(
        JSON.stringify({ error: 'Missing userId or subscriptionAmount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find any referral for this user (active, pending, or converted - permanent link)
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .select('*, affiliates(*)')
      .eq('referred_user_id', userId)
      .in('status', ['active', 'pending', 'converted'])
      .single();

    if (referralError || !referral) {
      return new Response(
        JSON.stringify({ message: 'No referral found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const commissionAmount = subscriptionAmount * COMMISSION_RATE;

    // Update the referral: increment commission and set status to 'active'
    const { error: updateReferralError } = await supabase
      .from('referrals')
      .update({
        status: 'active',
        commission_amount: (referral.commission_amount || 0) + commissionAmount,
        converted_at: new Date().toISOString(),
      })
      .eq('id', referral.id);

    if (updateReferralError) {
      console.error('Error updating referral:', updateReferralError);
      return new Response(
        JSON.stringify({ error: 'Failed to update referral' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the affiliate's earnings
    const { error: updateAffiliateError } = await supabase
      .from('affiliates')
      .update({
        total_earnings: (referral.affiliates.total_earnings || 0) + commissionAmount,
        pending_earnings: (referral.affiliates.pending_earnings || 0) + commissionAmount,
      })
      .eq('id', referral.affiliate_id);

    if (updateAffiliateError) {
      console.error('Error updating affiliate:', updateAffiliateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update affiliate earnings' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, commissionAmount }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
