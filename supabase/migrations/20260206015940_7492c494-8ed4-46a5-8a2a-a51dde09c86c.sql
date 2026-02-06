
-- 1. Deny anonymous access to profiles
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- 2. Deny anonymous access to affiliates
CREATE POLICY "Deny anonymous access to affiliates"
ON public.affiliates
FOR SELECT
TO anon
USING (false);

-- 3. Deny anonymous access to services
CREATE POLICY "Deny anonymous access to services"
ON public.services
FOR SELECT
TO anon
USING (false);

-- 4. Deny anonymous access to redemption_tokens
CREATE POLICY "Deny anonymous access to redemption_tokens"
ON public.redemption_tokens
FOR SELECT
TO anon
USING (false);

-- 5. Fix redemption_tokens: restrict authenticated users to only see their own used tokens
DROP POLICY IF EXISTS "Users can check tokens" ON public.redemption_tokens;

CREATE POLICY "Users can view their own used tokens"
ON public.redemption_tokens
FOR SELECT
TO authenticated
USING (used_by = auth.uid());
