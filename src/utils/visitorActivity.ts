export interface SavedStoryRecord {
  id: string;
  title: string;
  category: string;
  publisher: string;
  url: string;
  publishedAt: string;
  savedAt: string;
  isInternalSlug?: string;
}

export interface ReadingHistoryRecord {
  id: string;
  title: string;
  category: string;
  publisher: string;
  url: string;
  readAt: string;
  isInternalSlug?: string;
}

export interface VisitorActivityState {
  isReturningVisitor: boolean;
  firstVisitAt: string;
  previousVisitAt: string | null;
  currentVisitAt: string;
  readMap: Record<string, string>; // id -> ISO timestamp
  savedItems: SavedStoryRecord[];
  readingHistory: ReadingHistoryRecord[];
}

const STORAGE_KEY = 'trendverse_visitor_activity_v2';
const SESSION_KEY = 'trendverse_active_session_v2';

export function initVisitorActivity(): VisitorActivityState {
  const nowIso = new Date().toISOString();
  let stored: Partial<VisitorActivityState> | null = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    stored = raw ? (JSON.parse(raw) as Partial<VisitorActivityState>) : null;
  } catch {
    stored = null;
  }

  let hasActiveSession = false;
  try {
    hasActiveSession = Boolean(sessionStorage.getItem(SESSION_KEY));
  } catch {
    hasActiveSession = false;
  }

  if (!stored || !stored.firstVisitAt) {
    // First ever visit on this browser
    const initialState: VisitorActivityState = {
      isReturningVisitor: false,
      firstVisitAt: nowIso,
      previousVisitAt: null,
      currentVisitAt: nowIso,
      readMap: {},
      savedItems: [],
      readingHistory: [],
    };
    saveVisitorActivity(initialState);
    try {
      sessionStorage.setItem(SESSION_KEY, nowIso);
    } catch {
      // ignore
    }
    return initialState;
  }

  // Returning browser visit: if this is a fresh browser tab/session (or > 15 min gap),
  // promote the previous session timestamp to `previousVisitAt` so new stories appear clearly.
  let previousVisitAt = stored.previousVisitAt ?? null;
  let currentVisitAt = stored.currentVisitAt || stored.firstVisitAt;
  let isReturningVisitor = Boolean(stored.isReturningVisitor);

  if (!hasActiveSession) {
    previousVisitAt = currentVisitAt;
    currentVisitAt = nowIso;
    isReturningVisitor = true;
    try {
      sessionStorage.setItem(SESSION_KEY, nowIso);
    } catch {
      // ignore
    }
  }

  const nextState: VisitorActivityState = {
    isReturningVisitor,
    firstVisitAt: stored.firstVisitAt,
    previousVisitAt,
    currentVisitAt,
    readMap: stored.readMap ?? {},
    savedItems: Array.isArray(stored.savedItems) ? stored.savedItems : [],
    readingHistory: Array.isArray(stored.readingHistory) ? stored.readingHistory : [],
  };
  saveVisitorActivity(nextState);
  return nextState;
}

export function saveVisitorActivity(state: VisitorActivityState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}

export function clearVisitorActivity(): VisitorActivityState {
  const nowIso = new Date().toISOString();
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.setItem(SESSION_KEY, nowIso);
  } catch {
    // ignore
  }
  const fresh: VisitorActivityState = {
    isReturningVisitor: false,
    firstVisitAt: nowIso,
    previousVisitAt: null,
    currentVisitAt: nowIso,
    readMap: {},
    savedItems: [],
    readingHistory: [],
  };
  saveVisitorActivity(fresh);
  return fresh;
}
