'use client'

import { useEffect, useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input } from '@heroui/react'
import { createClient } from '@/lib/supabase/client'
import { extensaoDoBlob } from '@/lib/imagem'
import { LogoUpload } from '@/components/logo-upload'
import { mascararWhatsapp, slugify, type LojaCampos } from '@/lib/validacao/loja'
import { salvarLogo, salvarLoja } from './actions'

type LojaExistente = {
    id: string
    slug: string
    nome: string
    whatsapp: string
    cor_primaria: string | null
    logo_url: string | null
}

type Props = {
    loja: LojaExistente | null
    whatsappInicial: string
}

const COR_PADRAO = '#059669'
const campoInput = { input: 'text-base placeholder:text-default-300' }

export function LojaForm({ loja, whatsappInicial }: Props) {
    const router = useRouter()
    const [pendente, startTransition] = useTransition()

    const [nome, setNome] = useState(loja?.nome ?? '')
    const [slug, setSlug] = useState(loja?.slug ?? '')
    const [slugEditado, setSlugEditado] = useState(Boolean(loja))
    const [whatsapp, setWhatsapp] = useState(whatsappInicial)
    const [cor, setCor] = useState(loja?.cor_primaria ?? COR_PADRAO)
    const [logo, setLogo] = useState<Blob | null>(null)
    const [origem, setOrigem] = useState('')

    const [erros, setErros] = useState<Partial<Record<LojaCampos, string>>>({})
    const [erroGeral, setErroGeral] = useState<string | null>(null)
    const [salvo, setSalvo] = useState(false)

    useEffect(() => setOrigem(window.location.origin), [])

    const aoMudarNome = (valor: string) => {
        setNome(valor)
        if (!slugEditado) setSlug(slugify(valor))
    }

    const aoEnviar = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        setErros({})
        setErroGeral(null)
        setSalvo(false)

        startTransition(async () => {
            const resultado = await salvarLoja(formData)
            if (!resultado.ok) {
                setErros(resultado.erros ?? {})
                setErroGeral(resultado.erro ?? null)
                return
            }

            if (logo) {
                const supabase = createClient()
                const caminho = `${resultado.lojaId}/logo-${Date.now()}.${extensaoDoBlob(logo)}`
                const { error } = await supabase.storage.from('fotos').upload(caminho, logo, {
                    contentType: logo.type,
                })
                if (error) {
                    setErroGeral('A loja foi salva, mas o logo não pôde ser enviado. Tente de novo.')
                    router.refresh()
                    return
                }
                const { data } = supabase.storage.from('fotos').getPublicUrl(caminho)
                const logoSalvo = await salvarLogo(resultado.lojaId, data.publicUrl)
                if (!logoSalvo.ok) {
                    setErroGeral(logoSalvo.erro ?? 'Não foi possível salvar o logo.')
                    router.refresh()
                    return
                }
                setLogo(null)
            }

            setSalvo(true)
            router.refresh()
        })
    }

    const slugMudou = loja && slug !== loja.slug

    return (
        <form className="flex flex-col gap-5" onSubmit={aoEnviar}>
            <LogoUpload logoAtualUrl={loja?.logo_url ?? null} nome={nome} onChange={setLogo} />

            <Input
                name="nome"
                label="Nome da loja"
                value={nome}
                onValueChange={aoMudarNome}
                isRequired
                variant="bordered"
                classNames={campoInput}
                isInvalid={Boolean(erros.nome)}
                errorMessage={erros.nome}
            />

            <div className="flex flex-col gap-1">
                <Input
                    name="slug"
                    label="Endereço do cardápio"
                    value={slug}
                    onValueChange={(v) => {
                        setSlugEditado(true)
                        setSlug(slugify(v))
                    }}
                    isRequired
                    autoCapitalize="none"
                    autoCorrect="off"
                    variant="bordered"
                    classNames={campoInput}
                    isInvalid={Boolean(erros.slug)}
                    errorMessage={erros.slug}
                    description={`Seu link: ${origem}/${slug || 'seu-endereco'}`}
                />
                {slugMudou && (
                    <p className="text-sm text-warning-600">
                        Mudar o endereço muda o link e o QR code que você já divulgou.
                    </p>
                )}
            </div>

            <Input
                name="whatsapp"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                label="WhatsApp da loja"
                placeholder="(00) 90000-0000"
                value={whatsapp}
                onValueChange={(v) => setWhatsapp(mascararWhatsapp(v))}
                isRequired
                variant="bordered"
                classNames={campoInput}
                isInvalid={Boolean(erros.whatsapp)}
                errorMessage={erros.whatsapp}
            />

            <div className="flex flex-col gap-2">
                <label htmlFor="cor_primaria" className="text-sm">Cor principal</label>
                <div className="flex items-center gap-3">
                    <input
                        id="cor_primaria"
                        name="cor_primaria"
                        type="color"
                        value={cor}
                        onChange={(e) => setCor(e.target.value)}
                        className="h-11 w-16 cursor-pointer rounded-lg border border-default-200 bg-transparent p-1"
                    />
                    <span className="text-sm text-default-500">{cor.toUpperCase()}</span>
                </div>
                {erros.cor_primaria && <p className="text-sm text-danger">{erros.cor_primaria}</p>}
            </div>

            {erroGeral && <p className="text-sm text-danger">{erroGeral}</p>}
            {salvo && <p className="text-sm text-success-600">Loja salva.</p>}

            <Button type="submit" color="primary" size="lg" className="min-h-12" isLoading={pendente}>
                {loja ? 'Salvar alterações' : 'Criar loja'}
            </Button>
        </form>
    )
}
