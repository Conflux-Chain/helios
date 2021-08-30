module.exports = {
  mode: 'jit',
  purge: {
    content: [
      './packages/popup/**/*.html',
      './packages/popup/**/*.js',
      './packages/doc-ui/**/*.html',
      './packages/doc-ui/**/*.js',
      './packages/ui/**/*.html',
      './packages/ui/**/*.js',
      './packages/ui-components/**/*.html',
      './packages/ui-components/**/*.js',
      './websites/doc/**/*.html',
      './websites/doc/**/*.js',
    ],
    options: {
      keyframes: true,
    },
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontSize: {
      '2xs': ['10px', '14px'],
      xs: ['12px', '16px'],
      sm: ['14px', '18px'],
      base: ['16px', '22px'],
      lg: ['20px', '28px'],
      '2lg': ['24px', '30px'],
      xl: ['28px', '36px'],
      '2xl': ['32px', '40px'],
    },
    extend: {
      spacing: {
        1.25: '0.3125rem',
        4.5: '1.125rem',
        15: '3.75rem',
        24.5: '6.125rem',
        26.5: '6.625rem',
        29.5: '7.375rem',
        50: '12.5rem',
        63: '15.75rem',
        70: '17.5rem',
        77: '19rem',
        95: '23.75rem',
        100: '25rem',
        104: '26rem',
        110: '27.5rem',
        112: '28rem',
        116: '29rem',
        132: '33rem',
        145: '36.25rem',
        160: '40rem',
        168: '42rem',
        200: '50rem',
        236: '59rem',
        256: '64rem',
        360: '90rem',
        fit: 'fit-content',
      },
      borderRadius: {
        '2.5xl': '1.25rem',
      },
      boxShadow: {
        1: '0px 4px 6px rgba(0, 0, 0, 0.12)',
        2: '0px 6px 16px rgba(0, 0, 0, 0.08)',
        3: '0px 8px 36px rgba(0, 0, 0, 0.06)',
      },
      colors: {
        bg: 'var(--color-bg)',
        white: 'var(--color-white)',
        black: 'var(--color-black)',
        primary: 'var(--color-primary)',
        error: 'var(--color-error)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)',
        'primary-dark': 'var(--color-primary-dark)',
        'error-dark': 'var(--color-error-dark)',
        'success-dark': 'var(--color-success-dark)',
        'warning-dark': 'var(--color-warning-dark)',
        'info-dark': 'var(--color-info-dark)',
        'primary-4': 'var(--color-primary-4)',
        'primary-10': 'var(--color-primary-10)',
        'primary-90': 'var(--color-primary-90)',
        'primary-96': 'var(--color-primary-96)',
        'error-10': 'var(--color-error-10)',
        'error-90': 'var(--color-error-90)',
        'success-10': 'var(--color-success-10)',
        'success-90': 'var(--color-success-90)',
        'warning-10': 'var(--color-warning-10)',
        'warning-90': 'var(--color-warning-90)',
        'info-10': 'var(--color-info-10)',
        'info-90': 'var(--color-info-90)',
        'gray-0': 'var(--color-gray-0)',
        'gray-10': 'var(--color-gray-10)',
        'gray-20': 'var(--color-gray-20)',
        'gray-40': 'var(--color-gray-40)',
        'gray-60': 'var(--color-gray-60)',
        'gray-80': 'var(--color-gray-80)',
        'gray-90': 'var(--color-gray-90)',
        'gray-100': 'var(--color-gray-100)',
      },
      fontFamily: {
        body: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Helvetica Neue',
          'Helvetica',
          'Microsoft YaHei',
          '微软雅黑',
          'Arial',
          'sans-serif',
        ],
      },
      keyframes: {
        'move-left': {
          '0%': {
            transform: 'translateX(100%)',
          },
          '100%': {
            transform: 'translateX(0)',
          },
        },
        'move-down': {
          '0%': {
            transform: 'translateY(-100%)',
          },
          '100%': {
            transform: 'translateY(0)',
          },
        },
        'move-up': {
          '0%': {
            transform: 'translateY(0)',
          },
          '100%': {
            transform: 'translateY(100%)',
          },
        },
        'slice-down': {
          '0%': {
            transform: 'scale(1, 0)',
          },
          '100%': {
            transform: 'scale(1, 1)',
          },
        },
        'slice-up': {
          '0%': {
            transform: 'scale(1, 1)',
          },
          '100%': {
            transform: 'scale(1, 0)',
          },
        },
      },
      animation: {
        'move-left': 'move-left 0.2s ease-in-out 1',
        'move-down': 'move-down 0.2s ease-in-out 1',
        'move-up': 'move-up 0.2s ease-in-out 1',
        'slice-down': 'slice-down 0.3s ease-in 1',
        'slice-up': 'slice-up 0.3s ease-in 1',
        'pulse-fast': 'pulse 0.7s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      transitionProperty: {
        maxHeight: 'maxHeight',
      },
      minHeight: {
        8: '2rem',
        220: '55rem',
      },
      minWidth: {
        8: '2rem',
      },
      maxWidth: {
        60: '15rem',
      },
    },
  },
  variants: {
    extend: {
      borderWidth: ['hover'],
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}
