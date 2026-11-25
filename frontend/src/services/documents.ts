const API_URL = 'http://localhost:3000';

export interface DocumentItem {
  id: string;
  originalName: string;
  mimeType: string | null;
  fileSize: number;
  status: string;
  extractedText: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

async function parseError(response: Response): Promise<string> {
  const data = await response.json().catch(() => null);
  if (Array.isArray(data?.message)) {
    return data.message.join(', ');
  }
  return data?.message || 'Operacja na dokumencie nie powiodła się.';
}

export async function listDocuments(): Promise<DocumentItem[]> {
  const response = await fetch(`${API_URL}/documents`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function uploadDocument(file: File): Promise<DocumentItem> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/documents`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export async function deleteDocument(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/documents/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }
}

export async function downloadDocument(
  id: string,
  fileName: string,
): Promise<void> {
  const response = await fetch(`${API_URL}/documents/${id}/download`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
