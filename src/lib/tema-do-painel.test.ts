import assert from 'node:assert/strict'
import { test } from 'node:test'
import { razaoDeContraste } from './cor-da-loja.ts'
import { hexParaHslHeroui, temaDoPainel } from './tema-do-painel.ts'

test('hex vira HSL no formato do HeroUI', () => {
    assert.equal(hexParaHslHeroui('#ff0000'), '0 100% 50%')
    assert.equal(hexParaHslHeroui('#ffffff'), '0 0% 100%')
    assert.equal(hexParaHslHeroui('#000000'), '0 0% 0%')
    assert.equal(hexParaHslHeroui('#0000ff'), '240 100% 50%')
})

test('o tema devolve todas as variáveis e o contraste do botão é legível', () => {
    for (const cor of ['#bd3f0d', '#1c1814', '#fde047', '#1d4ed8', '#786d5f']) {
        const t = temaDoPainel(cor)
        for (const k of ['--color-acao', '--color-acao-hover', '--color-acao-suave', '--color-acao-contraste', '--heroui-primary', '--heroui-primary-foreground']) {
            assert.ok(t[k], `${cor} sem ${k}`)
        }
        assert.ok(razaoDeContraste(t['--color-acao'], t['--color-acao-contraste']) >= 4.5, cor)
        assert.ok(razaoDeContraste(t['--color-acao-texto'], '#fffdfa') >= 4.5, `texto ${cor}`)
    }
})
