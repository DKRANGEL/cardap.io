# CLAUDE.md

## 1. O que é
cardap.io: cardápio digital multi-loja para lanchonetes. O lojista monta categorias e produtos no painel
(`/painel`), divulga o link/QR e o PDF; o cliente final vê o cardápio público em `/[slug]`.
O acesso é fechado: o admin cria e-mail e senha de cada cliente em `/admin/clientes` (não há cadastro público).
Idioma de UI, commits, PRs e issues: português do Brasil.

## 2. Stack (de package.json)
- Next.js 15.5.2 (App Router, Turbopack), React 19.1.0, TypeScript 5 (`strict`), alias `@/*` -> `src/*`
- Tailwind 4 (CSS-first, tokens em `src/app/globals.css`), HeroUI 2.8 (só `/painel`, `/entrar`)
- Supabase (`@supabase/ssr` 0.12, `supabase-js` 2.118): Postgres + RLS + Auth + Storage (bucket `fotos`)
- zod 4, sharp 0.35, puppeteer-core 25 + @sparticuz/chromium 153 (PDF), html2canvas 1.4 + jspdf 4 (fallback do PDF
  no navegador, só carregados sob demanda), qrcode, lucide-react
- Gerenciador: pnpm (há `pnpm-lock.yaml` e `pnpm-workspace.yaml`). Node >= 24 (script usa `--env-file-if-exists`)

## 3. Comandos
- Dev: `pnpm dev` | Build: `pnpm build` | Start: `pnpm start`
- Lint: `pnpm lint` | Tipos: `pnpm exec tsc --noEmit`
- Testes: `pnpm test` (= `node --test "src/**/*.test.ts"`, Node puro, sem Jest/Vitest)
- Seed do admin: `pnpm seed:admin` (lê `.env.local`; recusa Supabase que não seja local sem `--producao`)
- Supabase local (Docker): `npx supabase start | stop | db reset --local | migration up --local`
- Produção: `npx supabase db push --linked` (só com aval explícito do dono do projeto)

## 4. Mapa de pastas
- `src/app/[slug]` cardápio público (Server Component; sem HeroUI)
- `src/app/painel` painel do lojista (`cardapio/`, `loja/`, `divulgar/`; layout aplica a cor da loja)
- `src/app/admin` área do admin (`clientes/`); `src/app/entrar` login
- `src/components` componentes compartilhados; `components/cardapio` é a árvore pública
- `src/lib` regras puras e testadas (`preco`, `reordenar`, `cor-da-loja`, `credenciais`, `cifra-senha`...)
- `src/lib/validacao` schemas zod; `src/lib/supabase` clientes (`server`, `client`, `middleware`, `admin`)
- `src/lib/pdf` HTML autossuficiente do PDF (`templates/` com os 4 modelos + `comum.ts`, `modelos.ts` lista leve que a
  interface importa, `fatiar.ts` corte em páginas do fallback, `fontes/` WOFF2 versionadas, `renderizar.ts`)
- `src/app/painel/divulgar` link, QR (SVG na tela e PNG para baixar) e PDF (`acoes-pdf.tsx`, rota `pdf/route.ts`,
  fallback em `pdf-no-navegador.ts`)
- `src/middleware.ts` protege `/painel`, `/admin`, `/entrar`
- `supabase/migrations` migrations; `supabase/seed.sql` demo; `scripts/` seed-admin
- `ia_docs/` documentos de planejamento (PLANO, BRIEFING-DESIGN, REFATORACAO-DESIGN, PESQUISA-MODELOS-PDF); os `*.md`
  estão no `.gitignore`

## 5. Convenções observadas
- Nomes de arquivos, funções e variáveis em português (`contextoDaLoja`, `salvarLoja`); tipos em PT também
- Testes ao lado do código (`*.test.ts`), imports com extensão `.ts` nos módulos puros para o Node rodar
- Server Actions em `actions*.ts` retornam `{ ok: true, ... } | { ok: false, erro?, erros? }`; nunca lançam
  para erro esperado. Mensagens de erro em português, sem jargão
- Toda ação do painel começa por `contextoDaLoja()` (`src/lib/acao-da-loja.ts`) e filtra por `loja_id`
- Ações admin começam por `contextoDoAdmin()` (`src/lib/acao-admin.ts`) antes de usar a service role
- Preço sempre em centavos (int); `toBRL` em `src/lib/moeda.ts`; máscara em reais em `campo-preco.tsx`
- Formulários: `Campo` (`components/campo.tsx`), alvos de toque >= 44px, fonte de 16px, mobile-first (360px)
- Tokens de cor: `bg-acao`, `text-acao-contraste`, `text-acao-texto`, `text-tinta-media`, `border-borda`
- Commits convencionais em português (`feat(pdf): ...`), granulares por responsabilidade; branch
  `feature/nome-curto` (sem número de issue), criada a partir da `develop`; um PR por issue (ou o que o dono
  agrupar) com label `enhancement`, milestone e `Closes #N`, **apontando para a `develop`**
- Fluxo de branches: a `develop` é a principal durante a milestone. A `main` só recebe a `develop` quando a
  milestone termina, com a tag de versão da milestone (`vX.Y.0`). O GitHub só fecha `Closes #N` ao chegar na
  branch padrão, então feche as issues à mão quando o PR entrar na `develop`
- Arquivos com CRLF no Windows: edição por script/sed de texto multilinha falha silenciosamente

## 6. Decisões não óbvias
- Admin = `app_metadata.role = 'admin'` (só a service role grava). `SUPABASE_SERVICE_ROLE_KEY` só em
  `src/app/admin`, `acao-admin.ts`, `supabase/admin.ts`, `cifra-senha.ts`, `painel/loja/actions-conta.ts`;
  `src/lib/fronteira-heroui.test.ts` falha se vazar para componente de cliente ou para a árvore pública
- Senhas de clientes ficam também cifradas (AES-256-GCM, `SENHAS_CHAVE`) em `cliente_senhas` (RLS sem
  policies) para o admin consultar; a troca de senha do cliente passa por Server Action para atualizar a cifra
- `[auth.email] enable_signup` em `supabase/config.toml` precisa ficar `true` (false desliga o login);
  o cadastro público é fechado por `[auth] enable_signup = false`
- Reordenar: funções SQL `reordenar_categorias/produtos` (security invoker) gravam `ordem` numa única chamada;
  arraste próprio com Pointer Events (sem `@dnd-kit`)
- Foto do produto sobe por Server Action (`bodySizeLimit: 2mb`) para não levar o supabase-js ao navegador;
  redimensionada no cliente para 800px WebP; `caminhoDaFoto` só reconhece URLs do bucket da própria loja
- Cor da loja: `derivarCorDaLoja` garante contraste 4,5:1; painel sobrescreve tokens via `tema-do-painel.ts`
- PDF: HTML sem nenhuma rede (fotos e fontes em base64); `?formato=html&template=<id>` no preview, PDF por padrão;
  Chrome local via `CHROME_PATH` ou caminhos padrão, em produção `@sparticuz/chromium`
- PDF, modelos: 4 padrão para toda loja (Clássico, Compacto, Vitrine, Destaque), todos com cor e logo da loja (sem
  logo vira a inicial). Registro em `templates/index.ts` + `modelos.ts`; `foto` = lado da miniatura (180, 320 no
  Vitrine, 0 = o modelo nem baixa fotos). Rodapé via `@page { @bottom-* }` (repete em toda página; o `<footer>`
  inline só aparece na tela). Blocos que não podem partir levam `data-bloco` (títulos `="titulo"`)
- PDF, tela: modelo escolhido na prévia (guardado em `localStorage`, sem migration). Prévia e PDF de cada modelo ficam
  em cache na tela enquanto ela estiver aberta (recarregar zera). A prévia é uma página contínua, o PDF pagina
- PDF, compartilhar: `navigator.share` só aceita logo após o toque e só em HTTPS, por isso o PDF é preparado ao abrir
  a prévia. `NotAllowedError` não baixa: o mesmo botão vira "Escolher o aplicativo" (segundo toque). Só baixa se o
  aparelho não compartilha arquivo. Para testar no celular use HTTPS (ex.: `tailscale serve --bg --https=8443
  http://127.0.0.1:3000`; nunca mexa no Funnel da 443 do dono)
- PDF, fallback (#16): se o servidor falhar, aparece "Gerar versão simplificada" (só com o toque do lojista).
  `pdf-no-navegador.ts` carrega o HTML da prévia num iframe fora da tela, troca `<img>` com `object-fit` por `div`
  com `background-size` (o html2canvas ignora object-fit), fixa `line-height` e +4px nos `h2` (o html2canvas
  desenha o texto ~4px abaixo) e corta com `fatiarPaginas`. Sai raster, sem texto selecionável
- Retry do postgrest desligado no servidor (`db: { retry: false }`) para falhar rápido
- `images.remotePatterns` libera só `/storage/v1/object/public/fotos/**` do host do Supabase

## 7. O que NÃO fazer
- Nunca rodar nada contra produção sem aval: `.env.local` aponta para o Supabase de PRODUÇÃO. Para testes,
  passe as variáveis do Supabase local por processo (API `http://127.0.0.1:54321`)
- Não commitar `.env*` (só `.env.example`), nem senha/chave de serviço; não colocar a chave em `NEXT_PUBLIC_*`
- Não importar `@heroui` em `src/components/cardapio` nem `src/app/[slug]`; nem o arraste do painel na árvore pública
- Não importar `validacao/produto.ts` (zod) em componente de cliente: use `limites-produto.ts`/`preco.ts`
- Não editar à mão: `.next/`, `next-env.d.ts`, `tsconfig.tsbuildinfo`, `pnpm-lock.yaml`
- Não usar `taskkill /IM chrome.exe` (fecha o Chrome do usuário); porta de teste usada: 18099 (divide o `.next` com o
  `pnpm dev` do dono: se sobrar tipo velho no `tsc`, tire a linha do `.next/types/validator.ts`)
- Não aplicar migrations em produção nem commitar/pushar sem pedido do usuário
- Não abrir PR nem dar push na `main` fora do fim da milestone; o dia a dia vai para a `develop`
- Frágil: o `README.md` ainda é o do create-next-app (desatualizado)

## Decisões do dono (confirmadas)
- Node 24 (v24.13.1 em uso). Produção: Vercel (hospedagem do PDF ainda a testar na #17, milestone v1.0).
- `ia_docs/` fica fora do Git. Não há CI nem deploy ainda (só ambiente de desenvolvimento).
- `package.json` em `0.4.0` (acompanha a tag da milestone); `type: module` fica (os testes rodam `.ts` direto no Node, em ESM).
- Em Divulgar só existe "Compartilhar PDF" (abre a folha do sistema; baixa só se o aparelho não compartilha);
  sem botão "Enviar". O QR code tem "Baixar QR code (PNG)" (1024px, margem de silêncio).
- Fluxo da v0.4.0: tag `v0.4.0` só ao fechar a milestone, depois do PR da `develop` para a `main`.

## Pendências
- v0.4.0: falta validar os 4 modelos com um lojista real (#18) e testar o fallback com o Chromium derrubado de
  propósito (`CHROME_PATH` inválido) no painel (#16). Teste de hospedagem do Chromium (#17) está na v1.0.
- Compacto (2 colunas) pode ter corte seco no fallback quando as colunas não têm ponto de corte em comum.
