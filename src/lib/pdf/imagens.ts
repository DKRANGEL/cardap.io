import sharp from 'sharp'
import { caminhoDaFoto } from '../foto-do-bucket.ts'

export const LADO_PADRAO = 180
const MAX_CACHE = 300
const MAX_BYTES = 6_000_000
const PARALELO = 6

// Cache por URL: o nome do arquivo muda a cada foto nova (carrega timestamp), então não fica velho.
const cache = new Map<string, string>()

// Baixa uma foto da loja, reduz para `lado` px (180 por padrão) e devolve como data: URI. Qualquer falha
// devolve null (o produto sai sem foto, o PDF não cai). Só aceita URL do bucket desta loja.
export async function fotoEmDataUri(url: string | null, lojaId: string, lado = LADO_PADRAO): Promise<string | null> {
    if (!url || !caminhoDaFoto(url, lojaId)) return null
    const chave = `${lado}:${url}`
    const guardada = cache.get(chave)
    if (guardada) return guardada

    try {
        const resposta = await fetch(url, { signal: AbortSignal.timeout(8000) })
        if (!resposta.ok) return null
        const original = Buffer.from(await resposta.arrayBuffer())
        if (original.length > MAX_BYTES) return null

        const reduzida = await sharp(original)
            .rotate()
            .resize({ width: lado, height: lado, fit: 'inside', withoutEnlargement: true })
            .flatten({ background: '#ffffff' })
            .jpeg({ quality: 72, mozjpeg: true })
            .toBuffer()

        const uri = `data:image/jpeg;base64,${reduzida.toString('base64')}`
        if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value as string)
        cache.set(chave, uri)
        return uri
    } catch {
        return null
    }
}

export async function fotosEmLote(urls: (string | null)[], lojaId: string, lado = LADO_PADRAO) {
    const unicas = [...new Set(urls.filter((u): u is string => Boolean(u)))]
    const resultado = new Map<string, string | null>()
    for (let i = 0; i < unicas.length; i += PARALELO) {
        const lote = unicas.slice(i, i + PARALELO)
        const feitas = await Promise.all(lote.map((u) => fotoEmDataUri(u, lojaId, lado)))
        lote.forEach((u, j) => resultado.set(u, feitas[j]))
    }
    return resultado
}
