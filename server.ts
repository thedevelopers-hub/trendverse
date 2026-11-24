import 'dotenv/config';
import express from 'express';
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

  // Rewrite Blogger-style /p/*.html static page URLs cleanly to SPA shell when not a static file
  app.use((req, _res, next) => {
    if (req.method === 'GET' && /^\/p\/[a-z0-9-]+\.html$/i.test(req.path)) {
      req.url = '/index.html';
    }
    next();
  });

  // Vite Middleware in Development / Static Dist in Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TRENDVERSE 2.0 server listening on http://localhost:${PORT}`);
  });
}

startServer();
