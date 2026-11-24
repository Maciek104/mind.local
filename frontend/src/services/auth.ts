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
