import {
  LeafUploadResponse,
  LeafAnalysis,
  LeafReportResponse,
  PopUploadResponse,
  VirtualPopRequest,
  VirtualPopResponse,
  LeaderboardEntry,
  UserStats,
  PopHistoryItem,
} from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

function getErrorMessage(payload: any, fallback: string): string {
  if (!payload) return fallback;

  if (typeof payload === 'string') return payload;

  if (typeof payload === 'object') {
    if (payload.error) {
      if (typeof payload.error.message === 'string') return payload.error.message;
      if (Array.isArray(payload.error.message)) {
        return payload.error.message.map((item: any) => typeof item === 'string' ? item : item?.msg || JSON.stringify(item)).join(', ');
      }
      if (payload.error.code) return `${payload.error.code}: ${JSON.stringify(payload.error)}`;
    }

    if (typeof payload.detail === 'string') return payload.detail;
    if (Array.isArray(payload.detail)) {
      return payload.detail.map((item: any) => typeof item === 'string' ? item : item?.msg || JSON.stringify(item)).join(', ');
    }

    if (payload.message) return payload.message;
  }

  return fallback;
}

function getAuthHeaders(token?: string | null, isMultipart = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  const bearerToken = token || (typeof window !== 'undefined' ? localStorage.getItem('leafpop_token') : null) || 'demo-token';
  if (bearerToken) {
    headers['Authorization'] = `Bearer ${bearerToken}`;
  }
  return headers;
}

export async function checkHealth(): Promise<{ status: string; environment?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/health`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return { status: 'error', environment: err.message };
  }
}

export async function uploadLeaf(file: File, token?: string | null): Promise<LeafUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/leaves/upload`, {
    method: 'POST',
    headers: getAuthHeaders(token, true),
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.detail || "Couldn't upload that leaf. Try another photo.");
  }
  return data;
}

export async function analyzeLeaf(leafId: string, token?: string | null): Promise<{ leaf_id: string; analysis: LeafAnalysis }> {
  const res = await fetch(`${BASE_URL}/leaves/${leafId}/analyze`, {
    method: 'POST',
    headers: getAuthHeaders(token),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.detail || "Failed to analyze leaf.");
  }
  return data;
}

export async function getLeafReport(leafId: string): Promise<LeafReportResponse> {
  const res = await fetch(`${BASE_URL}/leaves/${leafId}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.detail || "Failed to fetch leaf report.");
  }
  return data;
}

export async function uploadPopAudio(file: File, leafId?: string | null, token?: string | null, source: 'uploaded' | 'recorded' = 'uploaded'): Promise<PopUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (leafId) {
    formData.append('leaf_id', leafId);
  }
  formData.append('source', source);

  const res = await fetch(`${BASE_URL}/pops/upload`, {
    method: 'POST',
    headers: getAuthHeaders(token, true),
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    if (res.status === 422 && data.error?.code === 'POP_NOT_DETECTED') {
      throw new Error("We heard something... but not enough of a pop.");
    }
    throw new Error(data.error?.message || data.detail || "We couldn't find a clean pop in that recording.");
  }
  return data;
}

export async function getPopResult(popId: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/pops/${popId}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.detail || "Failed to fetch pop result.");
  }
  return data;
}

export async function submitVirtualPop(payload: VirtualPopRequest, token?: string | null): Promise<VirtualPopResponse> {
  const res = await fetch(`${BASE_URL}/virtual/pop`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(getErrorMessage(data, "Virtual pop failed to record."));
  }
  return data;
}

export async function getLeaderboard(mode: 'all' | 'real' | 'virtual' = 'all', limit = 20, source: 'all' | 'uploaded' | 'recorded' = 'all'): Promise<LeaderboardEntry[]> {
  const sourceQuery = source === 'all' ? '' : `&source=${source}`;
  const res = await fetch(`${BASE_URL}/leaderboard?mode=${mode}&limit=${limit}${sourceQuery}`, {
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.detail || "Failed to fetch leaderboard.");
  }
  return data.leaderboard || [];
}

export async function getMyStats(token?: string | null): Promise<UserStats> {
  const res = await fetch(`${BASE_URL}/users/me/stats`, {
    headers: getAuthHeaders(token),
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.detail || "Failed to load user statistics.");
  }
  return data;
}

export async function getMyPopHistory(token?: string | null): Promise<PopHistoryItem[]> {
  const res = await fetch(`${BASE_URL}/users/me/pops`, {
    headers: getAuthHeaders(token),
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || data.detail || "Failed to load pop history.");
  }
  return data.pops || [];
}
