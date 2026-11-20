import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ExternalLink, Link2, Share2 } from 'lucide-react';
import { AppRoute, Article } from '../types/editorial';
import { EditorialVisual } from './EditorialVisual';
import { AdSlot } from './AdSlot';

interface ArticlePageProps {
  article: Article;
  allArticles: Article[];
  onNavigate: (route: AppRoute) => void;
}

export const ArticlePage: React.FC<ArticlePageProps> = ({ article, allArticles, onNavigate }) => {
  const [copied, setCopied] = useState(false);

  const relatedArticles = useMemo(() => {
    const sameCategory = allArticles.filter(
      (a) => a.category === article.category && a.id !== article.id
    );
    const others = allArticles.filter(
      (a) => a.category !== article.category && a.id !== article.id
    );
    return [...sameCategory, ...others].slice(0, 3);
  }, [allArticles, article]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(article.title);

  return (
    <article className="mx-auto max-w-[1200px] px-4 sm:px-6 py-10 lg:py-14">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <button
          type="button"
          onClick={() => onNavigate({ view: 'home' })}
          className="hover:text-blue-600 cursor-pointer"
        >
          Home
        </button>
        <span aria-hidden="true">/</span>
        <button
          type="button"
          onClick={() => onNavigate({ view: 'category', slug: article.category })}
          className="hover:text-blue-600 cursor-pointer"
        >
          {article.categoryName}
        </button>
        <span aria-hidden="true">/</span>
        <span className="text-slate-800 font-medium truncate max-w-xs sm:max-w-md">
          {article.title}
        </span>
      </nav>

      {/* Article Header */}
      <header className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3">
          <span className="font-semibold text-blue-600">{article.categoryName}</span>
          <span aria-hidden="true">·</span>
          <span>{article.readTimeMinutes} min read</span>
          <span aria-hidden="true">·</span>
          <span>Published {article.publishedAt}</span>
          <span aria-hidden="true">·</span>
          <span>Updated {article.updatedAt}</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.14] text-slate-900">
          {article.title}
        </h1>

        <p className="mt-4 text-lg leading-relaxed text-slate-600">{article.subtitle}</p>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-slate-200 py-4">
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0b1324] font-display text-sm font-bold text-white"
            >
              TV
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">{article.authorName}</div>
              <div className="text-xs text-slate-500">
                {article.authorRole} · Publisher: TRENDVERSE Editorial Team · Founded by Vicky
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <a
              href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Share on X</span>
            </a>

            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </header>

      {/* Featured Visual */}
      <figure className="mt-8 mb-10">
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <EditorialVisual
            motif={article.visualMotif}
            imageUrl={article.imageUrl}
            alt={article.imageAlt}
            aspectClass="aspect-[16/8]"
            priority
          />
        </div>
        <figcaption className="mt-2.5 text-xs italic text-slate-500">
          {article.imageCaption}
        </figcaption>
      </figure>

      {/* Two-Column Reading Canvas: Sticky TOC + Article Prose */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <aside className="lg:col-span-4 order-1 lg:order-2 space-y-6">
          {article.sections.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 lg:sticky lg:top-24">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Table of Contents
              </h2>
              <nav aria-label="Article sections">
                <ol className="space-y-2.5 text-sm">
                  {article.sections.map((sec, idx) => (
                    <li key={sec.id}>
                      <a
                        href={`#${sec.id}`}
                        className="flex items-start gap-2.5 text-slate-700 hover:text-blue-600 transition-colors"
                      >
                        <span className="font-mono-tabular text-xs text-slate-400 mt-0.5">
                          0{idx + 1}
                        </span>
                        <span>{sec.heading}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>

              <div className="mt-6 pt-5 border-t border-slate-200">
                <AdSlot variant="rectangle" slotName="article-sidebar" />
              </div>
            </div>
          )}
        </aside>

        <div className="lg:col-span-8 order-2 lg:order-1">
          <div className="max-w-prose space-y-8 text-base sm:text-[17px] leading-[1.8] text-slate-800">
            {article.isLiveBloggerPost && article.rawHtmlBody ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-blue-200 bg-blue-50/60 px-4 py-3 text-xs text-slate-700">
                  Loaded from connected Blogger feed.
                  {article.externalUrl && (
                    <>
                      {' '}
                      <a
                        href={article.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-600 underline"
                      >
                        View original Blogger post
                      </a>
                    </>
                  )}
                </div>
                {article.sections[0]?.paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            ) : (
              article.sections.map((section, secIdx) => (
                <section key={section.id} id={section.id} className="scroll-mt-24">
                  <h2 className="font-display text-2xl sm:text-[1.75rem] font-semibold text-slate-900 mb-4">
                    {section.heading}
                  </h2>

                  <div className="space-y-4">
                    {section.paragraphs.map((para, pIdx) => (
                      <p
                        key={pIdx}
                        className={
                          secIdx === 0 && pIdx === 0
                            ? 'first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-5xl first-letter:font-bold first-letter:leading-none first-letter:text-navy-900'
                            : ''
                        }
                      >
                        {para}
                      </p>
                    ))}
                  </div>

                  {section.pullQuote && (
                    <blockquote className="my-8 border-y border-slate-200 py-5 font-display text-xl sm:text-2xl italic leading-relaxed text-slate-900">
                      “{section.pullQuote}”
                    </blockquote>
                  )}

                  {secIdx === 0 && (
                    <div className="my-8">
                      <AdSlot variant="in-article" slotName="article-mid-content" />
                    </div>
                  )}
                </section>
              ))
            )}

            {/* Topic Labels */}
            <div className="border-t border-slate-200 pt-6">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Topics:</span>
                {article.labels.map((label, idx) => (
                  <React.Fragment key={label}>
                    <span>{label}</span>
                    {idx < article.labels.length - 1 && <span aria-hidden="true">·</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Sources & References */}
            {article.sources.length > 0 && (
              <section className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="font-display text-lg font-semibold text-slate-900 mb-3">
                  Sources &amp; Primary References
                </h2>
                <ul className="space-y-2.5 text-sm">
                  {article.sources.map((src) => (
                    <li key={src.url} className="flex items-start justify-between gap-3">
                      <div>
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {src.label}
                        </a>
                        <div className="text-xs text-slate-500">{src.publisher}</div>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-1" aria-hidden="true" />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Related Articles */}
      <section className="mt-16 border-t border-slate-200 pt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold text-slate-900">Related Articles</h2>
          <button
            type="button"
            onClick={() => onNavigate({ view: 'home' })}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to Home</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {relatedArticles.map((rel) => (
            <article
              key={rel.id}
              className="group rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-colors"
            >
              <div className="text-xs text-slate-500 mb-2">
                <span className="font-semibold text-blue-600">{rel.categoryName}</span>{' '}
                <span aria-hidden="true">·</span> {rel.publishedAt}
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                <button
                  type="button"
                  onClick={() => onNavigate({ view: 'article', slug: rel.slug })}
                  className="text-left cursor-pointer"
                >
                  {rel.title}
                </button>
              </h3>
              <button
                type="button"
                onClick={() => onNavigate({ view: 'article', slug: rel.slug })}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 cursor-pointer"
              >
                <span>Read story</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
      </section>
    </article>
  );
};
