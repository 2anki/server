export interface UnsplashPhoto {
  id: string;
  photographer: string;
  photographerUrl: string;
  location: string;
  year: string;
}

export const NORWAY_PHOTOS: UnsplashPhoto[] = [
  {
    id: '1516612927263-e5040535da16',
    photographer: 'Michael Ankes',
    photographerUrl: 'https://unsplash.com/@w83design',
    location: 'Holmenkollen, Oslo',
    year: '2018',
  },
  {
    id: '1662357259439-df552e3f8f97',
    photographer: 'Stig Husby',
    photographerUrl: 'https://unsplash.com/@stighusby',
    location: 'Holmenkollen, Oslo',
    year: '2022',
  },
];

export function getDailyPhoto(): UnsplashPhoto {
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  return NORWAY_PHOTOS[dayIndex % NORWAY_PHOTOS.length];
}
