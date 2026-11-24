import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  generateAdsTxt,
  generateRobotsTxt,
  generateSitemapXml,
  getAllPrerenderPaths,
  injectSeoIntoHtml,
} from '../server/seoRegistry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', 'dist');
const templatePath = path.join(distDir, 'index.html');

function runPrerender() {
  if (!fs.existsSync(templatePath)) {
    throw new Error(`dist/index.html not found at ${templatePath}. Run vite build first.`);
  }

  const baseTemplate = fs.readFileSync(templatePath, 'utf-8');

  // 1. Write static fallback SEO files into dist/
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), generateSitemapXml(process.env), 'utf-8');
  fs.writeFileSync(path.join(distDir, 'robots.txt'), generateRobotsTxt(process.env), 'utf-8');
  fs.writeFileSync(path.join(distDir, 'ads.txt'), generateAdsTxt(process.env), 'utf-8');

  // 2. Prerender route-specific HTML metadata and <noscript> content for every static route
  const paths = getAllPrerenderPaths();
  let count = 0;

  for (const routePath of paths) {
    const renderedHtml = injectSeoIntoHtml(baseTemplate, routePath, '', process.env);

    if (routePath === '/') {
      fs.writeFileSync(templatePath, renderedHtml, 'utf-8');
      count += 1;
      continue;
    }

    const segments = routePath
      .split('/')
      .filter(Boolean)
      .map((s) => decodeURIComponent(s));

    const targetDir = path.join(distDir, ...segments);
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, 'index.html'), renderedHtml, 'utf-8');
    count += 1;
  }

  console.log(
    `TRENDVERSE SEO prerender complete: ${count} route HTML files + sitemap.xml, robots.txt, ads.txt`
  );
}

runPrerender();
