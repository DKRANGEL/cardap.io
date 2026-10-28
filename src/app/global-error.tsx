'use client'

import { useEffect, useState } from 'react'

// Segura qualquer erro que não tenha error.tsx mais perto (cardápio público, raiz). Fica sem
// componentes e sem ícones de propósito: ele vai no JS de toda página, inclusive a do cliente final.
// O estilo é inline porque, ao ser ativado, substitui o layout inteiro e o CSS pode não estar lá.
export default function ErroGlobal() {
    const [semInternet, setSemInternet] = useState(false)

    useEffect(() => {
        setSemInternet(!navigator.onLine)
    }, [])

    return (
        <html lang="pt-BR">
        <body style={{ margin: 0, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                       background: '#fffdfa', color: '#1c1814', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
        <main style={{ width: '100%', maxWidth: 360, boxSizing: 'border-box', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <span aria-hidden style={{ width: 48, height: 48, borderRadius: 9999, background: '#f2ede5',
                                       display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5a5146" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                </svg>
            </span>
            <h1 style={{ fontSize: 17, lineHeight: '22px', margin: 0 }}>Não deu pra carregar essa página</h1>
            <p style={{ fontSize: 15, lineHeight: '22px', margin: 0, color: '#5a5146' }}>
                {semInternet
                    ? 'Parece que você está sem internet. Confira a conexão e tente de novo.'
                    : 'Pode ser a sua conexão. Tente de novo.'}
            </p>
            <button type="button" onClick={() => window.location.reload()}
                    style={{ marginTop: 8, height: 52, width: '100%', border: 0, borderRadius: 9999, background: '#bd3f0d',
                             color: '#fffdfa', fontSize: 16, fontWeight: 600 }}>
                Tentar de novo
            </button>
        </main>
        </body>
        </html>
    )
}
