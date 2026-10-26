'use client'

import { SearchIcon, ShoppingCartIcon, PlusIcon, MinusIcon, ImageOffIcon, QrCodeIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import NextLink from 'next/link'
import {
    Navbar, NavbarBrand, NavbarContent, NavbarItem,
    Button, Card, CardBody, Image, Input,
    Chip, Badge, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Divider, ScrollShadow
} from '@heroui/react'
import type { Categoria, Loja, Produto } from '@/lib/types'

const toBRL = (centavos: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(centavos / 100)

type Props = {
    loja: Loja
    categorias: Categoria[]
    produtos: Produto[]
}

export function MenuClient({ loja, categorias, produtos }: Props) {
    const [query, setQuery] = useState('')
    const [cart, setCart] = useState<Record<string, number>>({})
    const [cartOpen, setCartOpen] = useState(false)

    const grouped = useMemo(() => {
        const q = query.trim().toLowerCase()
        const map = new Map<string, Produto[]>()
        for (const p of produtos) {
            if (!p.categoria_id) continue
            const matches = !q || p.nome.toLowerCase().includes(q) || p.descricao?.toLowerCase().includes(q)
            if (matches) {
                const arr = map.get(p.categoria_id) ?? []
                arr.push(p)
                map.set(p.categoria_id, arr)
            }
        }
        return map
    }, [query, produtos])

    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0)
    const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
        const item = produtos.find(p => p.id === id)
        return sum + (item ? item.preco_centavos * qty : 0)
    }, 0)

    const add = (id: string) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }))
    const sub = (id: string) =>
        setCart(c => {
            const next = { ...c }
            if (!next[id]) return c
            next[id] -= 1
            if (next[id] <= 0) delete next[id]
            return next
        })

    const scrollToCategoria = (categoriaId: string) => {
        document.getElementById(`cat-${categoriaId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return (
        <div className="min-h-dvh bg-background text-foreground">
            <Navbar isBordered className="sticky top-0 z-50 bg-background/80 backdrop-blur-md">
                <NavbarBrand className="gap-2">
                    {loja.logo_url ? (
                        <Image alt={loja.nome} src={loja.logo_url} width={28} height={28} radius="sm" />
                    ) : (
                        <div
                            aria-hidden
                            className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                            {loja.nome.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold">{loja.nome}</span>
                        <span className="text-xs text-default-500">Aberto • Retirada / Entrega</span>
                    </div>
                </NavbarBrand>
                <NavbarContent justify="end">
                    <NavbarItem>
                        <Button
                            as={NextLink}
                            href={`/${loja.slug}/qr`}
                            isIconOnly
                            radius="full"
                            variant="flat"
                            aria-label="Ver QR code do cardápio"
                        >
                            <QrCodeIcon />
                        </Button>
                    </NavbarItem>
                    <NavbarItem>
                        <Badge color="primary" content={totalItems} isInvisible={!totalItems} shape="circle">
                            <Button
                                isIconOnly
                                radius="full"
                                variant="flat"
                                aria-label="Abrir carrinho"
                                onPress={() => setCartOpen(true)}
                            >
                                <ShoppingCartIcon />
                            </Button>
                        </Badge>
                    </NavbarItem>
                </NavbarContent>
            </Navbar>

            <div className="p-4 pb-2">
                <Input value={query} onValueChange={setQuery} placeholder="Buscar no cardápio"
                       startContent={<SearchIcon className="text-2xl text-default-400 pointer-events-none shrink-0" />}
                       variant="bordered" />
            </div>

            <div className="px-4">
                <ScrollShadow hideScrollBar orientation="horizontal" className="max-w-full">
                    <div className="flex gap-2 pb-3 pt-3 w-max">
                        {categorias.map((c) => (
                            <Chip
                                key={c.id}
                                color="primary"
                                variant="flat"
                                className="cursor-pointer"
                                onClick={() => scrollToCategoria(c.id)}
                            >
                                {c.nome}
                            </Chip>
                        ))}
                    </div>
                </ScrollShadow>
            </div>

            <div className="flex flex-col gap-6 py-2">
                {categorias.map((categoria) => {
                    const items = grouped.get(categoria.id) ?? []
                    if (items.length === 0) return null

                    return (
                        <section key={categoria.id} id={`cat-${categoria.id}`} className="scroll-mt-20">
                            <div className="flex items-center justify-between px-4">
                                <h2 className="text-sm font-semibold tracking-wide uppercase text-default-600">{categoria.nome}</h2>
                            </div>

                            <ScrollShadow orientation="horizontal" hideScrollBar className="px-4 pt-2 pb-4">
                                <div className="flex gap-3 w-max snap-x snap-mandatory">
                                    {items.map((p) => (
                                        <Card isBlurred key={p.id} shadow="sm"
                                              className="snap-start w-[85vw] sm:w-[360px] shrink-0 bg-background/60 rounded-2xl border border-default-100 hover:shadow-lg transition-shadow">
                                            <CardBody className="p-4">
                                                <div className="flex gap-4 items-start">
                                                    {p.foto_url ? (
                                                        <Image
                                                            alt={p.nome}
                                                            src={p.foto_url}
                                                            width={96}
                                                            className="h-20 w-20 object-cover rounded-2xl shrink-0"
                                                        />
                                                    ) : (
                                                        <div
                                                            aria-hidden
                                                            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-default-100 shrink-0">
                                                            <ImageOffIcon className="h-6 w-6 text-default-400" />
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <span
                                                            className="text-[11px] uppercase tracking-wide text-success-500 font-semibold">
                                                            {categoria.nome}
                                                        </span>
                                                        <h3 className="mt-1 text-base font-extrabold leading-tight line-clamp-2">
                                                            {p.nome}
                                                        </h3>
                                                        {p.descricao && (
                                                            <p className="text-[11px] text-default-500 line-clamp-2 mt-1">
                                                                {p.descricao}
                                                            </p>
                                                        )}
                                                        <div className="mt-3 flex items-center justify-between">
                                                            <span className="text-lg font-extrabold text-success-600">
                                                                {toBRL(p.preco_centavos)}
                                                            </span>
                                                            {cart[p.id] ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Button
                                                                        isIconOnly
                                                                        size="sm"
                                                                        variant="flat"
                                                                        aria-label="Diminuir"
                                                                        onPress={() => sub(p.id)}
                                                                    >
                                                                        <MinusIcon className="w-5 h-5" />
                                                                    </Button>
                                                                    <span
                                                                        className="min-w-6 text-center text-xs font-medium">
                                                                        {cart[p.id]}
                                                                    </span>
                                                                    <Button
                                                                        isIconOnly
                                                                        size="sm"
                                                                        variant="flat"
                                                                        aria-label="Aumentar"
                                                                        onPress={() => add(p.id)}
                                                                    >
                                                                        <PlusIcon className="w-5 h-5" />
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <Button
                                                                    isIconOnly
                                                                    size="sm"
                                                                    radius="full"
                                                                    color="primary"
                                                                    aria-label="Adicionar"
                                                                    onPress={() => add(p.id)}
                                                                >
                                                                    <PlusIcon className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollShadow>

                            <Divider className="mt-4" />
                        </section>
                    )
                })}
            </div>

            {totalItems > 0 && (
                <div className="fixed inset-x-0 bottom-0 z-50 p-3">
                    <div className="mx-auto max-w-md sm:max-w-xl">
                        <Button color="primary" size="lg" radius="full" onPress={() => setCartOpen(true)}>
                            {totalItems} item{totalItems > 1 ? 's' : ''} • {toBRL(totalPrice)} — Ver carrinho
                        </Button>
                    </div>
                </div>
            )}

            <Modal isOpen={cartOpen} onOpenChange={setCartOpen} scrollBehavior="inside">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Carrinho</ModalHeader>
                            <ModalBody>
                                {totalItems === 0 && <p className="text-default-500">Seu carrinho está vazio.</p>}
                                {totalItems > 0 && (
                                    <div className="flex flex-col gap-3">
                                        {Object.entries(cart).map(([id, qty]) => {
                                            const p = produtos.find(x => x.id === id)!
                                            return (
                                                <div key={id} className="flex items-center gap-3">
                                                    {p.foto_url ? (
                                                        <Image alt={p.nome} src={p.foto_url} width={56} height={56}
                                                               radius="sm" />
                                                    ) : (
                                                        <div
                                                            aria-hidden
                                                            className="flex h-14 w-14 items-center justify-center rounded-md bg-default-100 shrink-0">
                                                            <ImageOffIcon className="h-5 w-5 text-default-400" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium">{p.nome}</span>
                                                            <span className="text-sm">{toBRL(p.preco_centavos * qty)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Button size="sm" variant="flat"
                                                                    onPress={() => sub(id)}>-</Button>
                                                            <span className="text-sm w-6 text-center">{qty}</span>
                                                            <Button size="sm" variant="flat"
                                                                    onPress={() => add(id)}>+</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        <Divider />
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Total</span>
                                            <span className="font-semibold">{toBRL(totalPrice)}</span>
                                        </div>
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={() => (setCart({}), onClose())}>Limpar</Button>
                                <Button color="primary" onPress={() => alert('Seguir para checkout…')}>Finalizar
                                    pedido</Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    )
}
