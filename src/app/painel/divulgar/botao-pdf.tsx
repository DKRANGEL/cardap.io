import { FileTextIcon } from 'lucide-react'

// Provisório: abre o HTML do cardápio numa nova aba. A issue do PDF (#14/#15) troca por gerar,
// compartilhar e baixar o arquivo.
export function BotaoPdf() {
    return (
        <a
            href="/painel/divulgar/pdf"
            target="_blank"
            rel="noopener"
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-superficie-marcada text-base font-semibold text-tinta"
        >
            <FileTextIcon aria-hidden className="h-5 w-5" />
            Ver cardápio para PDF
        </a>
    )
}
