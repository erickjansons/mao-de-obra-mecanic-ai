import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Affiliate {
  id: string;
  user_id: string;
  referral_code: string;
  total_earnings: number;
  pending_earnings: number;
  paid_earnings: number;
  is_active: boolean;
  created_at: string;
  pix_key: string | null;
  pix_key_type: string | null;
}

interface Referral {
  id: string;
  affiliate_id: string;
  referred_user_id: string;
  status: string;
  commission_amount: number;
  created_at: string;
  converted_at: string | null;
  referred_email: string | null;
}

export const useAffiliate = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAffiliate = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setAffiliate(data);
    } catch (error) {
      console.error('Error fetching affiliate:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferrals = async () => {
    if (!affiliate) return;

    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('affiliate_id', affiliate.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferrals((data as Referral[]) || []);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    }
  };

  const becomeAffiliate = async () => {
    if (!user) return;

    try {
      const { data: codeData, error: codeError } = await supabase
        .rpc('generate_referral_code');

      if (codeError) throw codeError;

      const { data, error } = await supabase
        .from('affiliates')
        .insert({
          user_id: user.id,
          referral_code: codeData,
        })
        .select()
        .single();

      if (error) throw error;

      setAffiliate(data);
      toast({
        title: 'Parabéns!',
        description: 'Você agora é um afiliado! Compartilhe seu link e ganhe comissões.',
      });
    } catch (error: any) {
      console.error('Error becoming affiliate:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar sua conta de afiliado.',
        variant: 'destructive',
      });
    }
  };

  const getAffiliateLink = () => {
    if (!affiliate) return '';
    return `${window.location.origin}/auth?ref=${affiliate.referral_code}`;
  };

  const copyAffiliateLink = async () => {
    const link = getAffiliateLink();
    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);
      toast({
        title: 'Link copiado!',
        description: 'Seu link de afiliado foi copiado para a área de transferência.',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar o link.',
        variant: 'destructive',
      });
    }
  };

  const getReferredName = (email: string | null): string => {
    if (!email) return 'Usuário';
    const namePart = email.split('@')[0];
    // Capitalize first letter
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  useEffect(() => {
    fetchAffiliate();
  }, [user]);

  useEffect(() => {
    if (affiliate) {
      fetchReferrals();
    }
  }, [affiliate]);

  const stats = {
    totalReferrals: referrals.length,
    convertedReferrals: referrals.filter(r => r.status === 'active' || r.status === 'converted').length,
    pendingReferrals: referrals.filter(r => r.status === 'pending').length,
    totalEarnings: affiliate?.total_earnings || 0,
    pendingEarnings: affiliate?.pending_earnings || 0,
    paidEarnings: affiliate?.paid_earnings || 0,
  };

  return {
    affiliate,
    referrals,
    loading,
    stats,
    becomeAffiliate,
    getAffiliateLink,
    copyAffiliateLink,
    getReferredName,
    refetch: fetchAffiliate,
  };
};
