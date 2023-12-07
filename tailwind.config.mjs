const defaultTheme = require("tailwindcss/defaultTheme");
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ["Inter", ...defaultTheme.fontFamily.sans],
				mono: ["'Space Mono'", ...defaultTheme.fontFamily.mono],
				display: ["Syne", ...defaultTheme.fontFamily.display],
			
			}
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
	],
}
