import axios from 'axios';

const isExpiredOrMissing = (status: number | undefined): boolean =>
  status === 403 || status === 404;

export async function downloadMediaOrSkip(url: string): Promise<Buffer | null> {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && isExpiredOrMissing(error.response?.status)) {
      console.warn(
        `Skipping media fetch for ${url} — received ${error.response?.status} (URL likely expired)`
      );
      return null;
    }
    throw error;
  }
}
