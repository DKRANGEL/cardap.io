import assert from 'node:assert/strict'
import { test } from 'node:test'
import { calcularRegua, MINIMO_PRODUTOS, type EstadoDaLoja } from './regua-publicacao.ts'

const LOJA = { nome: 'Burger do Joca', slug: 'burger-do-joca', whatsapp: '+5511912345678', divulgado_em: null }

const estado = (parcial: Partial<EstadoDaLoja> = {}): EstadoDaLoja => ({
    loja: LOJA,
    totalCategorias: 0,
    totalProdutos: 0,
    ...parcial,
})

const detalhe = (e: EstadoDaLoja, id: string) => calcularRegua(e).passos.find((p) => p.id === id)!.detalhe

test('sem loja: o passo atual é criar a loja e nada está pronto', () => {
    const r = calcularRegua(estado({ loja: null }))
    assert.equal(r.atual, 'loja')
    assert.equal(r.concluidos, 0)
    assert.equal(r.completa, false)
    assert.ok(r.passos.every((p) => !p.pronto))
})

test('loja criada: o próximo passo passa a ser a categoria', () => {
    const r = calcularRegua(estado())
    assert.equal(r.atual, 'categoria')
    assert.equal(r.concluidos, 1)
})

test('loja sem WhatsApp não conta como criada', () => {
    const r = calcularRegua(estado({ loja: { ...LOJA, whatsapp: '' } }))
    assert.equal(r.passos[0].pronto, false)
    assert.equal(r.atual, 'loja')
})

test('uma categoria fecha o passo 2 e leva ao passo 3', () => {
    const r = calcularRegua(estado({ totalCategorias: 1 }))
    assert.equal(r.passos[1].pronto, true)
    assert.equal(r.atual, 'produtos')
})

test('subtítulo quantitativo dos produtos: tem N, faltam M', () => {
    assert.equal(detalhe(estado({ totalCategorias: 1, totalProdutos: 2 }), 'produtos'), 'Você tem 2. Faltam 3.')
    assert.equal(detalhe(estado({ totalCategorias: 1, totalProdutos: 4 }), 'produtos'), 'Você tem 4. Falta 1.')
})

test('com 5 produtos o passo fecha; abaixo disso não', () => {
    assert.equal(calcularRegua(estado({ totalCategorias: 1, totalProdutos: MINIMO_PRODUTOS - 1 })).passos[2].pronto, false)
    assert.equal(calcularRegua(estado({ totalCategorias: 1, totalProdutos: MINIMO_PRODUTOS })).passos[2].pronto, true)
})

test('passos fora de ordem: produtos sem categoria continua apontando para a categoria', () => {
    const r = calcularRegua(estado({ totalCategorias: 0, totalProdutos: 8 }))
    assert.equal(r.atual, 'categoria')
    assert.equal(r.passos[2].pronto, true)
})

test('divulgação só fecha com divulgado_em preenchido', () => {
    const feita = estado({ totalCategorias: 1, totalProdutos: 5, loja: { ...LOJA, divulgado_em: '2026-10-27T12:00:00Z' } })
    const r = calcularRegua(feita)
    assert.equal(r.passos[3].pronto, true)
    assert.equal(r.completa, true)
    assert.equal(r.atual, null)
    assert.equal(r.concluidos, 4)
})

test('4 passos com os destinos certos', () => {
    const r = calcularRegua(estado())
    assert.deepEqual(r.passos.map((p) => p.href), ['/painel/loja', '/painel/cardapio', '/painel/cardapio', '/painel/divulgar'])
})

test('plural certo de categoria e produto', () => {
    assert.equal(detalhe(estado({ totalCategorias: 1 }), 'categoria'), 'Você tem 1 categoria.')
    assert.equal(detalhe(estado({ totalCategorias: 3 }), 'categoria'), 'Você tem 3 categorias.')
    assert.equal(detalhe(estado({ totalCategorias: 1, totalProdutos: 7 }), 'produtos'), 'Você tem 7 produtos.')
})
