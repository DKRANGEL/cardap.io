import type { NextConfig } from 'next'

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL) : null

const nextConfig: NextConfig = {
    images: {
        // Só as fotos públicas do bucket 'fotos'; qualquer outro host continua barrado pelo otimizador.
        remotePatterns: supabase
            ? [{
                protocol: supabase.protocol.replace(':', '') as 'http' | 'https',
                hostname: supabase.hostname,
                port: supabase.port,
                pathname: '/storage/v1/object/public/fotos/**',
            }]
            : [],
    },
    // As fontes do PDF são lidas do disco em tempo de execução; sem isso o build de produção não as leva junto.
    outputFileTracingIncludes: { '/painel/divulgar/pdf': ['./src/lib/pdf/fontes/**/*'] },
    serverExternalPackages: ['sharp'],
    transpilePackages: ['@heroui/system', '@heroui/react', '@heroui/theme'],
    experimental: {
        // A foto do produto (800px em WebP, na casa de 30 a 120 kB) sobe por Server Action, para o navegador
        // não carregar o supabase-js inteiro (~120 kB) só para enviar um arquivo. 2 MB dá folga e limita abuso.
        serverActions: { bodySizeLimit: '2mb' },
    },
    async redirects() {
        return [{ source: '/painel/login', destination: '/entrar', permanent: true }]
    },
}
export default nextConfig
