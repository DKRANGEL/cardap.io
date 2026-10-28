export default function CarregandoPainel() {
    return (
        <main role="status" aria-label="Carregando" className="mx-auto flex min-h-dvh w-full max-w-[448px] flex-col gap-6 px-4 pt-6 pb-6">
            <span className="sr-only">Carregando…</span>
            <div className="flex flex-col gap-2">
                <div className="h-6 w-56 animate-pulse rounded-xs bg-superficie-marcada" />
                <div className="h-4 w-32 animate-pulse rounded-xs bg-superficie-marcada" />
            </div>
            {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-superficie-marcada" />
            ))}
        </main>
    )
}
