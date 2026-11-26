export function getErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return 'Nie można połączyć się z API. Sprawdź, czy backend działa pod adresem http://localhost:3000.';
  }
  return error instanceof Error ? error.message : 'Wystąpił nieoczekiwany błąd.';
}
