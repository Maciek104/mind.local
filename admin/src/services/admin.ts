const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export interface AdminUser {
  id: string;
  email: string;
  display_name: string | null;
  bio: string | null;
  profile_image_path: string | null;
  plan: string;
  role: 'USER' | 'ADMIN';
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface AdminPlan {
  code: string;
  name: string;
  storage_limit_bytes: number;
  allowed_models: string[];
  created_at: string;
  updated_at: string;
}

export interface PlanInput {
  name: string;
  storage_limit_bytes: number;
  allowed_models: string[];
}

export interface AdminDocument {
  id: string;
  originalName: string;
  mimeType: string | null;
  fileSize: number;
  status: string;
  createdAt: string;
  userId: string;
  userEmail: string;
  userDisplayName: string | null;
}

export interface UserInput {
  email: string;
  display_name: string;
  plan: string;
  password?: string;
}

export function getUserAvatarUrl(userId: string, version: string): string {
  return `${API_URL}/users/${encodeURIComponent(userId)}/avatar?v=${encodeURIComponent(version)}`;
}

async function readError(response: Response): Promise<string> {
  const data = await response.json() as { message?: string | string[] };
  return Array.isArray(data.message)
    ? data.message.join(', ')
    : data.message || 'A server communication error occurred.';
}

async function requestJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<T>;
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const response = await fetch(`${API_URL}/auth/me`, {
    credentials: 'include',
  });

  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const data = await response.json() as { user: AdminUser };
  return data.user;
}

export async function login(email: string, password: string): Promise<AdminUser> {
  const data = await requestJson<{ user: AdminUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return data.user;
}

export async function logout(): Promise<void> {
  await requestJson('/auth/logout', { method: 'POST' });
}

export function listUsers(): Promise<AdminUser[]> {
  return requestJson('/users');
}

export function listPlans(): Promise<AdminPlan[]> {
  return requestJson('/plan');
}

export function updatePlan(code: string, input: PlanInput): Promise<AdminPlan> {
  return requestJson(`/plan/${encodeURIComponent(code)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function createUser(input: UserInput & { password: string }): Promise<AdminUser> {
  return requestJson('/users', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateUser(id: string, input: UserInput): Promise<AdminUser> {
  return requestJson(`/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function uploadUserAvatar(id: string, file: File): Promise<AdminUser> {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await fetch(`${API_URL}/users/${encodeURIComponent(id)}/avatar`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  return response.json() as Promise<AdminUser>;
}

export function deleteUserAvatar(id: string): Promise<AdminUser> {
  return requestJson(`/users/${encodeURIComponent(id)}/avatar`, {
    method: 'DELETE',
  });
}

export function setUserActive(id: string, is_active: boolean): Promise<AdminUser> {
  return requestJson(`/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active }),
  });
}

export async function deleteUser(id: string): Promise<void> {
  await requestJson(`/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function listDocuments(): Promise<AdminDocument[]> {
  return requestJson('/documents/admin');
}

export async function downloadDocument(document: AdminDocument): Promise<void> {
  const response = await fetch(
    `${API_URL}/documents/admin/${encodeURIComponent(document.id)}/download`,
    { credentials: 'include' },
  );
  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const objectUrl = URL.createObjectURL(await response.blob());
  const link = window.document.createElement('a');
  link.href = objectUrl;
  link.download = document.originalName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
