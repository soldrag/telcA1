/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Semantic Palette (CSS Variable backed for Theme support) ── */

        // Backgrounds
        canvas:             'var(--bg-canvas, #f1f5f9)',
        'bg-canvas':        'var(--bg-canvas, #f1f5f9)',
        'surface-card':     'var(--surface-card, #ffffff)',
        'surface-raised':   'var(--surface-raised, #f8fafc)',
        'surface-inset':    'var(--surface-inset, #f1f5f9)',

        // Primary action (telc blue)
        'action-primary':        '#0369a1',  // telc-600
        'action-primary-hover':  '#075985',  // telc-700
        'action-primary-active': '#0c4a6e',  // telc-800
        'action-primary-subtle': 'var(--action-primary-subtle, #f0f5fa)',
        'action-primary-muted':  'var(--action-primary-muted, #e1ebf5)',
        'action-primary-border': 'var(--action-primary-border, #c3d7eb)',

        // Content / text
        'content-primary':    'var(--content-primary, #020617)',
        'content-secondary':  'var(--content-secondary, #334155)',
        'content-tertiary':   'var(--content-tertiary, #64748b)',
        'content-muted':      'var(--content-muted, #94a3b8)',
        'content-on-primary': '#ffffff',

        // Borders
        'border-default':  'var(--border-default, #cbd5e1)',
        'border-subtle':   'var(--border-subtle, #e2e8f0)',
        'border-strong':   'var(--border-strong, #0f172a)',

        // State: success
        'state-success':         '#059669',  // emerald-600
        'state-success-hover':   '#047857',  // emerald-700
        'state-success-subtle':  'var(--state-success-subtle, #ecfdf5)',
        'state-success-muted':   'var(--state-success-muted, #d1fae5)',
        'state-success-border':  'var(--state-success-border, #a7f3d0)',
        'state-success-text':    'var(--state-success-text, #065f46)',

        // State: error
        'state-error':         '#e11d48',  // rose-600
        'state-error-hover':   '#be123c',  // rose-700
        'state-error-subtle':  'var(--state-error-subtle, #fff1f2)',
        'state-error-muted':   'var(--state-error-muted, #ffe4e6)',
        'state-error-border':  'var(--state-error-border, #fecdd3)',
        'state-error-text':    'var(--state-error-text, #9f1239)',

        // State: warning
        'state-warning':         '#d97706',  // amber-600
        'state-warning-hover':   '#b45309',  // amber-700
        'state-warning-subtle':  'var(--state-warning-subtle, #fffbeb)',
        'state-warning-muted':   'var(--state-warning-muted, #fef3c7)',
        'state-warning-border':  'var(--state-warning-border, #fde68a)',
        'state-warning-text':    'var(--state-warning-text, #92400e)',

        // State: info
        'state-info':         '#0284c7',  // sky-600
        'state-info-subtle':  'var(--state-info-subtle, #f0f9ff)',
        'state-info-muted':   'var(--state-info-muted, #e0f2fe)',
        'state-info-border':  'var(--state-info-border, #bae6fd)',
        'state-info-text':    'var(--state-info-text, #075985)',

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
