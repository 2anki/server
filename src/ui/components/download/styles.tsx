import React from 'react';

export const styles: {
  pageBackground: React.CSSProperties;
  container: React.CSSProperties;
  h1: React.CSSProperties;
  subhead: React.CSSProperties;
  ctaRow: React.CSSProperties;
  ctaButton: React.CSSProperties;
  expiryLine: React.CSSProperties;
  list: React.CSSProperties;
  listItem: React.CSSProperties;
  itemLink: React.CSSProperties;
  itemName: React.CSSProperties;
  itemSize: React.CSSProperties;
  itemDownload: React.CSSProperties;
  stickyBar: React.CSSProperties;
  stickyBarInner: React.CSSProperties;
  footer: React.CSSProperties;
  footerLink: React.CSSProperties;
} = {
  pageBackground: {
    margin: 0,
    padding: 0,
    backgroundColor: '#f8fafc',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
  },
  container: {
    margin: '0 auto',
    maxWidth: '720px',
    padding: '32px 24px',
  },
  h1: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 8px 0',
  },
  subhead: {
    fontSize: '15px',
    color: '#64748b',
    margin: '0 0 24px 0',
  },
  ctaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap' as const,
    marginBottom: '32px',
  },
  ctaButton: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '15px',
    borderRadius: '6px',
    whiteSpace: 'nowrap' as const,
  },
  expiryLine: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 40px 0',
    borderTop: '1px solid #e2e8f0',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #e2e8f0',
    gap: '12px',
  },
  itemLink: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    textDecoration: 'none',
    color: 'inherit',
    gap: '12px',
    minWidth: 0,
  },
  itemName: {
    flex: 1,
    fontSize: '15px',
    fontWeight: '500',
    color: '#1e293b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  itemSize: {
    fontSize: '13px',
    color: '#94a3b8',
    whiteSpace: 'nowrap' as const,
  },
  itemDownload: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#2563eb',
    textDecoration: 'none',
    padding: '4px 12px',
    border: '1px solid #2563eb',
    borderRadius: '4px',
    whiteSpace: 'nowrap' as const,
  },
  stickyBar: {
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
    backgroundColor: '#1e293b',
    borderBottom: '1px solid #334155',
    padding: '10px 24px',
  },
  stickyBarInner: {
    margin: '0 auto',
    maxWidth: '720px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  },
  footer: {
    paddingTop: '24px',
    borderTop: '1px solid #e2e8f0',
    textAlign: 'center' as const,
    fontSize: '14px',
    color: '#94a3b8',
  },
  footerLink: {
    color: '#64748b',
    textDecoration: 'none',
    fontWeight: '500',
  },
};
