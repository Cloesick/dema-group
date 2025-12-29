/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			'dema-primary': 'var(--dema-primary)',
  			'dema-primary-dark': 'var(--dema-primary-dark)',
  			'dema-red': 'var(--dema-red)',
  			'dema-red-dark': 'var(--dema-red-dark)',
  			'dema-orange': 'var(--dema-orange)',
  			'dema-orange-dark': 'var(--dema-orange-dark)',
  			'dema-green': 'var(--dema-green)',
  			'dema-green-dark': 'var(--dema-green-dark)',
  			'dema-purple': 'var(--dema-purple)',
  			'dema-purple-dark': 'var(--dema-purple-dark)',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			heading: 'var(--dema-font-heading)',
  			body: 'var(--dema-font-body)'
  		},
  		spacing: {
  			'dema-xs': 'var(--dema-spacing-xs)',
  			'dema-sm': 'var(--dema-spacing-sm)',
  			'dema-md': 'var(--dema-spacing-md)',
  			'dema-lg': 'var(--dema-spacing-lg)',
  			'dema-xl': 'var(--dema-spacing-xl)'
  		},
  		borderRadius: {
  			'dema-sm': 'var(--dema-border-radius-sm)',
  			'dema-md': 'var(--dema-border-radius-md)',
  			'dema-lg': 'var(--dema-border-radius-lg)',
  			'dema-full': 'var(--dema-border-radius-full)',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
