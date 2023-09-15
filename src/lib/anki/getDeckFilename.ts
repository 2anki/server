import Package from '../parser/Package';

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
  return name.endsWith('.apkg') ? name : `${name}.apkg`;
}
