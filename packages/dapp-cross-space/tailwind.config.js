module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  mode: 'jit',
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
        common: 'var(--shadow-common)',
      },
      backgroundImage: () => ({}),
      colors: {
        white: '#fff',
        black: '#000',
        primary: '#44d7b6',
        error: '#e15c56',
        success: '#44d7b6',
        warning: '#ffca4f',
        info: '#4c65e9',
        'primary-dark': '#16bd98',
        'error-dark': '#b83c36',
        'success-dark': '#16bd98',
        'warning-dark': '#ec7910',
        'info-dark': '#2330c0',
        'primary-10': 'var(--color-primary-10)',
        'primary-90': 'var(--color-primary-90)',
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
        'main-back': '#252a3a',
        'card-back': '#4d5a7e',
      },
      fontFamily: {
        body: [
          'Circular Std',
          'PingFang SC',
          'Helvetica Neue',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      keyframes: {
        'fade-out-top-right': {
          '0%': {
            opacity: 1,
            transform: 'translate3d(0, 0, 0)',
          },
          '100%': {
            opacity: 0,
            transform: 'translate3d(100%, -100%, 0)',
          },
        },
        'fade-out-bottom-left': {
          '0%': {
            opacity: 1,
            transform: 'translate3d(0, 0, 0)',
          },
          '100%': {
            opacity: 0,
            transform: 'translate3d(-100%, 100%, 0)',
          },
        },
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
        'fade-out-top-right': 'fade-out-top-right 0.5s ease-in-out 1',
        'fade-out-bottom-left': 'fade-out-bottom-left 0.5s ease-in-out 1',
      },
      transitionProperty: {
        maxHeight: 'maxHeight',
      },
      inset: {
        30: '7.5rem',
        34: '8.5rem',
        65: '16.25rem',
        100: '24rem',
        116: '29rem',
        136: '34rem',
        154: '38.5rem',
        158: '39.5rem',
        192: '48rem',
        232: '58rem',
        240: '60rem',
        260: '65rem',
        270: '67.5rem',
        280: '70rem',
        293: '73.25rem',
        302: '75.5rem',
      },
      minHeight: {
        8: '2rem',
        50: '12.5rem',
        220: '55rem',
      },
      minWidth: {
        8: '2rem',
        40: '10rem',
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
}
