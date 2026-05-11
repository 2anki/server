export interface LandingFaq {
  q: string;
  a: string;
}

export interface LandingCopy {
  pathname: string;
  title: string;
  description: string;
  h1: string;
  subhead: string;
  faqs: LandingFaq[];
}
