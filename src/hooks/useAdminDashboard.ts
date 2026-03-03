import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AdminDashboardData {
  revenue: {
    monthly_revenue: number;
    total_revenue: number;
    direct_revenue: number;
    token_revenue: number;
    total_paid_subscriptions: number;
    total_paid_ever: number;
    revenue_by_month: Record<string, number>;
  };
  users: {
    total: number;
    premium: number;
    free: number;
    renewed: number;
    renewed_details: RenewedDetail[];
    details: UserDetail[];
  };
  affiliates: {
    total: number;
    active: number;
    total_earnings: number;
    pending_earnings: number;
    paid_earnings: number;
    total_referrals: number;
    converted_referrals: number;
    pending_referrals: number;
    details: AffiliateDetail[];
  };
  payouts: {
    total: number;
    completed: number;
    pending: number;
  };
  tokens: {
    total: number;
    used: number;
    available: number;
    details: TokenDetail[];
  };
}

export interface UserDetail {
  id: string;
  email: string;
  created_at: string;
  plan_type: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
}

export interface RenewedDetail {
  email: string;
  plan_type: string;
  renewed_at: string;
  month: string;
}

export interface AffiliateDetail {
  id: string;
  email: string;
  referral_code: string;
  is_active: boolean;
  total_earnings: number;
  pending_earnings: number;
  paid_earnings: number;
  total_referrals: number;
  converted_referrals: number;
  pending_referrals: number;
  total_payouts: number;
  pix_key: string | null;
  pix_key_type: string | null;
  created_at: string;
}

export interface TokenDetail {
  id: string;
  token: string;
  is_used: boolean;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
  used_by_email: string | null;
}

export const useAdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const checkAdminRole = useCallback(async () => {
    if (!user) return false;

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    return !!roleData;
  }, [user]);

  const fetchDashboard = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const hasAdmin = await checkAdminRole();
      setIsAdmin(hasAdmin);

      if (!hasAdmin) {
        setLoading(false);
        return;
      }

      // Ensure we have a valid session before calling the edge function
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      const { data: response, error: fnError } = await supabase.functions.invoke(
        'admin-dashboard'
      );

      if (fnError) throw fnError;
      if (response?.error) throw new Error(response.error);

      setData(response);
    } catch (err: any) {
      console.error('Admin dashboard error:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [user, checkAdminRole]);

  const createTokens = useCallback(async (tokens: string[]) => {
    const { data: response, error: fnError } = await supabase.functions.invoke(
      'manage-tokens',
      { body: { action: 'create', tokens } }
    );
    if (fnError) throw fnError;
    if (response?.error) throw new Error(response.error);
    await fetchDashboard();
    return response;
  }, [fetchDashboard]);

  const deleteToken = useCallback(async (tokenId: string) => {
    const { data: response, error: fnError } = await supabase.functions.invoke(
      'manage-tokens',
      { body: { action: 'delete', token_id: tokenId } }
    );
    if (fnError) throw fnError;
    if (response?.error) throw new Error(response.error);
    await fetchDashboard();
    return response;
  }, [fetchDashboard]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, loading, error, isAdmin, refetch: fetchDashboard, createTokens, deleteToken };
};
