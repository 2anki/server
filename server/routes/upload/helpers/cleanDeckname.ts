export default function cleanDeckName(name: string) {
  const includesEmoji = name.startsWith('&#x');
  return includesEmoji ? name.split(' ').slice(1).join('').trim() : name;
}
