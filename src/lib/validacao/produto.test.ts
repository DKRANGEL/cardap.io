import assert from 'node:assert/strict'
import { test } from 'node:test'
import { toBRL } from '../moeda.ts'
import { centavosDigitados, centavosDoTexto, PRECO_MAX_CENTAVOS } from '../preco.ts'
import { DESCRICAO_PRODUTO_MAX, NOME_PRODUTO_MAX, produtoSchema } from './produto.ts'

const UUID = '3f2b8c1e-5a4d-4e7b-9c6a-1d2e3f4a5b6c'
const base = { nome: 'Smash Furioso', descricao: '', categoria_id: UUID, preco: 'R$ 27,90' }
const ler = (parcial: Record<string, unknown> = {}) => produtoSchema.safeParse({ ...base, ...parcial })
const mensagem = (r: ReturnType<typeof ler>) => (!r.success ? r.error.issues[0].message : '')
const sem_nbsp = (s: string) => s.replace(/ /g, ' ')

test('o preço em texto vira centavos, com ou sem máscara', () => {
    assert.equal(centavosDoTexto('R$ 27,90'), 2790)
    assert.equal(centavosDoTexto('2790'), 2790)
    assert.equal(centavosDoTexto('R$ 1.234,50'), 123450)
    assert.equal(centavosDoTexto('R$ 0,05'), 5)
    assert.equal(centavosDoTexto('000012'), 12)
})

test('vazio, zero e lixo viram 0 centavos', () => {
    for (const v of ['', 'R$ 0,00', '   ', 'abc', 'R$']) assert.equal(centavosDoTexto(v), 0, JSON.stringify(v))
})

test('máscara digitando: os dígitos entram pela direita', () => {
    let texto = ''
    const passos: number[] = []
    for (const tecla of '2790') {
        texto = toBRL(centavosDigitados(texto + tecla))
        passos.push(centavosDigitados(texto))
    }
    assert.deepEqual(passos, [2, 27, 279, 2790])
    assert.equal(sem_nbsp(texto), 'R$ 27,90')
})

test('máscara: apagar o último dígito devolve o valor anterior', () => {
    assert.equal(centavosDigitados('R$ 27,9'), 279)
    assert.equal(centavosDigitados('R$ 2,7'), 27)
    assert.equal(centavosDigitados('R$ 0,0'), 0)
})

test('máscara: passar do teto é ignorado, não aceito', () => {
    assert.equal(centavosDigitados('R$ 9.999,99'), PRECO_MAX_CENTAVOS)
    // um dígito a mais (9999999) é cortado e o campo fica no teto, em vez de pular para outro valor
    assert.equal(centavosDigitados('R$ 9.999,999'), PRECO_MAX_CENTAVOS)
    assert.equal(centavosDigitados('12345678901'), 123456)
})

test('o preço é sempre mostrado em reais', () => {
    assert.equal(sem_nbsp(toBRL(2790)), 'R$ 27,90')
    assert.equal(sem_nbsp(toBRL(5)), 'R$ 0,05')
    assert.equal(sem_nbsp(toBRL(PRECO_MAX_CENTAVOS)), 'R$ 9.999,99')
})

test('produto válido: nome aparado, preço em centavos e descrição vazia vira null', () => {
    const r = ler({ nome: '  Smash   Furioso ' })
    assert.equal(r.success, true)
    if (r.success) {
        assert.equal(r.data.nome, 'Smash Furioso')
        assert.equal(r.data.preco, 2790)
        assert.equal(r.data.descricao, null)
    }
})

test('descrição é aparada e mantida quando preenchida', () => {
    const r = ler({ descricao: '  Pão,   carne e queijo ' })
    assert.equal(r.success && r.data.descricao, 'Pão, carne e queijo')
})

test('nome: obrigatório e com limite', () => {
    assert.equal(mensagem(ler({ nome: '' })), 'Informe o nome do produto.')
    assert.equal(mensagem(ler({ nome: 'a' })), 'Informe o nome do produto.')
    assert.equal(ler({ nome: 'a'.repeat(NOME_PRODUTO_MAX) }).success, true)
    assert.equal(mensagem(ler({ nome: 'a'.repeat(NOME_PRODUTO_MAX + 1) })), `Use no máximo ${NOME_PRODUTO_MAX} caracteres.`)
})

test('descrição: limite de 140 caracteres', () => {
    assert.equal(ler({ descricao: 'a'.repeat(DESCRICAO_PRODUTO_MAX) }).success, true)
    assert.equal(
        mensagem(ler({ descricao: 'a'.repeat(DESCRICAO_PRODUTO_MAX + 1) })),
        `Use no máximo ${DESCRICAO_PRODUTO_MAX} caracteres.`,
    )
})

test('categoria é obrigatória e precisa ser um id válido', () => {
    for (const v of ['', 'abc', 'null', undefined]) {
        const r = ler({ categoria_id: v })
        assert.equal(r.success, false, String(v))
        assert.equal(mensagem(r), 'Escolha a categoria do produto.', String(v))
    }
})

test('preço: obrigatório, positivo e com teto de R$ 9.999,99', () => {
    for (const v of ['', 'R$ 0,00', 'abc']) assert.equal(mensagem(ler({ preco: v })), 'Informe o preço do produto.', v)
    assert.equal(ler({ preco: 'R$ 0,01' }).success, true)
    assert.equal(ler({ preco: 'R$ 9.999,99' }).success, true)
    assert.equal(mensagem(ler({ preco: 'R$ 10.000,00' })), 'O preço máximo é R$ 9.999,99.')
})

test('recusa o que não é texto', () => {
    for (const campo of ['nome', 'descricao', 'preco']) {
        assert.equal(ler({ [campo]: null }).success, false, campo)
        assert.equal(ler({ [campo]: 42 }).success, false, campo)
    }
})
