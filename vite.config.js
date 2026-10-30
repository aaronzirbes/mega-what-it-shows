import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// Renders the kb to static HTML in build/: the pages as the desk sees them.
export default defineConfig({
  plugins: [
    sveltekit({
      extensions: ['.svelte', '.svx'],
      preprocess: [mdsvex({ extensions: ['.svx'], layout: { runbook: fileURLToPath(new URL('src/lib/layouts/runbook.svelte', import.meta.url)) } })],
      adapter: adapter({ pages: 'build', assets: 'build' }),
      alias: { '#lib': 'src/lib' },
      prerender: { entries: ['*'] },
    }),
  ],
});
