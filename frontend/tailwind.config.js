/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy:  { DEFAULT: '#1E3A5F', light: '#2A4F80', dark: '#152B47' },
        beige: { DEFAULT: '#F5F0E8', dark: '#EDE6D6', card: '#FDFCFA' },
        amber: { DEFAULT: '#F5A623', light: '#FBD38D', dark: '#D4891A' },
        sage:  { DEFAULT: '#27AE60', light: '#6FCF97', dark: '#1E8449' },
        coral: { DEFAULT: '#E74C3C', light: '#FDECEA' },
        slate: { DEFAULT: '#64748B', light: '#94A3B8' },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 4px rgba(30,58,95,0.07), 0 4px 16px rgba(30,58,95,0.05)',
        modal: '0 20px 60px rgba(30,58,95,0.18)',
        button: '0 2px 8px rgba(245,166,35,0.35)',
      },
      borderRadius: { xl2: '16px', xl3: '24px' },
    },
  },
  plugins: [],
}
