import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

/**
 * Link previews (WhatsApp, iMessage, Facebook) need absolute URLs. Vercel sets the production
 * domain at build time (the custom domain once one is added); elsewhere the tags fall back to
 * root-relative paths, which only matters for local builds.
 */
function siteUrl(): Plugin {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const url = host ? `https://${host}` : ''
  return { name: 'site-url', transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', url) }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), siteUrl()],
})
