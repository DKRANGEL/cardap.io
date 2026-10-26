'use client'

import {SearchIcon, ShoppingCartIcon, PlusIcon, MinusIcon} from "lucide-react"
import {useMemo, useState} from 'react'
import {
    Navbar, NavbarBrand, NavbarContent, NavbarItem,
    Button, Card, CardBody, Image, Input,
    Chip, Badge, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
    Divider, ScrollShadow
} from '@heroui/react'

// helpers
const toBRL = (n: number) =>
    new Intl.NumberFormat('pt-BR', {style: 'currency', currency: 'BRL'}).format(n)

const slug = (s: string) =>
    s.toLowerCase()
        .normalize('NFD').replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// mock
type Product = {
    id: string; name: string; description: string; price: number; img: string; category: string
}

const PRODUCTS: Product[] = [
    {
        id: 'p1',
        name: 'Smash Furioso',
        description: 'Pão, carne, queijo, alface, tomate, onion rings, pimenta jalapeño e molho da casa.',
        price: 27.9,
        img: '/images/image_teste_01.jpg',
        category: 'Burgers',
    },
    {
        id: 'p2',
        name: 'Burger Duplo',
        description: 'Dois smash de 100g, cheddar duplo e cebola caramelizada.',
        price: 32.9,
        img: '/images/image_teste_01.jpg',
        category: 'Burgers',
    },
    {
        id: 'p3',
        name: 'Burger Triplo',
        description: 'Três smash de 100g, cheddar duplo e cebola caramelizada.',
        price: 38.9,
        img: '/images/image_teste_01.jpg',
        category: 'Burgers',
    },
    {
        id: 'p4',
        name: 'Burger Bacon',
        description: 'Smash de 150g, bacon crocante e cheddar.',
        price: 34.9,
        img: '/images/image_teste_01.jpg',
        category: 'Burgers',
    },
    {
        id: 'p5',
        name: 'Burger Clássico',
        description: 'Smash de 100g, queijo, alface, tomate e molho da casa.',
        price: 24.9,
        img: '/images/image_teste_01.jpg',
        category: 'Burgers',
    },
    {
        id: 'p6',
        name: 'Burger Vegetariano',
        description: 'Hambúrguer de grão-de-bico, queijo e rúcula.',
        price: 29.9,
        img: '/images/image_teste_01.jpg',
        category: 'Burgers',
    },
    {
        id: 'p7',
        name: 'Burger Especial da Casa',
        description: 'Smash de 100g, queijo, cebola crispy e molho especial.',
        price: 36.9,
        img: '/images/image_teste_01.jpg',
        category: 'Burgers',
    },
    {
        id: 'p8',
        name: 'Refrigerante Lata',
        description: '350ml bem gelado.',
        price: 6.5,
        img: '/images/image_teste_01.jpg',
        category: 'Bebidas',
    },
    {
        id: 'p9',
        name: 'Batata Palito',
        description: 'Porção crocante 300g.',
        price: 14.9,
        img: '/images/image_teste_01.jpg',
        category: 'Acompanhamentos',
    },
    {
        id: 'p10',
        name: 'Brownie com Sorvete',
        description: 'Brownie de chocolate com bola de creme.',
        price: 18.9,
        img: '/images/image_teste_01.jpg',
        category: 'Sobremesas',
    },
]

export default function CustomerMenuP0() {
    const [query, setQuery] = useState('')
    const [cart, setCart] = useState<Record<string, number>>({})
    const [cartOpen, setCartOpen] = useState(false)

    // categorias dinamicamente a partir dos produtos
    const categories = useMemo(() => {
        const set = new Set(PRODUCTS.map(p => p.category))
        return Array.from(set)
    }, [])

    // produtos agrupados por categoria (já aplicando busca)
    const grouped = useMemo(() => {
        const q = query.trim().toLowerCase()
        const map = new Map<string, Product[]>()
        for (const p of PRODUCTS) {
            if (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) {
                const arr = map.get(p.category) ?? []
                arr.push(p)
                map.set(p.category, arr)
            }
        }
        // ordenação opcional por nome dentro de cada categoria
        for (const [k, arr] of map) map.set(k, arr.sort((a, b) => a.name.localeCompare(b.name)))
        return map
    }, [query])

    const totalItems = Object.values(cart).reduce((a, b) => a + b, 0)
    const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
        const item = PRODUCTS.find(p => p.id === id)
        return sum + (item ? item.price * qty : 0)
    }, 0)

    const add = (id: string) => setCart(c => ({...c, [id]: (c[id] || 0) + 1}))
    const sub = (id: string) =>
        setCart(c => {
            const next = {...c}
            if (!next[id]) return c
            next[id] -= 1
            if (next[id] <= 0) delete next[id]
            return next
        })

    const scrollToCategory = (cat: string) => {
        document.getElementById(slug(cat))?.scrollIntoView({behavior: 'smooth', block: 'start'})
    }

    return (
        <div className="min-h-dvh bg-background text-foreground">
            {/* Top bar */}
            <Navbar isBordered className="sticky top-0 z-50 bg-background/80 backdrop-blur-md">
                <NavbarBrand className="gap-2">
                    <div
                        aria-hidden
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
                        B
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold">Burger do Joca</span>
                        <span className="text-xs text-default-500">Aberto • Retirada / Entrega</span>
                    </div>
                </NavbarBrand>
                <NavbarContent justify="end">
                    <NavbarItem>
                        <Badge color="primary" content={totalItems} isInvisible={!totalItems} shape="circle">
                            <Button
                                isIconOnly
                                radius="full"
                                variant="flat"
                                aria-label="Abrir carrinho"
                                onPress={() => setCartOpen(true)}
                            >
                                <ShoppingCartIcon/>
                            </Button>
                        </Badge>
                    </NavbarItem>
                </NavbarContent>
            </Navbar>

            {/* Busca + atalhos de categorias */}
            <div className="p-4 pb-2">
                <Input value={query} onValueChange={setQuery} placeholder="Buscar no cardápio"
                       startContent={<SearchIcon className="text-2xl text-default-400 pointer-events-none shrink-0"/>}
                       variant="bordered"/>
            </div>

            <div className="px-4">
                <ScrollShadow hideScrollBar orientation="horizontal" className="max-w-full">
                    <div className="flex gap-2 pb-3 pt-3 w-max">
                        {categories.map((c) => (
                            <Chip
                                key={c}
                                color="primary"
                                variant="flat"
                                className="cursor-pointer"
                                onClick={() => scrollToCategory(c)}
                            >
                                {c}
                            </Chip>

                        ))}
                    </div>
                </ScrollShadow>
            </div>

            {/* SEÇÕES (uma por categoria) */}
            <div className="flex flex-col gap-6 py-2">
                {categories.map((cat) => {
                    const items = grouped.get(cat) ?? []
                    if (items.length === 0) return null // esconde categoria sem resultados na busca

                    return (
                        <section key={cat} id={slug(cat)} className="scroll-mt-20">
                            {/* Cabeçalho da categoria */}
                            <div className="flex items-center justify-between px-4">
                                <h2 className="text-sm font-semibold tracking-wide uppercase text-default-600">{cat}</h2>
                                {/* botão “ver todos” se quiser levar a /categoria/{slug} */}
                            </div>

                            {/* Faixa horizontal de cards */}
                            <ScrollShadow orientation="horizontal" hideScrollBar className="px-4 pt-2 pb-4">
                                <div className="flex gap-3 w-max snap-x snap-mandatory">
                                    {items.map((p) => (
                                        <Card isBlurred key={p.id} shadow="sm"
                                              className="snap-start w-[85vw] sm:w-[360px] shrink-0 bg-background/60 rounded-2xl border border-default-100 hover:shadow-lg transition-shadow">
                                            <CardBody className="p-4">
                                                <div className="flex gap-4 items-start">
                                                    <Image
                                                        alt={p.name}
                                                        src={p.img}
                                                        width={96}
                                                        className="h-20 w-20 object-cover rounded-2xl shrink-0"
                                                    />
                                                    <div className="flex flex-col flex-1 min-w-0">
                                                        <span
                                                            className="text-[11px] uppercase tracking-wide text-success-500 font-semibold">
                                                            {p.category}
                                                        </span>
                                                        <h3 className="mt-1 text-base font-extrabold leading-tight line-clamp-2">
                                                            {p.name}
                                                        </h3>
                                                        <p className="text-[11px] text-default-500 line-clamp-2 mt-1">
                                                            {p.description}
                                                        </p>
                                                        <div className="mt-3 flex items-center justify-between">
                                                            <span className="text-lg font-extrabold text-success-600">
                                                                {toBRL(p.price)}
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
                                                                        <MinusIcon className="w-5 h-5"/>
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
                                                                        <PlusIcon className="w-5 h-5"/>
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
                                                                    <PlusIcon className="w-4 h-4"/>
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

                            <Divider className="mt-4"/>
                        </section>
                    )
                })}
            </div>

            {/* Barra do carrinho */}
            {totalItems > 0 && (
                <div className="fixed inset-x-0 bottom-0 z-50 p-3">
                    <div className="mx-auto max-w-md sm:max-w-xl">
                        <Button color="primary" size="lg" radius="full" onPress={() => setCartOpen(true)}>
                            {totalItems} item{totalItems > 1 ? 's' : ''} • {toBRL(totalPrice)} — Ver carrinho
                        </Button>
                    </div>
                </div>
            )}

            {/* Modal do carrinho */}
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
                                            const p = PRODUCTS.find(x => x.id === id)!
                                            return (
                                                <div key={id} className="flex items-center gap-3">
                                                    <Image alt={p.name} src={p.img} width={56} height={56} radius="sm"/>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium">{p.name}</span>
                                                            <span className="text-sm">{toBRL(p.price * qty)}</span>
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
                                        <Divider/>
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
