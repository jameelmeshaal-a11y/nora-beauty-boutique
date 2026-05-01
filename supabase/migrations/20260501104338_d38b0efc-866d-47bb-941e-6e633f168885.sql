-- Promote ceo@salasah.sa to admin
DO $$
DECLARE
  ceo_user_id uuid;
BEGIN
  SELECT id INTO ceo_user_id FROM auth.users WHERE email = 'ceo@salasah.sa' LIMIT 1;
  IF ceo_user_id IS NOT NULL THEN
    -- Remove existing customer role to avoid duplication then insert admin
    DELETE FROM public.user_roles WHERE user_id = ceo_user_id AND role = 'customer';
    INSERT INTO public.user_roles (user_id, role)
    VALUES (ceo_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;