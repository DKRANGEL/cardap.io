export const LADO_FOTO_PRODUTO = 800
export const LADO_LOGO = 512

export async function redimensionarImagem(arquivo: File, maxLado = LADO_LOGO): Promise<Blob> {
    const bitmap = await createImageBitmap(arquivo, { imageOrientation: 'from-image' })
    const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height))
    const largura = Math.round(bitmap.width * escala)
    const altura = Math.round(bitmap.height * escala)

    const canvas = document.createElement('canvas')
    canvas.width = largura
    canvas.height = altura
    const contexto = canvas.getContext('2d')!
    // O WebP guarda transparência, mas um PNG com fundo transparente aparece preto em alguns visualizadores
    // e na mesma moldura do cardápio. Pintar de branco antes garante o mesmo resultado em todo lugar.
    contexto.fillStyle = '#ffffff'
    contexto.fillRect(0, 0, largura, altura)
    contexto.drawImage(bitmap, 0, 0, largura, altura)
    bitmap.close()

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error('Falha ao processar a imagem.'))),
            'image/webp',
            0.85
        )
    })
}

export function extensaoDoBlob(blob: Blob) {
    if (blob.type === 'image/webp') return 'webp'
    if (blob.type === 'image/png') return 'png'
    return 'jpg'
}
