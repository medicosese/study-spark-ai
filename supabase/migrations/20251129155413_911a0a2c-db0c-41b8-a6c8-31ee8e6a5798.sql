-- Find the user by email and upgrade to super admin
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'superstarhatim@gmail.com';
  
  IF target_user_id IS NOT NULL THEN
    -- Update role to super_admin
    UPDATE public.user_roles
    SET role = 'super_admin'
    WHERE user_id = target_user_id;
    
    -- If role doesn't exist, insert it
    IF NOT FOUND THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (target_user_id, 'super_admin');
    END IF;
    
    -- Approve the profile if it exists
    UPDATE public.profiles
    SET 
      verification_status = 'approved',
      approved_at = now(),
      is_blocked = false
    WHERE user_id = target_user_id;
    
    RAISE NOTICE 'User % upgraded to super_admin and approved', target_user_id;
  ELSE
    RAISE NOTICE 'User with email superstarhatim@gmail.com not found. Please sign up first.';
  END IF;
END $$;