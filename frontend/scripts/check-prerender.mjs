import { readFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const routes = ['/', '/about', '/contact', '/privacy', '/terms', '/help', '/premium'];

const routeToOutputFile = (route) => (
  route === '/'
    ? path.join(distDir, 'index.html')
    : path.join(distDir, route.slice(1), 'index.html')
);

const failures = [];

for (const route of routes) {
  const html = await readFile(routeToOutputFile(route), 'utf8');
  const hasMarker = html.includes('data-seo-prerendered="true"') && html.includes(`data-seo-route="${route}"`);
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const hasBodyContent = /<div id="root"[^>]*>[\s\S]*<(main|section|article|nav)\b/i.test(html);

  if (!hasMarker || !hasBodyContent || !h1Match) {
    failures.push(route);
    continue;
  }

  const heading = h1Match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  console.log(`[seo:check] ${route} -> ${heading}`);
}

if (failures.length > 0) {
  console.error(`[seo:check] Missing prerendered HTML checks for: ${failures.join(', ')}`);
  process.exit(1);
}
