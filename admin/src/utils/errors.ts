export function getErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return 'Could not connect to the API. Check that the backend is running at http://localhost:3000.';
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}
