
-- Add new role values to enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'administrative';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'employee';

-- Create organizations table
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view organizations" ON public.organizations FOR SELECT USING (true);
CREATE POLICY "Admins can insert organizations" ON public.organizations FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update organizations" ON public.organizations FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete organizations" ON public.organizations FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Add organization and verified status to profiles
ALTER TABLE public.profiles ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
ALTER TABLE public.profiles ADD COLUMN is_verified boolean NOT NULL DEFAULT false;

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update any profile (for verification)
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to manage roles
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Update handle_new_user to support role and organization from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _role app_role;
BEGIN
  _role := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', '')::app_role, 'employee');
  -- Prevent signup as admin
  IF _role = 'admin' THEN
    _role := 'employee';
  END IF;

  INSERT INTO public.profiles (user_id, first_name, last_name, organization_id, is_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'organization_id', '')::uuid,
    CASE WHEN _role = 'employee' THEN true ELSE false END
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role);
  RETURN NEW;
END;
$function$;

-- Create trigger if it doesn't exist (recreate)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed some default organizations
INSERT INTO public.organizations (name) VALUES
  ('Ministry of Interior'),
  ('Ministry of Education'),
  ('Ministry of Finance'),
  ('Ministry of Health'),
  ('Ministry of Justice'),
  ('Ministry of Defense'),
  ('Ministry of Foreign Affairs'),
  ('Ministry of Digital Economy');
