import assert from 'node:assert/strict'
import { test } from 'node:test'
import { caminhoDaFoto, urlPublicaDaFoto } from './foto-do-bucket.ts'

const BASE = 'https://projeto.supabase.co'
const LOJA = 'c87ffb65-acf5-4ffa-84b6-a2b5e11e3500'
const OUTRA = '11111111-2222-3333-4444-555555555555'
const url = (loja: string, arquivo: string) => `${BASE}/storage/v1/object/public/fotos/${loja}/${arquivo}`

test('foto da própria loja devolve o caminho do bucket', () => {
    assert.equal(caminhoDaFoto(url(LOJA, 'produto-123.webp'), LOJA, BASE), `${LOJA}/produto-123.webp`)
})

test('foto de OUTRA loja nunca é apagável', () => {
    assert.equal(caminhoDaFoto(url(OUTRA, 'produto-123.webp'), LOJA, BASE), null)
})

test('foto de demonstração local, URL de fora e vazio não são apagáveis', () => {
    for (const v of ['/images/smash-furioso.png', 'https://exemplo.com/foto.webp', '', null]) {
        assert.equal(caminhoDaFoto(v, LOJA, BASE), null, String(v))
    }
})

test('caminho com subpasta, "..", query ou nome vazio é recusado', () => {
    for (const arquivo of ['sub/foto.webp', '../outra/foto.webp', 'foto.webp?x=1', '']) {
        assert.equal(caminhoDaFoto(url(LOJA, arquivo), LOJA, BASE), null, arquivo)
    }
})

test('sem endereço base configurado não apaga nada', () => {
    assert.equal(caminhoDaFoto(url(LOJA, 'a.webp'), LOJA, ''), null)
})

test('a URL montada é a mesma que o reconhecedor aceita', () => {
    const u = urlPublicaDaFoto(LOJA, 'produto-1.webp', BASE)
    assert.equal(caminhoDaFoto(u, LOJA, BASE), `${LOJA}/produto-1.webp`)
})
