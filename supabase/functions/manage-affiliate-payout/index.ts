import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, payoutId, adminNotes, transactionId } = await req.json();

    if (!action || !payoutId) {
      return new Response(
        JSON.stringify({ error: 'Missing action or payoutId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the payout
    const { data: payout, error: payoutError } = await supabase
      .from('affiliate_payouts')
      .select('*, affiliates(*)')
      .eq('id', payoutId)
      .single();

    if (payoutError || !payout) {
      return new Response(
        JSON.stringify({ error: 'Payout not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date().toISOString();

    switch (action) {
      case 'process': {
        // Mark payout as processing
        const { error } = await supabase
          .from('affiliate_payouts')
          .update({
            status: 'processing',
            processed_at: now,
            admin_notes: adminNotes || null,
          })
          .eq('id', payoutId);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, message: 'Payout marked as processing' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'complete': {
        // Verify payout is in valid state
        if (payout.status !== 'pending' && payout.status !== 'processing') {
          return new Response(
            JSON.stringify({ error: 'Payout cannot be completed from current status' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Start transaction-like operations
        // 1. Update payout status
        const { error: updatePayoutError } = await supabase
          .from('affiliate_payouts')
          .update({
            status: 'completed',
            completed_at: now,
            processed_at: payout.processed_at || now,
            admin_notes: adminNotes || payout.admin_notes,
            transaction_id: transactionId || null,
          })
          .eq('id', payoutId);

        if (updatePayoutError) {
          console.error('Error updating payout:', updatePayoutError);
          throw updatePayoutError;
        }

        // 2. Update affiliate earnings
        const newPendingEarnings = Math.max(0, (payout.affiliates.pending_earnings || 0) - payout.amount);
        const newPaidEarnings = (payout.affiliates.paid_earnings || 0) + Number(payout.amount);

        const { error: updateAffiliateError } = await supabase
          .from('affiliates')
          .update({
            pending_earnings: newPendingEarnings,
            paid_earnings: newPaidEarnings,
          })
          .eq('id', payout.affiliate_id);

        if (updateAffiliateError) {
          console.error('Error updating affiliate:', updateAffiliateError);
          // Rollback payout status
          await supabase
            .from('affiliate_payouts')
            .update({ status: 'processing', completed_at: null })
            .eq('id', payoutId);
          throw updateAffiliateError;
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Payout completed successfully',
            newPendingEarnings,
            newPaidEarnings,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'fail': {
        const { error } = await supabase
          .from('affiliate_payouts')
          .update({
            status: 'failed',
            admin_notes: adminNotes || 'Payment failed',
          })
          .eq('id', payoutId);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, message: 'Payout marked as failed' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'cancel': {
        if (payout.status !== 'pending') {
          return new Response(
            JSON.stringify({ error: 'Only pending payouts can be cancelled' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabase
          .from('affiliate_payouts')
          .update({
            status: 'cancelled',
            admin_notes: adminNotes || 'Cancelled by admin',
          })
          .eq('id', payoutId);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, message: 'Payout cancelled' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
