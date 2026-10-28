'use client'

export default function ErroGlobal({ reset }: { error: Error; reset: () => void }) {
    return (
        <html lang="pt-BR">
        <body style={{ margin: 0, minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
                       background: '#fffdfa', color: '#1c1814', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
        <main style={{ maxWidth: 360, padding: 24 }}>
            <h1 style={{ fontSize: 17, margin: '0 0 8px' }}>Algo deu errado</h1>
            <p style={{ fontSize: 15, lineHeight: '22px', margin: '0 0 16px', color: '#5a5146' }}>
                Não conseguimos abrir o cardap.io agora. Tente de novo.
            </p>
            <button type="button" onClick={reset}
                    style={{ height: 52, width: '100%', border: 0, borderRadius: 9999, background: '#bd3f0d',
                             color: '#fffdfa', fontSize: 16, fontWeight: 600 }}>
                Tentar de novo
            </button>
        </main>
        </body>
        </html>
    )
}
