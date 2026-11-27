const API_URL = 'http://localhost:3000';

export interface Plan {
  code: string;
  name: string;
  storage_limit_bytes: number;
}

export async function getPlan(code: string): Promise<Plan> {
  const response = await fetch(
    `${API_URL}/plan/${encodeURIComponent(code)}`,
    { credentials: 'include' },
  );
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Could not load your plan.');
  }

  return data as Plan;
}
