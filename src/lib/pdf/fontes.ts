import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

const PESOS = [400, 600, 700]
let cache: Promise<string> | null = null

// Fontes versionadas em src/lib/pdf/fontes, embutidas em base64: o PDF não pede nada à rede.
// next.config.ts inclui essa pasta no build de produção (outputFileTracingIncludes).
async function carregar() {
    const pasta = join(process.cwd(), 'src', 'lib', 'pdf', 'fontes')
    const faces = await Promise.all(
        PESOS.map(async (peso) => {
            const base64 = (await readFile(join(pasta, `archivo-latin-${peso}-normal.woff2`))).toString('base64')
            return `@font-face{font-family:'Archivo';font-weight:${peso};font-style:normal;src:url(data:font/woff2;base64,${base64}) format('woff2');}`
        }),
    )
    return faces.join('\n')
}

export function cssDasFontes() {
    cache ??= carregar().catch((erro) => {
        cache = null
        throw erro
    })
    return cache
}
