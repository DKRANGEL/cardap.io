import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    transpilePackages: ['@heroui/system', '@heroui/react', '@heroui/theme'],
    async redirects() {
        return [{ source: '/painel/login', destination: '/entrar', permanent: true }]
    },
}
export default nextConfig
