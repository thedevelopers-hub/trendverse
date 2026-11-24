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

export interface ArticleEditorialContext {
  whatHappened: string;
  whyItMatters: string;
  whatReadersShouldUnderstand: string;
}

export type ArticleEditorialStatus =
  | 'human-reviewed'
  | 'needs-editorial-verification'
  | 'draft-pending-review';

export interface AuthorProfile {
  id: string;
  name: string;
  type: 'Person' | 'Organization';
  role: string;
  bio: string;
  responsibilities: string[];
  contactEmail?: string;
  repositoryUrl?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  seoTitle?: string;
  subtitle: string;
  summary: string;
  seoDescription?: string;
  contextualLinks?: Array<{
    label: string;
    description: string;
    route: AppRoute;
  }>;
  category: CategorySlug;
  categoryName: string;
  labels: string[];
  authorId?: string;
  authorName: string;
  authorRole: string;
  reviewedBy?: string;
  lastReviewedAt?: string;
  editorialStatus?: ArticleEditorialStatus;
  correctionNote?: string;
  editorialContext?: ArticleEditorialContext;
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
  | 'editorial-policy'
  | 'corrections-policy';

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
