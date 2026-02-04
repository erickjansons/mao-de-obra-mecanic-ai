-- Create affiliates table
CREATE TABLE public.affiliates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    referral_code TEXT NOT NULL UNIQUE,
    total_earnings NUMERIC NOT NULL DEFAULT 0,
    pending_earnings NUMERIC NOT NULL DEFAULT 0,
    paid_earnings NUMERIC NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referrals table to track signups
CREATE TABLE public.referrals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending',
    commission_amount NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    converted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies for affiliates
CREATE POLICY "Users can view their own affiliate data"
ON public.affiliates
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own affiliate profile"
ON public.affiliates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own affiliate data"
ON public.affiliates
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policies for referrals
CREATE POLICY "Affiliates can view their own referrals"
ON public.referrals
FOR SELECT
USING (
    affiliate_id IN (
        SELECT id FROM public.affiliates WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Service role can manage referrals"
ON public.referrals
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create trigger for updated_at
CREATE TRIGGER update_affiliates_updated_at
BEFORE UPDATE ON public.affiliates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    code TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        code := upper(substring(md5(random()::text) from 1 for 8));
        SELECT EXISTS(SELECT 1 FROM public.affiliates WHERE referral_code = code) INTO exists_check;
        IF NOT exists_check THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$;