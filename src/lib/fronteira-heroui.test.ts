import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'

const RAIZ = process.cwd()

function arquivosDe(pasta: string): string[] {
    return readdirSync(join(RAIZ, pasta), { withFileTypes: true, recursive: true })
        .filter((e) => e.isFile() && /\.(ts|tsx)$/.test(e.name))
        .map((e) => join(e.parentPath, e.name))
}

const ARQUIVOS_PUBLICOS = [
    ...arquivosDe('src/components/cardapio'),
    ...arquivosDe('src/app/[slug]'),
]

test('a árvore pública tem arquivos para verificar (evita passar vazio)', () => {
    assert.ok(ARQUIVOS_PUBLICOS.length >= 8, `só ${ARQUIVOS_PUBLICOS.length} arquivos encontrados`)
})

test('cardápio público não importa @heroui', () => {
    const infratores = ARQUIVOS_PUBLICOS.filter((arquivo) => /@heroui/.test(readFileSync(arquivo, 'utf8')))
    assert.deepEqual(infratores, [], `HeroUI proibido na árvore pública: ${infratores.join(', ')}`)
})

test('layout raiz não carrega o provider do HeroUI (ele vale só para /painel)', () => {
    const layout = readFileSync(join(RAIZ, 'src/app/layout.tsx'), 'utf8')
    assert.doesNotMatch(layout, /@heroui/)
    assert.doesNotMatch(layout, /providers/i)
})
