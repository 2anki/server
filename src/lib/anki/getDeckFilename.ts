import Package from '../parser/Package';
import { getSafeFilename } from '../getSafeFilename';

function isPackage(something: unknown): something is Package {
  return something instanceof Package;
}

function isString(something: unknown): something is string {
  return typeof something === 'string';
}

export default function getDeckFilename(something: Package | string): string {
  let name = 'Default';
  if (isPackage(something)) {
    name = something.name;
  } else if (isString(something)) {
    name = something;
  }
  const safe = getSafeFilename(name);
  return safe.endsWith('.apkg') ? safe : `${safe}.apkg`;
}
