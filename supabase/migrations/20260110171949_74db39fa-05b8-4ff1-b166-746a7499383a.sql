-- Revert to SECURITY DEFINER which is REQUIRED for triggers on auth.users
-- The trigger fires from auth.users table and must bypass RLS to insert into profiles
-- This is safe because:
-- 1. NEW.id and NEW.email come directly from the auth system (trusted source)
-- 2. search_path is explicitly set to prevent path injection attacks
-- 3. The trigger only runs on auth.users INSERT, controlled by Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;