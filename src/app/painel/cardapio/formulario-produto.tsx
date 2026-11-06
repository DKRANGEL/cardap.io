'use client'

import { useState, useTransition, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertCircleIcon } from 'lucide-react'
import { Campo } from '@/components/campo'
import { CampoPreco } from '@/components/campo-preco'
import { SeletorFoto } from '@/components/seletor-foto'
import { extensaoDoBlob, LADO_FOTO_PRODUTO } from '@/lib/imagem'
import { DESCRICAO_PRODUTO_MAX, NOME_PRODUTO_MAX, type ProdutoCampos } from '@/lib/limites-produto'
import { criarProduto, definirFotoDoProduto, editarProduto } from './actions-produto'

type ProdutoExistente = {
    id: string
    nome: string
    descricao: string | null
    preco_centavos: number
    categoria_id: string | null
    foto_url: string | null
}

type Props = {
    produto?: ProdutoExistente
    categorias: { id: string; nome: string }[]
    categoriaInicial?: string
}

const AVISO = 'flex items-start gap-2 rounded-md bg-perigo-suave p-3 text-sm leading-5 text-perigo'

export function FormularioProduto({ produto, categorias, categoriaInicial }: Props) {
    const router = useRouter()
    const [pendente, startTransition] = useTransition()
    const [erros, setErros] = useState<Partial<Record<ProdutoCampos, string>>>({})
    const [erroGeral, setErroGeral] = useState<string | null>(null)
    const [foto, setFoto] = useState<Blob | null>(null)
    const [removerFoto, setRemoverFoto] = useState(false)
    const [descricao, setDescricao] = useState(produto?.descricao ?? '')

    const limpar = (campo: ProdutoCampos) => setErros((e) => (e[campo] ? { ...e, [campo]: undefined } : e))

    const aoEnviar = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        setErros({})
        setErroGeral(null)

        startTransition(async () => {
            try {
                const resultado = produto ? await editarProduto(produto.id, formData) : await criarProduto(formData)
                if (!resultado.ok) {
                    setErros(resultado.erros ?? {})
                    setErroGeral(resultado.erro ?? null)
                    return
                }

                // O produto já está salvo; a foto vai em seguida, pela própria Server Action (sem cliente do
                // Supabase no navegador). Se ela falhar, o produto continua salvo e a tela diz como tentar de novo.
                if (foto || (removerFoto && produto?.foto_url)) {
                    const envio = new FormData()
                    if (foto) envio.set('foto', foto, `foto.${extensaoDoBlob(foto)}`)
                    const salva = await definirFotoDoProduto(resultado.id, envio)
                    if (!salva.ok) {
                        setErroGeral(
                            foto
                                ? `O produto foi salvo, mas a foto não pôde ser enviada (${salva.erro.replace(/\.$/, '').toLowerCase()}). Abra o produto e tente de novo.`
                                : 'O produto foi salvo, mas a foto não pôde ser removida. Tente de novo.',
                        )
                        if (!produto) router.replace(`/painel/cardapio/produto/${resultado.id}`)
                        router.refresh()
                        return
                    }
                }

                router.push('/painel/cardapio')
                router.refresh()
            } catch {
                setErroGeral('Não deu pra salvar. Confira a conexão e tente de novo.')
            }
        })
    }

    return (
        <form className="flex flex-col gap-5" onSubmit={aoEnviar} noValidate>
            {erroGeral && (
                <div role="alert" className={AVISO}>
                    <AlertCircleIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{erroGeral}</p>
                </div>
            )}

            <SeletorFoto
                fotoAtualUrl={produto?.foto_url ?? null}
                nome={produto?.nome ?? ''}
                ladoMax={LADO_FOTO_PRODUTO}
                onChange={(blob) => {
                    setFoto(blob)
                    if (blob) setRemoverFoto(false)
                }}
                onRemover={() => setRemoverFoto(true)}
                removida={removerFoto}
            />

            <Campo
                id="nome"
                name="nome"
                rotulo="Nome do produto"
                placeholder="Ex.: X-Burger"
                defaultValue={produto?.nome ?? ''}
                dica={`Até ${NOME_PRODUTO_MAX} caracteres.`}
                erro={erros.nome}
                onChange={() => limpar('nome')}
                autoComplete="off"
                autoFocus={!produto}
                aria-required
            />

            <CampoPreco
                id="preco"
                name="preco"
                rotulo="Preço"
                centavosIniciais={produto?.preco_centavos ?? 0}
                erro={erros.preco}
                onMudar={() => limpar('preco')}
            />

            <div className="flex flex-col gap-1.5">
                <label htmlFor="categoria_id" className="text-sm font-semibold text-tinta">Categoria</label>
                <select
                    id="categoria_id"
                    name="categoria_id"
                    defaultValue={produto?.categoria_id ?? categoriaInicial ?? ''}
                    aria-required
                    aria-invalid={erros.categoria_id ? true : undefined}
                    aria-describedby={erros.categoria_id ? 'categoria_id-erro' : undefined}
                    onChange={() => limpar('categoria_id')}
                    className={`h-12 w-full rounded-md border bg-superficie px-4 text-base text-tinta ${
                        erros.categoria_id ? 'border-perigo' : 'border-borda-forte focus:border-tinta'
                    }`}
                >
                    <option value="" disabled>Escolha a categoria</option>
                    {categorias.map((c) => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                </select>
                {erros.categoria_id && (
                    <p id="categoria_id-erro" className="flex items-start gap-1.5 text-sm leading-5 text-perigo">
                        <AlertCircleIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                        {erros.categoria_id}
                    </p>
                )}
            </div>

            <div className="flex flex-col gap-1.5">
                <label htmlFor="descricao" className="text-sm font-semibold text-tinta">Descrição (opcional)</label>
                <textarea
                    id="descricao"
                    name="descricao"
                    rows={3}
                    value={descricao}
                    onChange={(e) => {
                        setDescricao(e.target.value)
                        limpar('descricao')
                    }}
                    placeholder="Ex.: Pão, carne, queijo e molho da casa."
                    aria-invalid={erros.descricao ? true : undefined}
                    aria-describedby={`descricao-dica${erros.descricao ? ' descricao-erro' : ''}`}
                    className={`w-full resize-none rounded-md border bg-superficie px-4 py-3 text-base text-tinta placeholder:text-tinta-suave ${
                        erros.descricao ? 'border-perigo' : 'border-borda-forte focus:border-tinta'
                    }`}
                />
                <p id="descricao-dica" className="text-sm leading-5 tabular-nums text-tinta-media">
                    {descricao.trim().length} de {DESCRICAO_PRODUTO_MAX} caracteres.
                </p>
                {erros.descricao && (
                    <p id="descricao-erro" className="flex items-start gap-1.5 text-sm leading-5 text-perigo">
                        <AlertCircleIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                        {erros.descricao}
                    </p>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <button type="submit" disabled={pendente}
                        className="flex h-[52px] w-full items-center justify-center rounded-full bg-acao text-base font-semibold text-acao-contraste disabled:opacity-60">
                    {pendente ? 'Salvando…' : produto ? 'Salvar' : 'Criar produto'}
                </button>
                <Link href="/painel/cardapio"
                      className="flex h-12 w-full items-center justify-center rounded-full text-base font-semibold text-tinta">
                    Cancelar
                </Link>
            </div>
        </form>
    )
}
