import { Article } from '../types/editorial';

/**
 * Curated Evergreen Reference Library for TRENDVERSE.
 * Strictly factual educational explainers using verifiable institutional documentation.
 * No fabricated breaking news, ratings, or synthetic quotes.
 */
export const EVERGREEN_ARTICLES: Article[] = [
  {
    id: 'art-ai-inference-architecture',
    slug: 'how-modern-ai-inference-infrastructure-scales-globally',
    title: 'How Modern AI Inference Infrastructure Scales Across Global Edge Regions',
    subtitle: 'Inside the networking, memory bandwidth, and quantization standards that determine how foundation models respond in milliseconds.',
    summary: 'An architectural breakdown of how data centers balance GPU memory bandwidth, model quantization, and optical interconnects to serve international traffic reliably.',
    category: 'technology-ai',
    categoryName: 'Technology & AI',
    labels: ['Technology & AI', 'Computing Architecture', 'Open Standards'],
    authorName: 'TRENDVERSE Editorial Desk',
    authorRole: 'Technology & Infrastructure Unit',
    publishedAt: '2026-10-14',
    updatedAt: '2026-11-08',
    readTimeMinutes: 7,
    featured: true,
    trending: true,
    discoverGroup: 'editors-pick',
    schemaType: 'Article',
    imageAlt: 'Architectural diagram of distributed optical fiber and high-bandwidth compute clusters',
    imageCaption: 'Fig. 1 — Distributed inference clusters rely on high-bandwidth memory and low-latency optical interconnects.',
    visualMotif: 'network',
    sections: [
      {
        id: 'memory-bandwidth-bottleneck',
        heading: 'Why Memory Bandwidth Governs Token Generation',
        paragraphs: [
          'Unlike traditional web applications that spend most compute cycles waiting on relational database queries or small stateless calculations, autoregressive language model inference is predominantly memory-bandwidth bound during token-by-token decoding.',
          'Each generated output token requires reading billions of model weights from high-bandwidth memory (HBM) into compute cores. Consequently, hardware architects evaluate inference clusters not solely by peak floating-point operations per second (FLOPS), but by bytes transferred per second between memory stacks and tensor units.',
        ],
        pullQuote: 'In large-scale inference, moving weights from memory to compute units often dictates real-world response latency more than raw arithmetic capacity.',
      },
      {
        id: 'quantization-and-precision',
        heading: 'Precision Trade-offs and Numeric Quantization',
        paragraphs: [
          'Training large neural networks typically relies on 16-bit floating-point formats such as BF16 to preserve numerical stability across gradient updates. Once weights are finalized for serving, engineers frequently apply post-training quantization to represent parameters in 8-bit or 4-bit integers.',
          'Reducing numeric precision shrinks the memory footprint by half or more, allowing models to fit onto fewer accelerators while cutting energy consumption per query. Careful calibration datasets ensure that accuracy across multilingual benchmarks remains within strict tolerances.',
        ],
      },
      {
        id: 'global-routing-and-latency',
        heading: 'Anycast Routing and Regional Compliance',
        paragraphs: [
          'Serving international readers introduces two simultaneous constraints: physical speed-of-light propagation delays across submarine cables and regional data governance frameworks. Modern edge networks terminate TLS connections near the user and route inference payloads to regional compute zones.',
          'For publishers and developers building lightweight web applications, keeping client bundles small and relying on structured server-side endpoints helps prevent network round-trips from compounding latency on mobile connections.',
        ],
      },
    ],
    sources: [
      {
        label: 'NIST Artificial Intelligence Risk Management Framework',
        publisher: 'National Institute of Standards and Technology',
        url: 'https://www.nist.gov/itl/ai-risk-management-framework',
      },
      {
        label: 'Core Web Vitals & Latency Performance Documentation',
        publisher: 'web.dev / Chrome Engineering',
        url: 'https://web.dev/articles/vitals',
      },
    ],
  },
  {
    id: 'art-maritime-corridors',
    slug: 'understanding-global-maritime-chokepoints-and-supply-chains',
    title: 'Understanding Global Maritime Corridors and Modern Supply Chain Resilience',
    subtitle: 'Why over four-fifths of international merchandise volume still travels by sea, and how port automation reshapes transit predictability.',
    summary: 'A foundational explainer on international shipping lanes, containerization standards, and how customs digitization reduces port dwell times.',
    category: 'world',
    categoryName: 'World',
    labels: ['World', 'Global Trade', 'Infrastructure'],
    authorName: 'TRENDVERSE Editorial Desk',
    authorRole: 'Global Affairs & Infrastructure Unit',
    publishedAt: '2026-10-22',
    updatedAt: '2026-11-10',
    readTimeMinutes: 6,
    trending: true,
    discoverGroup: 'most-read',
    schemaType: 'Article',
    imageAlt: 'Aerial geometric view of international maritime cargo lanes and container berths',
    imageCaption: 'Fig. 2 — Standardized intermodal containers connect oceanic trunk routes to inland rail corridors.',
    visualMotif: 'meridian',
    sections: [
      {
        id: 'scale-of-maritime-freight',
        heading: 'The Backbone of Cross-Border Commerce',
        paragraphs: [
          'According to the United Nations Conference on Trade and Development (UNCTAD), maritime transport carries more than 80 percent of global merchandise trade by volume. Standardized 20-foot and 40-foot ISO containers allow goods to move seamlessly from ocean vessels onto rail flatcars and highway chassis without repacking.',
          'Because global maritime traffic concentrates along narrow geographic corridors—including the Suez Canal, the Panama Canal, and the Strait of Malacca—disruptions in weather, water levels, or security rapidly alter vessel routing around entire continents.',
        ],
      },
      {
        id: 'digital-customs-and-port-calls',
        heading: 'Electronic Manifests and Port Call Optimization',
        paragraphs: [
          'Historically, ships waited at anchor outside congested terminals because berth schedules and customs clearances were processed asynchronously on paper. Modern port community systems synchronize arrival telemetry with crane scheduling so vessels can adjust cruising speed days in advance.',
          'This practice, known as just-in-time arrival, reduces bunker fuel burn at anchor while smoothing peak truck queues at inland terminal gates.',
        ],
        pullQuote: 'Digitizing customs manifests and berth allocation cuts idle vessel wait times without pouring a single ton of new concrete.',
      },
    ],
    sources: [
      {
        label: 'Review of Maritime Transport',
        publisher: 'UN Trade and Development (UNCTAD)',
        url: 'https://unctad.org/topic/transport-and-trade-logistics/review-of-maritime-transport',
      },
      {
        label: 'International Maritime Organization Facilitation Convention',
        publisher: 'International Maritime Organization (IMO)',
        url: 'https://www.imo.org/en/OurWork/Facilitation/Pages/Default.aspx',
      },
    ],
  },
  {
    id: 'art-inflation-indices-explained',
    slug: 'how-central-banks-measure-core-inflation-and-purchasing-power',
    title: 'How Central Banks Measure Core Inflation and Household Purchasing Power',
    subtitle: 'A clear guide to CPI baskets, PCE weights, and why policymakers distinguish headline price swings from underlying services inflation.',
    summary: 'Learn how statistical agencies construct consumer price indices, why shelter and energy carry different weights across countries, and how interest rate expectations form.',
    category: 'business-finance',
    categoryName: 'Business & Finance',
    labels: ['Business & Finance', 'Macroeconomics', 'Financial Literacy'],
    authorName: 'TRENDVERSE Editorial Desk',
    authorRole: 'Economics & Markets Literacy Unit',
    publishedAt: '2026-10-29',
    updatedAt: '2026-11-12',
    readTimeMinutes: 6,
    trending: true,
    discoverGroup: 'popular',
    schemaType: 'Article',
    imageAlt: 'Architectural facade representing central monetary policy and statistical measurement',
    imageCaption: 'Fig. 3 — Statistical baskets track price changes across housing, food, energy, and services.',
    visualMotif: 'ledger',
    sections: [
      {
        id: 'headline-versus-core',
        heading: 'Headline Inflation Versus Core Measures',
        paragraphs: [
          'When national statistical offices publish monthly inflation reports, markets pay close attention to two distinct figures: headline inflation and core inflation. Headline inflation tracks the full basket of goods and services purchased by typical urban households, including groceries and motor fuel.',
          'Core inflation excludes volatile food and energy components. Policymakers monitor core measures because monetary policy tools—such as benchmark overnight interest rates—operate with multi-quarter lags and cannot directly expand short-term agricultural harvests or global crude supply.',
        ],
      },
      {
        id: 'basket-weights-around-the-world',
        heading: 'Why Basket Weights Differ Across Economies',
        paragraphs: [
          'A household price index is only as representative as its underlying expenditure weights. In advanced economies, housing shelter, healthcare, and personal services frequently account for more than half of total index weight. In emerging economies, food and staple commodities represent a larger share of household budgets.',
          'Understanding these weighting differences explains why identical global commodity shocks produce sharply different inflation readings across regions.',
        ],
      },
    ],
    sources: [
      {
        label: 'Consumer Price Index Manual: Concepts and Methods',
        publisher: 'International Monetary Fund (IMF)',
        url: 'https://www.imf.org/en/Data/Statistics/cpi-manual',
      },
      {
        label: 'Consumer Prices OECD Data Overview',
        publisher: 'Organisation for Economic Co-operation and Development (OECD)',
        url: 'https://www.oecd.org/en/data/indicators/inflation-cpi.html',
      },
    ],
  },
  {
    id: 'art-infrared-space-observatories',
    slug: 'why-deep-space-observatories-operate-in-the-infrared-spectrum',
    title: 'Why Deep-Space Observatories Operate in the Infrared Spectrum',
    subtitle: 'How cosmic redshift stretches ancient starlight and why cryogenic sunshields at Lagrange points unlock early universe spectroscopy.',
    summary: 'An accessible physics explainer covering cosmic expansion, thermal shielding at the Sun-Earth L2 point, and how infrared sensors peer through interstellar dust clouds.',
    category: 'science-space',
    categoryName: 'Science & Space',
    labels: ['Science & Space', 'Astrophysics', 'Instrumentation'],
    authorName: 'TRENDVERSE Editorial Desk',
    authorRole: 'Science & Space Desk',
    publishedAt: '2026-11-02',
    updatedAt: '2026-11-14',
    readTimeMinutes: 7,
    trending: true,
    discoverGroup: 'editors-pick',
    schemaType: 'Article',
    imageAlt: 'Scientific orbital trajectory diagram of a segmented-mirror infrared telescope at L2',
    imageCaption: 'Fig. 4 — Multi-layer sunshields isolate cryogenic infrared detectors from solar radiation.',
    visualMotif: 'orbit',
    sections: [
      {
        id: 'cosmic-redshift-basics',
        heading: 'Cosmic Expansion and Wavelength Stretching',
        paragraphs: [
          'As light travels across billions of light-years through an expanding universe, the fabric of space stretches the electromagnetic wave itself. Ultraviolet and visible photons emitted by the earliest stars shift into longer infrared wavelengths by the time they reach Earth.',
          'Because Earth’s lower atmosphere contains water vapor and carbon dioxide that absorb most incoming infrared bands, high-precision infrared astronomy requires placing telescopes high above the troposphere in deep space.',
        ],
      },
      {
        id: 'lagrange-point-stability',
        heading: 'Operating at the Sun-Earth L2 Point',
        paragraphs: [
          'Located roughly 1.5 million kilometers beyond Earth away from the Sun, the second Sun-Earth Lagrange point (L2) allows an observatory to keep the Sun, Earth, and Moon continuously behind a single sunshield.',
          'This thermal geometry lets instruments cool passively below 40 Kelvin, preventing the telescope’s own warm mirrors from outshining faint galaxies billions of light-years away.',
        ],
      },
    ],
    sources: [
      {
        label: 'Infrared Astronomy & Space Observatories Overview',
        publisher: 'NASA Science',
        url: 'https://science.nasa.gov/universe/',
      },
      {
        label: 'ESA Lagrange Points Explained',
        publisher: 'European Space Agency (ESA)',
        url: 'https://www.esa.int/Science_Exploration/Space_Science/What_are_Lagrange_points',
      },
    ],
  },
  {
    id: 'art-ott-adaptive-streaming',
    slug: 'how-adaptive-bitrate-streaming-delivers-4k-cinema-worldwide',
    title: 'How Adaptive Bitrate Streaming Delivers 4K Cinema Across Variable Networks',
    subtitle: 'The encoding ladders, perceptual compression codecs, and CDN edge caching behind seamless global OTT playback.',
    summary: 'Explore how streaming platforms segment video into two-second chunks, switch codecs dynamically, and preserve cinema color fidelity on mobile connections.',
    category: 'entertainment',
    categoryName: 'Entertainment',
    labels: ['Entertainment', 'OTT Media', 'Video Engineering'],
    authorName: 'TRENDVERSE Editorial Desk',
    authorRole: 'Media & Culture Desk',
    publishedAt: '2026-11-05',
    updatedAt: '2026-11-15',
    readTimeMinutes: 5,
    discoverGroup: 'popular',
    schemaType: 'Article',
    imageAlt: 'Editorial illustration of cinema frame aspect ratios and adaptive bitrate streams',
    imageCaption: 'Fig. 5 — Adaptive streaming players switch resolution tiers between short media segments.',
    visualMotif: 'aperture',
    sections: [
      {
        id: 'abr-encoding-ladders',
        heading: 'Inside the Adaptive Bitrate Ladder',
        paragraphs: [
          'Every film or series delivered over modern over-the-top (OTT) platforms is encoded into a ladder of multiple resolutions and bitrates—ranging from compact 360p mobile streams up to 4K HDR masters—and sliced into small two-to-six-second segments.',
          'Using standards such as HLS and MPEG-DASH, the viewer’s media player continuously measures download throughput for each segment and seamlessly requests the highest quality tier that will arrive before the buffer empties.',
        ],
      },
      {
        id: 'modern-open-codecs',
        heading: 'Modern Codecs and Color Management',
        paragraphs: [
          'Royalty-free codecs such as AV1 deliver comparable visual sharpness at roughly 25 to 30 percent lower bitrates than legacy H.264 streams. That efficiency makes high-definition international streaming viable in regions where cellular data caps or rural bandwidth remain constrained.',
        ],
      },
    ],
    sources: [
      {
        label: 'AV1 Bitstream & Decoding Process Specification',
        publisher: 'Alliance for Open Media',
        url: 'https://aomediacodec.github.io/av1-spec/',
      },
      {
        label: 'Dynamic Adaptive Streaming over HTTP (DASH) Overview',
        publisher: 'MDN Web Docs',
        url: 'https://developer.mozilla.org/en-US/docs/Web/Media/DASH_Adaptive_Streaming_for_HTML_5_Video',
      },
    ],
  },
  {
    id: 'art-daylight-urban-architecture',
    slug: 'principles-of-biophilic-daylighting-in-modern-civic-workspaces',
    title: 'Principles of Daylighting and Acoustic Calm in Modern Civic Workspaces',
    subtitle: 'Why architectural daylight orientation, low-VOC timber, and acoustic zoning measurably improve focus in public libraries and studios.',
    summary: 'An evidence-based guide to building and workspace design standards that balance natural illumination, glare control, and acoustic comfort.',
    category: 'lifestyle',
    categoryName: 'Lifestyle',
    labels: ['Lifestyle', 'Architecture', 'Wellbeing'],
    authorName: 'TRENDVERSE Editorial Desk',
    authorRole: 'Design & Living Unit',
    publishedAt: '2026-11-09',
    updatedAt: '2026-11-16',
    readTimeMinutes: 5,
    discoverGroup: 'most-read',
    schemaType: 'Article',
    imageAlt: 'Geometric architectural composition of sunlit timber beams and reading bays',
    imageCaption: 'Fig. 6 — Indirect north-facing clerestory windows diffuse daylight without screen glare.',
    visualMotif: 'pavilion',
    sections: [
      {
        id: 'circadian-daylighting',
        heading: 'Balancing Natural Daylight Without Visual Glare',
        paragraphs: [
          'Architectural daylighting aims to bring high-CRI natural light deep into floorplates while avoiding direct solar glare on screens and reading surfaces. Clerestory windows, exterior louvers, and light shelves bounce sunlight across matte ceilings to illuminate interior rooms evenly.',
          'Research compiled by building-standard bodies shows that access to calibrated morning daylight supports circadian alignment without relying solely on harsh overhead artificial fixtures.',
        ],
      },
      {
        id: 'acoustic-zoning-strategies',
        heading: 'Acoustic Zoning for Shared Reading and Focus Rooms',
        paragraphs: [
          'Open-plan spaces frequently fail when conversation zones sit adjacent to quiet study desks. Effective contemporary civic buildings separate spaces by acoustic absorption tiers, pairing perforated wood baffles and upholstered alcoves with dedicated collaborative wings.',
        ],
      },
    ],
    sources: [
      {
        label: 'Indoor Environmental Quality & Daylighting Guidance',
        publisher: 'U.S. General Services Administration (GSA)',
        url: 'https://www.gsa.gov/real-estate/design-and-construction/design-excellence-program',
      },
      {
        label: 'Lighting and Health in Built Environments',
        publisher: 'World Health Organization (WHO) Housing & Health Guidelines',
        url: 'https://www.who.int/publications/i/item/9789241550376',
      },
    ],
  },
  {
    id: 'art-core-web-vitals-publishing',
    slug: 'engineering-zero-cls-digital-publications-for-global-mobile-readers',
    title: 'Engineering Zero-CLS Digital Publications for Global Mobile Readers',
    subtitle: 'How explicit aspect-ratio media containers, system-ready font stacks, and lightweight HTML keep editorial pages fast on every continent.',
    summary: 'A practical technical guide for web publishers covering Core Web Vitals, AdSense-safe layout reservations, and clean semantic HTML5.',
    category: 'technology-ai',
    categoryName: 'Technology & AI',
    labels: ['Technology & AI', 'Web Performance', 'Technical SEO'],
    authorName: 'TRENDVERSE Editorial Desk',
    authorRole: 'Web Performance Engineering Unit',
    publishedAt: '2026-11-12',
    updatedAt: '2026-11-18',
    readTimeMinutes: 6,
    discoverGroup: 'editors-pick',
    schemaType: 'Article',
    imageAlt: 'Technical layout wireframe illustrating reserved media and advertisement slots',
    imageCaption: 'Fig. 7 — Reserving explicit container dimensions eliminates layout jumps during ad and image loading.',
    visualMotif: 'network',
    sections: [
      {
        id: 'cumulative-layout-shift',
        heading: 'Eliminating Layout Shift Across Images and Ad Units',
        paragraphs: [
          'Cumulative Layout Shift (CLS) measures unexpected visual movement while a page loads. On content-rich news sites, un-sized images and dynamically injected advertisement slots are the two most common causes of jarring text jumps.',
          'Setting explicit CSS aspect ratios on media frames and reserving fixed minimum heights on advertisement containers guarantees that headline typography stays anchored from the first paint.',
        ],
      },
      {
        id: 'semantic-html-for-crawlers',
        heading: 'Semantic Document Structure and Structured Data',
        paragraphs: [
          'Clean semantic elements—including header, nav, main, article, and aside—help assistive screen readers and search engine parsers distinguish editorial prose from navigation chrome. Pairing clean markup with Schema.org JSON-LD provides unambiguous context without bloating page weight.',
        ],
      },
    ],
    sources: [
      {
        label: 'Optimize Cumulative Layout Shift (CLS)',
        publisher: 'web.dev / Google Search Central',
        url: 'https://web.dev/articles/optimize-cls',
      },
      {
        label: 'Introduction to Structured Data Markup in Google Search',
        publisher: 'Google Search Central',
        url: 'https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data',
      },
    ],
  },
  {
    id: 'art-compound-interest-and-real-yield',
    slug: 'understanding-real-yield-inflation-adjustment-and-compounding-horizons',
    title: 'Understanding Real Yield, Inflation Adjustment, and Compounding Horizons',
    subtitle: 'Why nominal return numbers can mislead savers, and how simple arithmetic separates purchasing-power growth from headline rates.',
    summary: 'An international financial literacy primer explaining nominal versus real returns, compounding frequency, and currency purchasing power.',
    category: 'business-finance',
    categoryName: 'Business & Finance',
    labels: ['Business & Finance', 'Personal Finance', 'Education'],
    authorName: 'TRENDVERSE Editorial Desk',
    authorRole: 'Economics & Markets Literacy Unit',
    publishedAt: '2026-11-15',
    updatedAt: '2026-11-18',
    readTimeMinutes: 5,
    discoverGroup: 'most-read',
    schemaType: 'Article',
    imageAlt: 'Minimalist chart geometry comparing nominal curves against inflation-adjusted real returns',
    imageCaption: 'Fig. 8 — Real purchasing power equals nominal compounding discounted by cumulative inflation.',
    visualMotif: 'ledger',
    sections: [
      {
        id: 'nominal-vs-real',
        heading: 'Nominal Yield Minus Inflation Equals Real Return',
        paragraphs: [
          'If a savings instrument yields 5 percent annually while consumer prices rise 3 percent over the same twelve months, the holder’s real purchasing-power gain is approximately 2 percent. Evaluating investments strictly in nominal terms overlooks erosion in what money actually buys.',
          'Using the Fisher equation—(1 + nominal rate) / (1 + inflation rate) - 1—gives savers an accurate cross-border benchmark regardless of local currency denomination.',
        ],
      },
      {
        id: 'horizon-sensitivity',
        heading: 'Why Time Horizon Dominates Short-Term Volatility',
        paragraphs: [
          'Over multi-decade horizons, small differences in annual fees or real compounding rates widen substantially due to exponential math. Clear percentage calculations and transparent fee comparisons remain essential tools for every household.',
        ],
      },
    ],
    sources: [
      {
        label: 'OECD/INFE International Survey of Adult Financial Literacy',
        publisher: 'OECD',
        url: 'https://www.oecd.org/en/topics/financial-education.html',
      },
    ],
  },
];

export function getArticleBySlug(slug: string, allArticles: Article[]): Article | undefined {
  return allArticles.find((a) => a.slug === slug || a.id === slug);
}
