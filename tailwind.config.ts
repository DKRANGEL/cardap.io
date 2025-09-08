import type { Config } from "tailwindcss"
import { heroui } from "@heroui/react"

export default {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: { extend: {} },
    plugins: [heroui()],
} satisfies Config
