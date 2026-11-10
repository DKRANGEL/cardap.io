import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { test } from 'node:test'
import { cifrar, decifrar } from './cifra-senha.ts'

const CHAVE = randomBytes(32).toString('base64')
const OUTRA = randomBytes(32).toString('base64')

test('ida e volta, inclusive com acento e espaço', () => {
    for (const s of ['Drco2709', 'Senha com espaço ç ã', 'a'.repeat(72)]) {
        assert.equal(decifrar(cifrar(s, CHAVE), CHAVE), s)
    }
})

test('a senha não aparece no texto cifrado e cada cifra é diferente', () => {
    const a = cifrar('Drco2709', CHAVE)
    assert.ok(!a.includes('Drco2709'))
    assert.notEqual(a, cifrar('Drco2709', CHAVE))
    assert.ok(a.startsWith('v1.'))
})

test('chave errada, adulteração e formato inválido falham', () => {
    const c = cifrar('Drco2709', CHAVE)
    assert.throws(() => decifrar(c, OUTRA))
    const partes = c.split('.')
    partes[3] = Buffer.from('outra coisa').toString('base64url')
    assert.throws(() => decifrar(partes.join('.'), CHAVE))
    assert.throws(() => decifrar('lixo', CHAVE), /inválido/)
})

test('chave ausente ou do tamanho errado dá erro claro', () => {
    assert.throws(() => cifrar('x', 'curta'), /32 bytes/)
})
