import React, { useEffect, useState } from 'react';
import { Check, Copy, Download, ExternalLink, RefreshCw } from 'lucide-react';
import bloggerXmlSource from '../../blogger/trendverse-theme.xml?raw';
import { AppRoute, EditorialDraft } from '../types/editorial';
import { EDITORIAL_WORKFLOW_STEPS } from '../data/workflowAndPolicies';
import { fetchIntegrationsHealth, IntegrationsHealth } from '../services/newsroomApi';
import { trackFormSubmit } from '../utils/thirdPartyScripts';

interface BloggerThemeHubProps {
  connectedBlogUrl: string;
  connectedBlogTitle: string | null;
  feedLoading: boolean;
  feedError: string | null;
  drafts: EditorialDraft[];
  onApproveDraft: (id: string) => void;
  onRemoveDraft: (id: string) => void;
  onConnectBlog: (url: string) => Promise<void>;
  onResetFeed: () => void;
  onNavigate: (route: AppRoute) => void;
}

type HubTab = 'architecture' | 'blogger-xml' | 'draft-queue' | 'workflow' | 'seo-adsense' | 'testing';

export const BloggerThemeHub: React.FC<BloggerThemeHubProps> = ({
  connectedBlogUrl,
  connectedBlogTitle,
  feedLoading,
  feedError,
  drafts,
  onApproveDraft,
  onRemoveDraft,
  onConnectBlog,
  onResetFeed,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<HubTab>('architecture');
  const [blogUrlInput, setBlogUrlInput] = useState(connectedBlogUrl || '');
  const [copiedXml, setCopiedXml] = useState(false);
  const [copiedDraftId, setCopiedDraftId] = useState<string | null>(null);
  const [health, setHealth] = useState<IntegrationsHealth | null>(null);

  useEffect(() => {
    fetchIntegrationsHealth()
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  const handleDownloadXml = () => {
    const blob = new Blob([bloggerXmlSource], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trendverse-theme.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyXml = async () => {
    try {
      await navigator.clipboard.writeText(bloggerXmlSource);
      setCopiedXml(true);
      window.setTimeout(() => setCopiedXml(false), 2000);
    } catch {
      setCopiedXml(false);
    }
  };

  const handleCopyBloggerHtml = async (draft: EditorialDraft) => {
    const html = [
      `<h2>${draft.headline}</h2>`,
      `<p><strong>Category:</strong> ${draft.category}</p>`,
      `<p>${draft.summary}</p>`,
      `<h3>Why It Matters</h3>`,
      `<p>${draft.whyItMatters}</p>`,
      `<h3>Primary Source</h3>`,
      `<p><a href="${draft.sourceUrl}" rel="noopener noreferrer" target="_blank">${draft.sourceName}</a></p>`,
    ].join('\n');
    await navigator.clipboard.writeText(html);
    setCopiedDraftId(draft.id);
    window.setTimeout(() => setCopiedDraftId(null), 2000);
  };

  const handleFeedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (blogUrlInput.trim()) {
      trackFormSubmit({ formName: 'connect_blogger_feed', formLocation: 'blogger_hub' });
    }
    void onConnectBlog(blogUrlInput);
  };

  return (
    <div>
      <section className="bg-[#0b1324] text-white border-b border-white/10 py-12">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="text-xs text-slate-400 mb-3">
            <button
              type="button"
              onClick={() => onNavigate({ view: 'home' })}
              className="hover:text-white cursor-pointer"
            >
              Home
            </button>{' '}
            / <span className="text-slate-200">Blogger Theme, AI Automation &amp; Editorial Queue</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white">
            Blogger Integration, Editorial Draft Queue &amp; Architecture
          </h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-slate-300">
            Production-ready Blogger (Blogspot) XML theme, live JSON-in-Script feed connector,
            human-approved AI draft queue, modular integration health, and SEO/AdSense blueprints.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-10 space-y-8">
        {/* Live Blogger Feed Connector */}
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 className="font-display text-xl font-semibold text-slate-900">
                Live Blogger Feed Connector
              </h2>
              <p className="mt-1.5 text-sm text-slate-600">
                Connect any public Blogger or custom Blogspot domain to load live posts, labels,
                thumbnails, and pagination directly into TRENDVERSE via Blogger&apos;s public
                JSON-in-Script feed.
              </p>
              {connectedBlogTitle && (
                <p className="mt-2 text-xs font-semibold text-blue-600">
                  Active Feed: {connectedBlogTitle}
                </p>
              )}
              {feedError && (
                <p role="alert" className="mt-2 text-xs font-medium text-amber-700">
                  {feedError}
                </p>
              )}
            </div>

            <form onSubmit={handleFeedSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label htmlFor="blogger-url-input" className="sr-only">
                Public Blogger URL
              </label>
              <input
                id="blogger-url-input"
                type="url"
                value={blogUrlInput}
                onChange={(e) => setBlogUrlInput(e.target.value)}
                placeholder="https://yourblog.blogspot.com"
                className="w-full sm:w-72 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={feedLoading}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 whitespace-nowrap cursor-pointer"
              >
                <RefreshCw className={`h-4 w-4 ${feedLoading ? 'animate-spin' : ''}`} aria-hidden="true" />
                <span>{feedLoading ? 'Connecting...' : 'Connect Feed'}</span>
              </button>
              {connectedBlogTitle && (
                <button
                  type="button"
                  onClick={() => {
                    setBlogUrlInput('');
                    onResetFeed();
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap cursor-pointer"
                >
                  Use Built-in Library
                </button>
              )}
            </form>
          </div>
        </section>

        {/* Modular Backend Integration Status */}
        {health && (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">RSS News Adapters</div>
              <div className="mt-1 font-mono-tabular text-xl font-semibold text-slate-900">
                {health.rssFeedCount} active feeds
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">Google Trends RSS</div>
              <div className="mt-1 font-mono-tabular text-xl font-semibold text-slate-900">
                {health.trendRegionsCount} regions
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">Server Gemini Adapter</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {health.geminiServerConfigured ? 'Configured (Server-side)' : 'Awaiting GEMINI_API_KEY'}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-xs text-slate-500">NASA Space Feed</div>
              <div className="mt-1 text-sm font-semibold text-blue-600">
                {health.nasaFeedActive ? 'Connected' : 'Standby'}
              </div>
            </div>
          </section>
        )}

        {/* Deliverable Navigation Tabs */}
        <div
          role="tablist"
          aria-label="Platform documentation sections"
          className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100 p-1.5"
        >
          {[
            { id: 'architecture' as const, label: 'Architecture & Design' },
            { id: 'draft-queue' as const, label: `Human Draft Queue (${drafts.length})` },
            { id: 'blogger-xml' as const, label: 'Blogger XML Theme' },
            { id: 'workflow' as const, label: '9-Step AI Workflow' },
            { id: 'seo-adsense' as const, label: 'SEO & AdSense' },
            { id: 'testing' as const, label: 'Setup & Testing' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-3.5 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: Human Editorial Draft Queue */}
        {activeTab === 'draft-queue' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
            <div>
              <h2 className="font-display text-2xl font-semibold text-slate-900">
                Human-Approved Blogger Draft Queue
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                AI Daily Briefing items queued for editorial review remain pending until a human
                editor explicitly approves them for Blogger publication.
              </p>
            </div>

            {drafts.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                No drafts queued yet. Generate an <strong>AI Daily Global Briefing</strong> on the
                Newsroom homepage and click <em>Queue for Human Review</em> on any story.
              </div>
            ) : (
              <div className="space-y-4">
                {drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-blue-600">
                        {draft.category} · {draft.sourceName}
                      </span>
                      <span
                        className={`font-semibold ${
                          draft.status === 'approved-for-blogger'
                            ? 'text-blue-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {draft.status === 'approved-for-blogger'
                          ? 'Approved by Human Editor'
                          : 'Pending Human Approval'}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-semibold text-slate-900">
                      {draft.headline}
                    </h3>
                    <p className="text-sm text-slate-700">{draft.summary}</p>
                    <p className="text-xs text-slate-600">
                      <strong>Context:</strong> {draft.whyItMatters}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {draft.status !== 'approved-for-blogger' && (
                        <button
                          type="button"
                          onClick={() => onApproveDraft(draft.id)}
                          className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
                        >
                          Approve Draft for Blogger
                        </button>
                      )}
                      {draft.status === 'approved-for-blogger' && (
                        <button
                          type="button"
                          onClick={() => void handleCopyBloggerHtml(draft)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer"
                        >
                          {copiedDraftId === draft.id ? (
                            <Check className="h-3.5 w-3.5 text-blue-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          <span>
                            {copiedDraftId === draft.id
                              ? 'Copied Blogger Post HTML'
                              : 'Copy Blogger Post HTML'}
                          </span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onRemoveDraft(draft.id)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 1: Architecture & Design System */}
        {activeTab === 'architecture' && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="font-display text-2xl font-semibold text-slate-900 mb-3">
                  TRENDVERSE 2.0 Modular Architecture
                </h2>
                <p className="text-sm leading-relaxed text-slate-600 mb-4">
                  Each external data source runs in an isolated server-side adapter with caching,
                  deduplication, and graceful offline fallbacks, paired with Blogger XML publishing
                  and React client tools.
                </p>
                <div className="rounded-lg bg-[#0b1324] p-4 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
                  <pre>{`trendverse/
├── server.ts                            # Express + Vite server (port 3000)
├── server/services/
│   ├── rssNewsAdapter.ts                # BBC, NPR, Hindu, NASA, Google AI, MIT AI, UN Climate
│   ├── googleTrendsAdapter.ts           # Official Google Trends public RSS (10 regions)
│   ├── trendBattleAdapter.ts            # Wikimedia Pageviews + Suggest + Trends RSS
│   ├── geminiBriefingAdapter.ts         # Server-side @google/genai (gemini-4-hydrogen)
│   └── careers/                         # Free Jobs, Internships, Scholarships & Gov Portals
├── blogger/
│   ├── trendverse-theme.xml             # Production Blogger XML theme (Search/404/Schema/Widgets)
│   ├── trendverse-theme.css             # External/GitHub CDN CSS3 stylesheet
│   └── trendverse-app.js                # Vanilla JS (Nav, TOC, JSONP Related Posts, Share)
├── docs/                                # Setup (A-J), Founder, Update Workflow, SEO & AdSense
└── src/                                 # React + TypeScript Newsroom, Trends, Careers & Tools`}</pre>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="font-display text-2xl font-semibold text-slate-900 mb-4">
                  Design System Tokens
                </h2>
                <div className="space-y-4">
                  {[
                    { name: 'Global Intelligence Navy', hex: '#060B16', swatch: 'bg-[#060b16]' },
                    { name: 'Newsroom Navy Surface', hex: '#0B1324', swatch: 'bg-[#0b1324]' },
                    { name: 'Electric Blue Accent', hex: '#2563EB', swatch: 'bg-[#2563eb]' },
                    { name: 'Editorial Reading Canvas', hex: '#FFFFFF', swatch: 'bg-white border border-slate-300' },
                  ].map((token) => (
                    <div key={token.hex} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className={`h-7 w-7 rounded-md ${token.swatch}`} aria-hidden="true" />
                        <span className="font-medium text-slate-800">{token.name}</span>
                      </div>
                      <span className="font-mono-tabular text-xs text-slate-500">{token.hex}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Blogger XML Theme */}
        {activeTab === 'blogger-xml' && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-semibold text-slate-900">
                  trendverse-theme.xml
                </h2>
                <p className="text-sm text-slate-600">
                  Complete responsive Blogger XML theme ready to upload via Blogger → Theme → Edit
                  HTML.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCopyXml}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
                >
                  {copiedXml ? <Check className="h-4 w-4 text-blue-600" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedXml ? 'Copied XML' : 'Copy XML'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadXml}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span>Download trendverse-theme.xml</span>
                </button>
              </div>
            </div>

            <div className="max-h-[480px] overflow-auto rounded-lg bg-[#0b1324] p-4 font-mono text-xs text-slate-200">
              <pre>{bloggerXmlSource}</pre>
            </div>
          </div>
        )}

        {/* TAB 3: 9-Step AI Content Workflow */}
        {activeTab === 'workflow' && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {EDITORIAL_WORKFLOW_STEPS.map((step) => (
              <div key={step.stepNumber} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono-tabular font-semibold text-blue-600">
                    Step {step.stepNumber}
                  </span>
                  <span className="text-slate-500">{step.owner}</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: SEO & AdSense */}
        {activeTab === 'seo-adsense' && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
              <h2 className="font-display text-2xl font-semibold text-slate-900">
                International SEO Standards
              </h2>
              <p className="text-sm text-slate-700">
                Outputs Organization, Person (Founder &amp; Developer: Vicky), WebSite, WebPage,
                Article/NewsArticle, BreadcrumbList, and WebApplication JSON-LD with clean
                canonical URLs, smart noindex on Blogger search/archive/404 views, and zero
                synthetic duplicate pages.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
              <h2 className="font-display text-2xl font-semibold text-slate-900">
                AdSense Compliance &amp; CLS Safety
              </h2>
              <p className="text-sm text-slate-700">
                All reserved ad units use explicit min-height containers labeled{' '}
                <em>Advertisement</em> alongside full About, Contact, Privacy Policy, Terms,
                Disclaimer, and Editorial Policy documentation.
              </p>
            </div>
          </div>
        )}

        {/* TAB 5: Setup & Testing */}
        {activeTab === 'testing' && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
              <h2 className="font-display text-2xl font-semibold text-slate-900">
                Blogger Setup Steps (A–J)
              </h2>
              <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-700">
                <li>Back up existing Blogger theme and content XML via Theme &amp; Settings.</li>
                <li>Open Theme → Edit HTML and install <strong>trendverse-theme.xml</strong>.</li>
                <li>Set Theme → Mobile Settings to <strong>Desktop</strong> for responsive mode.</li>
                <li>Enable HTTPS redirect, Full Site Feed, and Custom robots.txt.</li>
                <li>Connect custom domain, verify in Google Search Console &amp; Bing Webmaster Tools, and submit <code>/sitemap.xml</code> &amp; <code>/atom.xml</code>.</li>
              </ol>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
              <h2 className="font-display text-2xl font-semibold text-slate-900">
                Verification Tools
              </h2>
              <ul className="space-y-2.5 text-sm text-slate-700">
                <li>
                  <a
                    href="https://search.google.com/test/rich-results"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-blue-600 hover:underline"
                  >
                    <span>Google Rich Results Test</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://pagespeed.web.dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-blue-600 hover:underline"
                  >
                    <span>PageSpeed Insights</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
