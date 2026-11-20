import {
  CareerAiAssistRequest,
  CareerAiAssistResponse,
  CareerCertificationProgram,
  CareerOpportunity,
  CareerProviderHealth,
  CareersOpportunitiesResponse,
  GovernmentPortalDirectoryItem,
  OfficialScholarshipDirectoryItem,
} from '../../server/types';

export interface CareersQueryParams {
  q?: string;
  country?: string;
  city?: string;
  employmentType?: string;
  workMode?: string;
  experience?: string;
  postedWithin?: string;
  salaryMin?: number;
  salaryOnly?: boolean;
  sort?: 'newest' | 'relevant' | 'salary-desc' | 'salary-asc';
  refresh?: boolean;
}

export interface ScholarshipsApiResponse {
  items: CareerOpportunity[];
  providers: CareerProviderHealth[];
  directory: OfficialScholarshipDirectoryItem[];
  lastUpdated: string;
  errorMessage?: string;
}

export interface GovernmentApiResponse {
  items: CareerOpportunity[];
  providers: CareerProviderHealth[];
  portals: GovernmentPortalDirectoryItem[];
  lastUpdated: string;
  errorMessage?: string;
}

export async function fetchCareerOpportunities(
  params: CareersQueryParams = {}
): Promise<CareersOpportunitiesResponse> {
  const qs = new URLSearchParams();
  if (params.q) qs.set('q', params.q);
  if (params.country && params.country !== 'All') qs.set('country', params.country);
  if (params.city) qs.set('city', params.city);
  if (params.employmentType && params.employmentType !== 'All') {
    qs.set('employmentType', params.employmentType);
  }
  if (params.workMode && params.workMode !== 'All') qs.set('workMode', params.workMode);
  if (params.experience && params.experience !== 'All') qs.set('experience', params.experience);
  if (params.postedWithin && params.postedWithin !== 'all') {
    qs.set('postedWithin', params.postedWithin);
  }
  if (params.salaryMin && params.salaryMin > 0) qs.set('salaryMin', String(params.salaryMin));
  if (params.salaryOnly) qs.set('salaryOnly', '1');
  if (params.sort) qs.set('sort', params.sort);
  if (params.refresh) qs.set('refresh', '1');

  const res = await fetch(`/api/careers/opportunities?${qs.toString()}`);
  const data = (await res.json()) as CareersOpportunitiesResponse;
  if (!res.ok && data.status !== 'partial') {
    throw new Error('Failed to load career opportunities.');
  }
  return data;
}

export async function fetchScholarships(
  country = 'All',
  refresh = false
): Promise<ScholarshipsApiResponse> {
  const qs = new URLSearchParams();
  if (country && country !== 'All') qs.set('country', country);
  if (refresh) qs.set('refresh', '1');
  const res = await fetch(`/api/careers/scholarships?${qs.toString()}`);
  if (!res.ok) throw new Error('Unable to load scholarship feeds.');
  return (await res.json()) as ScholarshipsApiResponse;
}

export async function fetchGovernmentJobs(
  country = 'All',
  refresh = false
): Promise<GovernmentApiResponse> {
  const qs = new URLSearchParams();
  if (country && country !== 'All') qs.set('country', country);
  if (refresh) qs.set('refresh', '1');
  const res = await fetch(`/api/careers/government?${qs.toString()}`);
  if (!res.ok) throw new Error('Unable to load government recruitment data.');
  return (await res.json()) as GovernmentApiResponse;
}

export async function fetchStudentCertifications(): Promise<{
  programs: CareerCertificationProgram[];
  lastUpdated: string;
}> {
  const res = await fetch('/api/careers/student-resources');
  if (!res.ok) throw new Error('Unable to load student certification resources.');
  return (await res.json()) as {
    programs: CareerCertificationProgram[];
    lastUpdated: string;
  };
}

export async function requestCareerAiAssist(
  payload: CareerAiAssistRequest
): Promise<CareerAiAssistResponse> {
  const res = await fetch('/api/careers/ai-assist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return (await res.json()) as CareerAiAssistResponse;
}
