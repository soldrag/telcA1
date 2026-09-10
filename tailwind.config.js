/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Semantic Palette (role-based, not hue-based) ── */

        // Backgrounds
        canvas:             '#f1f5f9',   // slate-100 — full page bg
        'bg-canvas':        '#f1f5f9',   // slate-100 — full page bg (alias)
        'surface-card':     '#ffffff',   // white — card/panel bg
        'surface-raised':   '#f8fafc',   // slate-50 — subtle raised bg
        'surface-inset':    '#f1f5f9',   // slate-100 — inset/muted bg

        // Primary action (telc blue)
        'action-primary':        '#0369a1',  // telc-600
        'action-primary-hover':  '#075985',  // telc-700
        'action-primary-active': '#0c4a6e',  // telc-800
        'action-primary-subtle': '#f0f5fa',  // telc-50
        'action-primary-muted':  '#e1ebf5',  // telc-100
        'action-primary-border': '#c3d7eb',  // telc-200

        // Content / text
        'content-primary':    '#020617',  // slate-950
        'content-secondary':  '#334155',  // slate-700
        'content-tertiary':   '#64748b',  // slate-500
        'content-muted':      '#94a3b8',  // slate-400
        'content-on-primary': '#ffffff',  // white on primary bg

        // Borders
        'border-default':  '#cbd5e1',  // slate-300
        'border-subtle':   '#e2e8f0',  // slate-200
        'border-strong':   '#0f172a',  // slate-900

        // State: success
        'state-success':         '#059669',  // emerald-600
        'state-success-hover':   '#047857',  // emerald-700
        'state-success-subtle':  '#ecfdf5',  // emerald-50
        'state-success-muted':   '#d1fae5',  // emerald-100
        'state-success-border':  '#6ee7b7',  // emerald-300
        'state-success-text':    '#064e3b',  // emerald-900

        // State: error
        'state-error':         '#e11d48',  // rose-600
        'state-error-hover':   '#be123c',  // rose-700
        'state-error-subtle':  '#fff1f2',  // rose-50
        'state-error-muted':   '#ffe4e6',  // rose-100
        'state-error-border':  '#fda4af',  // rose-300
        'state-error-text':    '#881337',  // rose-900

        // State: warning
        'state-warning':         '#d97706',  // amber-600
        'state-warning-hover':   '#b45309',  // amber-700
        'state-warning-subtle':  '#fffbeb',  // amber-50
        'state-warning-muted':   '#fef3c7',  // amber-100
        'state-warning-border':  '#fcd34d',  // amber-300
        'state-warning-text':    '#78350f',  // amber-900

        // State: info
        'state-info':         '#0284c7',  // sky-600
        'state-info-subtle':  '#f0f9ff',  // sky-50
        'state-info-muted':   '#e0f2fe',  // sky-100
        'state-info-border':  '#7dd3fc',  // sky-300
        'state-info-text':    '#0c4a6e',  // sky-900

        // Legacy telc scale (kept for gradients / branding where semantic is too broad)
        telc: {
          50:  '#f0f5fa',
          100: '#e1ebf5',
          200: '#c3d7eb',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
          800: '#0c4a6e',
          900: '#082f49',
          950: '#041e36',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      /* ── Design-token spacing aliases (all on 4/8px grid) ── */
      /* Tailwind's default spacing already aligns: 1=4px, 2=8px, 3=12px, 4=16px, 6=24px, 8=32px, 12=48px */
    },
  },
  plugins: [],
}
