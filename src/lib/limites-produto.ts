// Limites do produto, sem dependências, para o formulário do navegador usá-los sem carregar o zod.
export const NOME_PRODUTO_MAX = 60
export const DESCRICAO_PRODUTO_MAX = 140

export type ProdutoCampos = 'nome' | 'descricao' | 'categoria_id' | 'preco'
