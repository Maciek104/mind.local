const API_URL = 'http://localhost:3000';

export async function checkAuthentication(): Promise<boolean> {
  const response = await fetch(`${API_URL}/auth/me`, {
    credentials: 'include',
  });

  if (response.status === 401) {
    return false;
  }

  if (!response.ok) {
    throw new Error('Nie udało się sprawdzić sesji użytkownika.');
  }

  return true;
}

export async function login(email: string, password: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message || 'Nie udało się zalogować.',
    );
  }
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  display_name: string | null;
  bio: string | null;
  profile_image_path: string | null;
  plan: string;
  role: string;
}

export async function getCurrentUser(): Promise<AuthenticatedUser> {
  const response = await fetch(`${API_URL}/auth/me`, {
    credentials: 'include',
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Nie udało się pobrać danych użytkownika.');
  }

  return data.user as AuthenticatedUser;
}

export interface UpdateUserInput {
  display_name?: string | null;
  bio?: string | null;
  profile_image_path?: string | null;
}

export async function updateCurrentUser(
  input: UpdateUserInput,
): Promise<AuthenticatedUser> {
  const response = await fetch(`${API_URL}/users/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message || 'Nie udało się zapisać profilu.',
    );
  }

  return data as AuthenticatedUser;
}

export async function uploadAvatar(file: File): Promise<AuthenticatedUser> {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch(`${API_URL}/users/me/avatar`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message || 'Nie udało się przesłać avatara.',
    );
  }

  return data as AuthenticatedUser;
}

export async function deleteAvatar(): Promise<AuthenticatedUser> {
  const response = await fetch(`${API_URL}/users/me/avatar`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Nie udało się usunąć avatara.');
  }

  return data as AuthenticatedUser;
}
