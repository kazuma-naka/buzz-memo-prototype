CREATE TABLE IF NOT EXISTS public.invite_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL,
    inviting_user_id TEXT NOT NULL,
    invited_user_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT fk_service FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE,
    CONSTRAINT fk_inviting_user FOREIGN KEY (inviting_user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_invited_user FOREIGN KEY (invited_user_id) REFERENCES public.users(id)
);
