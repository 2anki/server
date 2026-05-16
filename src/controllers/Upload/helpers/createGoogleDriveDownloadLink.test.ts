import { describe, expect, it } from '@jest/globals';
import {
  createGoogleDriveDownloadLink,
  createGoogleDriveExportLink,
  NATIVE_GOOGLE_APPS_EXPORT_MIMES,
} from './createGoogleDriveDownloadLink';

const baseFile = {
  id: 'file123',
  name: 'My Doc',
  mimeType: 'application/vnd.google-apps.document',
  iconUrl: '',
  url: '',
  sizeBytes: 0,
  embedUrl: '',
  description: '',
  driveSuccess: true,
  isShared: false,
  lastEditedUtc: 0,
  serviceId: '',
  type: 'document',
};

describe('createGoogleDriveDownloadLink', () => {
  it('returns an alt=media download URL for a binary file', () => {
    const file = { ...baseFile, mimeType: 'application/pdf' };
    expect(createGoogleDriveDownloadLink(file)).toBe(
      'https://www.googleapis.com/drive/v3/files/file123?alt=media'
    );
  });
});

describe('createGoogleDriveExportLink', () => {
  it('returns an export URL with the given mime type', () => {
    expect(createGoogleDriveExportLink(baseFile, 'text/html')).toBe(
      'https://www.googleapis.com/drive/v3/files/file123/export?mimeType=text%2Fhtml'
    );
  });

  it('encodes the mime type correctly for CSV', () => {
    expect(createGoogleDriveExportLink(baseFile, 'text/csv')).toBe(
      'https://www.googleapis.com/drive/v3/files/file123/export?mimeType=text%2Fcsv'
    );
  });

  it('encodes the mime type correctly for PDF', () => {
    expect(
      createGoogleDriveExportLink(baseFile, 'application/pdf')
    ).toBe(
      'https://www.googleapis.com/drive/v3/files/file123/export?mimeType=application%2Fpdf'
    );
  });
});

describe('NATIVE_GOOGLE_APPS_EXPORT_MIMES', () => {
  it('maps google-apps.document to text/html with .html extension', () => {
    expect(NATIVE_GOOGLE_APPS_EXPORT_MIMES['application/vnd.google-apps.document']).toEqual({
      exportMime: 'text/html',
      extension: '.html',
    });
  });

  it('maps google-apps.spreadsheet to text/csv with .csv extension', () => {
    expect(NATIVE_GOOGLE_APPS_EXPORT_MIMES['application/vnd.google-apps.spreadsheet']).toEqual({
      exportMime: 'text/csv',
      extension: '.csv',
    });
  });

  it('maps google-apps.presentation to application/pdf with .pdf extension', () => {
    expect(NATIVE_GOOGLE_APPS_EXPORT_MIMES['application/vnd.google-apps.presentation']).toEqual({
      exportMime: 'application/pdf',
      extension: '.pdf',
    });
  });

  it('does not include google-apps.folder', () => {
    expect(
      NATIVE_GOOGLE_APPS_EXPORT_MIMES['application/vnd.google-apps.folder']
    ).toBeUndefined();
  });
});
