import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mensagemDeCadastroDeCliente, mensagemDeSenhaNova, mensagemDoLogin } from './erros-auth.ts'

test('login: credenciais erradas, limite e falha de rede têm mensagens diferentes', () => {
    assert.match(mensagemDoLogin({ status: 400, code: 'invalid_credentials' }), /incorretos/)
    assert.match(mensagemDoLogin({ status: 429 }), /Muitas tentativas/)
    assert.match(mensagemDoLogin({ code: 'over_request_rate_limit' }), /Muitas tentativas/)
    assert.match(mensagemDoLogin({ status: 500 }), /servidor/)
    assert.match(mensagemDoLogin(null), /servidor/)
})

test('cadastro de cliente: e-mail repetido e senha fraca', () => {
    assert.match(mensagemDeCadastroDeCliente({ code: 'email_exists' }), /Já existe/)
    assert.match(mensagemDeCadastroDeCliente({ code: 'user_already_exists' }), /Já existe/)
    assert.match(mensagemDeCadastroDeCliente({ code: 'weak_password' }), /fraca/)
    assert.match(mensagemDeCadastroDeCliente({ status: 500 }), /Tente de novo/)
})

test('senha nova: igual à atual, fraca e limite', () => {
    assert.match(mensagemDeSenhaNova({ code: 'same_password' }), /diferente/)
    assert.match(mensagemDeSenhaNova({ code: 'weak_password' }), /fraca/)
    assert.match(mensagemDeSenhaNova({ status: 429 }), /Muitas tentativas/)
    assert.match(mensagemDeSenhaNova({ status: 500 }), /Tente de novo/)
})
