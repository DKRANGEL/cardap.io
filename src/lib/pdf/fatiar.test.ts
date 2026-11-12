import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fatiarPaginas, type BlocoMedido } from './fatiar.ts'

const bloco = (topo: number, base: number, colar = false): BlocoMedido => ({ topo, base, colar })

test('cabe numa página: uma fatia só, do primeiro bloco ao fim', () => {
    assert.deepEqual(fatiarPaginas([bloco(0, 300), bloco(310, 600)], 600, 1000), [{ inicio: 0, fim: 600 }])
})

test('corta no fim do último bloco inteiro que cabe e a próxima página começa no bloco seguinte', () => {
    const blocos = [bloco(0, 300), bloco(310, 600), bloco(610, 900)]
    assert.deepEqual(fatiarPaginas(blocos, 900, 700), [
        { inicio: 0, fim: 600 },
        { inicio: 610, fim: 900 },
    ])
})

test('nunca corta no meio de um bloco: o bloco que não cabe vai inteiro para a página seguinte', () => {
    const blocos = [bloco(0, 400), bloco(410, 800), bloco(810, 1000)]
    const fatias = fatiarPaginas(blocos, 1000, 700)
    assert.deepEqual(fatias[0], { inicio: 0, fim: 400 })
    assert.equal(fatias[1].inicio, 410)
    for (const f of fatias) for (const b of blocos) assert.ok(!(b.topo < f.fim && b.base > f.fim), 'bloco atravessado')
})

test('título não fica sozinho no fim da página', () => {
    const blocos = [bloco(0, 500), bloco(510, 560, true), bloco(570, 900), bloco(910, 1200)]
    const fatias = fatiarPaginas(blocos, 1200, 700)
    assert.ok(fatias[0].fim >= 500 && fatias[0].fim <= 510, 'o título fica para a página seguinte')
    assert.equal(fatias[1].inicio, 510)
})

test('bloco maior que a página: corte seco na altura da página, sem laço infinito', () => {
    const fatias = fatiarPaginas([bloco(0, 2000)], 2000, 700)
    assert.deepEqual(fatias, [
        { inicio: 0, fim: 700 },
        { inicio: 700, fim: 1400 },
        { inicio: 1400, fim: 2000 },
    ])
})

test('duas colunas: corta onde nenhum item de nenhuma coluna é atravessado', () => {
    const blocos = [
        bloco(0, 300), bloco(310, 600), bloco(610, 900),
        bloco(0, 250), bloco(260, 600), bloco(610, 900),
    ]
    const fatias = fatiarPaginas(blocos, 900, 700)
    assert.deepEqual(fatias, [
        { inicio: 0, fim: 600 },
        { inicio: 610, fim: 900 },
    ])
})

test('duas colunas sem corte limpo possível: cai no corte seco da altura da página', () => {
    const blocos = [bloco(0, 300), bloco(310, 650), bloco(660, 900), bloco(0, 500), bloco(510, 1000)]
    const fatias = fatiarPaginas(blocos, 1000, 700)
    assert.equal(fatias[0].fim, 700)
    assert.equal(fatias.length, 2)
})

test('sem blocos medidos ainda gera as páginas pela altura', () => {
    assert.deepEqual(fatiarPaginas([], 1500, 700), [
        { inicio: 0, fim: 700 },
        { inicio: 700, fim: 1400 },
        { inicio: 1400, fim: 1500 },
    ])
})
