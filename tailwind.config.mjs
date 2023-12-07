const defaultTheme = require("tailwindcss/defaultTheme");
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				mono: ["'Space Mono'", ...defaultTheme.fontFamily.mono]
			}
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
	],
}
