import { AuthorProfile } from '../types/editorial';

/**
 * Transparent authorship and editorial oversight profiles.
 * Strictly factual — never fabricates fictional journalists, academic titles, or credentials.
 */
export const AUTHOR_PROFILES: Record<string, AuthorProfile> = {
  vicky: {
    id: 'vicky',
    name: 'Vicky',
    type: 'Person',
    role: 'Founder, Developer & Managing Editor',
    bio: 'Founder and lead developer of TRENDVERSE. Oversees platform architecture, technical explainers, web performance standards, and final human editorial review across the publication.',
    responsibilities: [
      'Final human review and publication sign-off before content enters the public sitemap',
      'Maintenance of primary source links, factual corrections, and publication timestamps',
      'Engineering of TRENDVERSE web utilities, Blogger templates, and live feed adapters',
    ],
    contactEmail: 'ui.vicky2002@gmail.com',
  },
  'editorial-desk': {
    id: 'editorial-desk',
    name: 'TRENDVERSE Editorial Desk',
    type: 'Organization',
    role: 'Research, Explainers & Verification Desk',
    bio: 'Collaborative editorial publishing desk operating under TRENDVERSE editorial guidelines and supervised by Founder Vicky. Evergreen explainers are compiled from institutional documentation and reviewed by a human editor before publication.',
    responsibilities: [
      'Synthesizing primary documentation from public standards bodies and multilateral institutions',
      'Distinguishing verified factual reporting from analysis and background context',
      'Recording transparent update dates and reader-reported corrections',
    ],
    contactEmail: 'ui.vicky2002@gmail.com',
  },
};

export function getAuthorProfile(authorId?: string): AuthorProfile {
  if (authorId && authorId in AUTHOR_PROFILES) {
    return AUTHOR_PROFILES[authorId];
  }
  return AUTHOR_PROFILES['editorial-desk'];
}
