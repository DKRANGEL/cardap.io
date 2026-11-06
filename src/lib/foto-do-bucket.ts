const BUCKET = 'fotos'

// Devolve o caminho dentro do bucket (`{loja_id}/arquivo.webp`) quando a URL é uma foto desta loja.
// Qualquer outra coisa (foto de demonstração em /images, URL de fora, outra loja) devolve null,
// para nunca apagar o que não é do lojista.
export function caminhoDaFoto(url: string | null, lojaId: string, base = process.env.NEXT_PUBLIC_SUPABASE_URL): string | null {
    if (!url || !base) return null
    const prefixo = `${base}/storage/v1/object/public/${BUCKET}/${lojaId}/`
    if (!url.startsWith(prefixo)) return null

    const arquivo = url.slice(prefixo.length)
    if (!arquivo || arquivo.includes('/') || arquivo.includes('..') || arquivo.includes('?')) return null
    return `${lojaId}/${arquivo}`
}

export function urlPublicaDaFoto(lojaId: string, arquivo: string, base = process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return `${base}/storage/v1/object/public/${BUCKET}/${lojaId}/${arquivo}`
}
