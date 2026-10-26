'use client'

import NextLink from 'next/link'
import { Button } from '@heroui/react'
import type { ReactNode } from 'react'

type Props = {
    href: string
    children: ReactNode
    principal?: boolean
}

export function BotaoLink({ href, children, principal = false }: Props) {
    return (
        <Button
            as={NextLink}
            href={href}
            color="primary"
            variant={principal ? 'solid' : 'flat'}
            size="lg"
            className="min-h-12"
        >
            {children}
        </Button>
    )
}
