/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                body: 'var(--color-body-bg)',
                signature: 'var(--color-signature)',
                detailing: 'var(--color-detailing)',
            },
            spacing: {
                xs: 'var(--spacing-xs)',
                sm: 'var(--spacing-sm)',
                md: 'var(--spacing-md)',
                lg: 'var(--spacing-lg)',
                xl: 'var(--spacing-xl)',
            },
            transitionProperty: {
                'fluid': 'var(--transition-fluid)',
                'fast': 'var(--transition-fast)',
            },
            fontFamily: {
                mono: 'var(--font-family-mono)',
                sans: 'var(--font-family-base)'
            }
        },
    },
    plugins: [],
}
