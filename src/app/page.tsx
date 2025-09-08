'use client'
import {Button, Card, CardBody} from '@heroui/react'

export default function HomePage() {
    return (
        <main className="min-h-dvh p-4 flex flex-col gap-4 max-w-md mx-auto">
            <Card>
                <CardBody>
                    <h1 className="text-xl font-semibold">Cardápio — protótipo</h1>
                    <p className="text-default-500">HeroUI + Tailwind funcionando ✅</p>
                </CardBody>
            </Card>
            <Button color="primary">Adicionar ao carrinho</Button>
        </main>
    )
}
