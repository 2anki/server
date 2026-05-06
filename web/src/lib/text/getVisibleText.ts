import APP_DOCUMENT from './app.document.json';

interface AppDocument {
  [key: string]: string;
}

export const getVisibleText = (key: string): string => {
  const document: AppDocument = APP_DOCUMENT;
  return document[key] ?? key;
};
