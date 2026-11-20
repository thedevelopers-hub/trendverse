import React, { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { AppRoute, Article, CategorySlug } from '../types/editorial';
import { EDITORIAL_CATEGORIES, getCategoryBySlug } from '../data/categories';
import { EditorialVisual } from './EditorialVisual';
import { AdSlot } from './AdSlot';

interface CategoryPageProps {
  slug: CategorySlug;
  articles: Article[];
  onNavigate: (route: AppRoute) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ slug, articles, onNavigate }) => {
  const [filterText, setFilterText] = useState('');
  const category = getCategoryBySlug(slug) ?? EDITORIAL_CATEGORIES[0];

  const categoryArticles = useMemo(() => {
    const matching = articles.filter((a) => a.category === category.slug);
    const q = filterText.trim().toLowerCase();
    if (!q) return matching;
    return matching.filter(
      (a) => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q)
    );
  }, [articles, category.slug, filterText]);

  return (
    <div>
      <section className="bg-[#0b1324] text-white border-b border-white/10 py-12">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="text-xs text-slate-400 mb-4">
            <button
              type="button"
              onClick={() => onNavigate({ view: 'home' })}
              className="hover:text-white cursor-pointer"
            >
              Home
            </button>{' '}
            / <span className="text-slate-200">{category.name}</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white">
            {category.name}
          </h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-slate-300">
            {category.seoDescription}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {EDITORIAL_CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => {
                  setFilterText('');
                  onNavigate({ view: 'category', slug: cat.slug });
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  cat.slug === category.slug
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600 tabular-nums">
            Showing {categoryArticles.length} editorial{' '}
            {categoryArticles.length === 1 ? 'article' : 'articles'} in {category.name}
          </p>
          <input
            type="search"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder={`Filter ${category.name}...`}
            aria-label={`Filter articles in ${category.name}`}
            className="w-full sm:w-64 rounded-lg border border-slate-300 px-3.5 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>

        {categoryArticles.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-600">
              No matching articles found in {category.name}. Clear your filter or explore another
              desk above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {categoryArticles.map((article) => (
              <article
                key={article.id}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => onNavigate({ view: 'article', slug: article.slug })}
                  className="block w-full text-left cursor-pointer"
                >
                  <EditorialVisual
                    motif={article.visualMotif}
                    imageUrl={article.imageUrl}
                    alt={article.imageAlt}
                    aspectClass="aspect-[16/9]"
                  />
                </button>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <time dateTime={article.publishedAt}>{article.publishedAt}</time>
                    <span aria-hidden="true">·</span>
                    <span>{article.readTimeMinutes} min read</span>
                  </div>
                  <h2 className="font-display text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    <button
                      type="button"
                      onClick={() => onNavigate({ view: 'article', slug: article.slug })}
                      className="text-left cursor-pointer"
                    >
                      {article.title}
                    </button>
                  </h2>
                  <p className="mt-2.5 text-sm text-slate-600">{article.summary}</p>
                  <button
                    type="button"
                    onClick={() => onNavigate({ view: 'article', slug: article.slug })}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 cursor-pointer"
                  >
                    <span>Read explainer</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-10">
          <AdSlot variant="leaderboard" slotName={`category-${category.slug}`} />
        </div>
      </div>
    </div>
  );
};
