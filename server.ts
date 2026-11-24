import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  handleBriefingRequest,
  handleCareersAiAssistRequest,
  handleCareersGovernmentRequest,
  handleCareersOpportunitiesRequest,
  handleCareersScholarshipsRequest,
  handleCareersStudentResourcesRequest,
  handleIntegrationsStatusRequest,
  handleNewsRequest,
  handleTrendBattleRequest,
  handleTrendsRequest,
} from './server/apiHandlers.js';
import {
  generateAdsTxt,
  generateRobotsTxt,
  generateSitemapXml,
  injectSeoIntoHtml,
} from './server/seoRegistry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json({ limit: '1mb' }));

  // Shared API handlers (identical implementation to Vercel /api/* Serverless Functions)
  app.all('/api/news', (req, res) => void handleNewsRequest(req, res));
  app.all('/api/trends', (req, res) => void handleTrendsRequest(req, res));
  app.all('/api/trend-battle', (req, res) => void handleTrendBattleRequest(req, res));
  app.all('/api/briefing', (req, res) => void handleBriefingRequest(req, res));
  app.all('/api/integrations/status', (req, res) => void handleIntegrationsStatusRequest(req, res));

  app.all('/api/careers/opportunities', (req, res) => void handleCareersOpportunitiesRequest(req, res));
  app.all('/api/careers/scholarships', (req, res) => void handleCareersScholarshipsRequest(req, res));
  app.all('/api/careers/government', (req, res) => void handleCareersGovernmentRequest(req, res));
  app.all('/api/careers/student-resources', (req, res) => void handleCareersStudentResourcesRequest(req, res));
  app.all('/api/careers/ai-assist', (req, res) => void handleCareersAiAssistRequest(req, res));

  // Technical SEO files: sitemap.xml, robots.txt, ads.txt
  app.get('/sitemap.xml', (_req, res) => {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(generateSitemapXml(process.env));
  });

  app.get('/robots.txt', (_req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(generateRobotsTxt(process.env));
  });

  app.get('/ads.txt', (_req, res) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(generateAdsTxt(process.env));
  });

  // Vite Middleware in Development / Prerendered Dist in Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.get('*', async (req, res, next) => {
      const urlPath = req.path;
      const isAssetOrApi =
        urlPath.startsWith('/api/') ||
        urlPath.startsWith('/@') ||
        urlPath.startsWith('/src/') ||
        urlPath.startsWith('/node_modules/') ||
        /\.[a-z0-9]{2,8}$/i.test(urlPath);
      if (isAssetOrApi) return next();

      try {
        const templatePath = path.resolve(__dirname, 'index.html');
        const rawHtml = fs.readFileSync(templatePath, 'utf-8');
        const transformed = await vite.transformIndexHtml(req.originalUrl, rawHtml);
        const searchIndex = req.originalUrl.indexOf('?');
        const search = searchIndex >= 0 ? req.originalUrl.slice(searchIndex) : '';
        const finalHtml = injectSeoIntoHtml(transformed, req.path, search, process.env);
        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(finalHtml);
      } catch (err) {
        vite.ssrFixStacktrace(err as Error);
        next(err);
      }
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    const distTemplate = fs.existsSync(path.join(distPath, 'index.html'))
      ? fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8')
      : '';

    app.use(express.static(distPath, { index: 'index.html' }));

    app.get('*', (req, res) => {
      if (!distTemplate) {
        return res.status(404).send('Production build not found.');
      }
      const searchIndex = req.originalUrl.indexOf('?');
      const search = searchIndex >= 0 ? req.originalUrl.slice(searchIndex) : '';
      const rendered = injectSeoIntoHtml(distTemplate, req.path, search, process.env);
      res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).send(rendered);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TRENDVERSE 2.0 server listening on http://localhost:${PORT}`);
  });
}

startServer();
