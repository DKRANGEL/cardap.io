-- Senha de cada cliente, cifrada (AES-256-GCM, chave só no servidor), para o admin poder consultá-la.
-- RLS ligada e SEM policies: anon e authenticated não leem nem gravam; só a service role (que ignora a RLS).
create table public.cliente_senhas (
    user_id uuid primary key references auth.users (id) on delete cascade,
    senha_cifrada text not null,
    atualizada_em timestamptz not null default now()
);

alter table public.cliente_senhas enable row level security;
revoke all on public.cliente_senhas from anon, authenticated;
