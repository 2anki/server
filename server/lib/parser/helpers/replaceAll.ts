export default function replaceAll(
  original: string,
  oldValue: string,
  newValue: string
): string {
  // escaping all special Characters
  const escaped = oldValue.replace(/[{}()[\].?*+$^\\/]/g, "\\$&");
  // creating regex with global flag
  const reg = new RegExp(escaped, "g");
  return original.replace(reg, newValue);
}
