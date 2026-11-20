export type CategorySlug =
  | 'technology-ai'
  | 'world'
  | 'business-finance'
  | 'science-space'
  | 'entertainment'
  | 'lifestyle';

export interface CategoryInfo {
  slug: CategorySlug;
  name: string;
  bloggerLabel: string;
  shortDescription: string;
  seoDescription: string;
  visualMotif: 'network' | 'meridian' | 'ledger' | 'orbit' | 'aperture' | 'pavilion';
}

export interface ArticleSection {
  id: string;
  heading: string;
  paragraphs: string[];
  pullQuote?: string;
}

export interface ArticleSource {
  label: string;
  publisher: string;
  url: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  category: CategorySlug;
  categoryName: string;
  labels: string[];
  authorName: string;
  authorRole: string;
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  featured?: boolean;
  trending?: boolean;
  discoverGroup?: 'popular' | 'editors-pick' | 'most-read';
  schemaType: 'Article' | 'NewsArticle';
  imageUrl?: string;
  imageAlt: string;
  imageCaption: string;
  visualMotif: CategoryInfo['visualMotif'];
  sections: ArticleSection[];
  rawHtmlBody?: string;
  sources: ArticleSource[];
  externalUrl?: string;
  isLiveBloggerPost?: boolean;
}

export type ToolId =
  | 'word-counter'
  | 'percentage-calculator'
  | 'age-calculator'
  | 'unit-converter'
  | 'text-case-converter'
  | 'character-counter';

export type PolicyPageId =
  | 'about'
  | 'contact'
  | 'privacy-policy'
  | 'terms-and-conditions'
  | 'disclaimer'
  | 'editorial-policy';

export type CareersTab =
  | 'overview'
  | 'jobs'
  | 'internships'
  | 'remote'
  | 'fresher'
  | 'scholarships'
  | 'government'
  | 'tools';

export type CareerToolId =
  | 'resume-builder'
  | 'ats-checker'
  | 'cover-letter'
  | 'interview-practice'
  | 'salary-calculator'
  | 'hourly-converter'
  | 'skills-gap'
  | 'career-paths'
  | 'job-tracker'
  | 'internship-tracker';

export type AppRoute =
  | { view: 'home' }
  | { view: 'article'; slug: string }
  | { view: 'category'; slug: CategorySlug }
  | { view: 'tools'; toolId?: ToolId }
  | { view: 'ai-center' }
  | { view: 'news-center' }
  | { view: 'briefing' }
  | { view: 'trend-battle' }
  | { view: 'whats-new' }
  | { view: 'careers'; tab: CareersTab; toolId?: CareerToolId }
  | { view: 'blogger-hub' }
  | { view: 'policy'; pageId: PolicyPageId };

export interface EditorialWorkflowStep {
  stepNumber: string;
  title: string;
  owner: 'Research & Signals' | 'Editorial Drafting' | 'SEO & Structure' | 'Human Review' | 'Publishing';
  description: string;
  guardrail: string;
}

export interface EditorialDraft {
  id: string;
  headline: string;
  category: string;
  summary: string;
  whyItMatters: string;
  sourceName: string;
  sourceUrl: string;
  createdAt: string;
  status: 'pending-human-review' | 'approved-for-blogger';
}
