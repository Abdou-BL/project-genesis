
-- Trigger: notify org users when a new terminology term is added
CREATE OR REPLACE FUNCTION public.notify_term_inserted()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  actor_name text;
BEGIN
  SELECT (p.first_name || ' ' || p.last_name) INTO actor_name
    FROM profiles p WHERE p.user_id = NEW.created_by;
  IF NEW.organization_id IS NOT NULL THEN
    PERFORM notify_org_users(
      NEW.organization_id,
      'New terminology term added',
      'Term "' || NEW.en || ' / ' || NEW.fr || '" added by ' || COALESCE(actor_name, 'unknown'),
      'term',
      '/terminology'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_term_inserted
AFTER INSERT ON public.terminology_terms
FOR EACH ROW EXECUTE FUNCTION public.notify_term_inserted();

-- Trigger: notify org users when a terminology term is deleted
CREATE OR REPLACE FUNCTION public.notify_term_deleted()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  actor_name text;
BEGIN
  SELECT (p.first_name || ' ' || p.last_name) INTO actor_name
    FROM profiles p WHERE p.user_id = OLD.created_by;
  IF OLD.organization_id IS NOT NULL THEN
    PERFORM notify_org_users(
      OLD.organization_id,
      'Terminology term deleted',
      'Term "' || OLD.en || ' / ' || OLD.fr || '" deleted by ' || COALESCE(actor_name, 'unknown'),
      'term',
      '/terminology'
    );
  END IF;
  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_notify_term_deleted
AFTER DELETE ON public.terminology_terms
FOR EACH ROW EXECUTE FUNCTION public.notify_term_deleted();

-- Trigger: notify org users when a new course is added
CREATE OR REPLACE FUNCTION public.notify_course_inserted()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  actor_name text;
BEGIN
  SELECT (p.first_name || ' ' || p.last_name) INTO actor_name
    FROM profiles p WHERE p.user_id = NEW.created_by;
  IF NEW.organization_id IS NOT NULL THEN
    PERFORM notify_org_users(
      NEW.organization_id,
      'New course added',
      'Course "' || NEW.title || '" added by ' || COALESCE(actor_name, 'unknown'),
      'course',
      '/courses'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_course_inserted
AFTER INSERT ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.notify_course_inserted();

-- Trigger: notify org users when a course is deleted
CREATE OR REPLACE FUNCTION public.notify_course_deleted()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  actor_name text;
BEGIN
  SELECT (p.first_name || ' ' || p.last_name) INTO actor_name
    FROM profiles p WHERE p.user_id = OLD.created_by;
  IF OLD.organization_id IS NOT NULL THEN
    PERFORM notify_org_users(
      OLD.organization_id,
      'Course deleted',
      'Course "' || OLD.title || '" deleted by ' || COALESCE(actor_name, 'unknown'),
      'course',
      '/courses'
    );
  END IF;
  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_notify_course_deleted
AFTER DELETE ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.notify_course_deleted();

-- Trigger: notify org users when a new meeting is added
CREATE OR REPLACE FUNCTION public.notify_meeting_inserted()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  actor_name text;
BEGIN
  SELECT (p.first_name || ' ' || p.last_name) INTO actor_name
    FROM profiles p WHERE p.user_id = NEW.created_by;
  IF NEW.organization_id IS NOT NULL THEN
    PERFORM notify_org_users(
      NEW.organization_id,
      'New meeting scheduled',
      'Meeting "' || NEW.title || '" created by ' || COALESCE(actor_name, 'unknown'),
      'meeting',
      '/meetings'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_meeting_inserted
AFTER INSERT ON public.meetings
FOR EACH ROW EXECUTE FUNCTION public.notify_meeting_inserted();

-- Trigger: notify user when their account is approved (is_verified set to true)
CREATE OR REPLACE FUNCTION public.notify_account_approved()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF OLD.is_verified = false AND NEW.is_verified = true THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (NEW.user_id, 'Account approved', 'Your account has been verified. You now have full access.', 'approval', '/dashboard');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_account_approved
AFTER UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.notify_account_approved();

-- Trigger: notify org users when a meeting is deleted
CREATE OR REPLACE FUNCTION public.notify_meeting_deleted()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  actor_name text;
BEGIN
  SELECT (p.first_name || ' ' || p.last_name) INTO actor_name
    FROM profiles p WHERE p.user_id = OLD.created_by;
  IF OLD.organization_id IS NOT NULL THEN
    PERFORM notify_org_users(
      OLD.organization_id,
      'Meeting deleted',
      'Meeting "' || OLD.title || '" deleted by ' || COALESCE(actor_name, 'unknown'),
      'meeting',
      '/meetings'
    );
  END IF;
  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_notify_meeting_deleted
AFTER DELETE ON public.meetings
FOR EACH ROW EXECUTE FUNCTION public.notify_meeting_deleted();
