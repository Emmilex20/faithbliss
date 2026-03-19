import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const ssrDir = path.join(rootDir, 'dist-ssr');
const templatePath = path.join(distDir, 'index.html');
const appShellPath = path.join(distDir, 'app-shell.html');
const rootPlaceholderPattern = /<div id="root"><\/div>/;
const seoBlockPattern = /<!--seo-start-->[\s\S]*?<!--seo-end-->/;

const routeToOutputFile = (route) => (
  route === '/'
    ? path.join(distDir, 'index.html')
    : path.join(distDir, route.slice(1), 'index.html')
);

await rm(ssrDir, { recursive: true, force: true });

await build({
  root: rootDir,
  logLevel: 'info',
});

await build({
  root: rootDir,
  logLevel: 'info',
  build: {
    ssr: 'src/prerender/entry-server.tsx',
    outDir: 'dist-ssr',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'entry-server.mjs',
      },
    },
  },
});

const { PRERENDER_ROUTES, renderRoute } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.mjs')).href);
const clientTemplate = await readFile(templatePath, 'utf8');

await writeFile(appShellPath, clientTemplate, 'utf8');

for (const route of PRERENDER_ROUTES) {
  const { appHtml, headHtml } = renderRoute(route);
  const outputFile = routeToOutputFile(route);
  const renderedDocument = clientTemplate
    .replace(seoBlockPattern, `<!--seo-start-->\n    ${headHtml}\n    <!--seo-end-->`)
    .replace(
      rootPlaceholderPattern,
      `<div id="root" data-seo-prerendered="true" data-seo-route="${route}">${appHtml}</div>`,
    );

  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, renderedDocument, 'utf8');
}

await rm(ssrDir, { recursive: true, force: true });
