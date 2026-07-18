import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import tailwind from "@astrojs/tailwind"
import solidJs from "@astrojs/solid-js"

// https://astro.build/config
export default defineConfig({
  site: "https://lucasrgpedersen.com",
  output: "static",
  integrations: [
    mdx(),
    // Keep the unlisted voting page out of the sitemap
    sitemap({ filter: (page) => !page.includes("/vote") }),
    solidJs(),
    tailwind({ applyBaseStyles: false }),
  ],
})