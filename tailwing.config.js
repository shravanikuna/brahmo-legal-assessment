/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eef2f8',
                    100: '#d9e2ef',
                    200: '#b8c9df',
                    300: '#94abcc',
                    400: '#6087b3',
                    500: '#3a6a9e',
                    600: '#1a3a6b',
                    700: '#0f2b4f',
                    800: '#0a1e38',
                    900: '#061424',
                },
                gold: {
                    50: '#fef8e7',
                    100: '#fdf0cf',
                    200: '#fbe3a3',
                    300: '#f9d473',
                    400: '#f5c542',
                    500: '#c4a747',
                    600: '#a88a38',
                    700: '#8c6e2a',
                    800: '#70551c',
                    900: '#543d10',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                serif: ['Merriweather', 'Georgia', 'serif'],
            },
            boxShadow: {
                'card': '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
                'card-hover': '0 10px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.02)',
                'sidebar': '1px 0 0 0 var(--gray-200)',
            },
        },
    },
    plugins: [],
}