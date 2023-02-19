import formatDistance from 'date-fns/formatDistance';

export const getDistance = (date: Date | string): string => formatDistance(new Date(date), new Date());