-- Add PIX key to affiliates table
ALTER TABLE public.affiliates 
ADD COLUMN IF NOT EXISTS pix_key TEXT,
ADD COLUMN IF NOT EXISTS pix_key_type TEXT;

-- Create affiliate_payouts table to track all payouts
CREATE TABLE public.affiliate_payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  pix_key TEXT NOT NULL,
  pix_key_type TEXT NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- Affiliates can view their own payouts
CREATE POLICY "Affiliates can view their own payouts" 
ON public.affiliate_payouts 
FOR SELECT 
USING (affiliate_id IN (
  SELECT id FROM public.affiliates WHERE user_id = auth.uid()
));

-- Affiliates can request payouts (insert)
CREATE POLICY "Affiliates can request payouts" 
ON public.affiliate_payouts 
FOR INSERT 
WITH CHECK (affiliate_id IN (
  SELECT id FROM public.affiliates WHERE user_id = auth.uid()
));

-- Service role can manage all payouts (for admin operations)
CREATE POLICY "Service role can manage all payouts" 
ON public.affiliate_payouts 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create trigger for updated_at
CREATE TRIGGER update_affiliate_payouts_updated_at
BEFORE UPDATE ON public.affiliate_payouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_affiliate_payouts_affiliate_id ON public.affiliate_payouts(affiliate_id);
CREATE INDEX idx_affiliate_payouts_status ON public.affiliate_payouts(status);