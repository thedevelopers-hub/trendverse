import type { ApiRequest, ApiResponse } from '../server/apiHandlers.js';
import {
  generateAdsTxt,
  generateRobotsTxt,
  generateSitemapXml,
} from '../server/seoRegistry.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  let file = 'sitemap';
  const rawFile = req.query?.file;
  if (typeof rawFile === 'string') {
    file = rawFile.toLowerCase();
  } else if (Array.isArray(rawFile) && typeof rawFile[0] === 'string') {
    file = rawFile[0].toLowerCase();
  } else if (req.url) {
    const parsed = new URL(req.url, 'https://trendverse-ten.vercel.app');
    file = (parsed.searchParams.get('file') || 'sitemap').toLowerCase();
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.statusCode = 200;

  if (file === 'robots') {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.end(generateRobotsTxt(process.env));
  }

  if (file === 'ads') {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.end(generateAdsTxt(process.env));
  }

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  return res.end(generateSitemapXml(process.env));
}
