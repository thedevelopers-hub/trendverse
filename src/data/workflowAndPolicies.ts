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
    description: 'Evaluate whether readers seek a quick definition, an evergreen deep-dive explainer, or a practical online calculator/utility.',
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
    title: 'Generate Original Article Drafts',
    owner: 'Editorial Drafting',
    description: 'Use Google AI Studio to structure clear outlines and original prose grounded exclusively in verified source notes.',
    guardrail: 'Prohibit copied text, spun articles, or speculative statements presented as fact.',
  },
  {
    stepNumber: '05',
    title: 'Suggest SEO Titles & Meta Descriptions',
    owner: 'SEO & Structure',
    description: 'Craft concise 50–60 character headlines and 140–155 character meta descriptions aligned with authentic reader search intent.',
    guardrail: 'Avoid sensationalist clickbait or keyword stuffing.',
  },
  {
    stepNumber: '06',
    title: 'Suggest Relevant Internal Links',
    owner: 'SEO & Structure',
    description: 'Connect explainers to related category archives and relevant TRENDVERSE Free Tools (for example, linking inflation articles to the Percentage Calculator).',
    guardrail: 'Maintain natural anchor text that genuinely helps the reader.',
  },
  {
    stepNumber: '07',
    title: 'Check Factual Accuracy & Schema Eligibility',
    owner: 'Human Review',
    description: 'Verify every date, numeric figure, source URL, and Schema.org classification (using Article for explainers and NewsArticle strictly for original news reporting).',
    guardrail: 'Reject any claim lacking a verifiable primary reference.',
  },
  {
    stepNumber: '08',
    title: 'Mandatory Human Editorial Approval',
    owner: 'Human Review',
    description: 'A human editor reviews tone, accessibility, neutrality, image alt text, and AdSense policy compliance prior to scheduling.',
    guardrail: 'Never automatically publish unverified breaking news or unreviewed AI output.',
  },
  {
    stepNumber: '09',
    title: 'Publish & Index via Blogger',
    owner: 'Publishing',
    description: 'Publish with clean permalink slugs, assigned category labels, canonical metadata, and updated Blogger XML sitemap ping.',
    guardrail: 'Monitor Search Console indexing and Core Web Vitals post-publication.',
  },
];

export const FOUNDER_BRAND_IDENTITY = {
  brandName: 'TRENDVERSE',
  tagline: "Discover What's Next.",
  founderName: 'Vicky',
  developerName: 'Vicky',
  publisherName: 'TRENDVERSE Editorial Team',
  aboutIntro:
    'TRENDVERSE is an independent global digital platform founded and developed by Vicky.\n\nOur mission is to make global news, emerging trends, artificial intelligence, technology, career opportunities and educational resources accessible to people around the world.',
  platformNote:
    'Built with Google Blogger / Blogspot, GitHub source control, open web standards, and free public data feeds.',
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
    lastUpdated: 'November 2026',
    sections: [
      {
        heading: 'Our Mission',
        body: [
          'TRENDVERSE is an independent global digital platform founded and developed by Vicky.',
          'Our mission is to make global news, emerging trends, artificial intelligence, technology, career opportunities and educational resources accessible to people around the world.',
          'We organize explainers, live verified RSS headlines, global trend radar tools, international career pathways, scholarships, and fast browser utilities in clear international English for readers across the United States, the United Kingdom, India, Canada, Australia, Germany, Singapore, and worldwide.',
        ],
      },
      {
        heading: 'Founder, Developer & Publishing Credits',
        body: [
          'Founder & Developer: Vicky',
          'Publisher: TRENDVERSE Editorial Team',
          'Open Source Repository: https://github.com/thedevelopers-hub/trendverse',
          'TRENDVERSE is engineered for fast performance, accessibility, and editorial clarity using React, TypeScript, Vercel Edge/Serverless infrastructure, Google Blogger (Blogspot), and open web standards—operating strictly without mandatory paid APIs or subscriptions.',
        ],
      },
    ],
  },
  contact: {
    id: 'contact',
    title: 'Contact TRENDVERSE',
    subtitle: 'Reach our editorial desk for factual corrections, syndication inquiries, accessibility feedback, or partnership questions.',
    lastUpdated: 'November 2026',
    sections: [
      {
        heading: 'Editorial & Corrections Desk',
        body: [
          'Accuracy is foundational to our work. If you notice an outdated figure, broken source link, or technical issue in any article, career listing, or online tool, please submit a note using the form below or open an issue on our public repository (https://github.com/thedevelopers-hub/trendverse) so the TRENDVERSE Editorial Team and Founder Vicky can review and update the record transparently.',
        ],
      },
    ],
  },
  'privacy-policy': {
    id: 'privacy-policy',
    title: 'Privacy Policy',
    subtitle: 'How TRENDVERSE handles analytics, cookies, consent controls, third-party advertising disclosures, and browser-local utilities.',
    lastUpdated: 'November 2026',
    sections: [
      {
        heading: '1. Information We Collect & Browser-Local Processing',
        body: [
          'TRENDVERSE’s free online utilities (Word Counter, Percentage Calculator, Age Calculator, Unit Converter, Text Case Converter, and Character Counter) and Careers Resume/ATS Tools execute entirely inside your web browser. Text, dates, or numbers entered into these tools are never transmitted to or stored on external servers.',
          'Your reading history, saved articles, and privacy consent choices are stored locally in browser storage (localStorage) and can be cleared or updated at any time using the "Privacy & Cookie Settings" control.',
        ],
      },
      {
        heading: '2. Cookies, Consent Controls & Google AdSense Disclosure',
        body: [
          'TRENDVERSE separates essential local functionality from optional audience measurement (Google Analytics 4) and third-party advertising (Google AdSense). Optional analytics and advertising scripts load only when configured and after you grant consent via our Privacy & Cookie Preferences banner.',
          'When Google AdSense is active, third-party vendors (including Google) use cookies to serve ads based on a user’s prior visits to this website or other websites on the internet. Users may opt out of personalized advertising at any time by visiting Google Ads Settings (https://adssettings.google.com), aboutads.info, or by updating preferences via our footer Privacy & Cookie Settings button.',
        ],
      },
      {
        heading: '3. International Data Rights (GDPR / CCPA Alignment)',
        body: [
          'International visitors (including readers in the EEA, UK, and California) have the right to decline non-essential analytics and advertising cookies, withdraw previously granted consent at any time, and request access to or deletion of any personal inquiry submitted directly through our editorial channels.',
        ],
      },
    ],
  },
  'terms-and-conditions': {
    id: 'terms-and-conditions',
    title: 'Terms & Conditions',
    subtitle: 'Guidelines governing the use of TRENDVERSE editorial content, downloadable Blogger templates, and free web utilities.',
    lastUpdated: 'November 2026',
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
    subtitle: 'Important scope clarifications regarding financial education, technical explainers, and utility calculations.',
    lastUpdated: 'November 2026',
    sections: [
      {
        heading: 'Educational Content Only — Not Professional Advice',
        body: [
          'All content published under Business & Finance, Technology & AI, Science & Space, World, Entertainment, and Lifestyle on TRENDVERSE is intended strictly for general informational and educational purposes.',
          'Nothing on TRENDVERSE constitutes personalized financial, investment, tax, legal, or medical advice. Always consult qualified licensed professionals before making major financial or legal decisions.',
        ],
      },
      {
        heading: 'Utility Accuracy & External Links',
        body: [
          'While our calculators and unit converters use standard mathematical formulas and SI conversion constants, users should verify critical engineering, academic, or financial figures independently. TRENDVERSE is not responsible for the content or availability of external institutional websites cited in reference sections.',
        ],
      },
    ],
  },
  'editorial-policy': {
    id: 'editorial-policy',
    title: 'Editorial Policy & AI Workflow',
    subtitle: 'Transparency in sourcing, human oversight, corrections, and our nine-step editorial production workflow.',
    lastUpdated: 'November 2026',
    sections: [
      {
        heading: 'Core Editorial Principles',
        body: [
          'TRENDVERSE maintains strict separation between editorial content and advertising. Sponsored placements or reserved AdSense slots are always clearly labeled as "Advertisement" and never influence editorial coverage.',
          'Every factual article distinguishes between established consensus, primary source documentation, and evolving research. We never invent news events, synthetic reviews, ratings, or unverified author credentials.',
        ],
      },
      {
        heading: 'AI-Assisted Research with Mandatory Human Approval',
        body: [
          'TRENDVERSE leverages Google AI Studio strictly as a structured research and drafting aid within a nine-stage editorial pipeline. Every draft undergoes factual source verification, Schema.org validation, and final human editorial sign-off before publishing to Blogger. Automated publishing of unverified breaking news is strictly prohibited.',
        ],
      },
    ],
  },
};
