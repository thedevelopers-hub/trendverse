import { PolicyPageId } from '../types/editorial';

export const FOUNDER_BRAND_IDENTITY = {
  brandName: 'TRENDVERSE',
  tagline: "Discover What's Next.",
  founderName: 'Vicky',
  developerName: 'Vicky',
  publisherName: 'TRENDVERSE Editorial Team',
  contactEmail: 'ui.vicky2002@gmail.com',
  whatsappDisplay: '+91 63876 61594',
  whatsappUrl: 'https://wa.me/916387661594',
  aboutIntro:
    'TRENDVERSE is an independent global digital platform founded and developed by Vicky.\n\nOur mission is to make global news, emerging trends, artificial intelligence, technology, career opportunities and educational resources accessible to people around the world.',
  platformNote:
    'Built with React, TypeScript, Vercel Serverless infrastructure, Google Blogger compatibility, and curated public institutional feeds.',
};

export const POLICY_PAGE_ID_SET: ReadonlySet<string> = new Set<PolicyPageId>([
  'about',
  'contact',
  'privacy-policy',
  'terms-and-conditions',
  'disclaimer',
  'editorial-policy',
  'corrections-policy',
]);

export const POLICY_SEO_META: Record<
  PolicyPageId,
  { title: string; seoTitle: string; seoDescription: string; subtitle: string }
> = {
  about: {
    title: 'About Us',
    seoTitle: 'About Us — Independent Digital Media & Tools | TRENDVERSE',
    seoDescription:
      'Learn about TRENDVERSE, its mission, editorial philosophy, six subject desks, career resources, and founder-led publishing model.',
    subtitle:
      'Discover What’s Next — An independent digital publication, trend intelligence hub, and practical utilities platform founded and edited by Vicky.',
  },
  contact: {
    title: 'Contact Us',
    seoTitle: 'Contact Us — Editorial, Corrections & Enquiries | TRENDVERSE',
    seoDescription:
      'Contact TRENDVERSE Founder and Editorial Desk via official email or WhatsApp for general enquiries, editorial feedback, corrections, and partnerships.',
    subtitle:
      'Reach TRENDVERSE directly via official email or WhatsApp for general enquiries, editorial feedback, factual corrections, or partnership proposals.',
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    seoTitle: 'Privacy Policy — Consent Mode, GA4 & Cookies | TRENDVERSE',
    seoDescription:
      'Read how TRENDVERSE handles Google Consent Mode v2, Google Analytics 4 (G-TN4QF7535G), AdSense, browser storage, and your privacy rights.',
    subtitle:
      'Transparent disclosure of how TRENDVERSE uses Google Analytics 4 (gtag.js), Google Consent Mode v2, advertising controls, and browser-local storage.',
  },
  'terms-and-conditions': {
    title: 'Terms & Conditions',
    seoTitle: 'Terms & Conditions — Acceptable Use & IP | TRENDVERSE',
    seoDescription:
      'Review TRENDVERSE Terms & Conditions covering acceptable website use, copyright, attribution, external links, informational disclaimers, and liability.',
    subtitle:
      'Clear rules governing acceptable use, intellectual property, external links, informational disclaimers, and responsibilities on TRENDVERSE.',
  },
  'editorial-policy': {
    title: 'Editorial Policy',
    seoTitle: 'Editorial Policy & Review Standards | TRENDVERSE',
    seoDescription:
      'Read TRENDVERSE editorial standards covering primary source verification, human review, AI transparency, conflicts of interest, and current safeguards.',
    subtitle:
      'How TRENDVERSE researches explainers, verifies primary sources, labels AI-assisted briefings, separates advertising, and maintains human editorial accountability.',
  },
  'corrections-policy': {
    title: 'Corrections & Attribution Policy',
    seoTitle: 'Corrections & Source Attribution Policy | TRENDVERSE',
    seoDescription:
      'How readers report factual errors to TRENDVERSE, how corrections are evaluated and disclosed, and how primary sources and RSS feeds are attributed.',
    subtitle:
      'How TRENDVERSE evaluates reader error reports, discloses material updates transparently, and attributes external news feeds and primary sources.',
  },
  disclaimer: {
    title: 'Disclaimer',
    seoTitle: 'Disclaimer — Educational & Tool Scope | TRENDVERSE',
    seoDescription:
      'Scope clarifications for TRENDVERSE educational articles, financial and career explainers, third-party links, and free browser calculation tools.',
    subtitle:
      'Important scope clarifications regarding financial education, career/scholarship directories, and utility calculations.',
  },
};
