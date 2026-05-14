export interface UnsplashPhoto {
  id: string;
  photographer: string;
  photographerUrl: string;
  location: string;
  year: string;
}

// Verify each attribution at https://unsplash.com/photos/{id}
export const NORWAY_PHOTOS: UnsplashPhoto[] = [
  {
    id: '1506905925346-21bda4d32df4',
    photographer: 'Kace Rodriguez',
    photographerUrl: 'https://unsplash.com/@kacerodriguez',
    location: 'Geiranger, Norway',
    year: '2018',
  },
  {
    id: '1469474968028-56623f02e42e',
    photographer: 'Tobias Mrzyk',
    photographerUrl: 'https://unsplash.com/@tobiasmrzyk',
    location: 'Nordfjordeid, Norway',
    year: '2016',
  },
  {
    id: '1531366936337-7c912a4589a7',
    photographer: 'Arto Marttinen',
    photographerUrl: 'https://unsplash.com/@wandervisions',
    location: 'Lofoten Islands, Norway',
    year: '2017',
  },
];

export function getDailyPhoto(): UnsplashPhoto {
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  return NORWAY_PHOTOS[dayIndex % NORWAY_PHOTOS.length];
}
