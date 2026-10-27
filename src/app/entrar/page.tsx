'use client'

import { Suspense, useState, type FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button, Card, CardBody, Input, Link as HeroLink } from '@heroui/react'
import { createClient } from '@/lib/supabase/client'

type Step = 'email' | 'enviado'

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    )
}

function LoginForm() {
    const searchParams = useSearchParams()
    const supabase = createClient()

    const [step, setStep] = useState<Step>('email')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [erro, setErro] = useState<string | null>(
        searchParams.get('erro') === 'link_invalido' ? 'O link de acesso é inválido ou expirou. Peça um novo.' : null
    )

    const enviarLink = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErro(null)

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
                emailRedirectTo: `${window.location.origin}/auth/confirm`,
            },
        })

        setLoading(false)
        if (error) {
            setErro('Não foi possível enviar o link. Confira o e-mail e tente de novo.')
            return
        }
        setStep('enviado')
    }

    return (
        <div className="min-h-dvh flex items-center justify-center p-6 bg-background text-foreground">
            <Card className="w-full max-w-sm">
                <CardBody className="gap-4 p-6">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-lg font-bold">Painel do lojista</h1>
                        <p className="text-sm text-default-500">
                            {step === 'email'
                                ? 'Digite seu e-mail pra receber um link de acesso.'
                                : `Enviamos um link de acesso pra ${email}. Abra o e-mail neste mesmo aparelho e navegador e clique no link.`}
                        </p>
                    </div>

                    {step === 'email' && (
                        <form className="flex flex-col gap-4" onSubmit={enviarLink}>
                            <Input
                                type="email"
                                label="E-mail"
                                value={email}
                                onValueChange={setEmail}
                                autoComplete="email"
                                isRequired
                                variant="bordered"
                            />
                            {erro && <p className="text-sm text-danger">{erro}</p>}
                            <Button type="submit" color="primary" isLoading={loading}>
                                Enviar link
                            </Button>
                        </form>
                    )}

                    {step === 'enviado' && (
                        <HeroLink
                            as="button"
                            type="button"
                            size="sm"
                            className="cursor-pointer"
                            onPress={() => {
                                setStep('email')
                                setErro(null)
                            }}
                        >
                            Usar outro e-mail
                        </HeroLink>
                    )}
                </CardBody>
            </Card>
        </div>
    )
}
