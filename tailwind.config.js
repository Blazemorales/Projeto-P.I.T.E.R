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
        primary: '#2563eb',     // Azul principal (botões, destaques)
        secondary: '#111827',   // Cinza quase preto (textos fortes)
        accent: '#16a34a',      // Verde (indicadores positivos)
        background: '#f9fafb',  // Fundo claro
        muted: '#6b7280',       // Cinza médio para legendas
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        card: '0 4px 10px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
