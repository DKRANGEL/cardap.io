-- Seed de demonstração: 1 loja, 3 categorias, 12 produtos fictícios.
-- Dados e fotos próprios/fictícios, sem nomes ou imagens de marcas registradas.
-- Idempotente: pode rodar várias vezes (usa ON CONFLICT DO NOTHING com IDs fixos).

-- ========== DONO DEMO (placeholder técnico; login real só na Fase 2) ==========

insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    confirmation_token, email_change, email_change_token_new, recovery_token
) values (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated', 'authenticated', 'demo@cardap.io',
    crypt('demo-nao-usar-em-producao', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{}',
    '', '', '', ''
)
on conflict (id) do nothing;

-- ========== LOJA DEMO ==========

insert into public.lojas (id, owner_id, slug, nome, whatsapp, cor_primaria, ativo)
values (
    'a0000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'burger-do-joca-demo',
    'Burger do Joca (Demo)',
    '+5511999999999',
    '#059669',
    true
)
on conflict (id) do nothing;

-- ========== CATEGORIAS ==========

insert into public.categorias (id, loja_id, nome, ordem) values
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Burgers', 1),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Bebidas', 2),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Acompanhamentos e Sobremesas', 3)
on conflict (id) do nothing;

-- ========== PRODUTOS ==========

insert into public.produtos (id, loja_id, categoria_id, nome, descricao, preco_centavos, foto_url, ativo, ordem) values
    ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
     'Smash Furioso', 'Pão, carne, queijo, alface, tomate, onion rings, pimenta jalapeño e molho da casa.', 2790, '/images/smash-furioso.png', true, 1),
    ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
     'Burger Duplo', 'Dois smash de 100g, cheddar duplo e cebola caramelizada.', 3290, '/images/burger-duplo.png', true, 2),
    ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
     'Burger Triplo', 'Três smash de 100g, cheddar duplo e cebola caramelizada.', 3890, '/images/burger-triplo.png', true, 3),
    ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
     'Burger Bacon', 'Smash de 150g, bacon crocante e cheddar.', 3490, '/images/burger-bacon.png', true, 4),
    ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
     'Burger Clássico', 'Smash de 100g, queijo, alface, tomate e molho da casa.', 2490, '/images/burger-classico.png', true, 5),
    ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001',
     'Burger Vegetariano', 'Hambúrguer de grão-de-bico, queijo e rúcula.', 2990, '/images/burger-vegetariano.png', true, 6),

    ('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002',
     'Refrigerante Lata', '350ml bem gelado.', 650, '/images/refrigerante-lata.png', true, 1),
    ('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002',
     'Suco Natural', '500ml, sabor da fruta do dia.', 990, '/images/suco-natural.png', true, 2),
    ('c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002',
     'Água Mineral', '500ml sem gás.', 450, '/images/agua-mineral.png', true, 3),

    ('c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003',
     'Batata Palito', 'Porção crocante 300g.', 1490, '/images/batata-palito.png', true, 1),
    ('c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003',
     'Onion Rings', 'Porção de anéis de cebola empanados, 250g.', 1690, '/images/onion-rings.png', true, 2),
    ('c0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000003',
     'Brownie com Sorvete', 'Brownie de chocolate com bola de creme.', 1890, '/images/brownie-com-sorvete.png', true, 3)
on conflict (id) do nothing;
