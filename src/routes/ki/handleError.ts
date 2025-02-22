export function handleError(
  error: any,
  name: string,
  sendStatus: (message: string) => void
) {
  console.error(`Error processing file ${name}:`, error);
  const errorMessage = error?.message || 'Unknown error occurred';
  sendStatus(`[ERROR] Failed to process file ${name}: ${errorMessage}`);
  throw error;
}
