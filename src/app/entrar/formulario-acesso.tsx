'use client'

import { useState, type FormEvent } from 'react'
import { AlertCircleIcon, AlertTriangleIcon } from 'lucide-react'
import { Button, Input } from '@heroui/react'
import { Marca } from '@/components/marca'
import { createClient } from '@/lib/supabase/client'

type Passo = 'identificar' | 'codigo' | 'link'

const CODIGO_HABILITADO = process.env.NEXT_PUBLIC_CODIGO_HABILITADO === 'true'

const MENSAGEM_LINK_INVALIDO = 'Esse link não funcionou ou já expirou. Peça um novo abaixo.'
const MENSAGEM_FALHA_ENVIO = 'Não deu pra enviar o e-mail. Confira o endereço e tente de novo.'
const MENSAGEM_MUITOS_PEDIDOS = 'Você pediu muitas vezes seguidas. Espere um minuto e tente de novo.'
const MENSAGEM_EMAIL_VAZIO = 'Digite seu e-mail pra continuar.'
const MENSAGEM_EMAIL_INCOMPLETO = 'Esse e-mail parece incompleto. Confira se tem @ e o final, como .com.'
const MENSAGEM_CODIGO_CURTO = 'O código tem 6 dígitos. Confira o que chegou no e-mail.'
const MENSAGEM_CODIGO_ERRADO = 'Esse código não confere ou já venceu. Confira o e-mail ou volte e peça um novo.'

const EMAIL_COMPLETO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const ESTILO_CAMPO = { label: 'text-sm font-semibold !text-tinta', input: 'text-base placeholder:text-carvao-400' }
const BOTAO_PRINCIPAL = 'h-[52px] w-full text-base font-semibold'
const BOTAO_SECUNDARIO = 'h-12 w-full text-base font-semibold'

function mensagemDeErro(erro: { status?: number; code?: string }) {
    const limite = erro.status === 429 || erro.code === 'over_email_send_rate_limit'
    return limite ? MENSAGEM_MUITOS_PEDIDOS : MENSAGEM_FALHA_ENVIO
}

function validarEmail(valor: string) {
    const email = valor.trim()
    if (!email) return MENSAGEM_EMAIL_VAZIO
    if (!EMAIL_COMPLETO.test(email)) return MENSAGEM_EMAIL_INCOMPLETO
    return null
}

function MensagemDoCampo({ texto }: { texto: string }) {
    return (
        <span className="flex items-start gap-1.5 text-sm leading-5 text-perigo">
            <AlertCircleIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            {texto}
        </span>
    )
}

function AvisoDeErro({ texto }: { texto: string }) {
    return (
        <div role="alert" className="flex items-start gap-2 rounded-md bg-perigo-suave p-3 text-sm leading-5 text-perigo">
            <AlertCircleIcon aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{texto}</p>
        </div>
    )
}

type Props = {
    linkInvalido: boolean
}

export function FormularioAcesso({ linkInvalido }: Props) {
    const [supabase] = useState(() => createClient())
    const [passo, setPasso] = useState<Passo>('identificar')
    const [email, setEmail] = useState('')
    const [codigo, setCodigo] = useState('')
    const [enviando, setEnviando] = useState(false)
    const [erroCampo, setErroCampo] = useState<string | null>(null)
    const [aviso, setAviso] = useState<string | null>(linkInvalido ? MENSAGEM_LINK_INVALIDO : null)

    const continuar = async (e: FormEvent) => {
        e.preventDefault()
        setAviso(null)

        const problema = validarEmail(email)
        setErroCampo(problema)
        if (problema) return

        setEnviando(true)
        const { error } = await supabase.auth.signInWithOtp({
            email: email.trim(),
            options: {
                shouldCreateUser: true,
                emailRedirectTo: `${window.location.origin}/auth/confirm`,
            },
        })
        setEnviando(false)

        if (error) {
            setAviso(mensagemDeErro(error))
            return
        }
        setCodigo('')
        setPasso(CODIGO_HABILITADO ? 'codigo' : 'link')
    }

    const entrarComCodigo = async (e: FormEvent) => {
        e.preventDefault()
        setAviso(null)

        if (codigo.length !== 6) {
            setErroCampo(MENSAGEM_CODIGO_CURTO)
            return
        }
        setErroCampo(null)

        setEnviando(true)
        const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: codigo, type: 'email' })

        if (error) {
            setEnviando(false)
            setAviso(MENSAGEM_CODIGO_ERRADO)
            return
        }
        window.location.assign('/painel')
    }

    const irPara = (proximo: Passo) => {
        setPasso(proximo)
        setCodigo('')
        setErroCampo(null)
        setAviso(null)
    }

    if (passo === 'codigo') {
        return (
            <form className="flex flex-col gap-6" onSubmit={entrarComCodigo} noValidate>
                <Marca />
                <div className="flex flex-col gap-2">
                    <h1 className="text-xl leading-[26px] font-bold tracking-tight">Digite o código</h1>
                    <p className="text-[15px] leading-[22px] text-tinta-media">
                        Mandamos um código de 6 dígitos pra <strong className="break-words text-tinta">{email.trim()}</strong>.
                    </p>
                </div>

                {aviso && <AvisoDeErro texto={aviso} />}

                <Input
                    type="text"
                    name="codigo"
                    label="Código de 6 dígitos"
                    labelPlacement="outside"
                    placeholder="000000"
                    value={codigo}
                    onValueChange={(valor) => {
                        setCodigo(valor.replace(/\D/g, '').slice(0, 6))
                        if (erroCampo) setErroCampo(null)
                    }}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    isRequired
                    validationBehavior="aria"
                    size="lg"
                    variant="bordered"
                    classNames={{
                        ...ESTILO_CAMPO,
                        inputWrapper: 'h-14',
                        input: 'text-[26px] font-bold tracking-[0.3em] tabular-nums placeholder:text-carvao-300',
                    }}
                    isInvalid={Boolean(erroCampo)}
                    errorMessage={erroCampo && <MensagemDoCampo texto={erroCampo} />}
                />

                <div className="flex flex-col gap-2">
                    <Button type="submit" color="primary" isLoading={enviando} className={BOTAO_PRINCIPAL}>
                        Entrar
                    </Button>
                    <Button variant="light" onPress={() => irPara('link')} className={BOTAO_SECUNDARIO}>
                        Prefiro usar o link do e-mail
                    </Button>
                    <Button variant="light" onPress={() => irPara('identificar')} className={BOTAO_SECUNDARIO}>
                        Usar outro e-mail
                    </Button>
                </div>
            </form>
        )
    }

    if (passo === 'link') {
        return (
            <div className="flex flex-col gap-6">
                <Marca />
                <div className="flex flex-col gap-2">
                    <h1 className="text-xl leading-[26px] font-bold tracking-tight">Confira seu e-mail</h1>
                    <p className="text-[15px] leading-[22px] text-tinta-media">
                        Enviamos um link de acesso pra <strong className="break-words text-tinta">{email.trim()}</strong>.
                        Toque nele pra entrar.
                    </p>
                </div>

                <div role="note"
                     className="flex gap-3 rounded-md bg-aviso-suave p-4 text-[15px] leading-[22px] text-aviso">
                    <AlertTriangleIcon aria-hidden className="mt-0.5 h-5 w-5 shrink-0" />
                    <p>
                        <strong>Atenção:</strong> abra o e-mail neste mesmo aparelho e no mesmo navegador em que você
                        pediu o acesso. Em outro, o link não funciona.
                    </p>
                </div>

                <div className="flex flex-col gap-2">
                    {CODIGO_HABILITADO && (
                        <Button variant="flat" onPress={() => irPara('codigo')} className={BOTAO_PRINCIPAL}>
                            Digitar o código do e-mail
                        </Button>
                    )}
                    <Button variant={CODIGO_HABILITADO ? 'light' : 'flat'} onPress={() => irPara('identificar')}
                            className={CODIGO_HABILITADO ? BOTAO_SECUNDARIO : BOTAO_PRINCIPAL}>
                        Usar outro e-mail
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <form className="flex flex-col gap-6" onSubmit={continuar} noValidate>
            <Marca />
            <div className="flex flex-col gap-2">
                <h1 className="text-xl leading-[26px] font-bold tracking-tight">Entrar no seu painel</h1>
                <p className="text-[15px] leading-[22px] text-tinta-media">
                    Monte o cardápio da sua loja e receba os pedidos no WhatsApp.
                </p>
            </div>

            {aviso && <AvisoDeErro texto={aviso} />}

            <Input
                type="email"
                name="email"
                label="Seu e-mail"
                labelPlacement="outside"
                placeholder="nome@exemplo.com"
                value={email}
                onValueChange={(valor) => {
                    setEmail(valor)
                    if (erroCampo) setErroCampo(null)
                }}
                autoComplete="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                isRequired
                validationBehavior="aria"
                size="lg"
                variant="bordered"
                classNames={ESTILO_CAMPO}
                isInvalid={Boolean(erroCampo)}
                errorMessage={erroCampo && <MensagemDoCampo texto={erroCampo} />}
            />

            <div className="flex flex-col gap-3">
                <Button type="submit" color="primary" isLoading={enviando} className={BOTAO_PRINCIPAL}>
                    Continuar
                </Button>
                <p className="text-sm leading-5 text-tinta-suave">
                    Se você ainda não tem conta, a gente cria na hora. Não precisa de senha.
                </p>
            </div>
        </form>
    )
}
