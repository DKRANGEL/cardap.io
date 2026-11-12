import assert from 'node:assert/strict'
import { test } from 'node:test'
import { agruparProdutos } from './agrupar.ts'
import { escapar } from './escapar.ts'
import { TEMPLATES, temTemplate } from './templates/index.ts'
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
})

test('o template escapa o texto do lojista e formata o preço em reais', () => {
    const html = TEMPLATES.provisorio(dados(), { fontes: FONTES })
    assert.ok(!html.includes('<script>'))
    assert.ok(!html.includes('<b>do Zé'))
    assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/)
    assert.match(html, /R\$\s27,90/)
    assert.match(html, /Pão &amp; queijo/)
})

test('o HTML é autossuficiente: nenhuma referência de rede', () => {
    for (const id of Object.keys(TEMPLATES)) {
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
    const html = TEMPLATES.provisorio(d, { fontes: FONTES })
    assert.doesNotMatch(html, /https?:\/\//)
    assert.doesNotMatch(html, /javascript:/)
    assert.doesNotMatch(html, /display:none/)
    assert.match(html, /--cor: #bd3f0d/)
})

test('registro de templates', () => {
    assert.equal(temTemplate('provisorio'), true)
    assert.equal(temTemplate('__proto__'), false)
    assert.equal(temTemplate('constructor'), false)
})
