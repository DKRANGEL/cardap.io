type ErroAuth = { status?: number; code?: string } | null | undefined

const MUITAS_TENTATIVAS = 'Muitas tentativas seguidas. Espere um minuto e tente de novo.'
const SEM_CONEXAO = 'Não deu pra falar com o servidor. Confira a conexão e tente de novo.'

export function mensagemDoLogin(erro: ErroAuth): string {
    if (erro?.status === 429 || erro?.code === 'over_request_rate_limit') return MUITAS_TENTATIVAS
    if (erro?.code === 'invalid_credentials' || erro?.status === 400) return 'E-mail ou senha incorretos. Confira e tente de novo.'
    return SEM_CONEXAO
}

export function mensagemDeCadastroDeCliente(erro: ErroAuth): string {
    if (erro?.code === 'email_exists' || erro?.code === 'user_already_exists') return 'Já existe um cliente com esse e-mail.'
    if (erro?.code === 'weak_password') return 'Essa senha foi recusada por ser fraca. Escolha outra.'
    return 'Não foi possível salvar. Tente de novo.'
}

export function mensagemDeSenhaNova(erro: ErroAuth): string {
    if (erro?.code === 'same_password') return 'A nova senha precisa ser diferente da atual.'
    if (erro?.code === 'weak_password') return 'Essa senha foi recusada por ser fraca. Escolha outra.'
    if (erro?.status === 429 || erro?.code === 'over_request_rate_limit') return MUITAS_TENTATIVAS
    return 'Não foi possível trocar a senha. Tente de novo.'
}
