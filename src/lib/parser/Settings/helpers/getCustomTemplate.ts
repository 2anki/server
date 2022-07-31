import { TemplateFile } from '../types';

export const getCustomTemplate = (
  storageKey: string,
  templates: TemplateFile[]
): TemplateFile | null =>
  templates.find((tm: TemplateFile) => tm.storageKey === storageKey) ?? null;
