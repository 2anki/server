export interface SidebarItem {
  label: string;
  slug: string;
  href?: string;
}

export interface SidebarGroup {
  label: string;
  items: SidebarItem[];
}

export const sidebar: SidebarGroup[] = [
  {
    label: 'Guides',
    items: [
      { label: 'Introduction', slug: 'guides/introduction' },
      { label: 'Getting started', slug: 'guides/getting-started' },
    ],
  },
  {
    label: 'Features',
    items: [
      { label: 'Notion Support', slug: 'features/notion-support' },
      { label: 'Markdown', slug: 'features/markdown' },
      { label: 'HTML', slug: 'features/html' },
      { label: 'zip', slug: 'features/zip' },
      { label: 'csv', slug: 'features/csv' },
      { label: 'xlsx', slug: 'features/xlsx' },
      { label: 'tsv', slug: 'features/tsv' },
      { label: 'pdf', slug: 'features/pdf' },
      { label: 'ppt', slug: 'features/ppt' },
    ],
  },
  {
    label: 'Advanced usage',
    items: [
      { label: 'Self-hosting', slug: 'advanced/self-hosting' },
      { label: 'Terminology', slug: 'advanced/terminology' },
      { label: 'API access', slug: 'advanced/napi' },
      { label: 'Domain', slug: 'advanced/domain' },
      { label: 'Strategy', slug: 'advanced/strategy' },
    ],
  },
  {
    label: 'Troubleshooting',
    items: [
      {
        label: 'Common problems and solutions',
        slug: 'troubleshooting/common-problems',
      },
      {
        label: 'How to contact developer',
        slug: 'troubleshooting/contact',
      },
      {
        label: 'Frequently asked questions',
        slug: 'troubleshooting/faq',
      },
      { label: 'Bug report', slug: 'troubleshooting/bug-report' },
      { label: 'Limits', slug: 'troubleshooting/limits' },
    ],
  },
  {
    label: 'Useful links',
    items: [
      { label: 'Anki', slug: 'links/anki' },
      { label: 'Community', slug: 'links/community' },
      { label: 'YouTube', slug: 'links/youtube' },
      { label: 'Support', slug: 'links/support' },
    ],
  },
  {
    label: 'Misc',
    items: [
      { label: 'Terms of Service', slug: 'misc/terms-of-service' },
      { label: 'Privacy Policy', slug: 'misc/privacy-policy' },
    ],
  },
];

export function findAdjacent(slug: string) {
  const flat: SidebarItem[] = sidebar
    .flatMap((group) => group.items)
    .filter((item) => !item.href);
  const index = flat.findIndex((item) => item.slug === slug);
  return {
    prev: index > 0 ? flat[index - 1] : null,
    next: index >= 0 && index < flat.length - 1 ? flat[index + 1] : null,
  };
}
