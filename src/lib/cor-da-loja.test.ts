import assert from 'node:assert/strict'
import { test } from 'node:test'
import { derivarCorDaLoja, razaoDeContraste, TEXTO_CLARO, TEXTO_ESCURO } from './cor-da-loja.ts'

const FUNDO = '#fffdfa'

const CORES_EXTREMAS: Record<string, string> = {
    branco: '#ffffff',
    preto: '#000000',
    'amarelo-limao': '#ccff00',
    ciano: '#00ffff',
    amarelo: '#ffff00',
    verde: '#10b981',
    magenta: '#ff00ff',
    'cinza-medio': '#808080',
    laranja: '#ff8000',
    marinho: '#001f3f',
}

for (const [nome, hex] of Object.entries(CORES_EXTREMAS)) {
    test(`texto sobre a cor e a tinta sobre o papel ficam legíveis: ${nome} (${hex})`, () => {
        const { cor, contraste, tinta } = derivarCorDaLoja(hex)

        assert.ok([TEXTO_CLARO, TEXTO_ESCURO].includes(contraste))
        assert.match(tinta, /^#[0-9a-f]{6}$/)

        const textoSobreCor = razaoDeContraste(cor, contraste)
        const tintaSobrePapel = razaoDeContraste(tinta, FUNDO)

        assert.ok(textoSobreCor >= 4.5, `texto sobre ${cor}: ${textoSobreCor.toFixed(2)}:1`)
        assert.ok(tintaSobrePapel >= 4.5, `tinta ${tinta} sobre papel: ${tintaSobrePapel.toFixed(2)}:1`)
    })
}

test('mantém a cor quando ela já é escura o bastante', () => {
    const { cor, tinta } = derivarCorDaLoja('#bd3f0d')
    assert.equal(cor, '#bd3f0d')
    assert.equal(tinta, cor)
})

test('só ajusta o fundo quando nenhum texto chega a 4,5:1 (cinza médio)', () => {
    const { cor } = derivarCorDaLoja('#808080')
    assert.notEqual(cor, '#808080')
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(cor.slice(i, i + 2), 16))
    assert.ok(Math.abs(r - g) < 4 && Math.abs(g - b) < 4, `deveria continuar cinza, veio ${cor}`)
})

test('não mexe em cores que já têm texto legível', () => {
    for (const hex of ['#ffffff', '#000000', '#ffff00', '#ccff00', '#001f3f']) {
        assert.equal(derivarCorDaLoja(hex).cor, hex)
    }
})

test('escurece a cor clara mantendo a família da cor', () => {
    const { tinta } = derivarCorDaLoja('#ccff00')
    assert.notEqual(tinta, '#ccff00')
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(tinta.slice(i, i + 2), 16))
    assert.ok(g > b && r > b, `esperava verde-amarelado, veio ${tinta}`)
})

test('normaliza hex em maiúsculas', () => {
    assert.equal(derivarCorDaLoja('#BD3F0D').cor, '#bd3f0d')
})
