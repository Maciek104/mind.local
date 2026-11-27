const API_URL = 'http://localhost:3000';

export interface AuthenticatedUser {
  id: string;
  email: string;
  display_name: string | null;
  bio: string | null;
  profile_image_path: string | null;
  plan: string;
  role: string;
}

export async function checkAuthentication(): Promise<AuthenticatedUser | null> {
  const response = await fetch(`${API_URL}/auth/me`, {
    credentials: 'include',
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Could not check the user session.');
  }

  const data = await response.json();
  return data.user as AuthenticatedUser;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthenticatedUser> {
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
        : data.message || 'Could not sign in.',
    );
  }

  return data.user as AuthenticatedUser;
}

export async function logout(): Promise<void> {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Could not log out. Please try again.');
  }
}

export async function getCurrentUser(): Promise<AuthenticatedUser> {
  const response = await fetch(`${API_URL}/auth/me`, {
    credentials: 'include',
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Could not load user details.');
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
        : data.message || 'Could not save your profile.',
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
        : data.message || 'Could not upload your avatar.',
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
    throw new Error(data.message || 'Could not remove your avatar.');
  }

  return data as AuthenticatedUser;
}
