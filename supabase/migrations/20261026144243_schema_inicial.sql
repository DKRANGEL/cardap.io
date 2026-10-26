-- Schema inicial: lojas, categorias, produtos + RLS + bucket de fotos.
-- Ver seção 4 do PLANO.md.

-- ========== TABELAS ==========

create table public.lojas (
    id uuid primary key default gen_random_uuid(),
    owner_id uuid not null references auth.users (id) on delete cascade,
    slug text not null unique,
    nome text not null,
    whatsapp text not null,
    cor_primaria text,
    logo_url text,
    ativo boolean not null default true,
    created_at timestamptz not null default now(),
    constraint slug_formato check (slug ~ '^[a-z0-9-]+$'),
    constraint slug_reservado check (slug not in ('painel', 'api', 'login', 'admin', '_next'))
);

create index lojas_owner_id_idx on public.lojas (owner_id);

create table public.categorias (
    id uuid primary key default gen_random_uuid(),
    loja_id uuid not null references public.lojas (id) on delete cascade,
    nome text not null,
    ordem int not null default 0,
    created_at timestamptz not null default now()
);

create index categorias_loja_id_idx on public.categorias (loja_id);

create table public.produtos (
    id uuid primary key default gen_random_uuid(),
    loja_id uuid not null references public.lojas (id) on delete cascade,
    categoria_id uuid references public.categorias (id) on delete set null,
    nome text not null,
    descricao text,
    preco_centavos int not null check (preco_centavos >= 0),
    foto_url text,
    ativo boolean not null default true,
    ordem int not null default 0,
    created_at timestamptz not null default now()
);

create index produtos_loja_id_idx on public.produtos (loja_id);
create index produtos_categoria_id_idx on public.produtos (categoria_id);

-- ========== RLS: LOJAS ==========

alter table public.lojas enable row level security;

create policy "lojas_select_publico_ativo" on public.lojas
    for select using (ativo = true);

create policy "lojas_select_dono" on public.lojas
    for select using (auth.uid() = owner_id);

create policy "lojas_insert_dono" on public.lojas
    for insert with check (auth.uid() = owner_id);

create policy "lojas_update_dono" on public.lojas
    for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "lojas_delete_dono" on public.lojas
    for delete using (auth.uid() = owner_id);

-- ========== RLS: CATEGORIAS ==========

alter table public.categorias enable row level security;

create policy "categorias_select_publico" on public.categorias
    for select using (
        exists (select 1 from public.lojas l where l.id = loja_id and l.ativo = true)
    );

create policy "categorias_select_dono" on public.categorias
    for select using (
        exists (select 1 from public.lojas l where l.id = loja_id and l.owner_id = auth.uid())
    );

create policy "categorias_insert_dono" on public.categorias
    for insert with check (
        exists (select 1 from public.lojas l where l.id = loja_id and l.owner_id = auth.uid())
    );

create policy "categorias_update_dono" on public.categorias
    for update using (
        exists (select 1 from public.lojas l where l.id = loja_id and l.owner_id = auth.uid())
    ) with check (
        exists (select 1 from public.lojas l where l.id = loja_id and l.owner_id = auth.uid())
    );

create policy "categorias_delete_dono" on public.categorias
    for delete using (
        exists (select 1 from public.lojas l where l.id = loja_id and l.owner_id = auth.uid())
    );

-- ========== RLS: PRODUTOS ==========

alter table public.produtos enable row level security;

create policy "produtos_select_publico" on public.produtos
    for select using (
        ativo = true
        and exists (select 1 from public.lojas l where l.id = loja_id and l.ativo = true)
    );

create policy "produtos_select_dono" on public.produtos
    for select using (
        exists (select 1 from public.lojas l where l.id = loja_id and l.owner_id = auth.uid())
    );

create policy "produtos_insert_dono" on public.produtos
    for insert with check (
        exists (select 1 from public.lojas l where l.id = loja_id and l.owner_id = auth.uid())
    );

create policy "produtos_update_dono" on public.produtos
    for update using (
        exists (select 1 from public.lojas l where l.id = loja_id and l.owner_id = auth.uid())
    ) with check (
        exists (select 1 from public.lojas l where l.id = loja_id and l.owner_id = auth.uid())
    );

create policy "produtos_delete_dono" on public.produtos
    for delete using (
        exists (select 1 from public.lojas l where l.id = loja_id and l.owner_id = auth.uid())
    );

-- ========== STORAGE: BUCKET DE FOTOS ==========
-- Convenção de caminho: fotos/{loja_id}/{arquivo}. Leitura pública,
-- escrita só no prefixo da própria loja.

insert into storage.buckets (id, name, public)
values ('fotos', 'fotos', true)
on conflict (id) do nothing;

create policy "fotos_select_publico" on storage.objects
    for select using (bucket_id = 'fotos');

create policy "fotos_insert_dono" on storage.objects
    for insert with check (
        bucket_id = 'fotos'
        and exists (
            select 1 from public.lojas l
            where l.owner_id = auth.uid()
              and (storage.foldername(name))[1] = l.id::text
        )
    );

create policy "fotos_update_dono" on storage.objects
    for update using (
        bucket_id = 'fotos'
        and exists (
            select 1 from public.lojas l
            where l.owner_id = auth.uid()
              and (storage.foldername(name))[1] = l.id::text
        )
    );

create policy "fotos_delete_dono" on storage.objects
    for delete using (
        bucket_id = 'fotos'
        and exists (
            select 1 from public.lojas l
            where l.owner_id = auth.uid()
              and (storage.foldername(name))[1] = l.id::text
        )
    );
