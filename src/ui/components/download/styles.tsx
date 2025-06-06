import React from 'react';

export const styles: {
  downloadContainer: React.CSSProperties;
  downloadHeader: React.CSSProperties;
  downloadList: React.CSSProperties;
  downloadItem: React.CSSProperties;
  downloadItemName: React.CSSProperties;
  downloadItemLinkHover: React.CSSProperties;
  downloadItemLink: React.CSSProperties;
  bulkDownloadButton: React.CSSProperties;
  pageDescription: React.CSSProperties;
  footer: React.CSSProperties;
  footerLink: React.CSSProperties;
} = {
  downloadContainer: {
    margin: '0 auto',
    maxWidth: '800px',
    padding: '30px',
    border: '1px solid #e1e4e8',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    backgroundColor: '#ffffff',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
  },
  downloadHeader: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '24px',
    color: '#2563eb',
  },
  downloadList: {
    listStyle: 'none',
    padding: '0',
    margin: '0',
  },
  downloadItem: {
    marginBottom: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: '6px',
    border: '1px solid #e1e4e8',
    overflow: 'hidden',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  },
  downloadItemName: {
    display: 'block',
    padding: '14px 20px',
    backgroundColor: '#f8fafc',
    textDecoration: 'none',
    color: '#334155',
    maxWidth: '70%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '15px',
    fontWeight: 500,
  },
  downloadItemLinkHover: {
    backgroundColor: '#dbeafe',
  },
  downloadItemLink: {
    padding: '14px 20px',
    backgroundColor: '#2563eb',
    color: 'white',
    textDecoration: 'none',
    fontWeight: 500,
    borderRadius: '0 4px 4px 0',
    transition: 'background-color 0.2s ease-in-out',
  },
  bulkDownloadButton: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#2563eb',
    color: 'white',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '16px',
    borderRadius: '6px',
    transition: 'background-color 0.2s ease-in-out, transform 0.1s ease',
    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
    border: 'none',
    cursor: 'pointer',
  },
  pageDescription: {
    color: '#64748b',
    fontSize: '16px',
    lineHeight: 1.6,
    marginBottom: '32px',
  },
  footer: {
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: '1px solid #e1e4e8',
    color: '#64748b',
    fontSize: '14px',
    textAlign: 'center' as const,
  },
  footerLink: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 500,
  },
};
