import type {
  Project,
  ProjectSummary,
  Asset,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateLinkAssetRequest,
  UpdateLinkAssetRequest,
  CreateFileAssetRequest,
  UpdateFileAssetRequest,
  CreateVideoAssetRequest,
  UpdateVideoAssetRequest,
} from '../types';

// All API calls are prefixed with /api.
// In development, Vite's proxy forwards /api/* to localhost:3000.
// In production, set VITE_API_URL as an environment variable instead.
const BASE = '/api';

// A small helper that throws on non-2xx responses with a readable message.
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? `Request failed: ${res.status}`);
  }
  // 204 No Content has no body
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
export const projectsApi = {
  list: () =>
    request<ProjectSummary[]>('/projects'),

  get: (id: string) =>
    request<Project>(`/projects/${id}`),

  create: (data: CreateProjectRequest) =>
    request<Project>('/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateProjectRequest) =>
    request<Project>(`/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  remove: (id: string) =>
    request<void>(`/projects/${id}`, { method: 'DELETE' }),
};

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------
export const assetsApi = {
  list: (projectId: string) =>
    request<Asset[]>(`/projects/${projectId}/assets`),

  createLink: (projectId: string, data: CreateLinkAssetRequest) =>
    request<Asset>(`/projects/${projectId}/assets/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  updateLink: (projectId: string, assetId: string, data: UpdateLinkAssetRequest) =>
    request<Asset>(`/projects/${projectId}/assets/${assetId}/links`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  createFile: (projectId: string, data: CreateFileAssetRequest) => {
    const form = new FormData();
    form.append('name', data.name);
    form.append('type', data.type);
    // 'file' must match the field name in FileInterceptor('file') on the backend
    form.append('file', data.file);
    return request<Asset>(`/projects/${projectId}/assets/files`, {
      method: 'POST',
      body: form,
    });
  },

  updateFile: (projectId: string, assetId: string, data: UpdateFileAssetRequest) => {
    const form = new FormData();
    if (data.name) form.append('name', data.name);
    form.append('file', data.file);
    return request<Asset>(`/projects/${projectId}/assets/${assetId}/files`, {
      method: 'PATCH',
      body: form,
    });
  },

  createVideo: (projectId: string, data: CreateVideoAssetRequest) =>
    request<Asset>(`/projects/${projectId}/assets/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  updateVideo: (projectId: string, assetId: string, data: UpdateVideoAssetRequest) =>
    request<Asset>(`/projects/${projectId}/assets/${assetId}/videos`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  remove: (projectId: string, assetId: string) =>
    request<void>(`/projects/${projectId}/assets/${assetId}`, {
      method: 'DELETE',
    }),
};