export function moverItem<T>(lista: readonly T[], de: number, para: number): T[] {
    if (de === para || de < 0 || de >= lista.length) return [...lista]
    const alvo = Math.min(Math.max(para, 0), lista.length - 1)
    const copia = [...lista]
    const [item] = copia.splice(de, 1)
    copia.splice(alvo, 0, item)
    return copia
}
