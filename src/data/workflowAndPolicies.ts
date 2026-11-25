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
  contactEmail: 'ui.vicky2002@gmail.com',
  whatsappDisplay: '+91 63876 61594',
  whatsappUrl: 'https://wa.me/916387661594',
  aboutIntro:
    'TRENDVERSE is an independent global digital platform founded and developed by Vicky.\n\nOur mission is to make global news, emerging trends, artificial intelligence, technology, career opportunities and educational resources accessible to people around the world.',
  platformNote:
    'Built with React, TypeScript, Vercel Serverless infrastructure, Google Blogger compatibility, and curated public institutional feeds.',
};

export interface PolicyContent {
  id: PolicyPageId;
  title: string;
  seoTitle?: string;
  seoDescription?: string;
  subtitle: string;
  lastUpdated: string;
  sections: { heading: string; body: string[] }[];
}

export const POLICY_PAGES: Record<PolicyPageId, PolicyContent> = {
  about: {
    id: 'about',
    title: 'About Us',
    seoTitle: 'About Us — Independent Digital Media & Tools | TRENDVERSE',
    seoDescription:
      'Learn about TRENDVERSE, its mission, editorial philosophy, six subject desks, career resources, and founder-led publishing model.',
    subtitle:
      'Discover What’s Next — An independent digital publication, trend intelligence hub, and practical utilities platform founded and edited by Vicky.',
    lastUpdated: 'November 24, 2026',
    sections: [
      {
        heading: 'What TRENDVERSE Is & Why It Exists',
        body: [
          'TRENDVERSE is an independent digital publication and web platform founded, engineered, and edited by Vicky under the TRENDVERSE Editorial Team banner.',
          'Much of the modern web splits into two extremes: fast-moving headline feeds that offer little context, or dense technical documents locked behind paywalls and jargon. TRENDVERSE exists to bring both sides together in plain, readable English—pairing live international news aggregation and rising trend signals with structured reference explainers and zero-cost browser utilities.',
        ],
      },
      {
        heading: 'What Topics & Resources We Cover',
        body: [
          'Our evergreen explainers and live news desks cover six core subjects: Technology & AI, World Affairs, Business & Finance, Science & Space, Entertainment, and Lifestyle.',
          'Alongside written explainers, TRENDVERSE maintains Your World in 60 Seconds (an AI-assisted daily digest grounded in named RSS dispatches), Trend Battle for comparing regional topic interest, TRENDVERSE CAREERS (aggregating open job boards, internships, scholarships, and official government recruitment portals), and browser-local calculators and text tools for students and writers.',
        ],
      },
      {
        heading: 'Who TRENDVERSE Serves',
        body: [
          'We write for an international audience of students, early-career professionals, engineers, educators, and general readers who want clear explanations of complex global systems without sensationalism or clickbait.',
        ],
      },
      {
        heading: 'Editorial Philosophy & Publishing Approach',
        body: [
          'Every evergreen explainer published on TRENDVERSE aims to answer three practical questions: what is happening, why the underlying mechanism matters, and what primary documentation supports each claim.',
          'We separate original explainers from external live news feeds. When TRENDVERSE displays breaking headlines from international publishers such as BBC News, NPR, The Hindu, NASA, or UN News, those items remain attributed with original timestamps and direct links to the source publisher rather than being rewritten as original reporting.',
        ],
      },
      {
        heading: 'Ownership & Actual Editorial Structure',
        body: [
          'TRENDVERSE is independently owned, built, and overseen by Founder and Managing Editor Vicky, with collaborative research notes compiled under the TRENDVERSE Editorial Desk.',
          'We believe trust starts with honesty about size and structure: TRENDVERSE does not invent corporate parent companies, regional office addresses, employee headcounts, awards, or fictional staff journalists. Every human-reviewed article identifies its contributor, editor, publication date, revision date, and primary references.',
        ],
      },
    ],
  },
  contact: {
    id: 'contact',
    title: 'Contact Us',
    seoTitle: 'Contact Us — Editorial, Corrections & Enquiries | TRENDVERSE',
    seoDescription:
      'Contact TRENDVERSE Founder and Editorial Desk via official email or WhatsApp for general enquiries, editorial feedback, corrections, and partnerships.',
    subtitle:
      'Reach TRENDVERSE directly via official email or WhatsApp for general enquiries, editorial feedback, factual corrections, or partnership proposals.',
    lastUpdated: 'November 24, 2026',
    sections: [
      {
        heading: 'Official Direct Contact Channels',
        body: [
          'You can contact Founder and Managing Editor Vicky directly using our two official communication channels below. We do not operate telephone call centers or physical walk-in offices, and we do not publish unverified third-party contact handles.',
          'Official Email: ui.vicky2002@gmail.com',
          'Official WhatsApp: +91 63876 61594 (https://wa.me/916387661594)',
        ],
      },
      {
        heading: 'How to Route Your Enquiry',
        body: [
          'General Enquiries: Questions about using TRENDVERSE desks, career directories, scholarship links, or browser-local productivity tools.',
          'Editorial Feedback: Suggestions for new explainer topics, clarity improvements, accessibility notes, or authoritative institutional resources worth referencing.',
          'Corrections & Factual Error Reporting: If you notice an outdated figure, broken source URL, ambiguous explanation, or misattributed feed headline, please share the exact article link and supporting primary documentation so we can review and update the page.',
          'Business & Partnership Enquiries: Inquiries regarding ethical brand sponsorships, educational collaborations, or content licensing. Paid placements never influence editorial judgment or factual conclusions.',
        ],
      },
    ],
  },
  'privacy-policy': {
    id: 'privacy-policy',
    title: 'Privacy Policy',
    seoTitle: 'Privacy Policy — Consent Mode, GA4 & Cookies | TRENDVERSE',
    seoDescription:
      'Read how TRENDVERSE handles Google Consent Mode v2, Google Analytics 4 (G-TN4QF7535G), AdSense, browser storage, and your privacy rights.',
    subtitle:
      'Transparent disclosure of how TRENDVERSE uses Google Analytics 4 (gtag.js), Google Consent Mode v2, advertising controls, and browser-local storage.',
    lastUpdated: 'November 25, 2026',
    sections: [
      {
        heading: '1. Scope & Data Controller Contact',
        body: [
          'TRENDVERSE (https://trendverse-ten.vercel.app/) is an independent publication operated by Vicky. For privacy questions or requests regarding direct email or WhatsApp correspondence, contact ui.vicky2002@gmail.com or message +91 63876 61594 on WhatsApp.',
        ],
      },
      {
        heading: '2. Google Analytics 4 (gtag.js) & Google Consent Mode v2',
        body: [
          'TRENDVERSE integrates Google Analytics 4 (Measurement ID: G-TN4QF7535G) directly via Google’s official gtag.js library across pages and client-side routes, paired with Google Consent Mode v2.',
          'Before gtag.js initializes, our page sets Google Consent Mode v2 defaults in the document head: analytics_storage, ad_storage, ad_user_data, ad_personalization, and personalization_storage default to "denied" unless you have previously saved consent preferences, while functionality_storage and security_storage remain "granted". When advertising consent is denied, ads_data_redaction is set to true and url_passthrough is set to false.',
          'Loading the official gtag.js script connects your browser to Google servers while Consent Mode v2 enforces your privacy settings and restricts analytics cookies until you grant permission. When you navigate between routes or interact with site features, sanitized analytics events strip query parameters, hash fragments, and personal form fields so search text, emails, or user messages are never sent to Google Analytics.',
          'Updating your selection in the Privacy & Cookie Settings panel immediately calls gtag consent update so Audience Analytics and Advertising storage states stay synchronized with your choice.',
        ],
      },
      {
        heading: '3. Cookies, Browser Storage & Local Utilities',
        body: [
          'Essential browser storage (localStorage) is used to remember your privacy consent preferences (key: trendverse_privacy_consent_v1), reading history, saved articles, clock preference, and locally saved 60-second briefing history.',
          'Our free online tools (Word Counter, Percentage Calculator, Age Calculator, Unit Converter, Text Case Converter, Character Counter) and Career Resume/ATS tools run entirely inside your browser. Text, numbers, dates, and resume drafts entered into these utilities are not sent to TRENDVERSE servers or advertising partners.',
        ],
      },
      {
        heading: '4. Advertising Technologies & Consent Choices',
        body: [
          'TRENDVERSE includes consent-gated support for Google AdSense. AdSense scripts (pagead2.googlesyndication.com) are not loaded unless AdSense is explicitly enabled on the site and you have granted Advertising Partners consent.',
          'When Google AdSense is active and consented, Google and third-party vendors may use cookies or device identifiers to serve and measure ads based on prior visits to this or other websites. You can opt out of personalized advertising via Google Ads Settings (https://adssettings.google.com), aboutads.info, or at any time using the "Privacy & Cookie Settings" control in our footer or below.',
        ],
      },
      {
        heading: '5. Third-Party Feeds, Server Endpoints & External Links',
        body: [
          'TRENDVERSE is hosted on Vercel. Our serverless endpoints fetch public RSS news feeds, Google Trends feeds, NASA updates, and public job/scholarship APIs. When you generate an AI daily briefing ("Your World in 60 Seconds") or use Career AI Assist, your selected topic/category filters or prompt text are processed on the server without creating user accounts.',
          'Articles, live news cards, and career listings contain outbound links to external publishers, government portals, and universities. Once you leave TRENDVERSE, those external websites operate under their own privacy policies and cookie practices.',
        ],
      },
      {
        heading: '6. Data Retention & Your Privacy Rights',
        body: [
          'TRENDVERSE does not maintain user login accounts or a central database of reader profiles. Local browser storage persists on your device until you clear site data. Retention of any aggregated measurement data in Google Analytics 4 follows configured Google Analytics retention settings, and email or WhatsApp messages sent to us are kept only as long as needed to respond or verify editorial corrections.',
          'Depending on your jurisdiction (including the EEA, UK, and California), you have the right to decline or withdraw non-essential analytics and advertising consent, clear local browser storage, and request access to or deletion of correspondence sent to ui.vicky2002@gmail.com.',
        ],
      },
    ],
  },
  'terms-and-conditions': {
    id: 'terms-and-conditions',
    title: 'Terms & Conditions',
    seoTitle: 'Terms & Conditions — Acceptable Use & IP | TRENDVERSE',
    seoDescription:
      'Review TRENDVERSE Terms & Conditions covering acceptable website use, copyright, attribution, external links, informational disclaimers, and liability.',
    subtitle:
      'Clear rules governing acceptable use, intellectual property, external links, informational disclaimers, and responsibilities on TRENDVERSE.',
    lastUpdated: 'November 24, 2026',
    sections: [
      {
        heading: '1. Acceptable Website Use',
        body: [
          'By accessing or reading TRENDVERSE (https://trendverse-ten.vercel.app/), you agree to use the site only for lawful personal, academic, or professional informational purposes.',
          'You agree not to disrupt server infrastructure, attempt unauthorized access, bypass rate limits, run abusive automated scraping, or impersonate TRENDVERSE or its editorial team.',
        ],
      },
      {
        heading: '2. Content Ownership, Copyright & Attribution',
        body: [
          'Original articles, editorial summaries, site code, and custom visual diagrams published on TRENDVERSE remain the intellectual property of TRENDVERSE and Founder Vicky unless otherwise noted.',
          'You may share links to TRENDVERSE articles and quote brief passages for commentary, education, or criticism provided clear attribution and a link back to the original TRENDVERSE page are included. Bulk copying, automated republication, or passing off TRENDVERSE content as your own is prohibited.',
          'Headlines, excerpts, trademarks, and outbound links surfaced through Live Global Wire, Google Trends Radar, or TRENDVERSE CAREERS belong to their respective publishers, employers, and institutions.',
        ],
      },
      {
        heading: '3. External Website Links & Third-Party Feeds',
        body: [
          'TRENDVERSE links extensively to primary standards bodies, public statistical agencies, international newsrooms, universities, and government job portals. We do not control external websites and cannot guarantee their uptime, accuracy after publication, or privacy practices.',
        ],
      },
      {
        heading: '4. User-Submitted Information',
        body: [
          'When you send an enquiry, feedback note, or correction report via email or WhatsApp, you confirm that your message is lawful and accurate to the best of your knowledge. Do not submit confidential third-party data or sensitive personal records through contact channels.',
        ],
      },
      {
        heading: '5. General Informational Disclaimers',
        body: [
          'All explainers, finance overviews, career directories, scholarship summaries, AI-assisted briefings, and online calculators on TRENDVERSE are provided for general informational and educational purposes only.',
          'Nothing on TRENDVERSE constitutes licensed financial, investment, tax, legal, medical, or immigration advice, nor does TRENDVERSE guarantee employment, scholarship selection, or third-party application outcomes.',
        ],
      },
      {
        heading: '6. Limitations of Liability & Contact',
        body: [
          'TRENDVERSE provides its website, live feeds, and free utilities on an "as is" and "as available" basis without express or implied warranties of uninterrupted availability or absolute error-free operation. To the fullest extent permitted by applicable law, TRENDVERSE and its founder are not liable for indirect, incidental, or consequential losses resulting from reliance on informational content or temporary outages of upstream feeds.',
          'Questions about these Terms & Conditions can be sent to ui.vicky2002@gmail.com or via WhatsApp at +91 63876 61594.',
        ],
      },
    ],
  },
  'editorial-policy': {
    id: 'editorial-policy',
    title: 'Editorial Policy',
    seoTitle: 'Editorial Policy & Review Standards | TRENDVERSE',
    seoDescription:
      'Read TRENDVERSE editorial standards covering primary source verification, human review, AI transparency, conflicts of interest, and current safeguards.',
    subtitle:
      'How TRENDVERSE researches explainers, verifies primary sources, labels AI-assisted briefings, separates advertising, and maintains human editorial accountability.',
    lastUpdated: 'November 24, 2026',
    sections: [
      {
        heading: '1. Research Methodology & Primary Sources',
        body: [
          'TRENDVERSE selects evergreen explainer topics based on persistent reader questions and emerging global search demand rather than short-lived social rumors.',
          'Our writers and editors prioritize primary and authoritative documentation—including technical specifications (W3C, NIST, AOMedia), multilateral institutions (IMF, OECD, WHO, UNCTAD, IMO), public financial regulators (U.S. SEC Investor.gov, central banks), and official engineering documentation—before consulting secondary commentary.',
        ],
      },
      {
        heading: '2. Source Verification & Human Editorial Review',
        body: [
          'Every evergreen explainer undergoes human editorial review by Founder and Managing Editor Vicky before publication in our sitemap. Review checks confirm that quantitative statements match cited primary sources, publication and revision dates are genuine, and technical explanations remain accurate for general readers.',
          'Drafts marked as pending review or requiring additional verification are withheld from public sitemap inclusion and carry noindex directives until cleared.',
        ],
      },
      {
        heading: '3. Author & Editor Accountability',
        body: [
          'Articles identify either an individual author ("Vicky") or the collaborative desk ("TRENDVERSE Editorial Desk") alongside the reviewing editor and visible last-reviewed date. We never invent fictional journalists, fabricated biographies, or unverified academic credentials.',
        ],
      },
      {
        heading: '4. AI-Assisted Writing & Human Responsibility',
        body: [
          'AI tools may assist with structuring research outlines or generating "Your World in 60 Seconds" briefings strictly from live verified RSS headlines. Whenever AI summarizes live news feeds, the briefing carries a visible AI-generated summary label alongside direct publisher links and timestamps.',
          'AI output is never treated as an authoritative source of truth. Final editorial responsibility for every published evergreen explainer rests with a human editor, and TRENDVERSE never disguises AI text or fabricates events, quotes, or citations.',
        ],
      },
      {
        heading: '5. Conflicts of Interest & Advertising Separation',
        body: [
          'Editorial selection and conclusions are independent of advertising and monetization. All ad placements are visibly labeled "Advertisement", and TRENDVERSE does not accept undisclosed paid placements or favorable coverage agreements.',
        ],
      },
      {
        heading: '6. Reporting vs. Analysis & What Is Implemented vs. Planned',
        body: [
          'TRENDVERSE clearly distinguishes factual background (what standards, data, or events show) from editorial explanation (why those mechanisms matter to readers). External headlines in Live Global Wire represent reporting by the named third-party newsrooms, not original TRENDVERSE journalism.',
          'Implemented Today: Human editorial review of all curated evergreen articles, primary source link sections, explicit AI-summary labels on live briefings, draft noindex guards, and transparent revision notes. Planned for Future Growth: Expanding independent domain-specialist peer review as contributor capacity grows. TRENDVERSE does not claim that every live external RSS item has undergone independent fact-checking.',
        ],
      },
    ],
  },
  'corrections-policy': {
    id: 'corrections-policy',
    title: 'Corrections & Attribution Policy',
    seoTitle: 'Corrections & Source Attribution Policy | TRENDVERSE',
    seoDescription:
      'How readers report factual errors to TRENDVERSE, how corrections are evaluated and disclosed, and how primary sources and RSS feeds are attributed.',
    subtitle:
      'How TRENDVERSE evaluates reader error reports, discloses material updates transparently, and attributes external news feeds and primary sources.',
    lastUpdated: 'November 24, 2026',
    sections: [
      {
        heading: '1. How Readers Can Report Factual Errors',
        body: [
          'Readers can report factual inaccuracies, outdated metrics, broken institutional links, or attribution issues directly via our official channels:',
          'Email: ui.vicky2002@gmail.com · WhatsApp: +91 63876 61594 (https://wa.me/916387661594).',
          'When contacting us about a correction, please include the article or page URL, the specific statement in question, and—if possible—a primary source or official document showing the updated facts.',
        ],
      },
      {
        heading: '2. How Editorial Corrections Are Evaluated',
        body: [
          'Founder and Managing Editor Vicky reviews every correction report by comparing the published text against primary standards documents, official institutional statistics, or the original cited source.',
          'If an upstream RSS headline or job/scholarship listing contains an external publisher update or expires upstream, TRENDVERSE refreshes or removes the cached entry from its live feed rather than altering third-party reporting.',
        ],
      },
      {
        heading: '3. How Material Corrections & Updates Are Disclosed',
        body: [
          'When a factual error, outdated technical claim, or substantive gap is corrected in an article, TRENDVERSE displays an explicit Revision Note on the article page explaining what changed, updates the visible "Updated" date, and updates the corresponding sitemap <lastmod> date.',
          'Routine spelling, punctuation, or layout adjustments that do not change factual meaning are corrected silently without artificially changing publication or update dates.',
        ],
      },
      {
        heading: '4. Attribution & Communication Standards',
        body: [
          'Every evergreen explainer lists its primary references in a dedicated Sources & Primary References section with direct outbound links. Live news wires and 60-second briefings retain original publisher names, upstream publication timestamps, and direct links to source reporting.',
          'When a reader submits a valid correction by email or WhatsApp, we aim to acknowledge the message and confirm once the verified update is live.',
        ],
      },
    ],
  },
  disclaimer: {
    id: 'disclaimer',
    title: 'Disclaimer',
    seoTitle: 'Disclaimer — Educational & Tool Scope | TRENDVERSE',
    seoDescription:
      'Scope clarifications for TRENDVERSE educational articles, financial and career explainers, third-party links, and free browser calculation tools.',
    subtitle:
      'Important scope clarifications regarding financial education, career/scholarship directories, and utility calculations.',
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

