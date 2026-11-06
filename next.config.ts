import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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
