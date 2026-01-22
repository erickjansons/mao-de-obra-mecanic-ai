import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type PlanType = 'free' | 'monthly' | 'annual';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string;
  plan_type: PlanType;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export const PLAN_LIMITS = {
  free: 8,
  monthly: Infinity,
  annual: Infinity,
};

export const PLAN_PRICES = {
  monthly: {
    amount: 1099,
    display: 'R$ 10,99',
  },
  annual: {
    amount: 699,
    display: 'R$ 6,99/mês',
    savings: '36% de economia vs mensal',
  },
};

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
      }

      setSubscription(data as Subscription | null);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const getPlanType = (): PlanType => {
    if (!subscription) return 'free';
    if (subscription.status !== 'active' && subscription.status !== 'trialing') return 'free';
    return subscription.plan_type as PlanType;
  };

  const getServiceLimit = (): number => {
    const planType = getPlanType();
    return PLAN_LIMITS[planType];
  };

  const canAddService = (currentServiceCount: number): boolean => {
    const limit = getServiceLimit();
    return currentServiceCount < limit;
  };

  const isPremium = (): boolean => {
    const planType = getPlanType();
    return planType === 'monthly' || planType === 'annual';
  };

  const createCheckout = async (planType: 'monthly' | 'annual'): Promise<string | null> => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        await supabase.auth.signOut();
        throw new Error('SESSION_EXPIRED');
      }

      const response = await supabase.functions.invoke('create-checkout', {
        body: { planType },
      });

      if (response.error) {
        if (response.error.message?.includes('Unauthorized') || response.error.status === 401) {
          await supabase.auth.signOut();
          throw new Error('SESSION_EXPIRED');
        }
        throw response.error;
      }

      return response.data.url;
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  };

  return {
    subscription,
    loading,
    getPlanType,
    getServiceLimit,
    canAddService,
    isPremium,
    createCheckout,
    refetch: fetchSubscription,
  };
};
