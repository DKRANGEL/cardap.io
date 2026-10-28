export default function CarregandoCardapio() {
    return (
        <div role="status" aria-label="Carregando o cardápio" className="mx-auto min-h-dvh w-full max-w-[520px] bg-superficie">
            <span className="sr-only">Carregando o cardápio…</span>
            <div className="flex h-16 items-center gap-3 border-b border-borda px-4">
                <div className="h-11 w-11 animate-pulse rounded-sm bg-superficie-marcada" />
                <div className="h-6 w-40 animate-pulse rounded-xs bg-superficie-marcada" />
            </div>
            <div className="px-4 py-3">
                <div className="h-12 animate-pulse rounded-md bg-superficie-marcada" />
            </div>
            <div className="flex gap-2 px-4 pb-2">
                {[88, 72, 120].map((l) => (
                    <div key={l} style={{ width: l }} className="h-11 animate-pulse rounded-full bg-superficie-marcada" />
                ))}
            </div>
            <div className="flex flex-col gap-3 px-4 pt-5">
                <div className="h-5 w-24 animate-pulse rounded-xs bg-superficie-marcada" />
                {[0, 1, 2].map((i) => (
                    <div key={i} className="flex gap-3 rounded-lg border border-borda p-3">
                        <div className="h-[84px] w-[84px] shrink-0 animate-pulse rounded-lg bg-superficie-marcada" />
                        <div className="flex flex-1 flex-col gap-2">
                            <div className="h-5 w-3/4 animate-pulse rounded-xs bg-superficie-marcada" />
                            <div className="h-4 w-full animate-pulse rounded-xs bg-superficie-marcada" />
                            <div className="mt-auto h-5 w-20 animate-pulse rounded-xs bg-superficie-marcada" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
