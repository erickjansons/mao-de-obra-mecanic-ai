
-- Add referred_email column to referrals table
ALTER TABLE public.referrals ADD COLUMN IF NOT EXISTS referred_email text;

-- Populate existing referrals with emails from profiles
UPDATE public.referrals r
SET referred_email = p.email
FROM public.profiles p
WHERE p.user_id = r.referred_user_id
AND r.referred_email IS NULL;
