const formato = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const toBRL = (centavos: number) => formato.format(centavos / 100)
