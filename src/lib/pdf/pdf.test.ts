import assert from 'node:assert/strict'
import { test } from 'node:test'
import { agruparProdutos } from './agrupar.ts'
import { escapar } from './escapar.ts'
import { ladoDaFoto, MODELOS } from './modelos.ts'
import { TEMPLATE_PADRAO, TEMPLATES, temTemplate } from './templates/index.ts'
import type { DadosDoPdf } from './tipos.ts'

const FONTES = "@font-face{font-family:'Archivo';src:url(data:font/woff2;base64,AAAA) format('woff2');}"
const PIXEL = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA=='

const categorias = [
    { id: 'b', nome: 'Bebidas', ordem: 2 },
    { id: 'a', nome: 'Lanches', ordem: 1 },
    { id: 'v', nome: 'Vazia', ordem: 3 },
]
const produto = (nome: string, categoria_id: string | null, ordem: number, extra = {}) => ({
    categoria_id, nome, descricao: null, preco_centavos: 1590, foto_url: null, ordem, ...extra,
})

test('escapar neutraliza HTML e aspas', () => {
    assert.equal(escapar(`<script>alert("x")</script> & 'y'`), '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &#39;y&#39;')
})

test('agrupar: ordem das categorias e dos produtos, inativo fora, categoria vazia some', () => {
    const secoes = agruparProdutos(categorias, [
        produto('Coca', 'b', 1),
        produto('Burger B', 'a', 2),
        produto('Burger A', 'a', 1),
        produto('Escondido', 'a', 3, { ativo: false }),
    ])
    assert.deepEqual(secoes.map((s) => s.nome), ['Lanches', 'Bebidas'])
    assert.deepEqual(secoes[0].produtos.map((p) => p.nome), ['Burger A', 'Burger B'])
})

test('agrupar: produto sem categoria (ou de categoria inexistente) vai para Outros, no fim', () => {
    const secoes = agruparProdutos(categorias, [produto('Solto', null, 1), produto('Órfão', 'x', 2), produto('Coca', 'b', 1)])
    assert.deepEqual(secoes.map((s) => s.nome), ['Bebidas', 'Outros'])
    assert.deepEqual(secoes[1].produtos.map((p) => p.nome), ['Solto', 'Órfão'])
})

const dados = (nome = 'Lanchonete <b>do Zé</b>', descricao: string | null = 'Pão & queijo'): DadosDoPdf => ({
    loja: { nome, whatsapp: '(11) 91234-5678', cor: '#1d4ed8', contraste: '#fffdfa', tinta: '#1d4ed8', logo: PIXEL },
    secoes: [{ nome: 'Lanches <x>', produtos: [{ nome: '<script>alert(1)</script>', descricao, precoCentavos: 2790, foto: PIXEL }] }],
    atualizadoEm: '12/11/2026',
})

const IDS = Object.keys(TEMPLATES) as (keyof typeof TEMPLATES)[]

test('registro: os 4 modelos de MODELOS existem em TEMPLATES, com o padrão entre eles', () => {
    assert.deepEqual([...IDS].sort(), MODELOS.map((m) => m.id).sort())
    assert.equal(IDS.length, 4)
    assert.ok(temTemplate(TEMPLATE_PADRAO))
})

test('cada modelo escapa o texto do lojista e formata o preço em reais', () => {
    for (const id of IDS) {
        const html = TEMPLATES[id](dados(), { fontes: FONTES })
        assert.ok(!html.includes('<script>'), id)
        assert.ok(!html.includes('<b>do Zé'), id)
        assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/, id)
        assert.match(html, /R\$\s27,90/, id)
        assert.match(html, /Pão &amp; queijo/, id)
    }
})

test('cada modelo traz o rodapé com a data e usa a inicial quando não há logo', () => {
    for (const id of IDS) {
        const html = TEMPLATES[id](dados('Zé'), { fontes: FONTES })
        assert.match(html, /Atualizado em 12\/11\/2026/, id)
        const d = dados('zé')
        d.loja.logo = null
        const semLogo = TEMPLATES[id](d, { fontes: FONTES })
        assert.match(semLogo, /class="marca"[^>]*>Z</, id)
    }
})

test('cada modelo marca os blocos que não podem ser partidos entre páginas', () => {
    for (const id of IDS) {
        const html = TEMPLATES[id](dados(), { fontes: FONTES })
        assert.ok((html.match(/data-bloco/g) ?? []).length >= 4, id)
    }
})

test('só os modelos com foto embutem a imagem do produto', () => {
    for (const m of MODELOS) {
        const html = TEMPLATES[m.id](dados(), { fontes: FONTES })
        const imagens = (html.match(/<img\b[^>]*class="(?!marca)|<img\b(?![^>]*class=)/g) ?? []).length
        assert.equal(imagens > 0, m.foto > 0, m.id)
    }
})

test('o HTML é autossuficiente: nenhuma referência de rede', () => {
    for (const id of IDS) {
        const html = TEMPLATES[id](dados(), { fontes: FONTES })
        assert.doesNotMatch(html, /https?:\/\//i, id)
        assert.doesNotMatch(html, /<link\b/i, id)
        assert.doesNotMatch(html, /@import/i, id)
        assert.doesNotMatch(html, /<script\b/i, id)
    }
})

test('imagem que não é data URI de imagem, e cor inválida, são ignoradas', () => {
    const d = dados()
    d.loja.logo = 'https://exemplo.com/logo.png'
    d.loja.cor = 'red; } body { display:none'
    d.secoes[0].produtos[0].foto = 'javascript:alert(1)'
    for (const id of IDS) {
        const html = TEMPLATES[id](d, { fontes: FONTES })
        assert.doesNotMatch(html, /https?:\/\//, id)
        assert.doesNotMatch(html, /javascript:/, id)
        assert.doesNotMatch(html, /display:none/, id)
        assert.match(html, /--cor: #bd3f0d/, id)
    }
})

test('registro de templates', () => {
    for (const m of MODELOS) assert.equal(temTemplate(m.id), true)
    assert.equal(temTemplate('provisorio'), false)
    assert.equal(temTemplate('__proto__'), false)
    assert.equal(temTemplate('constructor'), false)
})

test('o lado da foto: Vitrine 320px, Clássico 180px, modelos sem foto 0', () => {
    assert.equal(ladoDaFoto('vitrine'), 320)
    assert.equal(ladoDaFoto('classico'), 180)
    assert.equal(ladoDaFoto('compacto'), 0)
    assert.equal(ladoDaFoto('destaque'), 0)
})
