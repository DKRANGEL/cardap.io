-- Cores derivadas da cor principal da loja (calculadas no servidor ao salvar).
-- Ficam nulas nas lojas existentes: o servidor deriva na leitura e grava no próximo salvamento.

alter table public.lojas
    add column cor_contraste text,
    add column cor_tinta text,
    add constraint lojas_cor_contraste_formato
        check (cor_contraste is null or cor_contraste ~ '^#[0-9a-fA-F]{6}$'),
    add constraint lojas_cor_tinta_formato
        check (cor_tinta is null or cor_tinta ~ '^#[0-9a-fA-F]{6}$');
