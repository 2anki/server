import { Request } from 'express';
import { getRedirect } from './getRedirect';

// Mock Request object factory
const createMockRequest = (redirectParam?: string): Request => {
  return {
    query: redirectParam ? { redirect: redirectParam } : {},
  } as Request;
};

describe('getRedirect security tests', () => {
  describe('should return safe default for missing redirect', () => {
    it('should return /search when no redirect param', () => {
      const req = createMockRequest();
      expect(getRedirect(req)).toBe('/search');
    });

    it('should return /search when redirect param is undefined', () => {
      const req = createMockRequest(undefined);
      expect(getRedirect(req)).toBe('/search');
    });
  });

  describe('should allow valid internal paths', () => {
    const validPaths = [
      '/search',
      '/upload',
      '/downloads', 
      '/favorites',
      '/templates',
      '/pricing',
      '/settings',
      '/anki',
      '/search/results',
      '/templates/new',
    ];

    validPaths.forEach(path => {
      it(`should allow valid internal path: ${path}`, () => {
        const req = createMockRequest(path);
        expect(getRedirect(req)).toBe(path);
      });
    });
  });

  describe('should block malicious redirects', () => {
    const maliciousUrls = [
      'http://evil.com',
      'https://evil.com',
      'https://malicious.example.com',
      'https://2anki.net.evil.com',
      'https://app.2anki.net.attacker.com',
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      '//evil.com',
      '/\\evil.com',
      'https://phishing-site.com',
    ];

    maliciousUrls.forEach(url => {
      it(`should block malicious URL: ${url}`, () => {
        const req = createMockRequest(url);
        expect(getRedirect(req)).toBe('/search');
      });
    });
  });

  describe('should allow legitimate external domains', () => {
    const legitimateUrls = [
      'https://2anki.net',
      'https://app.2anki.net', 
      'https://notion.2anki.net',
      'https://staging.2anki.net',
      'https://templates.2anki.net',
    ];

    legitimateUrls.forEach(url => {
      it(`should allow legitimate domain: ${url}`, () => {
        const req = createMockRequest(url);
        expect(getRedirect(req)).toBe(url);
      });
    });
  });

  describe('should block invalid paths', () => {
    const invalidPaths = [
      '/admin',
      '/config', 
      '/secret',
      '/api/internal',
      '/../../etc/passwd',
      '/malicious',
    ];

    invalidPaths.forEach(path => {
      it(`should block invalid internal path: ${path}`, () => {
        const req = createMockRequest(path);
        expect(getRedirect(req)).toBe('/search');
      });
    });
  });

  describe('should handle edge cases', () => {
    it('should block empty string', () => {
      const req = createMockRequest('');
      expect(getRedirect(req)).toBe('/search');
    });

    it('should block invalid URL formats', () => {
      const req = createMockRequest('not-a-url');
      expect(getRedirect(req)).toBe('/search');
    });

    it('should block non-HTTPS external URLs (except localhost)', () => {
      const req = createMockRequest('http://2anki.net');
      expect(getRedirect(req)).toBe('/search');
    });
  });
});