const defaultTheme = require("tailwindcss/defaultTheme");
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		fontFamily: {
			display: ["Syne", ...defaultTheme.fontFamily.sans],
		},
		extend: {
			fontFamily: {
				sans: ["Inter", ...defaultTheme.fontFamily.sans],
				mono: ["'Space Mono'", ...defaultTheme.fontFamily.mono],
			}
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
	],
}
