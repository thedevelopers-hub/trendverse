import { Article } from '../types/editorial';
import { mapBloggerLabelsToCategory } from '../data/categories';

interface BloggerFeedEntry {
  id?: { $t?: string };
  published?: { $t?: string };
  updated?: { $t?: string };
  title?: { $t?: string };
  content?: { $t?: string };
  summary?: { $t?: string };
  link?: Array<{ rel?: string; href?: string }>;
  author?: Array<{ name?: { $t?: string } }>;
  category?: Array<{ term?: string }>;
  media$thumbnail?: { url?: string };
}

interface BloggerFeedPayload {
  feed?: {
    title?: { $t?: string };
    openSearch$totalResults?: { $t?: string };
    entry?: BloggerFeedEntry[];
  };
}

export interface BloggerFetchResult {
  blogTitle: string;
  totalResults: number;
  articles: Article[];
}

function stripHtmlTags(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim();
}

function extractFirstImageSrc(html: string): string | undefined {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1];
}

function estimateReadingMinutes(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 210));
}

function sanitizeBlogUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/**
 * Fetches live posts from any public Blogger (Blogspot) site using Blogger's
 * native JSON-in-Script feed endpoint without requiring an API key.
 */
export function fetchBloggerPosts(
  blogUrl: string,
  options: { maxResults?: number; startIndex?: number; label?: string; query?: string } = {}
): Promise<BloggerFetchResult> {
  const cleanUrl = sanitizeBlogUrl(blogUrl);
  if (!cleanUrl) {
    return Promise.reject(new Error('Please enter a valid Blogger URL (e.g. https://yourblog.blogspot.com).'));
  }

  let parsed: URL;
  try {
    parsed = new URL(cleanUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
  } catch {
    return Promise.reject(new Error('Invalid URL format. Include a domain such as https://example.blogspot.com.'));
  }

  const maxResults = options.maxResults ?? 12;
  const startIndex = options.startIndex ?? 1;
  const labelPath = options.label ? `/-/${encodeURIComponent(options.label)}` : '';
  const callbackName = `trendverseBloggerCb_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

  const params = new URLSearchParams({
    alt: 'json-in-script',
    callback: callbackName,
    'max-results': String(maxResults),
    'start-index': String(startIndex),
  });
  if (options.query) {
    params.set('q', options.query);
  }

  const feedEndpoint = `${parsed.origin}/feeds/posts/default${labelPath}?${params.toString()}`;

  return new Promise<BloggerFetchResult>((resolve, reject) => {
    const script = document.createElement('script');
    let settled = false;

    const cleanup = () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      delete (window as unknown as Record<string, unknown>)[callbackName];
    };

    const timer = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error('Request timed out. Verify the blog is public and allows Blogger feeds.'));
    }, 9000);

    (window as unknown as Record<string, unknown>)[callbackName] = (payload: BloggerFeedPayload) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      cleanup();

      const feed = payload?.feed;
      if (!feed) {
        reject(new Error('Unexpected feed format returned by Blogger.'));
        return;
      }

      const entries = feed.entry ?? [];
      const totalResults = Number(feed.openSearch$totalResults?.$t ?? entries.length);
      const blogTitle = feed.title?.$t || parsed.hostname;

      const articles: Article[] = entries.map((entry, idx) => {
        const title = entry.title?.$t || 'Untitled Post';
        const rawHtml = entry.content?.$t || entry.summary?.$t || '';
        const plain = stripHtmlTags(rawHtml);
        const summary = plain.slice(0, 185) + (plain.length > 185 ? '…' : '');
        const labels = (entry.category ?? []).map((c) => c.term || '').filter(Boolean);
        const catInfo = mapBloggerLabelsToCategory(labels);
        const alternateLink = entry.link?.find((l) => l.rel === 'alternate')?.href;
        const thumbUrl = entry.media$thumbnail?.url?.replace(/\/s72[^/]*\//, '/w1200/') || extractFirstImageSrc(rawHtml);
        const publishedAt = (entry.published?.$t || new Date().toISOString()).slice(0, 10);
        const updatedAt = (entry.updated?.$t || publishedAt).slice(0, 10);
        const postIdMatch = entry.id?.$t?.match(/post-(\d+)/);
        const id = postIdMatch ? `blogger-${postIdMatch[1]}` : `blogger-entry-${idx}`;

        return {
          id,
          slug: id,
          title,
          subtitle: summary,
          summary,
          category: catInfo.slug,
          categoryName: catInfo.name,
          labels: labels.length > 0 ? labels : [catInfo.name],
          authorName: entry.author?.[0]?.name?.$t || blogTitle,
          authorRole: 'Blogger Feed Contributor',
          publishedAt,
          updatedAt,
          readTimeMinutes: estimateReadingMinutes(plain),
          featured: idx === 0,
          trending: idx < 4,
          discoverGroup: idx % 3 === 0 ? 'popular' : idx % 3 === 1 ? 'editors-pick' : 'most-read',
          schemaType: 'Article',
          imageUrl: thumbUrl,
          imageAlt: title,
          imageCaption: `Published on ${blogTitle}`,
          visualMotif: catInfo.visualMotif,
          sections: [
            {
              id: 'article-content',
              heading: 'Full Article',
              paragraphs: plain ? [plain] : ['Read the complete post directly via the connected Blogger feed.'],
            },
          ],
          rawHtmlBody: rawHtml,
          sources: alternateLink
            ? [{ label: 'Original Blogger Post', publisher: blogTitle, url: alternateLink }]
            : [],
          externalUrl: alternateLink,
          isLiveBloggerPost: true,
        };
      });

      resolve({ blogTitle, totalResults, articles });
    };

    script.src = feedEndpoint;
    script.async = true;
    script.onerror = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      cleanup();
      reject(new Error('Could not load Blogger JSON feed. Confirm the URL is a public Blogspot/Blogger site.'));
    };

    document.body.appendChild(script);
  });
}
