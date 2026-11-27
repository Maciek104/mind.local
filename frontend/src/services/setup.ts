const API_URL = 'http://localhost:3000';

export async function checkSetupStatus(): Promise<boolean> {
  const response = await fetch(`${API_URL}/setup/status`);

  if (!response.ok) {
    throw new Error('Could not check the application setup status.');
  }

  const data = await response.json();

  return data.initialized;
}
