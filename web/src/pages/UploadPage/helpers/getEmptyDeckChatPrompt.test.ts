import { describe, expect, it } from 'vitest';
import { getEmptyDeckChatPrompt } from './getEmptyDeckChatPrompt';

describe('getEmptyDeckChatPrompt', () => {
  it('returns pdf prompt when driveMimeType is application/pdf', () => {
    const prompt = getEmptyDeckChatPrompt('application/pdf', 'notes.pdf');
    expect(prompt).toContain('My PDF converted but produced 0 cards');
    expect(prompt).toContain('layout');
  });

  it('returns pdf prompt when filename has .pdf extension and no drive mime type', () => {
    const prompt = getEmptyDeckChatPrompt(null, 'notes.pdf');
    expect(prompt).toContain('My PDF converted but produced 0 cards');
  });

  it('returns notion-export prompt when filename has .zip extension', () => {
    const prompt = getEmptyDeckChatPrompt(null, 'export.zip');
    expect(prompt).toContain('My Notion export converted but produced 0 cards');
    expect(prompt).toContain('toggle blocks');
  });

  it('returns html prompt when filename has .html extension', () => {
    const prompt = getEmptyDeckChatPrompt(null, 'page.html');
    expect(prompt).toContain('My HTML file converted but produced 0 cards');
    expect(prompt).toContain('2anki look for');
  });

  it('returns markdown prompt when filename has .md extension', () => {
    const prompt = getEmptyDeckChatPrompt(null, 'notes.md');
    expect(prompt).toContain('My markdown file converted but produced 0 cards');
    expect(prompt).toContain('heading or list pattern');
  });

  it('returns fallback prompt with extension for docx files', () => {
    const prompt = getEmptyDeckChatPrompt(null, 'notes.docx');
    expect(prompt).toContain('docx');
    expect(prompt).toContain('0 cards');
  });

  it('returns fallback prompt for unknown extension', () => {
    const prompt = getEmptyDeckChatPrompt(null, 'data.csv');
    expect(prompt).toContain('csv');
    expect(prompt).toContain('0 cards');
  });

  it('uses drive mime type before filename extension', () => {
    const prompt = getEmptyDeckChatPrompt('application/pdf', 'export.zip');
    expect(prompt).toContain('PDF');
    expect(prompt).not.toContain('Notion export');
  });

  it('returns fallback with "file" when no filename and no mime type', () => {
    const prompt = getEmptyDeckChatPrompt(null, null);
    expect(prompt).toContain('file');
    expect(prompt).toContain('0 cards');
  });
});
