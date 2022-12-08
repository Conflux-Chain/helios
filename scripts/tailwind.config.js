module.exports = {
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

  // purge: {
  //   options: {
  //     keyframes: true,
  //   },
  // },
  // darkMode: false, // or 'media' or 'class'
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
      current: 'currentColor',
      flex: {
        2: '2 2 0%',
        3: '2 2 0%',
      },
      spacing: {
        1.25: '0.3125rem',
        13: '3.25rem',
        15: '3.75rem',
        25: '6.25rem',
        45: '11.25rem',
        50: '12.5rem',
        70: '17.5rem',
        85: '21.25rem',
        93: '23.25rem',
        100: '25rem',
        110: '27.5rem',
        120: '30rem',
        125: '31.25rem',
        150: '37.5rem',
      },
      boxShadow: {
        1: '0px 4px 6px rgba(0, 0, 0, 0.12)',
        2: '0px 6px 16px rgba(0, 0, 0, 0.08)',
        3: '0px 8px 36px rgba(0, 0, 0, 0.06)',
        'fluent-1': '0px 2px 8px rgba(75, 100, 233, 0.12)',
        'fluent-2': '0px 6px 16px rgba(149, 163, 233, 0.08)',
        'fluent-3': '0px 8px 16px rgba(149, 163, 233, 0.08)',
        'fluent-4': '0px 8px 16px rgba(164, 170, 216, 0.08)',
      },
      colors: {
        bg: 'var(--color-bg)',
        white: 'var(--color-white)',
        black: 'var(--color-black)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
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
        'gray-4': 'var(--color-gray-4)',
        'gray-10': 'var(--color-gray-10)',
        'gray-20': 'var(--color-gray-20)',
        'gray-40': 'var(--color-gray-40)',
        'gray-60': 'var(--color-gray-60)',
        'gray-80': 'var(--color-gray-80)',
        'gray-90': 'var(--color-gray-90)',
        'gray-96': 'var(--color-gray-96)',
        'gray-100': 'var(--color-gray-100)',
      },
      fontFamily: {
        sans: [
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
        zh: [
          'PingFang SC',
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
      minHeight: {
        8: '2rem',
        150: '37.5rem',
      },
      minWidth: {
        8: '2rem',
        93: '23.25rem',
      },
      maxWidth: {
        60: '15rem',
      },
      keyframes: {
        'slide-up': {
          '0%': {
            transform: 'translateY(100%)',
          },
          '100%': {
            transform: 'translateY(0%)',
          },
        },
        'slide-down': {
          '0%': {
            transform: 'translateY(0%)',
          },
          '100%': {
            transform: 'translateY(100%)',
            display: 'none',
          },
        },
        'slide-left-in': {
          '0%': {
            transform: 'translateX(100%)',
          },
          '100%': {
            transform: 'translateX(0%)',
          },
        },
        'slide-left-out': {
          '0%': {
            transform: 'translateX(0%)',
          },
          '100%': {
            transform: 'translateX(100%)',
            display: 'none',
          },
        },
        'mask-fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '0.6',
          },
        },
        'mask-fade-out': {
          '0%': {
            opacity: '0.6',
          },
          '100%': {
            opacity: '0',
          },
        },
        'fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
        'fade-out': {
          '0%': {
            opacity: '1',
          },
          '100%': {
            opacity: '0',
          },
        },
        'address-change-blink': {
          '0%': {
            'background-color': 'rgba(128,139,231, 0)',
          },
          '100%': {
            'background-color': 'rgba(128,139,231, 100)',
          },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease',
        'slide-down': 'slide-down 0.3s linear forwards',
        'slide-left-in': 'slide-left-in 0.3s ease',
        'slide-left-out': 'slide-left-out 0.3s linear forwards',
        'mask-fade-in': 'mask-fade-in 0.3s cubic-bezier(.23,1,.32,1)',
        'mask-fade-out': 'mask-fade-out 0.3s',
        'fade-in': 'fade-in 0.3s linear forwards',
        'fade-out': 'fade-out 0.3s',
        'address-change-blink': 'address-change-blink 1s linear 0s 2 alternate',
      },
      backgroundImage: {
        'hardware-background':
          'linear-gradient(180deg, #F8F8FE 0.11%, rgba(248, 249, 254, 0) 44.61%);',
        'token-background':
          'linear-gradient(0deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)',
        'logo-background': 'linear-gradient(180deg, #D0D9FF 0%, #F2F5FF 102%)',
        'logo-bottom':
          'linear-gradient(180deg, #F0F3FF 0%, rgba(240, 243, 255, 0) 47.37%)',
        'gray-circles': "url('/images/gray-circles-bg.svg')",
        'blue-circles': "url('/images/blue-circles-bg.svg')",
        'blue-card-linear': "url('/images/blue-card-linear-bg.svg')",
        'guard-banner': "url('/images/guard-banner.svg')",
        'identity-panel': "url('/images/identity-panel-bg.svg')",
        'add-hw-account': "url('/images/adding-hw-account.svg')",
        'welcome-background': "url('/images/bg.svg')",
        'homepage-background': "url('/images/bg-homepage.svg')",
      },
      backgroundColor: {
        'z-skeleton': 'rgb(229, 231, 235)', // for cover text skeleton default bg
      },
    },
  },
  plugins: [],
}
