CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    image TEXT
);

GRANT ALL ON TABLE public.users TO authenticated,
postgres,
service_role;
