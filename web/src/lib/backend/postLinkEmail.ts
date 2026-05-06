import { post } from './api';

const UNAUTHORIZED = 401;

export const postLinkEmail = async (email: string) => {
  try {
    const response = await post('/api/users/link_email', { email });
    if (response?.status === UNAUTHORIZED) {
      window.location.href = '/login';
      return undefined;
    }
    if (response?.status !== 200) {
      throw new Error(
        `Failed to link email: ${response?.statusText || 'Unknown error'}`
      );
    }
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
};
