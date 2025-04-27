const defaultTheme = require("tailwindcss/defaultTheme");
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		fontFamily: {
			display: ["'Syne Variable'", ...defaultTheme.fontFamily.sans],
		},
		extend: {
			fontFamily: {
				sans: ["'Inter Variable'", ...defaultTheme.fontFamily.sans],
				mono: ["'Space Mono'", ...defaultTheme.fontFamily.mono],
			},
            animation: {
                blink: "blink 1s ease infinite",
            },
            keyframes: {
                blink: {
                    "0%, 100%": { opacity: 0 },
                    "50%": { opacity: 1 }
                }
            }
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
	],
}
