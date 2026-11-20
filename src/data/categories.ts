import { CategoryInfo } from '../types/editorial';

export const EDITORIAL_CATEGORIES: CategoryInfo[] = [
  {
    slug: 'technology-ai',
    name: 'Technology & AI',
    bloggerLabel: 'Technology & AI',
    shortDescription: 'Computing architecture, open web standards, machine learning fundamentals, and digital infrastructure.',
    seoDescription: 'Clear technical explainers covering artificial intelligence systems, cloud architecture, cybersecurity standards, and web engineering.',
    visualMotif: 'network',
  },
  {
    slug: 'world',
    name: 'World',
    bloggerLabel: 'World',
    shortDescription: 'Global logistics, international institutions, demographic shifts, and cross-border policy explainers.',
    seoDescription: 'Balanced international explainers examining global trade corridors, multilateral institutions, energy grids, and urban infrastructure.',
    visualMotif: 'meridian',
  },
  {
    slug: 'business-finance',
    name: 'Business & Finance',
    bloggerLabel: 'Business & Finance',
    shortDescription: 'Macroeconomic mechanics, monetary policy frameworks, capital allocation, and corporate fundamentals.',
    seoDescription: 'Educational guides on central banking, inflation measurement, balance sheets, international commerce, and long-term financial literacy.',
    visualMotif: 'ledger',
  },
  {
    slug: 'science-space',
    name: 'Science & Space',
    bloggerLabel: 'Science & Space',
    shortDescription: 'Orbital mechanics, infrared astronomy, climate telemetry, materials research, and earth observation.',
    seoDescription: 'Accessible scientific explainers on space observatories, satellite communications, physics instrumentation, and peer-reviewed earth science.',
    visualMotif: 'orbit',
  },
  {
    slug: 'entertainment',
    name: 'Entertainment',
    bloggerLabel: 'Entertainment',
    shortDescription: 'Global streaming economics, digital cinema mastering, audio formats, and cross-cultural media.',
    seoDescription: 'In-depth guides on international OTT distribution, cinema mastering workflows, spatial audio standards, and global media production.',
    visualMotif: 'aperture',
  },
  {
    slug: 'lifestyle',
    name: 'Lifestyle',
    bloggerLabel: 'Lifestyle',
    shortDescription: 'Sustainable urban architecture, ergonomic work environments, digital wellbeing, and civic spaces.',
    seoDescription: 'Practical international guides on sustainable design, healthy digital habits, civic architecture, and everyday productivity.',
    visualMotif: 'pavilion',
  },
];

export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  return EDITORIAL_CATEGORIES.find((c) => c.slug === slug);
}

export function mapBloggerLabelsToCategory(labels: string[]): CategoryInfo {
  const normalized = labels.map((l) => l.toLowerCase().trim());
  for (const cat of EDITORIAL_CATEGORIES) {
    if (
      normalized.includes(cat.name.toLowerCase()) ||
      normalized.includes(cat.slug) ||
      normalized.some((l) => cat.name.toLowerCase().includes(l) && l.length > 3)
    ) {
      return cat;
    }
  }
  if (normalized.some((l) => l.includes('ai') || l.includes('tech') || l.includes('software'))) {
    return EDITORIAL_CATEGORIES[0];
  }
  if (normalized.some((l) => l.includes('world') || l.includes('global') || l.includes('geo'))) {
    return EDITORIAL_CATEGORIES[1];
  }
  if (normalized.some((l) => l.includes('finance') || l.includes('business') || l.includes('econ'))) {
    return EDITORIAL_CATEGORIES[2];
  }
  if (normalized.some((l) => l.includes('science') || l.includes('space') || l.includes('astro'))) {
    return EDITORIAL_CATEGORIES[3];
  }
  if (normalized.some((l) => l.includes('ott') || l.includes('film') || l.includes('entertain'))) {
    return EDITORIAL_CATEGORIES[4];
  }
  if (normalized.some((l) => l.includes('life') || l.includes('design') || l.includes('health'))) {
    return EDITORIAL_CATEGORIES[5];
  }
  return EDITORIAL_CATEGORIES[0];
}
