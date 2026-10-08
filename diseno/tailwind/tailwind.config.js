/**
 * tailwind.config.js — C4 (§8/§12 maestro): Tailwind mapeado EXACTO a
 * tokens/design-tokens.json. La paridad literal la verifica
 * diseno/tests/test_paridad_tokens.py: editar aquí sin editar el JSON rompe CI.
 *
 * Uso (repo operativo): `npx tailwindcss -i src/styles/base.css -o dist/…`
 */

module.exports = {
  content: [
    "./*.html",
    "./auth/**/*.html",
    "./dashboard/**/*.html",
    "./src/**/*.{js,html}",
    "./components/**/*.js",
  ],
  darkMode: "media", // prefers-color-scheme (§11.1)
  theme: {
    container: { center: true, padding: "1rem" },
    screens: {
      xs: "320px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        /* §8.2 primario */
        "azul-profundo": "#0A2540",
        "azul-medio": "#1E4D8C",
        "azul-claro": "#4A90E2",
        /* §8.2 secundario */
        "amarillo-energia": "#FFD93D",
        "naranja-calido": "#FF6B35",
        "verde-sostenible": "#2ECC71",
        "verde-oscuro": "#1E8449",
        /* §8.2 neutro */
        blanco: "#FFFFFF",
        "gris-050": "#F8FAFC",
        "gris-200": "#E2E8F0",
        "gris-400": "#94A3B8",
        "gris-600": "#475569",
        "negro-suave": "#0F172A",
        /* §8.2 semántico */
        exito: "#16A34A",
        advertencia: "#F59E0B",
        error: "#DC2626",
        info: "#0EA5E9",
        /* §8.2 datos */
        dato: {
          1: "#1E4D8C",
          2: "#2ECC71",
          3: "#FFD93D",
          4: "#FF6B35",
          5: "#8B5CF6",
          6: "#06B6D4",
          7: "#EC4899",
          8: "#64748B",
        },
        /* §8.2 dark */
        fondo: { DEFAULT: "#0F172A", 2: "#1E293B", 3: "#334155" },
        texto: { DEFAULT: "#F1F5F9", 2: "#CBD5E1" },
        "azul-dark": "#60A5FA",
        "amarillo-dark": "#FCD34D",
      },
      fontFamily: {
        cuerpo: ["Inter", "system-ui", "sans-serif"],
        datos: ["'JetBrains Mono'", "ui-monospace", "monospace"],
        titular: ["'Space Grotesk'", "Inter", "sans-serif"],
      },
      fontSize: {
        // [tamanyo, line-height] — escala Major Third 1.250 (§8.3)
        "display-xl": ["4rem", "4.5rem"],
        "display-l": ["3rem", "3.5rem"],
        h1: ["2.5rem", "3rem"],
        h2: ["2rem", "2.5rem"],
        h3: ["1.5rem", "2rem"],
        h4: ["1.25rem", "1.75rem"],
        "body-l": ["1.125rem", "1.75rem"],
        "body-m": ["1rem", "1.5rem"],
        "body-s": ["0.875rem", "1.25rem"],
        caption: ["0.75rem", "1rem"],
        overline: ["0.6875rem", "1rem"],
      },
      letterSpacing: {
        display: "-0.02em",
        h: "-0.01em",
        overline: "0.08em",
      },
      spacing: {
        "3xs": "0.25rem",
        "2xs": "0.5rem",
        xs: "0.75rem",
        sm: "1rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "3rem",
        "2xl": "4rem",
        "3xl": "6rem",
      },
      borderRadius: {
        cero: "0",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
        full: "9999px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(15,23,42,0.05)",
        sm: "0 1px 3px 0 rgba(15,23,42,0.10), 0 1px 2px -1px rgba(15,23,42,0.10)",
        md: "0 4px 6px -1px rgba(15,23,42,0.10), 0 2px 4px -2px rgba(15,23,42,0.10)",
        lg: "0 10px 15px -3px rgba(15,23,42,0.10), 0 4px 6px -4px rgba(15,23,42,0.10)",
        xl: "0 20px 25px -5px rgba(15,23,42,0.12), 0 8px 10px -6px rgba(15,23,42,0.10)",
        "2xl": "0 25px 50px -12px rgba(15,23,42,0.25)",
      },
      transitionDuration: {
        instant: "100ms",
        fast: "200ms",
        normal: "300ms",
        slow: "500ms",
        "very-slow": "800ms",
      },
      transitionTimingFunction: {
        "ease-out": "cubic-bezier(0.33, 1, 0.68, 1)",
        "ease-in": "cubic-bezier(0.32, 0, 0.67, 0)",
        "ease-in-out": "cubic-bezier(0.65, 0, 0.35, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      maxWidth: {
        desktop: "1440px",
        tablet: "1024px",
      },
      zIndex: {
        base: 0,
        arriba: 1,
        fijo: 10,
        overlay: 100,
        modal: 1000,
        toast: 1100,
        salto: 9999,
      },
    },
  },
  plugins: [],
};
