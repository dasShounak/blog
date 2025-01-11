import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://shounakdas.netlify.app/",
  integrations: [tailwind({
    applyBaseStyles: true
  }), sitemap()]
} // your configuration options here...
);
