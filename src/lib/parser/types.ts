export interface TagElement {
  tagName: string;
  attribs: { [key: string]: string };
}

export interface ToggleHeading {
  details: string | null;
  summary: string | null;
}
