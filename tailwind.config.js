/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
    theme: {
        extend: {
            colors: {
                orange: {
                    DEFAULT: "#d35400",
                    500: "#d35400",
                    accent: "#e67e22",
                    hover: "#f39c12",
                },
                "blue-gray": {
                    DEFAULT: "#2c3e50",
                    800: "#2c3e50",
                    700: "#34495e",
                    darker: "#233140",
                },
                danger: {
                    DEFAULT: "#e74c3c",
                    dark: "#c0392b",
                },
            },
            animation: {
                modalAppear: "modalAppear 0.3s ease-out",
            },
            keyframes: {
                modalAppear: {
                    "0%": { opacity: "0", transform: "scale(0.95)" },
                    "100%": { opacity: "1", transform: "scale(1)" },
                },
            },
        },
    },
    plugins: [],
};

