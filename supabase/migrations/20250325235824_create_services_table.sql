CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  path TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT fk_user_email FOREIGN KEY (user_email) REFERENCES public.users(email),
  CONSTRAINT fk_user_id FOREIGN KEY (created_user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_updated_at ON public.services;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

