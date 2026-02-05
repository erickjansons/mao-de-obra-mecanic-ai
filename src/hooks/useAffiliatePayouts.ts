import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface AffiliatePayout {
  id: string;
  affiliate_id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  pix_key: string;
  pix_key_type: string;
  requested_at: string;
  processed_at: string | null;
  completed_at: string | null;
  admin_notes: string | null;
  transaction_id: string | null;
  created_at: string;
}

interface PayoutRequest {
  amount: number;
  pixKey: string;
  pixKeyType: string;
}

export const useAffiliatePayouts = (affiliateId: string | undefined) => {
  const { toast } = useToast();
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  const fetchPayouts = async () => {
    if (!affiliateId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch payouts
      const { data, error } = await supabase
        .from('affiliate_payouts')
        .select('*')
        .eq('affiliate_id', affiliateId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayouts((data as AffiliatePayout[]) || []);
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestPayout = async ({ amount, pixKey, pixKeyType }: PayoutRequest): Promise<{ success: boolean }> => {
    if (!affiliateId) return { success: false };

    setRequesting(true);
    try {
      // Create payout request with 'completed' status (immediate approval via WhatsApp)
      const { data, error } = await supabase
        .from('affiliate_payouts')
        .insert({
          affiliate_id: affiliateId,
          amount,
          pix_key: pixKey,
          pix_key_type: pixKeyType,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update affiliate balance - deduct from pending_earnings and add to paid_earnings
      const { error: updateError } = await supabase
        .from('affiliates')
        .update({
          pending_earnings: supabase.rpc ? 0 : 0, // Will be handled below
        })
        .eq('id', affiliateId);

      // Use RPC or direct update to handle the balance
      const { data: affiliateData } = await supabase
        .from('affiliates')
        .select('pending_earnings, paid_earnings')
        .eq('id', affiliateId)
        .single();

      if (affiliateData) {
        await supabase
          .from('affiliates')
          .update({
            pending_earnings: Math.max(0, (affiliateData.pending_earnings || 0) - amount),
            paid_earnings: (affiliateData.paid_earnings || 0) + amount,
          })
          .eq('id', affiliateId);
      }

      // Update local state
      setPayouts(prev => [data as AffiliatePayout, ...prev]);

      toast({
        title: 'Saque registrado!',
        description: `Seu saque de R$ ${amount.toFixed(2)} foi registrado. Aguarde o pagamento via PIX.`,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error requesting payout:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível solicitar o saque.',
        variant: 'destructive',
      });
      return { success: false };
    } finally {
      setRequesting(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [affiliateId]);

  const stats = {
    totalRequested: payouts.reduce((acc, p) => acc + Number(p.amount), 0),
    totalPaid: payouts
      .filter(p => p.status === 'completed')
      .reduce((acc, p) => acc + Number(p.amount), 0),
    pendingPayouts: payouts.filter(p => p.status === 'pending' || p.status === 'processing'),
    hasPendingRequest: false, // No longer blocking new requests
  };

  return {
    payouts,
    loading,
    requesting,
    stats,
    requestPayout,
    refetch: fetchPayouts,
  };
};
