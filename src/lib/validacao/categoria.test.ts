import assert from 'node:assert/strict'
import { test } from 'node:test'
import { categoriaSchema, nomeJaExiste, normalizarNome, NOME_CATEGORIA_MAX } from './categoria.ts'

const nome = (v: unknown) => categoriaSchema.safeParse({ nome: v })

test('aceita um nome simples e apara os espaços', () => {
    const r = nome('  Bebidas  ')
    assert.equal(r.success && r.data.nome, 'Bebidas')
})

test('junta espaços repetidos no meio do nome', () => {
    const r = nome('Lanches    da   Casa')
    assert.equal(r.success && r.data.nome, 'Lanches da Casa')
})

test('recusa nome vazio, só espaços e curto demais, com mensagem em português', () => {
    for (const v of ['', '   ', 'a']) {
        const r = nome(v)
        assert.equal(r.success, false, JSON.stringify(v))
        assert.equal(!r.success && r.error.issues[0].message, 'Informe o nome da categoria.')
    }
})

test('limite de tamanho: aceita o máximo e recusa um a mais', () => {
    assert.equal(nome('a'.repeat(NOME_CATEGORIA_MAX)).success, true)
    const r = nome('a'.repeat(NOME_CATEGORIA_MAX + 1))
    assert.equal(r.success, false)
    assert.equal(!r.success && r.error.issues[0].message, `Use no máximo ${NOME_CATEGORIA_MAX} caracteres.`)
})

test('recusa o que não é texto', () => {
    for (const v of [null, undefined, 42, {}]) assert.equal(nome(v).success, false, String(v))
})

test('normaliza sem acento, sem maiúscula e sem espaço sobrando', () => {
    assert.equal(normalizarNome('  Açaí  e   Sobremesas '), 'acai e sobremesas')
})

test('detecta duplicado ignorando acento, caixa e espaços', () => {
    assert.equal(nomeJaExiste('BEBIDAS', ['Lanches', 'Bebidas']), true)
    assert.equal(nomeJaExiste('Acai', ['Açaí']), true)
    assert.equal(nomeJaExiste('Sucos', ['Lanches', 'Bebidas']), false)
})

test('ao renomear, o próprio nome atual não conta como duplicado (mudar só a caixa)', () => {
    assert.equal(nomeJaExiste('bebidas', ['Lanches', 'Bebidas'], 'Bebidas'), false)
    assert.equal(nomeJaExiste('Lanches', ['Lanches', 'Bebidas'], 'Bebidas'), true)
})
