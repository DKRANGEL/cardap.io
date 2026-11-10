import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { montarHtmlDoCardapio, type LojaParaPdf } from '@/lib/pdf/montar-html'
import { TEMPLATE_PADRAO, temTemplate } from '@/lib/pdf/templates'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Só o dono gera o PDF, e só da própria loja (o Chromium é caro e não deve ser aberto ao público).
// Nesta etapa devolve o HTML autossuficiente; a issue seguinte troca por PDF.
export async function GET(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ erro: 'Sua sessão expirou. Entre novamente.' }, { status: 401 })

    const template = request.nextUrl.searchParams.get('template') ?? TEMPLATE_PADRAO
    if (!temTemplate(template)) return NextResponse.json({ erro: 'Modelo de PDF desconhecido.' }, { status: 400 })

    const { data: loja, error } = await supabase
        .from('lojas')
        .select('id, slug, nome, whatsapp, cor_primaria, logo_url')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle<LojaParaPdf & { slug: string }>()
    if (error) return NextResponse.json({ erro: 'Não deu pra falar com o servidor. Tente de novo.' }, { status: 503 })
    if (!loja) return NextResponse.json({ erro: 'Crie sua loja antes de gerar o PDF.' }, { status: 404 })

    const slug = request.nextUrl.searchParams.get('slug')
    if (slug && slug !== loja.slug) return NextResponse.json({ erro: 'Essa loja não é sua.' }, { status: 404 })

    try {
        const html = await montarHtmlDoCardapio(supabase, loja, template)
        return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } })
    } catch {
        return NextResponse.json({ erro: 'Não foi possível montar o cardápio. Tente de novo.' }, { status: 500 })
    }
}
