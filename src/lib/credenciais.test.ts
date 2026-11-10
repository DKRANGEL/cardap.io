import assert from 'node:assert/strict'
import { test } from 'node:test'
import { erroDaSenha, erroDoEmail, normalizarEmail, SENHA_MAX, SENHA_MIN } from './credenciais.ts'

test('e-mail: aceita completo e recusa vazio ou incompleto', () => {
    assert.equal(erroDoEmail('ana@loja.com'), null)
    assert.equal(erroDoEmail('  ana@loja.com.br '), null)
    for (const v of ['', '   ', 'ana', 'ana@', 'ana@loja', 'ana@loja.c', 'a na@loja.com']) {
        assert.notEqual(erroDoEmail(v), null, JSON.stringify(v))
    }
})

test('e-mail: normaliza para minúsculas sem espaços', () => {
    assert.equal(normalizarEmail('  Ana@Loja.COM '), 'ana@loja.com')
})

test('senha: de 8 a 72 caracteres, sem outras exigências', () => {
    assert.equal(erroDaSenha('Drco2709'), null)
    assert.equal(erroDaSenha('a'.repeat(SENHA_MIN)), null)
    assert.equal(erroDaSenha('a'.repeat(SENHA_MAX)), null)
    assert.equal(erroDaSenha('senha com espaço'), null)
    assert.match(erroDaSenha('') ?? '', /Digite/)
    assert.match(erroDaSenha('a'.repeat(SENHA_MIN - 1)) ?? '', /pelo menos 8/)
    assert.match(erroDaSenha('a'.repeat(SENHA_MAX + 1)) ?? '', /no máximo 72/)
})
