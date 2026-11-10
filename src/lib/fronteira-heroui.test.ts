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

test('cardápio público não importa o arraste do painel', () => {
    const infratores = ARQUIVOS_PUBLICOS.filter((arquivo) =>
        /alca-arraste|lista-ordenavel|lista-cardapio|actions-ordem|\/reordenar/.test(readFileSync(arquivo, 'utf8')),
    )
    assert.deepEqual(infratores, [], `arraste proibido na árvore pública: ${infratores.join(', ')}`)
})

test('a chave de serviço só é usada por código de servidor do admin', () => {
    const todos = arquivosDe('src').map((a) => ({ caminho: a.replaceAll('\\', '/'), codigo: readFileSync(a, 'utf8') }))
    const usam = todos.filter((a) => /supabase\/admin['"]|SUPABASE_SERVICE_ROLE_KEY|SENHAS_CHAVE|cifra-senha['"]/.test(a.codigo))
    const permitido = /\/lib\/supabase\/admin\.ts$|\/lib\/acao-admin\.ts$|\/lib\/cifra-senha\.ts$|\/app\/painel\/loja\/actions-conta\.ts$|\/app\/admin\/|\.test\.ts$/
    assert.deepEqual(usam.filter((a) => !permitido.test(a.caminho)).map((a) => a.caminho), [])

    const deCliente = usam.filter((a) => /^\s*['"]use client['"]/.test(a.codigo)).map((a) => a.caminho)
    assert.deepEqual(deCliente, [], 'a chave de serviço não pode aparecer em componente de cliente')
})
