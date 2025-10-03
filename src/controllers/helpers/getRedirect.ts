import { Request } from 'express';

const ALLOWED_REDIRECT_PATHS = [
  '/search',
  '/upload',
  '/downloads',
  '/favorites',
  '/templates',
  '/pricing',
  '/settings',
  '/anki',
];

const ALLOWED_REDIRECT_HOSTS = [
  'localhost:8080',
  'localhost:2020', 
  'dev.notion2anki.alemayhu.com',
  'dev.2anki.net',
  'notion.2anki.com',
  '2anki.net',
  '2anki.com',
  'notion.2anki.net',
  'dev.notion.2anki.net',
  'staging.2anki.net',
  'templates.2anki.net',
  'app.2anki.net',
];

const isValidRedirectUrl = (url: string): boolean => {
  try {
    // Check if it's a relative path (starts with /)
    if (url.startsWith('/')) {
      // Allow only specific internal paths
      return ALLOWED_REDIRECT_PATHS.some(allowedPath => 
        url === allowedPath || url.startsWith(allowedPath + '/')
      );
    }

    // For absolute URLs, validate the host
    const parsedUrl = new URL(url);
    
    // Only allow HTTPS (except localhost for development)
    if (parsedUrl.protocol !== 'https:' && 
        !parsedUrl.hostname.includes('localhost')) {
      return false;
    }
    
    // Check if host is in allow-list
    const hostWithPort = parsedUrl.host;
    return ALLOWED_REDIRECT_HOSTS.includes(hostWithPort);
    
  } catch {
    // Invalid URL format
    return false;
  }
};

export const getRedirect = (req: Request): string => {
  const redirectParam = req.query.redirect?.toString();
  
  if (!redirectParam) {
    return '/search';
  }
  
  if (isValidRedirectUrl(redirectParam)) {
    return redirectParam;
  }
  
  // If redirect URL is not valid, return safe default
  return '/search';
};
