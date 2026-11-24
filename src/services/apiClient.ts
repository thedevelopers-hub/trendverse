const rawConfiguredBase = (import.meta.env?.VITE_API_BASE_URL || '').trim();

function resolveApiBaseUrl(): string {
  if (!rawConfiguredBase) return '';

  const pointsToLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(
    rawConfiguredBase
  );
  const runningOnLocalhost =
    typeof window !== 'undefined' &&
    /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

  // Never send production traffic to localhost even if VITE_API_BASE_URL was misconfigured
  if (pointsToLocalhost && !runningOnLocalhost) {
    return '';
  }

  return rawConfiguredBase.replace(/\/+$/, '');
}

const API_BASE_URL = resolveApiBaseUrl();

export function buildApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}

export interface JsonFetchOptions extends RequestInit {
  allowErrorPayload?: boolean;
}

export async function fetchJsonApi<T>(
  path: string,
  options: JsonFetchOptions = {}
): Promise<{ status: number; ok: boolean; data: T }> {
  const { allowErrorPayload = false, headers, ...rest } = options;
  const url = buildApiUrl(path);

  const mergedHeaders = new Headers(headers);
  if (!mergedHeaders.has('Accept')) {
    mergedHeaders.set('Accept', 'application/json');
  }

  const res = await fetch(url, {
    ...rest,
    headers: mergedHeaders,
  });

  const contentType = (res.headers.get('content-type') || '').toLowerCase();
  const rawText = await res.text();

  const looksLikeHtmlOrPlain =
    contentType.includes('text/html') ||
    (!contentType.includes('application/json') &&
      !rawText.trim().startsWith('{') &&
      !rawText.trim().startsWith('['));

  if (looksLikeHtmlOrPlain) {
    throw new Error(
      `API endpoint returned non-JSON (${res.status} ${
        contentType || 'unknown content-type'
      }). Verify Vercel /api functions or backend deployment.`
    );
  }

  let parsed: T;
  try {
    parsed = JSON.parse(rawText) as T;
  } catch {
    throw new Error(`Invalid JSON payload received from ${path} (HTTP ${res.status}).`);
  }

  if (!res.ok && !allowErrorPayload) {
    const errMsg =
      typeof parsed === 'object' &&
      parsed !== null &&
      'errorMessage' in parsed &&
      typeof (parsed as { errorMessage?: unknown }).errorMessage === 'string'
        ? (parsed as { errorMessage: string }).errorMessage
        : `API request failed (${res.status})`;
    throw new Error(errMsg);
  }

  return { status: res.status, ok: res.ok, data: parsed };
}
