export async function handleRetryError(
  error: any,
  retries: number,
  sendStatus: (message: string) => void
) {
  const waitTime = error?.status === 429 ? 5000 * (3 - retries) : 3000;
  sendStatus(
    `[DEBUG] ${error?.status === 429 ? 'Rate limit hit' : 'Error occurred'}, waiting ${waitTime / 1000}s before retry (${retries} retries left)`
  );
  await new Promise((resolve) => setTimeout(resolve, waitTime));
}
