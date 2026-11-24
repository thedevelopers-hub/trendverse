import { EditorialWorkflowStep, PolicyPageId } from '../types/editorial';

export const EDITORIAL_WORKFLOW_STEPS: EditorialWorkflowStep[] = [
  {
    stepNumber: '01',
    title: 'Discover Topics from Google Trends',
    owner: 'Research & Signals',
    description: 'Monitor rising international search queries across technology, world affairs, science, finance, and culture without chasing unverified rumors.',
    guardrail: 'Filter out transient clickbait or unsubstantiated social claims before briefing.',
  },
  {
    stepNumber: '02',
    title: 'Analyze Topic Relevance & Search Intent',
    owner: 'Research & Signals',
    description: 'Evaluate whether readers seek a clear definition, an evergreen deep-dive explainer, or a practical online calculator/utility.',
    guardrail: 'Ensure global English clarity and avoid unnecessary single-country assumptions.',
  },
  {
    stepNumber: '03',
    title: 'Research from Reliable Primary Sources',
    owner: 'Research & Signals',
    description: 'Gather documentation from peer-reviewed journals, standards bodies (W3C, NIST, IEEE), statistical agencies (IMF, OECD, UNCTAD), and official releases.',
    guardrail: 'Never fabricate statistics, quotes, citations, or institutional credentials.',
  },
  {
    stepNumber: '04',
    title: 'Prepare Structured Original Drafts',
    owner: 'Editorial Drafting',
    description: 'Use AI research tools strictly as a drafting aid to organize outlines and plain-language explanations grounded exclusively in verified source notes.',
    guardrail: 'Prohibit copied text, spun articles, disguised AI boilerplate, or speculative claims presented as fact.',
  },
  {
    stepNumber: '05',
    title: 'Craft Accurate Titles & Meta Descriptions',
    owner: 'SEO & Structure',
    description: 'Write specific 50–60 character headlines and 120–160 character meta descriptions aligned with what the article actually proves and explains.',
    guardrail: 'Avoid sensationalist clickbait, keyword stuffing, or misleading promises.',
  },
  {
    stepNumber: '06',
    title: 'Add Genuinely Relevant Internal Links',
    owner: 'SEO & Structure',
    description: 'Link explainers only to closely related articles, category archives, or TRENDVERSE utilities that genuinely help the reader apply the concept.',
    guardrail: 'Never pad related-article modules with unrelated topics.',
  },
  {
    stepNumber: '07',
    title: 'Check Factual Accuracy & Schema Eligibility',
    owner: 'Human Review',
    description: 'Verify every date, numeric claim, source URL, and Schema.org classification (Article for evergreen explainers; NewsArticle strictly for verified original news reporting).',
    guardrail: 'Reject or flag any claim lacking a verifiable primary reference.',
  },
  {
    stepNumber: '08',
    title: 'Mandatory Human Editorial Approval',
    owner: 'Human Review',
    description: 'A human editor reviews factual accuracy, neutrality, readability, image alt text, and AdSense policy compliance. Unpublished drafts stay excluded from sitemap.xml and search indexing.',
    guardrail: 'Never automatically publish unverified breaking news or unreviewed AI output.',
  },
  {
    stepNumber: '09',
    title: 'Publish, Attribute & Maintain Corrections',
    owner: 'Publishing',
    description: 'Publish with author attribution, original publication date, genuine update date, and visible primary source citations, updating records transparently whenever corrections arise.',
    guardrail: 'Only update lastmod when meaningful editorial revisions are made.',
  },
];

export const FOUNDER_BRAND_IDENTITY = {
  brandName: 'TRENDVERSE',
  tagline: "Discover What's Next.",
  founderName: 'Vicky',
  developerName: 'Vicky',
  publisherName: 'TRENDVERSE Editorial Team',
  contactEmail: 'vickykumar80299@gmail.com',
  repositoryUrl: 'https://github.com/thedevelopers-hub/trendverse',
  aboutIntro:
    'TRENDVERSE is an independent global digital platform founded and developed by Vicky.\n\nOur mission is to make global news, emerging trends, artificial intelligence, technology, career opportunities and educational resources accessible to people around the world.',
  platformNote:
    'Built with React, TypeScript, Vercel Serverless infrastructure, Google Blogger / Blogspot compatibility, GitHub source control, and free public data feeds.',
};

export interface PolicyContent {
  id: PolicyPageId;
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: { heading: string; body: string[] }[];
}

export const POLICY_PAGES: Record<PolicyPageId, PolicyContent> = {
  about: {
    id: 'about',
    title: 'About TRENDVERSE',
    subtitle: 'Discover What’s Next — Founded & Developed by Vicky · Published by TRENDVERSE Editorial Team.',
    lastUpdated: 'November 24, 2026',
    sections: [
      {
        heading: 'Our Mission',
        body: [
          'TRENDVERSE is an independent global digital platform founded and developed by Vicky.',
          'Our mission is to make global news, emerging trends, artificial intelligence, technology, career opportunities and educational resources accessible to people around the world.',
          'We combine original evergreen explainers grounded in public institutional documentation, clearly attributed live international RSS feeds, global trend tracking, career resources, and browser-local productivity utilities.',
        ],
      },
      {
        heading: 'Founder, Ownership & Contact Information',
        body: [
          'Founder, Owner & Developer: Vicky',
          'Publisher: TRENDVERSE Editorial Team',
          'Direct Editorial & Ownership Email: vickykumar80299@gmail.com',
          'Public Source Repository: https://github.com/thedevelopers-hub/trendverse',
          'TRENDVERSE does not fabricate fictional newsroom staff, artificial author biographies, or undisclosed corporate parent entities. All human-reviewed articles clearly identify their desk or editor alongside primary sources.',
        ],
      },
    ],
  },
  contact: {
    id: 'contact',
    title: 'Contact TRENDVERSE',
    subtitle: 'Reach Founder Vicky and the TRENDVERSE Editorial Desk for corrections, source feedback, accessibility notes, or general inquiries.',
    lastUpdated: 'November 24, 2026',
    sections: [
      {
        heading: 'Direct Contact & Corrections Desk',
        body: [
          'Editorial & Corrections Email: vickykumar80299@gmail.com',
          'Public Technical & Editorial Issue Tracker: https://github.com/thedevelopers-hub/trendverse/issues',
          'Accuracy is foundational to our work. If you spot an outdated statistic, ambiguous phrasing, broken external citation, or accessibility defect in any article, live feed attribution, or tool, write to vickykumar80299@gmail.com or submit the form below so we can review and update the page transparently.',
        ],
      },
    ],
  },
  'editorial-policy': {
    id: 'editorial-policy',
    title: 'Editorial Policy & AI Workflow',
    subtitle: 'Standards for source verification, human editorial review, live news attribution, and responsible AI assistance.',
    lastUpdated: 'November 24, 2026',
    sections: [
      {
        heading: 'Core Editorial Standards',
        body: [
          'TRENDVERSE maintains strict separation between editorial content and advertising. Ad placements are always labeled "Advertisement" and never influence editorial coverage, topic selection, or source attribution.',
          'Every explainer article must clearly separate background context, verified factual evidence from named primary institutions, and editorial analysis. We never invent news events, statistics, quotes, reviews, ratings, or human author credentials.',
        ],
      },
      {
        heading: 'Live RSS Feeds vs. Original Articles',
        body: [
          'TRENDVERSE’s Live Global Wire and Live News Center display headlines, brief upstream feed excerpts, exact source publication timestamps, and direct links to original publishers (such as BBC News, NPR, The Hindu, NASA, Google AI Blog, MIT News AI, and UN News Climate).',
          'We do not republish full third-party RSS articles as original TRENDVERSE reporting. When upstream feeds are temporarily unavailable, the interface displays an explicit unavailable state rather than fabricated headlines.',
        ],
      },
      {
        heading: 'AI-Assisted Research & Mandatory Human Review',
        body: [
          'AI tools may assist with organizing outlines, synthesizing multi-source reading briefings ("Your World in 60 Seconds"), or preparing initial research notes. Every evergreen article published on TRENDVERSE undergoes human editorial review for accuracy, primary-source verification, and clarity before entering the public sitemap.',
          'AI-assisted daily briefings are explicitly labeled as AI-generated summaries tied to named RSS sources, and unpublished drafts remain excluded from public indexing.',
        ],
      },
    ],
  },
  'corrections-policy': {
    id: 'corrections-policy',
    title: 'Corrections & Source Attribution Policy',
    subtitle: 'How TRENDVERSE verifies primary sources, handles reader error reports, and documents factual updates transparently.',
    lastUpdated: 'November 24, 2026',
    sections: [
      {
        heading: '1. Reporting Errors or Broken Citations',
        body: [
          'Readers can report factual errors, outdated metrics, or broken external source links at any time by emailing vickykumar80299@gmail.com or opening an issue on https://github.com/thedevelopers-hub/trendverse.',
          'Every report is reviewed by Founder & Managing Editor Vicky alongside the cited institutional documentation before changes are published.',
        ],
      },
      {
        heading: '2. How Corrections Are Documented',
        body: [
          'When a factual correction or substantive update is made to an article, TRENDVERSE updates the visible "Last Updated" date on the article header, updates the corresponding sitemap <lastmod> date, and displays an explicit Correction / Revision Note summarizing what changed.',
          'Minor typographic or formatting fixes that do not alter meaning do not artificially bump editorial publication timestamps.',
        ],
      },
      {
        heading: '3. Primary Source Attribution Rules',
        body: [
          'All quantitative claims, definitions, and technical specifications must trace to identifiable public standards bodies, peer-reviewed research, multilateral statistical agencies, or official publisher releases linked in the article’s Sources & Primary References section.',
        ],
      },
    ],
  },
  'privacy-policy': {
    id: 'privacy-policy',
    title: 'Privacy Policy',
    subtitle: 'How TRENDVERSE handles analytics, cookies, consent controls, third-party advertising disclosures, and browser-local utilities.',
    lastUpdated: 'November 24, 2026',
    sections: [
      {
        heading: '1. Information We Collect & Browser-Local Processing',
        body: [
          'TRENDVERSE’s free online utilities (Word Counter, Percentage Calculator, Age Calculator, Unit Converter, Text Case Converter, and Character Counter) and Careers Resume/ATS Tools execute entirely inside your web browser. Text, dates, or numbers entered into these tools are never transmitted to or stored on external servers.',
          'Your reading history, saved articles, and privacy consent choices are stored locally in browser storage (localStorage) and can be cleared or updated at any time using the "Privacy & Cookie Settings" control.',
        ],
      },
      {
        heading: '2. Cookies, Consent Controls, Google Tag Manager & AdSense',
        body: [
          'TRENDVERSE uses Google Tag Manager (Container ID: GTM-TXW2Z9KR) configured with Google Consent Mode defaults to manage essential tag governance cleanly across routes. By default, analytics storage and advertising storage remain denied until you grant consent via our Privacy & Cookie Preferences banner.',
          'TRENDVERSE does not transmit personally identifiable information (such as names, email addresses, search queries, or text entered into browser-local calculators or career tools) to Google Tag Manager or analytics data layers.',
          'When Google AdSense is active and advertising consent is granted, third-party vendors (including Google) may use cookies to serve ads based on a user’s prior visits to this website or other websites on the internet. Users may opt out of personalized advertising at any time by visiting Google Ads Settings (https://adssettings.google.com), aboutads.info, or by updating preferences via our footer Privacy & Cookie Settings button.',
        ],
      },
      {
        heading: '3. International Data Rights & Contact (GDPR / CCPA Alignment)',
        body: [
          'International visitors (including readers in the EEA, UK, and California) have the right to decline non-essential analytics and advertising cookies, withdraw previously granted consent at any time, and request access to or deletion of any personal inquiry sent to vickykumar80299@gmail.com.',
        ],
      },
    ],
  },
  'terms-and-conditions': {
    id: 'terms-and-conditions',
    title: 'Terms & Conditions',
    subtitle: 'Guidelines governing the use of TRENDVERSE editorial content, downloadable Blogger templates, and free web utilities.',
    lastUpdated: 'November 24, 2026',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        body: [
          'By accessing TRENDVERSE, reading our publications, or using our free browser utilities, you agree to use the platform lawfully and in accordance with these Terms & Conditions.',
        ],
      },
      {
        heading: '2. Intellectual Property & Open Templates',
        body: [
          'Original editorial articles, brand assets, and visual compositions published on TRENDVERSE remain the intellectual property of their respective authors and TRENDVERSE unless explicitly marked under an open license. The TRENDVERSE Blogger XML theme template provided in our documentation hub may be adapted for personal or commercial Blogger sites with attribution preserved in source comments.',
        ],
      },
      {
        heading: '3. Acceptable Use of Free Utilities',
        body: [
          'Our online calculators and text utilities are provided free of charge for educational, editorial, and general productivity purposes. Users must not attempt automated scraping, denial-of-service abuse, or misrepresentation of TRENDVERSE’s brand.',
        ],
      },
    ],
  },
  disclaimer: {
    id: 'disclaimer',
    title: 'Disclaimer',
    subtitle: 'Important scope clarifications regarding financial education, career/scholarship directories, and utility calculations.',
    lastUpdated: 'November 24, 2026',
    sections: [
      {
        heading: 'Educational Content Only — Not Professional Advice',
        body: [
          'All content published under Business & Finance, Technology & AI, Science & Space, World, Entertainment, Lifestyle, and Careers on TRENDVERSE is intended strictly for general informational and educational purposes.',
          'Nothing on TRENDVERSE constitutes personalized financial, investment, tax, legal, immigration, or medical advice. Always consult qualified licensed professionals and official issuing institutions before making major financial, academic, or legal decisions.',
        ],
      },
      {
        heading: 'Utility Accuracy & External Links',
        body: [
          'While our calculators and unit converters use standard mathematical formulas and SI conversion constants, users should verify critical engineering, academic, or financial figures independently. TRENDVERSE is not responsible for the content or availability of external institutional websites or third-party RSS publishers.',
        ],
      },
    ],
  },
};
