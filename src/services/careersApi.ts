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
import { fetchJsonApi } from './apiClient';

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
  signal?: AbortSignal;
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
  if (params.refresh) {
    qs.set('refresh', '1');
    qs.set('_t', String(Date.now()));
  }

  const query = qs.toString();
  const { ok, data } = await fetchJsonApi<CareersOpportunitiesResponse>(
    query ? `/api/careers/opportunities?${query}` : '/api/careers/opportunities',
    {
      allowErrorPayload: true,
      signal: params.signal,
      cache: params.refresh ? 'no-store' : 'default',
    }
  );
  if (!ok && data.status !== 'partial') {
    const maybeErr = (data as CareersOpportunitiesResponse & { errorMessage?: string }).errorMessage;
    throw new Error(maybeErr || 'Failed to load career opportunities.');
  }
  return data;
}

export async function fetchScholarships(
  country = 'All',
  refresh = false,
  signal?: AbortSignal
): Promise<ScholarshipsApiResponse> {
  const qs = new URLSearchParams();
  if (country && country !== 'All') qs.set('country', country);
  if (refresh) {
    qs.set('refresh', '1');
    qs.set('_t', String(Date.now()));
  }
  const query = qs.toString();
  const { data } = await fetchJsonApi<ScholarshipsApiResponse>(
    query ? `/api/careers/scholarships?${query}` : '/api/careers/scholarships',
    {
      signal,
      cache: refresh ? 'no-store' : 'default',
    }
  );
  return data;
}

export async function fetchGovernmentJobs(
  country = 'All',
  refresh = false,
  signal?: AbortSignal
): Promise<GovernmentApiResponse> {
  const qs = new URLSearchParams();
  if (country && country !== 'All') qs.set('country', country);
  if (refresh) {
    qs.set('refresh', '1');
    qs.set('_t', String(Date.now()));
  }
  const query = qs.toString();
  const { data } = await fetchJsonApi<GovernmentApiResponse>(
    query ? `/api/careers/government?${query}` : '/api/careers/government',
    {
      signal,
      cache: refresh ? 'no-store' : 'default',
    }
  );
  return data;
}

export async function fetchStudentCertifications(
  signal?: AbortSignal
): Promise<{
  programs: CareerCertificationProgram[];
  lastUpdated: string;
}> {
  const { data } = await fetchJsonApi<{
    programs: CareerCertificationProgram[];
    lastUpdated: string;
  }>('/api/careers/student-resources', { signal });
  return data;
}

export async function requestCareerAiAssist(
  payload: CareerAiAssistRequest,
  signal?: AbortSignal
): Promise<CareerAiAssistResponse> {
  const { data } = await fetchJsonApi<CareerAiAssistResponse>('/api/careers/ai-assist', {
    method: 'POST',
    allowErrorPayload: true,
    signal,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return data;
}
