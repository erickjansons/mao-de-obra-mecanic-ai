-- Update handle_new_user function to use SECURITY INVOKER
-- This is safer as it respects RLS policies and doesn't bypass them
-- The function is only called via trigger on auth.users insert, so it will still work correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;