import { useCallback, useState } from 'react';

export type ValidationStatus = 'clean' | 'info' | 'warning' | 'error';

export interface FileValidationResult {
  status: ValidationStatus;
  title: string;
  body: string;
  continueLabel: string;
}

export function detectUploadIssues(
  files: FileList | File[]
): FileValidationResult | null {
  const fileArray = Array.from(files);
  if (fileArray.length === 0) return null;

  const allMarkdown = fileArray.every((f) =>
    f.name.toLowerCase().endsWith('.md')
  );
  if (allMarkdown) {
    return {
      status: 'error',
      title: 'Markdown files make simple cards, not Notion-style decks',
      body: 'If you exported from Notion, choose HTML instead of Markdown in Notion\'s export menu — you\'ll keep your images, toggles, and formatting. If this is a plain Markdown file, you can continue, but cards will be based on bullet pairs, not toggles.',
      continueLabel: 'Continue with this file',
    };
  }

  const htmlFiles = fileArray.filter((f) =>
    f.name.toLowerCase().endsWith('.html')
  );

  if (htmlFiles.length >= 2) {
    return {
      status: 'warning',
      title: 'Did Safari unzip your Notion export?',
      body: 'If your files came from a Notion export, the images might have been left behind when Safari unpacked the zip. For the best results, re-download the export from Notion using a different browser, or find the original zip in your Downloads folder and upload that instead.',
      continueLabel: 'Continue with these files',
    };
  }

  const allPdf = fileArray.every((f) =>
    f.name.toLowerCase().endsWith('.pdf')
  );
  if (allPdf) {
    return {
      status: 'info',
      title: 'Each pair of pages becomes one card',
      body: "Page 1 is the front of your first card, page 2 is the back, page 3 is the next front, and so on. This works well for lecture slides where each topic spans two pages. You can customize how cards are created in Card Options.",
      continueLabel: 'Make cards from this PDF',
    };
  }

  if (fileArray.length === 1 && htmlFiles.length === 1) {
    return {
      status: 'warning',
      title: 'This will work, but images won’t be included',
      body: 'A single HTML file doesn\'t carry its images with it. If you exported this from Notion, go back and download the zip file instead — it bundles the images. If you don\'t need images, continue and we\'ll make your deck without them.',
      continueLabel: 'Continue without images',
    };
  }

  return null;
}

export function useFileValidation() {
  const [validation, setValidation] = useState<FileValidationResult | null>(
    null
  );
  const [pendingFiles, setPendingFiles] = useState<FileList | null>(null);

  const validate = useCallback(
    (files: FileList): boolean => {
      const result = detectUploadIssues(files);
      if (result) {
        setValidation(result);
        setPendingFiles(files);
        return false;
      }
      setValidation(null);
      setPendingFiles(null);
      return true;
    },
    []
  );

  const reset = useCallback(() => {
    setValidation(null);
    setPendingFiles(null);
  }, []);

  return { validation, pendingFiles, validate, reset };
}
