// Ref: https://edvins.io/how-to-strip-emojis-from-string-in-java-script
const stripEmojis = (str: string) =>
  str
    .replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ''
    )
    .replace(/\s+/g, ' ')
    .trim();

export default function cleanDeckName(name: string) {
  const includesEmoji = name.startsWith('&#x');
  return stripEmojis(
    includesEmoji ? name.split(' ').slice(1).join('').trim() : name
  );
}
