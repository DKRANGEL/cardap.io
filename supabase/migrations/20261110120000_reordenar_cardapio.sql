-- Reordena em uma única gravação. SECURITY INVOKER: a RLS do dono continua valendo,
-- então ids de outra loja simplesmente não são atualizados (e a função avisa).
create or replace function public.reordenar_categorias(p_loja uuid, p_ids uuid[])
returns int
language plpgsql
security invoker
set search_path = public
as $$
declare n int;
begin
    update public.categorias c
       set ordem = t.pos
      from unnest(p_ids) with ordinality as t(id, pos)
     where c.id = t.id and c.loja_id = p_loja;
    get diagnostics n = row_count;
    return n;
end $$;

create or replace function public.reordenar_produtos(p_loja uuid, p_categoria uuid, p_ids uuid[])
returns int
language plpgsql
security invoker
set search_path = public
as $$
declare n int;
begin
    update public.produtos p
       set ordem = t.pos
      from unnest(p_ids) with ordinality as t(id, pos)
     where p.id = t.id and p.loja_id = p_loja and p.categoria_id = p_categoria;
    get diagnostics n = row_count;
    return n;
end $$;

grant execute on function public.reordenar_categorias(uuid, uuid[]) to authenticated;
grant execute on function public.reordenar_produtos(uuid, uuid, uuid[]) to authenticated;
