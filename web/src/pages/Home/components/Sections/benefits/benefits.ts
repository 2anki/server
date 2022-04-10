export default [
  {
    icon: '/icons/benefit-icon-1.svg',
    title: 'All of the Anki note types are supported.',
    description:
        'Support a lot of media like basic cards, reversed cards, cloze deletion, and input card',
  },
  {
    title: 'Rich media support',
    icon: '/icons/benefit-icon-2.svg',
    description: 'Support a lot of media like images, emojis, embeds and Math.',
  },
  {
    icon: '/icons/benefit-icon-3.svg',
    title: 'Mobile friendly',
    description:
        'The website works fine with your browser on iOS and Android. To see how people use it watch',
  },
];

export interface Benefit {
  icon: string;
  title: string;
  description: string;
}
