-- Create table for redemption tokens
CREATE TABLE public.redemption_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  is_used boolean NOT NULL DEFAULT false,
  used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.redemption_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone authenticated can check if a token exists (for validation)
CREATE POLICY "Users can check tokens"
ON public.redemption_tokens
FOR SELECT
TO authenticated
USING (true);

-- Policy: Service role can manage all tokens
CREATE POLICY "Service role can manage tokens"
ON public.redemption_tokens
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Insert the 20 tokens
INSERT INTO public.redemption_tokens (token) VALUES
  ('483920'),
  ('761054'),
  ('092638'),
  ('547301'),
  ('819462'),
  ('230975'),
  ('604187'),
  ('958024'),
  ('371690'),
  ('146852'),
  ('790413'),
  ('528906'),
  ('064291'),
  ('935780'),
  ('412568'),
  ('807134'),
  ('259047'),
  ('684912'),
  ('173805'),
  ('996240');