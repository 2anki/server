export default function cleanDeckName(name: string) {
  let _name = name;
  if (name.startsWith('&#x')) {
    _name = name.split(' ').slice(1).join('').trim();
  }
  return _name;
}
