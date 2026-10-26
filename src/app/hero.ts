import { heroui } from "@heroui/react";

export default heroui({
    themes: {
        light: {
            colors: {
                background: "#fffdfa",
                foreground: "#1c1814",
                focus: "#1c1814",
                primary: {
                    50: "#fef4ee", 100: "#fde3d3", 200: "#fac5a6", 300: "#f59e6f",
                    400: "#ee7538", 500: "#e05616", 600: "#bd3f0d", 700: "#9a330f",
                    800: "#7b2c12", 900: "#652712",
                    DEFAULT: "#bd3f0d", foreground: "#fffdfa",
                },
                default: {
                    50: "#faf8f4", 100: "#f2ede5", 200: "#e6ded2", 300: "#d3c8b8",
                    400: "#a99d8c", 500: "#786d5f", 600: "#5a5146", 700: "#433c33",
                    800: "#2d2822", 900: "#1c1814",
                    DEFAULT: "#a99d8c", foreground: "#1c1814",
                },
                success: { DEFAULT: "#0f6e5e", 50: "#e6f4f1", 600: "#0f6e5e", foreground: "#fffdfa" },
                danger: { DEFAULT: "#9f1239", 50: "#fdeef2", 600: "#9f1239", foreground: "#fffdfa" },
                warning: { DEFAULT: "#8a5a00", 50: "#fdf2dc", 600: "#8a5a00", foreground: "#fffdfa" },
            },
            layout: {
                radius: { small: "10px", medium: "14px", large: "20px" },
                borderWidth: { small: "1px", medium: "1px", large: "2px" },
            },
        },
    },
});
