-- Marca quando o lojista abriu a tela de divulgação pela primeira vez.
-- Alimenta o passo 4 da régua de publicação do painel. Nula nas lojas existentes;
-- a policy de update do dono (lojas_update_dono) já permite gravar.

alter table public.lojas
    add column divulgado_em timestamptz;
